const { spawnSync } = require('node:child_process');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function getExtraHeadersFromEnv() {
  const name = process.env.PW_HEADER_NAME;
  const value = process.env.PW_HEADER_VALUE;
  if (name && value) return { [name]: value };

  if (!process.env.PW_EXTRA_HEADERS) return null;
  try {
    const headers = JSON.parse(process.env.PW_EXTRA_HEADERS);
    if (headers && typeof headers === 'object' && !Array.isArray(headers)) return headers;
    console.warn('PW_EXTRA_HEADERS must be a JSON object; ignoring it.');
  } catch (error) {
    console.warn(`Failed to parse PW_EXTRA_HEADERS: ${error.message}`);
  }
  return null;
}

async function launchBrowser(browserType = process.env.PW_BROWSER || 'chromium', options = {}) {
  const playwright = require('playwright');
  const browser = playwright[browserType];
  if (!browser) throw new Error(`Invalid browser type: ${browserType}`);

  const origLaunch = browser._origLaunch || browser.launch.bind(browser);
  const headlessValue = process.env.PW_HEADLESS || process.env.HEADLESS || 'false';
  // ponytail: Chromium refuses to start as root without --no-sandbox; only add it there
  const needsNoSandbox = browserType === 'chromium' && process.getuid?.() === 0;
  const launchOptions = {
    headless: headlessValue !== 'false',
    slowMo: Number(process.env.SLOW_MO) || 0,
    ...(process.env.PW_CHANNEL && { channel: process.env.PW_CHANNEL }),
    ...(process.env.PW_EXECUTABLE_PATH && { executablePath: process.env.PW_EXECUTABLE_PATH }),
    ...options,
    ...(needsNoSandbox && { args: ['--no-sandbox', ...(options.args ?? [])] }),
  };
  try {
    return await origLaunch(launchOptions);
  } catch (error) {
    if (browserType === 'chromium' && !launchOptions.channel && !launchOptions.executablePath && (error.message.includes("Executable doesn't exist") || error.message.includes("npx playwright install") || error.code === 'ENOENT')) {
      const channelErrors = [];
      for (const channel of ['chrome', 'msedge']) {
        try { return await origLaunch({ ...launchOptions, channel }); }
        catch (chErr) { channelErrors.push(`${channel}: ${chErr.message}`); }
      }
      if (channelErrors.length) error.message += ` (Fallback attempts: ${channelErrors.join('; ')})`;
    }
    throw error;
  }
}

async function createContext(browser, options = {}) {
  const headers = { ...getExtraHeadersFromEnv(), ...options.extraHTTPHeaders };
  const contextOptions = {
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
    ...options,
    ...(Object.keys(headers).length > 0 && { extraHTTPHeaders: headers }),
  };
  delete contextOptions.mobile;
  return browser.newContext(contextOptions);
}

async function takeScreenshot(page, name, options = {}) {
  const { directory, path: customPath, ...screenshotOptions } = options;
  let filename = customPath;
  if (!filename) {
    const outputDirectory = directory || process.env.PW_ARTIFACT_DIR || os.tmpdir();
    fs.mkdirSync(outputDirectory, { recursive: true });
    filename = path.join(outputDirectory, `${name}-${new Date().toISOString().replace(/[:.]/g, '-')}.png`);
  }
  await page.screenshot({ path: filename, fullPage: screenshotOptions.fullPage !== false, ...screenshotOptions });
  console.log(`Screenshot saved: ${filename}`);
  return filename;
}

async function handleCookieBanner(page, timeout = 3000) {
  const selectors = [
    'button:has-text("Accept")',
    'button:has-text("Accept all")',
    'button:has-text("OK")',
    'button:has-text("Got it")',
    'button:has-text("I agree")',
    '.cookie-accept',
    '#cookie-accept',
    '[data-testid="cookie-accept"]',
  ];
  for (const selector of selectors) {
    try {
      await page.locator(selector).filter({ visible: true }).first().click({ timeout: timeout / selectors.length });
      console.log('Cookie banner dismissed');
      return true;
    } catch {
      // Try the next common selector.
    }
  }
  return false;
}

const DEFAULT_DEV_PORTS = [3000, 3001, 3002, 4321, 5173, 5174, 8080, 8000, 8787, 4200, 5000, 9000, 1234, 80];
const DEFAULT_AUDIT_VIEWPORTS = [
  { w: 375, h: 667 },
  { w: 768, h: 1024 },
  { w: 1280, h: 800 },
];

