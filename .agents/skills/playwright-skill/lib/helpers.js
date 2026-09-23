const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium, firefox, webkit } = require('playwright');

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
  const browser = { chromium, firefox, webkit }[browserType];
  if (!browser) throw new Error(`Invalid browser type: ${browserType}`);

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
  return browser.launch(launchOptions);
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

async function detectDevServers(customPorts = []) {
  const ports = [...new Set([3000, 3001, 3002, 5173, 8080, 8000, 4200, 5000, 9000, 1234, 80, ...customPorts])];
  const servers = [];
  await Promise.all(ports.map(async port => {
    await new Promise(resolve => {
      const request = http.request({ hostname: 'localhost', port, path: '/', method: 'HEAD', timeout: 500 }, response => {
        if (response.statusCode < 500) servers.push(port);
        response.resume();
        resolve();
      });
      request.on('error', resolve);
      request.on('timeout', () => { request.destroy(); resolve(); });
      request.end();
    });
  }));
  return servers.sort((a, b) => a - b).map(port => `http://localhost:${port}`);
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

function normalize21stUrl(inputUrl) {
  try {
    const u = new URL(inputUrl);
    const preview = u.searchParams.get('preview');
    if (preview) {
      const clean = decodeURIComponent(preview).replace(/^\/+/, '');
      return `https://21st.dev/${clean}`;
    }
    return inputUrl;
  } catch {
    return inputUrl;
  }
}

async function extract21stComponent(inputUrl, options = {}) {
  const target = normalize21stUrl(inputUrl);
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(target, { waitUntil: 'domcontentloaded' });

    let meta = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script')).map(s => s.textContent || '');
      let bundleUrl = null;
      let demoCodeUrl = null;
      let componentName = null;

      for (const s of scripts) {
        if (!bundleUrl) {
          const m = s.match(/bundle_html_url[^\n\r]*?(https:\/\/[^"\\\s]+)/);
          if (m) bundleUrl = m[1];
        }
        if (!demoCodeUrl) {
          const m = s.match(/(https:\/\/cdn\.21st\.dev\/[^"\\\s]+code\.demo[^"\\\s]+\.tsx)/);
          if (m) demoCodeUrl = m[1];
        }
        if (!componentName) {
          const m = s.match(/\"name\"[\\:]+\"([^\"\\]+)\"/);
          if (m) componentName = m[1];
        }
      }
      const iframes = Array.from(document.querySelectorAll('iframe'))
        .map(f => f.src)
        .filter(s => s && !s.startsWith('about:'));
      return { bundleUrl, demoCodeUrl, componentName, title: document.title, iframes };
    });

    let demoCode = null;
    let bundleHtml = null;
    let standaloneHtml = null;
    let templateDemoUrl = null;

    if (!meta.bundleUrl && inputUrl !== target) {
      await page.goto(inputUrl, { waitUntil: 'domcontentloaded' });
      const origIframes = await page.evaluate(() =>
        Array.from(document.querySelectorAll('iframe'))
          .map(f => f.src)
          .filter(s => s && !s.startsWith('about:'))
      );
      if (origIframes.length) {
        meta.iframes = origIframes;
      }
    }

    if (!meta.bundleUrl && meta.iframes && meta.iframes.length > 0) {
      templateDemoUrl = meta.iframes[0];
      const templatePage = await browser.newPage();
      await templatePage.goto(templateDemoUrl, { waitUntil: 'networkidle' });
      standaloneHtml = await templatePage.content();
      meta.title = await templatePage.title() || meta.title;
      bundleHtml = standaloneHtml;
      await templatePage.close();
    } else {
      if (meta.demoCodeUrl) {
        try {
          const res = await fetch(meta.demoCodeUrl);
          if (res.ok) demoCode = await res.text();
        } catch {}
      }

      if (meta.bundleUrl) {
        try {
          const res = await fetch(meta.bundleUrl);
          if (res.ok) {
            bundleHtml = await res.text();
            standaloneHtml = bundleHtml
              .replace('<html lang="en">', '<html lang="en" class="dark">')
              .replace(/get\(["']dark["']\)\s*===\s*["']true["']/g, 'true')
              .replace('enableSystem:!1', 'defaultTheme:"dark",enableSystem:!1');
          }
        } catch {}
      }
    }

    if (options.writeTo && standaloneHtml) {
      fs.writeFileSync(path.resolve(process.cwd(), options.writeTo), standaloneHtml, 'utf8');
    }

    let shaders = null;
    if (bundleHtml) {
      const vMatch = bundleHtml.match(/void\s+main\s*\(\s*\)\s*\{[\s\S]*?gl_Position[\s\S]*?\}/);
      const fMatch = bundleHtml.match(/void\s+main\s*\(\s*(?:void)?\s*\)\s*\{[\s\S]*?gl_FragColor[\s\S]*?\}/);
      if (vMatch || fMatch) {
        shaders = {
          vertexShader: vMatch ? vMatch[0] : null,
          fragmentShader: fMatch ? fMatch[0] : null,
        };
      }
    }

    return {
      targetUrl: target,
      templateUrl: templateDemoUrl,
      title: meta.title,
      componentName: meta.componentName,
      demoCodeUrl: meta.demoCodeUrl,
      bundleUrl: meta.bundleUrl,
      demoCode,
      shaders,
      bundleHtmlLength: bundleHtml ? bundleHtml.length : 0,
      writtenFile: options.writeTo || null,
    };
  } finally {
    await browser.close();
  }
}

module.exports = {
  createContext,
  detectDevServers,
  extract21stComponent,
  getExtraHeadersFromEnv,
  handleCookieBanner,
  launchBrowser,
  normalize21stUrl,
  resolveTargetUrl,
  takeScreenshot,
};

