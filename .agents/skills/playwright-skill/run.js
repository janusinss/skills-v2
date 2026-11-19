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

  // Optional shared node_modules directory
  if (process.env.PW_SHARED_NODE_MODULES) {
    candidates.push(path.resolve(process.env.PW_SHARED_NODE_MODULES));
  }

  // User home directory (.agents, .claude)
  const home = os.homedir();
  candidates.push(
    path.join(home, '.agents', 'skills', 'playwright-skill', 'node_modules'),
    path.join(home, '.claude', 'skills', 'playwright-skill', 'node_modules')
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

function runInlineHelpers(source) {
  const helpersPath = JSON.stringify(path.join(skillDir, 'lib/helpers'));
  const prefix = `const playwright = require('playwright');\nconst { chromium, firefox, webkit, devices } = playwright;\nif (!chromium._origLaunch) chromium._origLaunch = chromium.launch.bind(chromium);\nconst helpers = require(${helpersPath});\nchromium.launch = (opts = {}) => helpers.launchBrowser('chromium', { headless: opts.headless ?? true, ...opts });\n`;
  const exit = "async () => { for (const s of [process.stdout, process.stderr]) await new Promise(r => s.write('', r)); process.exit(process.exitCode ?? 0); }";
  run(['-e', `${prefix}\n(async () => {\n  try {\n    ${source}\n  } catch (error) {\n    console.error(error.stack || error.message);\n    process.exitCode = 1;\n  }\n})().finally(${exit});`]);
}

async function readStdinUtf8() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : chunk);
  }
  return Buffer.concat(chunks).toString('utf8').replace(/^\uFEFF/, '');
}

function readOptionValue(argv, index, flag) {
  const next = argv[index + 1];
  if (!next || next.startsWith('-')) {
    console.error(`Missing value for ${flag}`);
    process.exit(1);
  }
  return next;
}

function readEqualsValue(arg, flag) {
  const value = arg.slice(arg.indexOf('=') + 1);
  if (!value) {
    console.error(`Missing value for ${flag}`);
    process.exit(1);
  }
  return value;
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
      options.screenshotDir = readOptionValue(argv, i, arg);
      i++;
    } else if (arg.startsWith('--screenshots=') || arg.startsWith('--screenshot-dir=')) {
      options.screenshotDir = readEqualsValue(arg, arg.slice(0, arg.indexOf('=')));
    } else if (arg === '--session') {
      options.session = readOptionValue(argv, i, arg);
      i++;
    } else if (arg.startsWith('--session=')) {
      options.session = readEqualsValue(arg, '--session');
    } else if (arg === '--cdp') {
      options.cdp = readOptionValue(argv, i, arg);
      i++;
    } else if (arg.startsWith('--cdp=')) {
      options.cdp = readEqualsValue(arg, '--cdp');
    } else if (arg === '--storage-state') {
      options.storageState = readOptionValue(argv, i, arg);
      i++;
    } else if (arg.startsWith('--storage-state=')) {
      options.storageState = readEqualsValue(arg, '--storage-state');
    } else if (arg === '--touch-targets') {
      options.checkTouchTargets = true;
    } else if (arg === '--a11y') {
      options.a11y = true;
    } else if (arg === '--no-network-errors') {
      options.ignoreNetworkErrors = true;
    } else if (!arg.startsWith('-') && !options.url) {
      options.url = arg;
    } else {
      console.error(`Unknown option for --audit: ${arg}`);
      process.exit(1);
    }
  }
  return options;
}

function printUsage() {
  console.error('Usage: node run.js <script.js> [args...]');
  console.error('   or: node run.js -e "const b = await chromium.launch(); const p = await b.newPage(); await p.goto(\'https://example.com\'); console.log(await p.title()); await b.close();"');
  console.error('   or: node run.js --stdin');
  console.error('   or: node run.js -b <base64> | --base64 <base64>');
  console.error('   or: node run.js --detect-url');
  console.error('   or: node run.js --audit [url] [--screenshots <dir>] [--touch-targets] [--session <id>] [--cdp <url>] [--storage-state <file>] [--a11y] [--no-network-errors]');
}

const args = process.argv.slice(2);

if (args[0] === '--detect-url') {
  const helpers = require(path.join(skillDir, 'lib/helpers'));
  Promise.resolve(helpers.resolveTargetUrl())
    .then(url => {
      if (!url) {
        console.error('No target URL or active dev server found.');
        process.exit(1);
      }
      console.log(url);
      process.exit(0);
    })
    .catch(error => {
      console.error(error && error.stack ? error.stack : String(error));
      process.exit(1);
    });
} else if (args[0] === '-e' || args[0] === '--eval') {
  const source = args.slice(1).join(' ');
  if (!source) {
    console.error('Usage: node run.js -e "const b = await chromium.launch(); const p = await b.newPage(); await p.goto(\'https://example.com\'); console.log(await p.title()); await b.close();"');
    process.exit(1);
  }
  ensurePlaywright();
  runInlineHelpers(source);
} else if (args[0] === '--stdin') {
  ensurePlaywright();
  readStdinUtf8()
    .then(source => {
      if (!source.trim()) {
        console.error('No inline script provided on stdin.');
        process.exit(1);
      }
      runInlineHelpers(source);
    })
    .catch(error => {
      console.error(`Failed to read stdin: ${error.message}`);
      process.exit(1);
    });
} else if (args[0] === '-b' || args[0] === '--base64' || (args[0] && args[0].startsWith('--base64='))) {
  const raw = args[0].startsWith('--base64=') ? args[0].slice('--base64='.length) : args[1];
  if (!raw) {
    console.error('Usage: node run.js -b <base64> | --base64 <base64>');
    process.exit(1);
  }
  const source = Buffer.from(raw, 'base64').toString('utf8').replace(/^\uFEFF/, '');
  if (!source.trim()) {
    console.error('Decoded base64 script is empty.');
    process.exit(1);
  }
  ensurePlaywright();
  runInlineHelpers(source);
} else if (args.some(arg => arg === '--audit' || arg.startsWith('--audit='))) {
  const auditOptions = parseAuditOptions(args);
  ensurePlaywright();
  runInlineHelpers(`const result = await helpers.auditLayout(${JSON.stringify(auditOptions)}); if (!result.passed) process.exitCode = 1;`);
} else if (args[0]) {
  const file = path.resolve(args[0]);
  if (!fs.existsSync(file)) {
    console.error(`Script not found: ${file}`);
    process.exit(1);
  }
  ensurePlaywright();
  saveScript(file);
  run([file, ...args.slice(1)]);
} else if (!process.stdin.isTTY) {
  console.error('Bare stdin execution is not supported. Pass --stdin, -b <base64>, -e "<code>", or a script file.');
  process.exit(1);
} else {
  printUsage();
  process.exit(1);
}