function probePortHost(hostname, port) {
  return new Promise(resolve => {
    const request = http.request({ hostname, port, path: '/', method: 'HEAD', timeout: 500 }, response => {
      const ok = typeof response.statusCode === 'number' && response.statusCode < 500;
      response.resume();
      resolve(ok);
    });
    request.on('error', () => resolve(false));
    request.on('timeout', () => {
      request.destroy();
      resolve(false);
    });
    request.end();
  });
}

async function detectDevServers(customPorts = []) {
  const ports = [...new Set(
    [...DEFAULT_DEV_PORTS, ...customPorts]
      .map(port => Number(port))
      .filter(port => Number.isInteger(port) && port > 0 && port <= 65535)
  )];
  const servers = [];
  await Promise.all(ports.map(async port => {
    const [localhostOk, ipv4Ok] = await Promise.all([
      probePortHost('localhost', port),
      probePortHost('127.0.0.1', port),
    ]);
    if (localhostOk) {
      servers.push({ port, url: `http://localhost:${port}` });
    } else if (ipv4Ok) {
      servers.push({ port, url: `http://127.0.0.1:${port}` });
    }
  }));
  return servers.sort((a, b) => a.port - b.port).map(entry => entry.url);
}

async function resolveTargetUrl(options = {}) {
  if (process.env.URL) return process.env.URL;
  if (options.url) return options.url;

  const cwd = process.cwd();
  const activeServers = await detectDevServers(options.ports || []);

  if (activeServers.length) {
    const webRoots = ['htdocs', 'www', 'public_html', 'html'];
    const lowerCwd = cwd.toLowerCase();

    for (const root of webRoots) {
      const idx = lowerCwd.lastIndexOf(root);
      if (idx !== -1) {
        const sub = cwd.slice(idx + root.length).split(/[\\/]/).filter(Boolean).map(encodeURIComponent).join('/');
        let entry = '';
        for (const file of ['index.php', 'index.html', 'default.html']) {
          if (fs.existsSync(path.join(cwd, file))) {
            entry = file;
            break;
          }
        }
        const apacheServer = activeServers.find(s => s.endsWith(':80')) || activeServers.find(s => s.endsWith(':8080'));
        if (apacheServer) {
          const base = apacheServer.replace(/:80$/, '');
          const pathPart = sub ? `/${sub}` : '';
          const filePart = entry ? `/${entry}` : '/';
          return `${base}${pathPart}${filePart}`.replace(/\/+/g, '/').replace(':/', '://');
        }
      }
    }

    return activeServers[0];
  }

  for (const file of ['index.html', 'index.htm']) {
    const localFile = path.join(cwd, file);
    if (fs.existsSync(localFile)) {
      return `file://${path.resolve(localFile).replace(/\\/g, '/')}`;
    }
  }

  return null;
}

function normalizeAuditViewports(viewports) {
  const source = Array.isArray(viewports) && viewports.length > 0 ? viewports : DEFAULT_AUDIT_VIEWPORTS;
  return source
    .map(vp => ({ w: Number(vp.w ?? vp.width), h: Number(vp.h ?? vp.height) }))
    .filter(vp => Number.isFinite(vp.w) && vp.w > 0 && Number.isFinite(vp.h) && vp.h > 0);
}

