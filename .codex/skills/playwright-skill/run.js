#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');

const skillDir = __dirname;

function getCandidatePaths() {
  const candidates = [
    path.join(skillDir, 'node_modules'),
    path.join(process.cwd(), 'node_modules'),
  ];

  // Windows global npm
  if (process.env.APPDATA) {
    candidates.push(path.join(process.env.APPDATA, 'npm', 'node_modules'));
  }
  // Linux / macOS global npm
  candidates.push('/usr/local/lib/node_modules', '/usr/lib/node_modules');

  // User-scoped Agent Skills directory
  const home = os.homedir();
  candidates.push(
    path.join(home, '.agents', 'skills', 'playwright-skill', 'node_modules')
  );

  return [...new Set(candidates.filter(Boolean))];
}

let activeNodeModules = path.join(skillDir, 'node_modules');

function ensurePlaywright() {
  const candidatePaths = getCandidatePaths();

  for (const candidate of candidatePaths) {
    try {
      if (fs.existsSync(candidate)) {
        require.resolve('playwright', { paths: [candidate] });
        activeNodeModules = candidate;
        return;
      }
    } catch {
      // try next candidate
    }
  }

  // Dependencies are never installed implicitly; setup is an explicit step.
  console.error(`Playwright is not installed. Run \`npm ci\` in ${skillDir}, then \`npx playwright install chromium\` (or install a system Chrome/Edge).`);
  process.exit(1);
}

function saveScript(file) {
  const directory = process.env.PW_SCRIPT_DIR;
  if (!directory || !file) return;

  const targetDir = path.resolve(directory);
  fs.mkdirSync(targetDir, { recursive: true });
  const name = path.basename(file);
  let target = path.join(targetDir, name);
  if (fs.existsSync(target)) {
    const extension = path.extname(name);
    const stem = path.basename(name, extension);
    target = path.join(targetDir, `${stem}-${Date.now()}${extension}`);
  }
  fs.copyFileSync(file, target);
  console.log(`Script saved to: ${target}`);
}

function run(args) {
  const nodePathList = [
    activeNodeModules,
    path.join(skillDir, 'node_modules'),
    path.join(process.cwd(), 'node_modules'),
    process.env.NODE_PATH,
  ].filter(Boolean);

  const combinedNodePath = [...new Set(nodePathList)].join(path.delimiter);

  const child = spawn(process.execPath, args, {
    cwd: process.cwd(),
    env: { ...process.env, NODE_PATH: combinedNodePath, PW_SKILL_DIR: skillDir },
    stdio: 'inherit',
  });
  const handlers = new Map();
  child.on('exit', (code, signal) => {
    if (!signal) process.exit(code ?? 1);
    for (const [name, handler] of handlers) process.off(name, handler);
    process.kill(process.pid, signal);
  });
  child.on('error', error => {
    console.error(`Failed to start Node.js: ${error.message}`);
    process.exit(1);
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    const handler = () => {
      child.kill(signal);
      setTimeout(() => child.kill('SIGKILL'), 2000).unref();
    };
    handlers.set(signal, handler);
    process.on(signal, handler);
  }
}

ensurePlaywright();

function runInlineHelpers(source) {
  const helpersPath = JSON.stringify(path.join(skillDir, 'lib/helpers'));
  const prefix = `const playwright = require('playwright');\nconst { chromium, firefox, webkit, devices } = playwright;\nif (!chromium._origLaunch) chromium._origLaunch = chromium.launch.bind(chromium);\nconst helpers = require(${helpersPath});\nchromium.launch = (opts = {}) => helpers.launchBrowser('chromium', { headless: opts.headless ?? true, ...opts });\n`;
  const exit = "async () => { for (const s of [process.stdout, process.stderr]) await new Promise(r => s.write('', r)); process.exit(process.exitCode ?? 0); }";
  run(['-e', `${prefix}\n(async () => {\n  try {\n    ${source}\n  } catch (error) {\n    console.error(error.stack || error.message);\n    process.exitCode = 1;\n  }\n})().finally(${exit});`]);
}

function parseAuditOptions(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--audit') {
      const next = argv[i + 1];
      if (next && !next.startsWith('-')) {
        options.url = next;
        i++;
      }
    } else if (arg.startsWith('--audit=')) {
      options.url = arg.slice('--audit='.length);
    } else if (arg === '--screenshots' || arg === '--screenshot-dir') {
      const next = argv[i + 1];
      if (!next || next.startsWith('-')) {
        console.error(`Missing directory value for ${arg}`);
        process.exit(1);
      }
      options.screenshotDir = next;
      i++;
    } else if (arg.startsWith('--screenshots=') || arg.startsWith('--screenshot-dir=')) {
      options.screenshotDir = arg.slice(arg.indexOf('=') + 1);
    } else if (arg === '--touch-targets') {
      options.checkTouchTargets = true;
    } else if (!arg.startsWith('-') && !options.url) {
      options.url = arg;
    } else {
      console.error(`Unknown option for --audit: ${arg}`);
      process.exit(1);
    }
  }
  return options;
}

const args = process.argv.slice(2);
if (args[0] === '-e' || args[0] === '--eval') {
  const source = args.slice(1).join(' ');
  if (!source) {
    console.error('Usage: node run.js -e "await page.goto(\'https://example.com\')"');
    process.exit(1);
  }
  runInlineHelpers(source);
} else if (args[0] === '--detect-url') {
  runInlineHelpers("const url = await helpers.resolveTargetUrl(); if (!url) { console.error('No target URL or active dev server found.'); process.exitCode = 1; } else { console.log(url); }");
} else if (args.some(arg => arg === '--audit' || arg.startsWith('--audit='))) {
  const auditOptions = parseAuditOptions(args);
  runInlineHelpers(`const result = await helpers.auditLayout(${JSON.stringify(auditOptions)}); if (!result.passed) process.exitCode = 1;`);
} else if (args[0]) {
  const file = path.resolve(args[0]);
  if (!fs.existsSync(file)) {
    console.error(`Script not found: ${file}`);
    process.exit(1);
  }
  saveScript(file);
  run([file, ...args.slice(1)]);
} else if (!process.stdin.isTTY) {
  console.error('Stdin execution is no longer supported. Use a script file or `-e`.');
  process.exit(1);
} else {
  console.error('Usage: node run.js <script.js> [args...]');
  console.error('   or: node run.js -e "await page.goto(\'https://example.com\')"');
  console.error('   or: node run.js --detect-url');
  console.error('   or: node run.js --audit [url] [--screenshots <dir>] [--touch-targets]');
  process.exit(1);
}