async function collectSmallTouchTargets(page) {
  return page.evaluate(() => {
    const selector = 'a, button, input:not([type="hidden"]), select, textarea, [role="button"], [role="link"]';
    const small = [];
    for (const el of document.querySelectorAll(selector)) {
      if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') continue;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || Number.parseFloat(style.opacity) === 0) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      if (rect.width < 43.99 || rect.height < 43.99) {
        const label = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.tagName).trim().slice(0, 40);
        small.push({
          tag: el.tagName.toLowerCase(),
          label,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    }
    return small;
  });
}

async function auditLayout(options = {}) {
  const targetUrl = options.url || await resolveTargetUrl(options);
  if (!targetUrl) {
    const msg = 'No target URL or active dev server found. Pass --audit <url>, set URL env, or start a server.';
    console.error(msg);
    process.exitCode = 1;
    return {
      url: null,
      passed: false,
      viewports: [],
      consoleErrors: [],
      pageErrors: [msg],
    };
  }

  const viewportsToCheck = normalizeAuditViewports(options.viewports);
  const consoleErrors = [];
  const pageErrors = [];
  const viewports = [];
  let browser;
  let passed = true;

  if (options.screenshotDir) {
    fs.mkdirSync(options.screenshotDir, { recursive: true });
  }

  try {
    browser = await launchBrowser('chromium', { headless: true, ...options.launchOptions });
    const context = await createContext(browser, options.contextOptions || {});
    const page = await context.newPage();

    page.on('pageerror', error => {
      pageErrors.push(error && error.message ? error.message : String(error));
    });
    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    await page.setViewportSize({ width: viewportsToCheck[0].w, height: viewportsToCheck[0].h });
    await page.goto(targetUrl, {
      waitUntil: options.waitUntil || 'load',
      timeout: options.timeout || 30000,
    });

    for (let i = 0; i < viewportsToCheck.length; i++) {
      const { w, h } = viewportsToCheck[i];
      if (i > 0) {
        await page.setViewportSize({ width: w, height: h });
      }
      await page.evaluate(async () => {
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready.catch(() => {});
        }
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      });

      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      }));

      let smallTouchTargets = [];
      if (options.checkTouchTargets && w <= 480) {
        smallTouchTargets = await collectSmallTouchTargets(page);
      }

      let screenshotPath = null;
      if (options.screenshotDir) {
        screenshotPath = path.join(options.screenshotDir, `audit-${w}x${h}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: options.fullPage ?? true });
      }

      if (metrics.overflow || (options.checkTouchTargets && w <= 480 && smallTouchTargets.length > 0)) {
        passed = false;
      }

      console.log(`Viewport ${w}x${h}: ${metrics.overflow ? 'OVERFLOW' : 'OK'}`);
      if (smallTouchTargets.length > 0) {
        console.log(`Small touch targets (<44x44px) at ${w}x${h}: ${smallTouchTargets.length}`, smallTouchTargets.slice(0, 5));
      }

      viewports.push({
        width: w,
        height: h,
        scrollWidth: metrics.scrollWidth,
        innerWidth: metrics.innerWidth,
        overflow: metrics.overflow,
        smallTouchTargets,
        screenshotPath,
      });
    }

    if (consoleErrors.length > 0 || pageErrors.length > 0) {
      passed = false;
    }

    console.log(`Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.error('Console error details:', consoleErrors);
    }
    if (pageErrors.length > 0) {
      console.error(`Page errors: ${pageErrors.length}`, pageErrors);
    }
  } catch (error) {
    passed = false;
    const message = error && error.message ? error.message.split('\n')[0] : String(error);
    pageErrors.push(message);
    console.error(`Audit failed: ${message}`);
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }

  if (!passed) {
    process.exitCode = 1;
  }

  return {
    url: targetUrl,
    passed,
    viewports,
    consoleErrors,
    pageErrors,
  };
}

function resolveNativeWinBinary(startDir) {
  if (!startDir) return null;
  const nativeName = `agent-browser-win32-${process.arch}.exe`;
  const candidates = [
    path.join(startDir, 'node_modules', 'agent-browser', 'bin', nativeName),
    path.join(startDir, 'agent-browser', 'bin', nativeName),
    path.resolve(startDir, '..', 'agent-browser', 'bin', nativeName),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function resolveAgentBrowserBinary(options = {}) {
  const explicit = options.bin || process.env.AGENT_BROWSER_BIN;
  if (explicit && fs.existsSync(explicit)) return explicit;

  const isWin = process.platform === 'win32';
  const winNativeName = `agent-browser-win32-${process.arch}.exe`;
  const searchDirs = [];

  let currentDir = process.cwd();
  while (currentDir) {
    searchDirs.push(path.join(currentDir, 'node_modules', '.bin'));
    const parent = path.dirname(currentDir);
    if (parent === currentDir) break;
    currentDir = parent;
  }

  searchDirs.push(path.resolve(__dirname, '..', 'node_modules', '.bin'));

  if (isWin && process.env.APPDATA) {
    searchDirs.push(path.join(process.env.APPDATA, 'npm'));
  }

  if (process.env.PATH) {
    for (const entry of process.env.PATH.split(path.delimiter)) {
      if (entry) searchDirs.push(entry);
    }
  }

  const seen = new Set();
  for (const dir of searchDirs) {
    const resolvedDir = path.resolve(dir);
    if (seen.has(resolvedDir)) continue;
    seen.add(resolvedDir);

    if (isWin) {
      const nativeDirect = path.join(resolvedDir, winNativeName);
      if (fs.existsSync(nativeDirect)) return nativeDirect;

      const exePath = path.join(resolvedDir, 'agent-browser.exe');
      if (fs.existsSync(exePath)) return exePath;

      const cmdPath = path.join(resolvedDir, 'agent-browser.cmd');
      if (fs.existsSync(cmdPath)) {
        return resolveNativeWinBinary(resolvedDir) || cmdPath;
      }
    } else {
      const binPath = path.join(resolvedDir, 'agent-browser');
      if (fs.existsSync(binPath)) return binPath;
    }
  }

  return null;
}

function hasAgentBrowser(options = {}) {
  return Boolean(resolveAgentBrowserBinary(options));
}

function quoteWinCmdArg(arg) {
  const s = String(arg);
  if (!/[\s"&|<>^()]/.test(s) && s.length > 0) return s;
  return `"${s.replace(/"/g, '""')}"`;
}

function runAgentBrowserRaw(bin, args = [], options = {}) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ab-cli-'));
  const outFile = path.join(tmpDir, 'stdout.txt');
  const errFile = path.join(tmpDir, 'stderr.txt');
  let outFd;
  let errFd;
  try {
    outFd = fs.openSync(outFile, 'w');
    errFd = fs.openSync(errFile, 'w');

    const spawnOpts = {
      cwd: options.cwd || process.cwd(),
      env: options.env || process.env,
      timeout: options.timeout ?? 60000,
      stdio: ['ignore', outFd, errFd],
      windowsHide: true,
    };

    let result;
    if (process.platform === 'win32' && /\.(cmd|bat)$/i.test(bin)) {
      const cmdLine = `${quoteWinCmdArg(bin)} ${args.map(quoteWinCmdArg).join(' ')}`.trim();
      result = spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', cmdLine], {
        ...spawnOpts,
        windowsVerbatimArguments: true,
      });
    } else {
      result = spawnSync(bin, args, spawnOpts);
    }

    fs.closeSync(outFd);
    outFd = undefined;
    fs.closeSync(errFd);
    errFd = undefined;

    const stdout = fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf8').trimEnd() : '';
    let stderr = fs.existsSync(errFile) ? fs.readFileSync(errFile, 'utf8').trimEnd() : '';
    if (result.error) {
      stderr = stderr ? `${stderr}\n${result.error.message}` : result.error.message;
    }
    return {
      status: typeof result.status === 'number' ? result.status : 1,
      stdout,
      stderr,
    };
  } finally {
    if (outFd !== undefined) {
      try { fs.closeSync(outFd); } catch {}
    }
    if (errFd !== undefined) {
      try { fs.closeSync(errFd); } catch {}
    }
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

function shouldAutoScopeSession(args, options) {
  if (options.session === false) return false;
  if (args.some(arg => arg === '--session' || String(arg).startsWith('--session='))) return false;
  const skipSubcommands = new Set(['session', 'doctor', 'install', '--version', '-V', '--help', '-h', 'help']);
  if (args.length === 0 || skipSubcommands.has(String(args[0]))) return false;
  return true;
}

function agentBrowser(args = [], options = {}) {
  const bin = resolveAgentBrowserBinary(options);
  if (!bin) {
    return {
      status: 127,
      stdout: '',
      stderr: 'agent-browser binary not found. Run: npm install -g agent-browser && agent-browser install',
    };
  }

  let finalArgs = Array.isArray(args) ? args.map(String) : [String(args)];
  if (shouldAutoScopeSession(finalArgs, options)) {
    let sessionId = typeof options.session === 'string' && options.session.trim()
      ? options.session.trim()
      : null;
    if (!sessionId) {
      const prefix = options.sessionPrefix || 'task';
      const idResult = runAgentBrowserRaw(bin, ['session', 'id', '--scope', 'worktree', '--prefix', prefix], options);
      if (idResult.status === 0 && idResult.stdout.trim()) {
        sessionId = idResult.stdout.trim();
      }
    }
    if (sessionId) {
      finalArgs = ['--session', sessionId, ...finalArgs];
    }
  }

  return runAgentBrowserRaw(bin, finalArgs, options);
}

module.exports = {
  agentBrowser,
  auditLayout,
  createContext,
  detectDevServers,
  getExtraHeadersFromEnv,
  handleCookieBanner,
  hasAgentBrowser,
  launchBrowser,
  resolveAgentBrowserBinary,
  resolveTargetUrl,
  takeScreenshot,
};
