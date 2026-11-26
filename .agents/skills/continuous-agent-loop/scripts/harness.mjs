#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';

/**
 * Self-Improving Agent Harness CLI (Zero External Dependencies)
 * Meta-Harness / ACE 2026 Engine:
 *   1. Contract Gate & Worktree-Scoped Pointers (`contract init`)
 *   2. Adaptive Worktree Sandbox (`worktree spawn|merge|abort`)
 *   3. Boundary Sensor (`sensor check-file --hook <antigravity|claude|codex>`)
 *   4. Deterministic Receipt Verifier & Diff Freshness Gate (`verify run|status-check`)
 *   5. Cold-Context Skeptic Packet & Closed-Loop JSON Stamp (`skeptic-packet`, `stamp-skeptic`)
 *   6. Dual-Polarity ACE Memory Flywheel (`flywheel record|promote|feedback|digest|prune|test`, `eval ingest`)
 *   7. Just-in-Time SessionStart Memory Brief (`memory brief`) & Telemetry (`telemetry record|summary`)
 *   + Compaction Checkpoint (`checkpoint`) & Git Hook Gate (`install-git-hook`, `pre-commit-check`)
 */

const HARNESS_DIR = '.harness';
const PROTECTED_GLOBS = [
  '.harness/receipts/**',
  '.harness/contracts/**',
  '.git/hooks/**',
  '.git/config',
];

const STOP_BYPASS_REASONS = new Set([
  'USER_CANCELED',
  'ERROR',
  'MAX_INVOCATIONS',
  'MAX_FORCED_INVOCATIONS',
  'MAX_TOKEN_BUDGET_EXCEEDED',
]);

const PROMOTED_START_MARKER = '<!-- flywheel-promoted-rules-start -->';
const PROMOTED_END_MARKER = '<!-- flywheel-promoted-rules-end -->';
const EXEMPLAR_START_MARKER = '<!-- flywheel-exemplars-start -->';
const EXEMPLAR_END_MARKER = '<!-- flywheel-exemplars-end -->';
const STAGED_START_MARKER = '<!-- flywheel-staged-rules-start -->';
const STAGED_END_MARKER = '<!-- flywheel-staged-rules-end -->';

const PROMOTED_HEADING_RE = /^##\s+(?:\d+\.\s+)?Promoted\s+(?:Guardrails|Project Invariants)\b/i;
const EXEMPLAR_HEADING_RE = /^##\s+(?:\d+\.\s+)?Promoted\s+(?:Positive\s+)?Exemplars\b/i;
const STAGED_HEADING_RE = /^##\s+(?:\d+\.\s+)?Staged\s+Candidates\b/i;

const INVARIANT_MAX_BYTES = 24000;
const INVARIANT_SOFT_BYTES = 12288;
const INVARIANT_PROMOTED_SOFT_LIMIT = 20;
const INVARIANT_EXEMPLAR_SOFT_LIMIT = 8;
const DIGEST_DOMAIN_THRESHOLD = 3;
const JACCARD_DEDUP_THRESHOLD = 0.75;

function toPosix(p) {
  return String(p || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function sha256(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function normalizePathForHash(p) {
  const norm = toPosix(path.resolve(p)).replace(/\/+$/, '');
  return process.platform === 'win32' ? norm.toLowerCase() : norm;
}

function parseFlags(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      flags.help = true;
    } else if (arg.startsWith('--')) {
      const eq = arg.indexOf('=');
      if (eq !== -1) {
        flags[arg.slice(2, eq)] = arg.slice(eq + 1);
      } else {
        const key = arg.slice(2);
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith('--')) {
          flags[key] = next;
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

function globToRegex(globPattern) {
  const norm = toPosix(globPattern.trim());
  let regexStr = '^';
  let i = 0;
  while (i < norm.length) {
    const ch = norm[i];
    if (ch === '*') {
      if (norm[i + 1] === '*') {
        if (norm[i + 2] === '/') {
          regexStr += '(?:.+/)?';
          i += 3;
          continue;
        }
        regexStr += '.*';
        i += 2;
        continue;
      }
      regexStr += '[^/]*';
      i++;
    } else if (ch === '?') {
      regexStr += '[^/]';
      i++;
    } else if ('.+^${}()|[]\\'.includes(ch)) {
      regexStr += '\\' + ch;
      i++;
    } else {
      regexStr += ch;
      i++;
    }
  }
  regexStr += '$';
  return new RegExp(regexStr);
}

function matchesAnyGlob(filePath, globs) {
  const norm = toPosix(filePath);
  return globs.some(g => globToRegex(g).test(norm));
}

function resolveWorkspaceRoot(cwd = process.cwd()) {
  let curr = path.resolve(cwd);
  while (true) {
    const gitPath = path.join(curr, '.git');
    if (fs.existsSync(gitPath)) {
      try {
        if (fs.statSync(gitPath).isFile()) {
          const rawCommon = execFileSync('git', ['rev-parse', '--git-common-dir'], {
            cwd: curr,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
          }).trim();
          if (rawCommon) {
            const commonDir = path.resolve(curr, rawCommon);
            if (path.basename(commonDir) === '.git') {
              return path.dirname(commonDir);
            }
          }
        }
      } catch {
        // Fallback to curr if git common-dir lookup fails
      }
      return curr;
    }
    if (fs.existsSync(path.join(curr, HARNESS_DIR))) {
      return curr;
    }
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }
  return path.resolve(cwd);
}

function resolveWorktreeRoot(cwd = process.cwd()) {
  const absCwd = path.resolve(cwd);
  try {
    const top = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: absCwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (top) return path.resolve(top);
  } catch {
    // Not inside a git worktree
  }
  return resolveWorkspaceRoot(absCwd);
}

function harnessPaths(root, worktreeRoot = root) {
  const base = path.join(root, HARNESS_DIR);
  return {
    root,
    worktreeRoot: path.resolve(worktreeRoot || root),
    base,
    contracts: path.join(base, 'contracts'),
    receipts: path.join(base, 'receipts'),
    worktrees: path.join(base, 'worktrees'),
    worktreeTasks: path.join(base, 'worktree-tasks'),
    context: path.join(base, 'context'),
    evals: path.join(base, 'evals'),
    regressions: path.join(base, 'evals', 'regressions.jsonl'),
    exemplars: path.join(base, 'evals', 'exemplars.jsonl'),
    metrics: path.join(base, 'evals', 'orchestration-metrics.jsonl'),
    progress: path.join(base, 'PROGRESS.md'),
    activeTask: path.join(base, 'active-task.json'),
  };
}

function ensureDirs(dirs) {
  for (const d of dirs) {
    fs.mkdirSync(d, { recursive: true });
  }
}

function writeFileAtomic(filePath, content) {
  ensureDirs([path.dirname(filePath)]);
  const tmpPath = `${filePath}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2, 8)}`;
  fs.writeFileSync(tmpPath, content, 'utf8');
  fs.renameSync(tmpPath, filePath);
}

function getWorktreeTaskFile(hp, wtRoot = hp.worktreeRoot) {
  const hash = sha256(normalizePathForHash(wtRoot)).slice(0, 16);
  return path.join(hp.worktreeTasks, `${hash}.json`);
}

function writeActiveTaskPointer(hp, taskId, wtRoot = hp.worktreeRoot) {
  ensureDirs([hp.base, hp.worktreeTasks]);
  const nowIso = new Date().toISOString();
  const wtFile = getWorktreeTaskFile(hp, wtRoot);
  const wtPayload = {
    task_id: taskId,
    worktree_root: toPosix(path.resolve(wtRoot)),
    updated_at: nowIso,
  };
  fs.writeFileSync(wtFile, JSON.stringify(wtPayload, null, 2) + '\n', 'utf8');

  const isMainTree = normalizePathForHash(wtRoot) === normalizePathForHash(hp.root);
  if (isMainTree || !fs.existsSync(hp.activeTask)) {
    fs.writeFileSync(
      hp.activeTask,
      JSON.stringify({ task_id: taskId, updated_at: nowIso }, null, 2) + '\n',
      'utf8'
    );
  }
}

function readTaskIdFromPointer(pointerPath, contractsDir) {
  if (!fs.existsSync(pointerPath)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(pointerPath, 'utf8'));
    if (data && typeof data.task_id === 'string' && data.task_id.trim()) {
      const id = data.task_id.trim();
      if (!contractsDir || fs.existsSync(path.join(contractsDir, `${id}.json`))) {
        return id;
      }
    }
  } catch {
    // Ignore malformed pointer
  }
  return null;
}

function resolveTaskId(hp, explicitTask) {
  if (explicitTask && typeof explicitTask === 'string') return explicitTask;

  const wtTask = readTaskIdFromPointer(getWorktreeTaskFile(hp, hp.worktreeRoot), hp.contracts);
  if (wtTask) return wtTask;

  const fallbackTask = readTaskIdFromPointer(hp.activeTask, hp.contracts);
  if (fallbackTask) return fallbackTask;

  if (fs.existsSync(hp.contracts)) {
    const files = fs.readdirSync(hp.contracts).filter(f => f.endsWith('.json'));
    if (files.length === 1) return path.basename(files[0], '.json');
    if (files.length > 1) {
      files.sort((a, b) => {
        const sa = fs.statSync(path.join(hp.contracts, a)).mtimeMs;
        const sb = fs.statSync(path.join(hp.contracts, b)).mtimeMs;
        return sb - sa;
      });
      return path.basename(files[0], '.json');
    }
  }
  return null;
}

function loadContract(hp, taskId) {
  const id = resolveTaskId(hp, taskId);
  if (!id) throw new Error('No task ID specified and no active contract found in .harness/contracts/');
  const file = path.join(hp.contracts, `${id}.json`);
  if (!fs.existsSync(file)) throw new Error(`Contract not found: .harness/contracts/${id}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function splitCsv(val) {
  if (!val || typeof val !== 'string') return [];
  return val.split(',').map(s => s.trim()).filter(Boolean);
}

function parseHookHost(rawHook) {
  if (rawHook === undefined) return null;
  const normalized = typeof rawHook === 'string' ? rawHook.trim().toLowerCase() : '';
  if (!['antigravity', 'codex', 'claude'].includes(normalized)) {
    throw new Error('Invalid --hook value. Expected antigravity, codex, or claude.');
  }
  return normalized;
}

function computeEscalation(consecutiveFailures) {
  const strike = Math.max(0, Number(consecutiveFailures) || 0);
  if (strike >= 3) {
    return {
      strike,
      escalation_action: 'CIRCUIT_BREAKER_STOP_AND_ASK_USER',
      banner: '[STRIKE 3: CIRCUIT BREAKER — STOP & ASK USER]',
    };
  }
  if (strike === 2) {
    return {
      strike,
      escalation_action: 'ESCALATE_TO_ARCHITECT_BRAIN',
      banner: '[STRIKE 2: ESCALATE TO ARCHITECT/BRAIN]',
    };
  }
  return {
    strike,
    escalation_action: 'NONE',
    banner: null,
  };
}

function updateProgressFile(hp, contract, { step, failedHypothesis, statusNote } = {}) {
  ensureDirs([hp.base]);
  let existingHypotheses = [];
  let existingCheckpoints = [];

  if (fs.existsSync(hp.progress)) {
    const raw = fs.readFileSync(hp.progress, 'utf8');
    const hypMatch = raw.match(/## Failed Hypotheses \(Do Not Repeat\)\r?\n([\s\S]*?)(?=\r?\n## |\s*$)/);
    if (hypMatch) {
      existingHypotheses = hypMatch[1]
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.startsWith('- ') && l !== '- (none recorded)');
    }
    const chkMatch = raw.match(/## Verified Checkpoints\r?\n([\s\S]*?)(?=\r?\n## |\s*$)/);
    if (chkMatch) {
      existingCheckpoints = chkMatch[1]
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.startsWith('- ') && l !== '- (none recorded)');
    }
  }

  const timestamp = new Date().toISOString();
  if (failedHypothesis) {
    const entry = `- [${timestamp}] (${contract.task_id}) ${failedHypothesis}`;
    if (!existingHypotheses.includes(entry)) existingHypotheses.push(entry);
  }
  if (step) {
    const entry = `- [${timestamp}] (${contract.task_id}) ${step}`;
    if (!existingCheckpoints.includes(entry)) existingCheckpoints.push(entry);
  }

  const content = [
    '# Harness Progress & Compaction Ledger',
    '',
    '## Active Contract',
    `- **Task ID**: \`${contract.task_id}\``,
    `- **Isolation Mode**: \`${contract.mode}\``,
    `- **Max Turns**: \`${contract.max_turns}\``,
    `- **Allowed Paths**: ${contract.allowed_paths.map(p => `\`${p}\``).join(', ')}`,
    `- **Acceptance Commands**: ${contract.acceptance_commands.map(c => `\`${c}\``).join(', ')}`,
    `- **Status**: ${statusNote || contract.status || 'IN_PROGRESS'}`,
    '',
    '## Verified Checkpoints',
    ...(existingCheckpoints.length ? existingCheckpoints : ['- (none recorded)']),
    '',
    '## Failed Hypotheses (Do Not Repeat)',
    ...(existingHypotheses.length ? existingHypotheses : ['- (none recorded)']),
    '',
    '## Next Atomic Step',
    `- ${step ? `Completed: ${step} — proceed to verification or next atomic target.` : 'Execute scoped implementation and run `verify run`.'}`,
    '',
  ].join('\n');

  fs.writeFileSync(hp.progress, content, 'utf8');
}

function cmdContractInit(hp, flags) {
  const taskId = flags.task;
  const allow = splitCsv(flags.allow);
  const cmds = splitCsv(flags.cmd);
  const maxTurns = Number(flags['max-turns'] || 15);
  const mode = flags.mode || 'adaptive';

  if (!taskId || typeof taskId !== 'string') {
    throw new Error('Usage: harness.mjs contract init --task <id> --allow <csv_globs> --cmd <csv_commands> [--max-turns <n>] [--mode <adaptive|worktree|in-tree>]');
  }
  if (!allow.length) throw new Error('--allow <csv_globs> is required (e.g. --allow "src/**,tests/**")');
  if (!cmds.length) throw new Error('--cmd <csv_commands> is required (e.g. --cmd "npm test")');
  if (!['adaptive', 'worktree', 'in-tree'].includes(mode)) {
    throw new Error(`Invalid --mode "${mode}". Expected adaptive, worktree, or in-tree.`);
  }

  ensureDirs([hp.contracts, hp.receipts, hp.context, hp.evals, hp.worktreeTasks]);

  const contract = {
    schema_version: 1,
    task_id: taskId,
    created_at: new Date().toISOString(),
    mode,
    max_turns: maxTurns,
    allowed_paths: allow,
    acceptance_commands: cmds,
    adaptive_thresholds: {
      max_in_tree_files: 1,
      max_in_tree_changed_lines: 20,
    },
    status: 'ACTIVE',
  };

  const contractFile = path.join(hp.contracts, `${taskId}.json`);
  fs.writeFileSync(contractFile, JSON.stringify(contract, null, 2) + '\n', 'utf8');
  writeActiveTaskPointer(hp, taskId, hp.worktreeRoot);

  updateProgressFile(hp, contract, {
    step: `Initialized contract ${taskId} (mode=${mode}, allow=${allow.join(',')})`,
    statusNote: 'ACTIVE',
  });

  console.log(JSON.stringify({
    ok: true,
    action: 'contract.init',
    contract_path: toPosix(path.relative(hp.root, contractFile)),
    worktree_pointer: toPosix(path.relative(hp.root, getWorktreeTaskFile(hp, hp.worktreeRoot))),
    contract,
  }, null, 2));
}

function readRawStdin(timeoutMs = 1500) {
  return new Promise(resolve => {
    if (process.stdin.isTTY) return resolve('');
    let raw = '';
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        process.stdin.pause();
        process.stdin.destroy();
      } catch {
        // Pipe already closed
      }
      resolve(raw);
    };
    const timer = setTimeout(finish, timeoutMs);
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
      raw += chunk;
      if (raw.length > 4 * 1024 * 1024) finish();
    });
    process.stdin.on('end', finish);
    process.stdin.on('error', finish);
  });
}

async function readStdinPayload(timeoutMs = 1500) {
  const raw = await readRawStdin(timeoutMs);
  const cleaned = raw.replace(/^\uFEFF/, '').trim();
  if (!cleaned) return null;
  try {
    const parsed = JSON.parse(cleaned);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function readJsonFromSource(fromJsonFlag, baseDir) {
  let raw = '';
  if (fromJsonFlag === '-') {
    raw = await readRawStdin(5000);
  } else {
    const resolved = path.isAbsolute(fromJsonFlag)
      ? fromJsonFlag
      : (fs.existsSync(path.resolve(process.cwd(), fromJsonFlag))
          ? path.resolve(process.cwd(), fromJsonFlag)
          : path.resolve(baseDir, fromJsonFlag));
    if (!fs.existsSync(resolved)) {
      throw new Error(`JSON input file not found: ${fromJsonFlag}`);
    }
    raw = fs.readFileSync(resolved, 'utf8');
  }
  let cleaned = raw.replace(/^\uFEFF/, '').trim();
  const fenceMatch = cleaned.match(/^```(?:json)?\s*\r?\n([\s\S]*?)\r?\n```\s*$/i);
  if (fenceMatch) cleaned = fenceMatch[1].trim();
  if (!cleaned) throw new Error('Empty JSON input received from --from-json');
  try {
    const parsed = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Expected a JSON object');
    }
    return parsed;
  } catch (err) {
    throw new Error(`Invalid JSON from --from-json: ${err.message}`);
  }
}

function extractPatchFiles(patchText) {
  if (!patchText || typeof patchText !== 'string') return [];
  const files = [];
  for (const line of patchText.split(/\r?\n/)) {
    const fileMatch = line.match(/^\*\*\*\s+(?:Add|Update|Delete)\s+File:\s+(.+?)\s*$/);
    if (fileMatch && fileMatch[1]) {
      files.push(fileMatch[1]);
      continue;
    }
    const moveMatch = line.match(/^\*\*\*\s+Move to:\s+(.+?)\s*$/);
    if (moveMatch && moveMatch[1]) {
      files.push(moveMatch[1]);
    }
  }
  return files;
}

function parseMaybeJsonObject(val) {
  if (!val) return null;
  if (typeof val === 'object' && !Array.isArray(val)) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }
  }
  return null;
}

function extractFilesFromStdin(stdinData) {
  if (!stdinData || typeof stdinData !== 'object') return [];
  const files = [];
  const seen = new Set();
  const addFile = candidate => {
    if (typeof candidate !== 'string') return;
    const trimmed = candidate.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    files.push(trimmed);
  };

  const tcArgs = parseMaybeJsonObject(stdinData.toolCall?.args)
    || parseMaybeJsonObject(stdinData.toolCall?.arguments);
  const toolInput = parseMaybeJsonObject(stdinData.tool_input);
  const inputObj = parseMaybeJsonObject(stdinData.input);

  for (const obj of [tcArgs, toolInput, inputObj, stdinData]) {
    if (!obj || typeof obj !== 'object') continue;
    for (const key of ['Path', 'TargetFile', 'file_path', 'path', 'File', 'AbsolutePath']) {
      addFile(obj[key]);
    }
    if (Array.isArray(obj.paths)) {
      for (const p of obj.paths) addFile(p);
    } else if (typeof obj.paths === 'string') {
      addFile(obj.paths);
    }
  }

  const patchSources = [
    tcArgs?.patch,
    tcArgs?.input,
    toolInput?.patch,
    toolInput?.input,
    inputObj?.patch,
    inputObj?.input,
    stdinData.patch,
    typeof stdinData.tool_input === 'string' ? stdinData.tool_input : null,
    typeof stdinData.input === 'string' ? stdinData.input : null,
  ];
  for (const patchText of patchSources) {
    for (const p of extractPatchFiles(patchText)) {
      addFile(p);
    }
  }

  return files;
}

function cmdSensorCheckFile(hp, flags, stdinData = null) {
  const hookHost = parseHookHost(flags.hook);

  const emitAllow = payload => {
    if (hookHost === 'antigravity') {
      console.log(JSON.stringify({ decision: 'allow' }));
      return;
    }
    console.log(JSON.stringify(payload));
  };

  const emitBlock = reason => {
    if (hookHost === 'antigravity') {
      console.log(JSON.stringify({ decision: 'deny', reason }));
      return;
    }
    console.error(reason);
    process.exit(2);
  };

  const candidates = flags.file ? [String(flags.file)] : extractFilesFromStdin(stdinData);
  if (candidates.length === 0) {
    emitAllow({ ok: true, action: 'sensor.check-file', skipped: true, reason: 'No target file argument found' });
    return;
  }

  const taskId = resolveTaskId(hp, flags.task);
  const baseDir = hp.worktreeRoot || hp.root;
  const normalizedPaths = [];

  for (const candidate of candidates) {
    const absCandidate = path.resolve(baseDir, candidate);
    const relFromBase = toPosix(path.relative(baseDir, absCandidate));
    const relFromRoot = toPosix(path.relative(hp.root, absCandidate));

    const escapesBase = path.isAbsolute(relFromBase) || relFromBase.startsWith('../') || relFromBase === '..';
    const escapesRoot = path.isAbsolute(relFromRoot) || relFromRoot.startsWith('../') || relFromRoot === '..';

    if (escapesBase && escapesRoot) {
      emitBlock(`[HARNESS SENSOR BLOCK] Path escapes workspace root: ${candidate}`);
      return;
    }

    let relPath = !escapesBase ? relFromBase : relFromRoot;
    if (matchesAnyGlob(relPath, PROTECTED_GLOBS) || (!escapesRoot && matchesAnyGlob(relFromRoot, PROTECTED_GLOBS))) {
      emitBlock(`[HARNESS SENSOR BLOCK] Direct agent tampering with protected harness/git path is forbidden: ${relPath}`);
      return;
    }

    if (taskId) {
      const wtPrefix = `.harness/worktrees/${taskId}/`;
      if (relPath.startsWith(wtPrefix)) {
        relPath = relPath.slice(wtPrefix.length);
      }
    }

    normalizedPaths.push(relPath);
  }

  if (!taskId) {
    if (flags['require-contract']) {
      emitBlock(`[HARNESS SENSOR BLOCK] No active contract found in .harness/contracts/. Run 'harness.mjs contract init' first.`);
      return;
    }
    emitAllow({
      ok: true,
      action: 'sensor.check-file',
      file: normalizedPaths[0],
      ...(normalizedPaths.length > 1 ? { files: normalizedPaths } : {}),
      contract: null,
      note: 'No active contract; protected path check passed',
    });
    return;
  }

  const contract = loadContract(hp, taskId);
  for (const relPath of normalizedPaths) {
    if (relPath === '.harness/PROGRESS.md') continue;
    if (!matchesAnyGlob(relPath, contract.allowed_paths)) {
      emitBlock(
        `[HARNESS SENSOR BLOCK] File "${relPath}" is outside contract "${contract.task_id}" allowed_paths: [${contract.allowed_paths.join(', ')}]`
      );
      return;
    }
  }

  emitAllow({
    ok: true,
    action: 'sensor.check-file',
    file: normalizedPaths[0],
    ...(normalizedPaths.length > 1 ? { files: normalizedPaths } : {}),
    task_id: contract.task_id,
  });
}

function getExecutionCwd(hp, contract) {
  const wtDir = path.join(hp.worktrees, contract.task_id);
  if (fs.existsSync(wtDir)) return wtDir;
  if (hp.worktreeRoot && normalizePathForHash(hp.worktreeRoot) !== normalizePathForHash(hp.root)) {
    return hp.worktreeRoot;
  }
  return hp.root;
}

function cmdWorktree(hp, subaction, flags) {
  const contract = loadContract(hp, flags.task);
  const taskId = contract.task_id;
  const wtPath = path.join(hp.worktrees, taskId);
  const branchName = `agent/${taskId}`;

  if (subaction === 'spawn') {
    ensureDirs([hp.worktrees, hp.worktreeTasks]);
    if (fs.existsSync(wtPath)) {
      writeActiveTaskPointer(hp, taskId, wtPath);
      console.log(JSON.stringify({ ok: true, action: 'worktree.spawn', task_id: taskId, worktree_path: toPosix(path.relative(hp.root, wtPath)), branch: branchName, reused: true }, null, 2));
      return;
    }
    execFileSync('git', ['worktree', 'add', '-b', branchName, wtPath, 'HEAD'], {
      cwd: hp.root,
      stdio: 'pipe',
    });
    const wtHarnessContracts = path.join(wtPath, HARNESS_DIR, 'contracts');
    ensureDirs([wtHarnessContracts]);
    fs.copyFileSync(path.join(hp.contracts, `${taskId}.json`), path.join(wtHarnessContracts, `${taskId}.json`));
    writeActiveTaskPointer(hp, taskId, wtPath);
    updateProgressFile(hp, contract, { step: `Spawned isolated git worktree at .harness/worktrees/${taskId} (branch ${branchName})` });
    console.log(JSON.stringify({ ok: true, action: 'worktree.spawn', task_id: taskId, worktree_path: toPosix(path.relative(hp.root, wtPath)), branch: branchName }, null, 2));
    return;
  }

  if (subaction === 'merge') {
    const receiptFile = path.join(hp.receipts, `${taskId}.json`);
    if (!fs.existsSync(receiptFile)) {
      throw new Error(`Cannot merge worktree for task "${taskId}": missing verification receipt (.harness/receipts/${taskId}.json).`);
    }
    const receipt = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
    if (receipt.status !== 'PASS') {
      throw new Error(`Cannot merge worktree for task "${taskId}": receipt status is "${receipt.status}" (expected "PASS").`);
    }
    if (receipt.skeptic_verdict !== 'APPROVE') {
      throw new Error(`Cannot merge worktree for task "${taskId}": skeptic_verdict is "${receipt.skeptic_verdict || 'PENDING'}" (expected "APPROVE").`);
    }

    if (fs.existsSync(wtPath)) {
      fs.rmSync(path.join(wtPath, HARNESS_DIR), { recursive: true, force: true });
      const statusOut = execFileSync('git', ['status', '--porcelain'], { cwd: wtPath, encoding: 'utf8' }).trim();
      if (statusOut) {
        execFileSync('git', ['add', '-A'], { cwd: wtPath, stdio: 'pipe' });
        execFileSync('git', ['commit', '-m', `harness(${taskId}): verified worktree changes`], { cwd: wtPath, stdio: 'pipe' });
      }
      execFileSync('git', ['merge', '--no-ff', branchName, '-m', `Merge verified agent worktree ${branchName}`], {
        cwd: hp.root,
        stdio: 'pipe',
      });
      execFileSync('git', ['worktree', 'remove', '--force', wtPath], { cwd: hp.root, stdio: 'pipe' });
      execFileSync('git', ['branch', '-d', branchName], { cwd: hp.root, stdio: 'pipe' });
    }
    updateProgressFile(hp, contract, { step: `Merged verified worktree ${branchName} and cleaned up sandbox`, statusNote: 'MERGED' });
    console.log(JSON.stringify({ ok: true, action: 'worktree.merge', task_id: taskId, branch: branchName }, null, 2));
    return;
  }

  if (subaction === 'abort') {
    if (fs.existsSync(wtPath)) {
      execFileSync('git', ['worktree', 'remove', '--force', wtPath], { cwd: hp.root, stdio: 'pipe' });
    }
    try {
      execFileSync('git', ['branch', '-D', branchName], { cwd: hp.root, stdio: 'pipe' });
    } catch {
      // Branch may not exist
    }
    updateProgressFile(hp, contract, { step: `Aborted and removed worktree ${branchName}`, statusNote: 'ABORTED' });
    console.log(JSON.stringify({ ok: true, action: 'worktree.abort', task_id: taskId, branch: branchName }, null, 2));
    return;
  }

  throw new Error(`Unknown worktree subcommand "${subaction}". Expected spawn, merge, or abort.`);
}

function payloadHash(buf) {
  const data = !buf.includes(0) ? Buffer.from(buf.toString('utf8').replace(/\r\n/g, '\n'), 'utf8') : buf;
  return crypto.createHash('sha256').update(data).digest('hex');
}

function collectGitDiffAndFiles(execCwd) {
  let rawDiff = '';
  let changedFiles = [];
  let changedLines = 0;
  const untrackedFiles = new Set();

  try {
    rawDiff = execFileSync('git', ['diff', 'HEAD'], { cwd: execCwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    try {
      rawDiff = execFileSync('git', ['diff'], { cwd: execCwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    } catch {
      rawDiff = '';
    }
  }

  try {
    const statusOut = execFileSync('git', ['status', '--porcelain', '-uall'], { cwd: execCwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const set = new Set();
    for (const rawLine of statusOut.split(/\r?\n/)) {
      const line = rawLine.trimEnd();
      if (!line) continue;
      const isUntracked = line.startsWith('?? ');
      const filePart = line.slice(3).trim().split(' -> ').pop();
      const norm = toPosix(filePart.replace(/^"|"$/g, ''));
      if (norm && !norm.startsWith('.harness/')) {
        set.add(norm);
        if (isUntracked) untrackedFiles.add(norm);
      }
    }
    changedFiles = [...set].sort();
  } catch {
    changedFiles = [];
  }

  for (const norm of [...untrackedFiles].sort()) {
    const fullPath = path.join(execCwd, norm);
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) continue;
    const buf = fs.readFileSync(fullPath);
    if (rawDiff && !rawDiff.endsWith('\n')) rawDiff += '\n';
    if (buf.includes(0)) {
      rawDiff += `diff --git a/${norm} b/${norm}\nnew file mode 100644\nBinary files /dev/null and b/${norm} differ\n`;
      continue;
    }
    const text = buf.toString('utf8').replace(/\r\n/g, '\n');
    if (text.length === 0) {
      rawDiff += `diff --git a/${norm} b/${norm}\nnew file mode 100644\n--- /dev/null\n+++ b/${norm}\n`;
      continue;
    }
    const lines = text.endsWith('\n') ? text.slice(0, -1).split('\n') : text.split('\n');
    rawDiff += `diff --git a/${norm} b/${norm}\nnew file mode 100644\n--- /dev/null\n+++ b/${norm}\n@@ -0,0 +1,${lines.length} @@\n+${lines.join('\n+')}\n`;
  }

  for (const line of rawDiff.split(/\r?\n/)) {
    if ((line.startsWith('+') && !line.startsWith('+++')) || (line.startsWith('-') && !line.startsWith('---'))) {
      changedLines++;
    }
  }

  const fileDigestEntries = changedFiles.map(norm => {
    const fullPath = path.join(execCwd, norm);
    const existsAndFile = fs.existsSync(fullPath) && fs.statSync(fullPath).isFile();
    return `${norm}:${existsAndFile ? payloadHash(fs.readFileSync(fullPath)) : 'DELETED'}\n`;
  });
  const filesHash = sha256(fileDigestEntries.join(''));

  return { rawDiff, changedFiles, changedLines, filesHash };
}

function runShellCommand(cmdStr, execCwd, timeoutMs = 120000) {
  const start = Date.now();

  const res = spawnSync(cmdStr, [], {
    cwd: execCwd,
    shell: true,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 10 * 1024 * 1024,
  });

  const durationMs = Date.now() - start;
  const stdout = (res.stdout || '').trim();
  const stderr = (res.stderr || '').trim();
  const timedOut = Boolean(res.error && res.error.code === 'ETIMEDOUT');
  const exitCode = timedOut ? 124 : (typeof res.status === 'number' ? res.status : 1);

  return {
    command: cmdStr,
    exit_code: exitCode,
    passed: exitCode === 0,
    timed_out: timedOut,
    duration_ms: durationMs,
    stdout_sha256: sha256(stdout),
    stderr_sha256: sha256(stderr),
    stdout_preview: stdout.slice(0, 500),
    stderr_preview: stderr.slice(0, 500),
  };
}

function cmdVerifyRun(hp, flags) {
  const contract = loadContract(hp, flags.task);
  const taskId = contract.task_id;
  const execCwd = getExecutionCwd(hp, contract);
  const inWorktree = normalizePathForHash(execCwd) !== normalizePathForHash(hp.root);

  const { rawDiff, changedFiles, changedLines, filesHash } = collectGitDiffAndFiles(execCwd);

  const scopeViolations = changedFiles.filter(f => !matchesAnyGlob(f, contract.allowed_paths));
  const protectedViolations = changedFiles.filter(f => matchesAnyGlob(f, PROTECTED_GLOBS));

  let isolationWarning = null;
  if (contract.mode === 'worktree' && !inWorktree) {
    scopeViolations.push('MODE_VIOLATION: Contract requires isolated worktree (.harness/worktrees/' + taskId + ')');
  } else if (contract.mode === 'adaptive' && !inWorktree) {
    const maxFiles = contract.adaptive_thresholds?.max_in_tree_files ?? 1;
    const maxLines = contract.adaptive_thresholds?.max_in_tree_changed_lines ?? 20;
    if (changedFiles.length > maxFiles || changedLines > maxLines) {
      isolationWarning = `Adaptive threshold exceeded in-tree (${changedFiles.length} files, ${changedLines} lines > ${maxFiles} file / ${maxLines} lines). Recommend spawning worktree for future multi-file edits.`;
    }
  }

  const commandResults = contract.acceptance_commands.map(cmd => runShellCommand(cmd, execCwd, 120000));
  const allCommandsPassed = commandResults.every(r => r.passed);
  const status = scopeViolations.length === 0 && protectedViolations.length === 0 && allCommandsPassed ? 'PASS' : 'FAIL';

  const diffHash = sha256(rawDiff);
  ensureDirs([hp.receipts]);
  const receiptFile = path.join(hp.receipts, `${taskId}.json`);
  let existingSkeptic = null;
  let prevFailures = 0;

  if (fs.existsSync(receiptFile)) {
    try {
      const prev = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
      prevFailures = Number(prev.consecutive_failures) || 0;
      if (prev.diff_sha256 === diffHash && prev.skeptic_verdict) {
        existingSkeptic = {
          skeptic_verdict: prev.skeptic_verdict,
          skeptic_reason: prev.skeptic_reason || null,
          skeptic_stamped_at: prev.skeptic_stamped_at || null,
        };
      }
    } catch {
      // ignore
    }
  }

  const skepticVerdict = existingSkeptic ? existingSkeptic.skeptic_verdict : 'PENDING';
  const consecutiveFailures = status === 'FAIL'
    ? prevFailures + 1
    : (skepticVerdict === 'APPROVE' ? 0 : prevFailures);
  const escalation = computeEscalation(consecutiveFailures);

  const receipt = {
    schema_version: 2,
    task_id: taskId,
    verified_at: new Date().toISOString(),
    status,
    execution_context: inWorktree ? 'worktree' : 'in-tree',
    changed_files: changedFiles,
    changed_lines: changedLines,
    scope_violations: [...scopeViolations, ...protectedViolations],
    isolation_warning: isolationWarning,
    diff_sha256: diffHash,
    files_sha256: filesHash,
    command_results: commandResults,
    skeptic_verdict: skepticVerdict,
    skeptic_reason: existingSkeptic ? existingSkeptic.skeptic_reason : null,
    skeptic_stamped_at: existingSkeptic ? existingSkeptic.skeptic_stamped_at : null,
    consecutive_failures: consecutiveFailures,
    strike: escalation.strike,
    escalation_action: escalation.escalation_action,
  };

  fs.writeFileSync(receiptFile, JSON.stringify(receipt, null, 2) + '\n', 'utf8');
  updateProgressFile(hp, contract, {
    step: `Ran deterministic verify: status=${status} (diff_sha256=${diffHash.slice(0, 12)}, strike=${escalation.strike})`,
    statusNote: status === 'PASS' ? 'VERIFIED_PENDING_SKEPTIC' : 'VERIFY_FAILED',
  });

  let autoStagedRegression = null;
  if (status === 'FAIL') {
    const failedCmds = commandResults.filter(r => !r.passed);
    const failParts = [];
    if (receipt.scope_violations.length) failParts.push(`scope violations: ${receipt.scope_violations.join(', ')}`);
    if (failedCmds.length) failParts.push(`failed commands: ${failedCmds.map(c => `${c.command} (exit ${c.exit_code})`).join(', ')}`);
    const failSummary = failParts.join('; ') || 'verification failed';
    const inferredDomain = (changedFiles[0] && changedFiles[0].includes('/'))
      ? changedFiles[0].split('/')[0]
      : 'verify';
    try {
      const staged = recordFlywheelEntry(hp, {
        kind: 'regression',
        taskId,
        source: 'verify',
        domain: inferredDomain,
        cause: `verify run FAIL on ${taskId}: ${failSummary}`,
        rule: `Resolve ${failSummary} and verify green receipt before completion.`,
        reproCmd: failedCmds[0]?.command || null,
        promote: false,
        updateProgress: false,
        updateRules: false,
      });
      autoStagedRegression = staged.record.id;
    } catch {
      // Auto-staging must never mask verify output
    }
    if (escalation.banner) {
      console.error(escalation.banner);
    }
  }

  console.log(JSON.stringify({
    ok: status === 'PASS',
    action: 'verify.run',
    receipt_path: toPosix(path.relative(hp.root, receiptFile)),
    strike: escalation.strike,
    escalation_action: escalation.escalation_action,
    ...(autoStagedRegression ? { auto_staged_regression: autoStagedRegression } : {}),
    receipt,
  }, null, 2));
  if (status !== 'PASS') process.exit(1);
}

function cmdVerifyStatusCheck(hp, flags, stdinData = null) {
  const hookHost = parseHookHost(flags.hook);

  if (hookHost && stdinData) {
    const terminationReason = stdinData.terminationReason || stdinData.stop_reason || stdinData.stopReason;
    if (
      stdinData.continuationActive === true ||
      stdinData.stop_hook_active === true ||
      STOP_BYPASS_REASONS.has(terminationReason)
    ) {
      if (hookHost === 'antigravity') console.log('{}');
      return;
    }
  }

  const emitStopAllow = cliPayload => {
    if (hookHost === 'antigravity') {
      console.log('{}');
      return;
    }
    if (!hookHost) {
      console.log(JSON.stringify(cliPayload));
    }
  };

  const emitStopFailure = reason => {
    if (hookHost) {
      console.log(JSON.stringify({
        decision: hookHost === 'antigravity' ? 'continue' : 'block',
        reason,
      }));
      return;
    }
    console.error(reason);
    process.exit(1);
  };

  const taskId = resolveTaskId(hp, flags.task);
  if (!taskId) {
    emitStopAllow({ ok: true, action: 'verify.status-check', active_contract: null });
    return;
  }

  const receiptFile = path.join(hp.receipts, `${taskId}.json`);
  if (!fs.existsSync(receiptFile)) {
    emitStopFailure(
      `[HARNESS STOP CHECK] Active contract "${taskId}" has no verification receipt (.harness/receipts/${taskId}.json). Run 'harness.mjs verify run --task ${taskId}' and checkpoint .harness/PROGRESS.md before finishing.`
    );
    return;
  }

  let receipt;
  try {
    receipt = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
  } catch {
    emitStopFailure(
      `[HARNESS STOP CHECK] Active contract "${taskId}" has an unreadable verification receipt (.harness/receipts/${taskId}.json). Re-run 'harness.mjs verify run --task ${taskId}'.`
    );
    return;
  }

  if (receipt.status !== 'PASS') {
    emitStopFailure(
      `[HARNESS STOP CHECK] Active contract "${taskId}" verification receipt status is "${receipt.status || 'UNKNOWN'}" (expected "PASS"). Fix failures, re-run 'harness.mjs verify run --task ${taskId}', and checkpoint .harness/PROGRESS.md before finishing.`
    );
    return;
  }

  if (receipt.skeptic_verdict === 'REJECT') {
    emitStopFailure(
      `[HARNESS STOP CHECK] Active contract "${taskId}" was REJECTED by Cold-Context Skeptic (${receipt.skeptic_reason || 'blocking issues unresolved'}). Fix issues, re-run 'harness.mjs verify run --task ${taskId}', and re-stamp skeptic before finishing.`
    );
    return;
  }

  // Diff Freshness Gate: recompute current git diff HEAD SHA-256 and confirm it matches receipt.diff_sha256
  let contract = null;
  try {
    contract = loadContract(hp, taskId);
  } catch {
    contract = null;
  }
  const execCwd = contract ? getExecutionCwd(hp, contract) : (hp.worktreeRoot || hp.root);
  const { rawDiff } = collectGitDiffAndFiles(execCwd);
  const currentDiffHash = sha256(rawDiff);
  if (!receipt.diff_sha256 || currentDiffHash !== receipt.diff_sha256) {
    emitStopFailure(
      `[HARNESS STOP CHECK] Working tree diff_sha256 (${currentDiffHash.slice(0, 12)}) does not match verified receipt (${String(receipt.diff_sha256 || 'missing').slice(0, 12)}) for task "${taskId}". Files changed after PASS — re-run 'harness.mjs verify run --task ${taskId}' before finishing.`
    );
    return;
  }

  emitStopAllow({
    ok: true,
    action: 'verify.status-check',
    task_id: taskId,
    receipt_status: receipt.status,
    skeptic_verdict: receipt.skeptic_verdict,
    diff_sha256: currentDiffHash,
    diff_fresh: true,
  });
}

function cmdSkepticPacket(hp, flags) {
  const contract = loadContract(hp, flags.task);
  const taskId = contract.task_id;
  const receiptFile = path.join(hp.receipts, `${taskId}.json`);
  if (!fs.existsSync(receiptFile)) {
    throw new Error(`Receipt not found for task "${taskId}". Run 'harness.mjs verify run --task ${taskId}' before generating skeptic packet.`);
  }
  const receipt = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
  const execCwd = getExecutionCwd(hp, contract);
  const { rawDiff } = collectGitDiffAndFiles(execCwd);

  ensureDirs([hp.context]);
  const briefFile = path.join(hp.context, `${taskId}-brief.json`);

  // Strictly isolated cold-context packet: ONLY contract, raw git_diff, and receipt. Zero author prose.
  const brief = {
    contract,
    git_diff: rawDiff,
    receipt,
  };

  fs.writeFileSync(briefFile, JSON.stringify(brief, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({
    ok: true,
    action: 'skeptic-packet',
    task_id: taskId,
    brief_path: toPosix(path.relative(hp.root, briefFile)),
    keys: Object.keys(brief),
  }, null, 2));
}

async function cmdStampSkeptic(hp, flags) {
  let skepticJson = null;
  if (flags['from-json']) {
    skepticJson = await readJsonFromSource(String(flags['from-json']), hp.worktreeRoot || hp.root);
  }

  const requestedTask = flags.task || skepticJson?.task_id;
  const contract = loadContract(hp, requestedTask);
  const taskId = contract.task_id;
  const verdict = String(flags.verdict || skepticJson?.verdict || '').toUpperCase();
  const reason = flags.reason || skepticJson?.summary || skepticJson?.reason || '';

  if (!['APPROVE', 'REJECT'].includes(verdict)) {
    throw new Error('Usage: harness.mjs stamp-skeptic --task <id> (--verdict <APPROVE|REJECT> [--reason <text>] | --from-json <file|->)');
  }

  const receiptFile = path.join(hp.receipts, `${taskId}.json`);
  if (!fs.existsSync(receiptFile)) {
    throw new Error(`Receipt not found for task "${taskId}". Run 'harness.mjs verify run --task ${taskId}' first.`);
  }

  const receipt = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
  receipt.skeptic_verdict = verdict;
  receipt.skeptic_reason = reason || (verdict === 'APPROVE' ? 'All contract invariants and boundaries verified.' : 'Rejected by Cold-Context Skeptic.');
  receipt.skeptic_stamped_at = new Date().toISOString();

  const prevFailures = Number(receipt.consecutive_failures) || 0;
  if (verdict === 'REJECT') {
    receipt.consecutive_failures = prevFailures + 1;
  } else if (verdict === 'APPROVE' && receipt.status === 'PASS') {
    receipt.consecutive_failures = 0;
  }
  const escalation = computeEscalation(receipt.consecutive_failures);
  receipt.strike = escalation.strike;
  receipt.escalation_action = escalation.escalation_action;

  fs.writeFileSync(receiptFile, JSON.stringify(receipt, null, 2) + '\n', 'utf8');
  updateProgressFile(hp, contract, {
    step: `Stamped Skeptic verdict: ${verdict}${reason ? ` (${reason})` : ''} (strike=${escalation.strike})`,
    failedHypothesis: verdict === 'REJECT' ? `Skeptic rejected diff: ${receipt.skeptic_reason}` : undefined,
    statusNote: verdict === 'APPROVE' ? 'SKEPTIC_APPROVED' : 'SKEPTIC_REJECTED',
  });

  const stagedRegressions = [];
  const stagedExemplars = [];

  if (skepticJson) {
    const blockingIssues = Array.isArray(skepticJson.blocking_issues) ? skepticJson.blocking_issues : [];
    for (const issue of blockingIssues) {
      if (!issue || typeof issue !== 'object') continue;
      const ruleText = typeof issue.proposed_flywheel_rule === 'string' ? issue.proposed_flywheel_rule.trim() : '';
      if (!ruleText) continue;
      const causeText = issue.invariant_violated || issue.fix_required || receipt.skeptic_reason;
      const staged = recordFlywheelEntry(hp, {
        kind: 'regression',
        taskId,
        source: 'skeptic',
        domain: issue.domain || 'general',
        cause: String(causeText),
        rule: ruleText,
        reproCmd: issue.repro_cmd || null,
        promote: false,
        updateProgress: false,
        updateRules: false,
      });
      stagedRegressions.push(staged.record.id);
    }

    const verifiedExemplars = Array.isArray(skepticJson.verified_exemplars) ? skepticJson.verified_exemplars : [];
    for (const ex of verifiedExemplars) {
      if (!ex || typeof ex !== 'object') continue;
      const pattern = typeof ex.pattern === 'string' && ex.pattern.trim()
        ? ex.pattern.trim()
        : (typeof ex.rule === 'string' ? ex.rule.trim() : '');
      if (!pattern) continue;
      const staged = recordFlywheelEntry(hp, {
        kind: 'exemplar',
        taskId,
        source: 'skeptic',
        domain: ex.domain || 'general',
        cause: ex.context || ex.cause || receipt.skeptic_reason || 'Verified winning pattern by Cold-Context Skeptic',
        rule: pattern,
        reproCmd: ex.evidence_cmd || ex.repro_cmd || null,
        trigger: ex.trigger || null,
        promote: false,
        updateProgress: false,
        updateRules: false,
      });
      stagedExemplars.push(staged.record.id);
    }
  }

  if (verdict === 'REJECT' && escalation.banner) {
    console.error(escalation.banner);
  }

  console.log(JSON.stringify({
    ok: verdict === 'APPROVE',
    action: 'stamp-skeptic',
    task_id: taskId,
    verdict,
    reason: receipt.skeptic_reason,
    strike: escalation.strike,
    escalation_action: escalation.escalation_action,
    staged_regressions: stagedRegressions,
    staged_exemplars: stagedExemplars,
  }, null, 2));
}

function isSkillsSourceRepo(root) {
  return (
    fs.existsSync(path.join(root, 'tools', 'codex', 'build.mjs')) &&
    fs.existsSync(path.join(root, 'tools', 'claude', 'build.mjs'))
  );
}

function resolveLearnedInvariantsPaths(root) {
  const primary = path.join(root, '.agents', 'rules', 'learned-invariants.md');
  if (isSkillsSourceRepo(root)) {
    ensureDirs([path.dirname(primary)]);
    return [primary];
  }
  const candidates = [
    primary,
    path.join(root, '.codex', 'rules', 'learned-invariants.md'),
    path.join(root, '.claude', 'rules', 'learned-invariants.md'),
  ];
  const active = candidates.filter(p => fs.existsSync(path.dirname(p)));
  if (active.length === 0) {
    ensureDirs([path.dirname(primary)]);
    return [primary];
  }
  return active;
}

function findMarkerBlock(lines, startMarker, endMarker) {
  const start = lines.findIndex(l => l.trim() === startMarker);
  if (start === -1) return null;
  const end = lines.findIndex((l, idx) => idx > start && l.trim() === endMarker);
  if (end === -1) return null;
  return { start, end };
}

function findHeadingSection(lines, headingRegex) {
  const headingIdx = lines.findIndex(l => headingRegex.test(l.trim()));
  if (headingIdx === -1) return null;
  let end = lines.length;
  for (let i = headingIdx + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i].trim())) {
      end = i;
      break;
    }
  }
  return { headingIdx, start: headingIdx, end };
}

function locateInvariantSections(lines) {
  const promotedMarker = findMarkerBlock(lines, PROMOTED_START_MARKER, PROMOTED_END_MARKER);
  const exemplarMarker = findMarkerBlock(lines, EXEMPLAR_START_MARKER, EXEMPLAR_END_MARKER);
  const stagedMarker = findMarkerBlock(lines, STAGED_START_MARKER, STAGED_END_MARKER);
  const promotedHeading = findHeadingSection(lines, PROMOTED_HEADING_RE);
  const exemplarHeading = findHeadingSection(lines, EXEMPLAR_HEADING_RE);
  const stagedHeading = findHeadingSection(lines, STAGED_HEADING_RE);
  return {
    promotedMarker,
    exemplarMarker,
    stagedMarker,
    promotedHeading,
    exemplarHeading,
    stagedHeading,
    promotedRange: promotedMarker || promotedHeading,
    exemplarRange: exemplarMarker || exemplarHeading,
    stagedRange: stagedMarker || stagedHeading,
  };
}

function countBulletsInRange(lines, range) {
  if (!range) return 0;
  let count = 0;
  for (let i = range.start + 1; i < range.end; i++) {
    if (/^- /.test(lines[i])) count++;
  }
  return count;
}

function insertBulletIntoSection(lines, bullet, { markerBlock, headingSection, fallbackHeading, startMarker, endMarker, insertBeforeIndex = null }) {
  if (markerBlock) {
    lines.splice(markerBlock.end, 0, bullet);
    return lines;
  }
  if (headingSection) {
    lines.splice(headingSection.headingIdx + 1, 0, bullet);
    return lines;
  }
  const block = [fallbackHeading, '', startMarker, bullet, endMarker, ''];
  if (insertBeforeIndex !== null && insertBeforeIndex >= 0 && insertBeforeIndex <= lines.length) {
    lines.splice(insertBeforeIndex, 0, ...block);
    return lines;
  }
  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  if (lines.length > 0) lines.push('');
  lines.push(...block);
  return lines;
}

function ensureLearnedInvariantsFile(filePath) {
  if (fs.existsSync(filePath)) return;
  const isAgents = filePath.includes(`${path.sep}.agents${path.sep}`);
  const header = isAgents
    ? [
        '---',
        'trigger: model_decision',
        'description: Calibrated 3-Tier Memory Flywheel store of core project invariants, verified winning exemplars, and anti-regression guardrails loaded before planning, code edits, or verification gates.',
        '---',
        '',
      ].join('\n')
    : '';
  const body = [
    '# Learned Invariants & Memory Flywheel Rules',
    '',
    'This file is maintained by `harness.mjs flywheel`. Rules in **Promoted Project Invariants** and **Promoted Positive Exemplars** are curated workspace guidance.',
    '',
    '## Promoted Project Invariants',
    '',
    PROMOTED_START_MARKER,
    PROMOTED_END_MARKER,
    '',
    '## Promoted Positive Exemplars',
    '',
    EXEMPLAR_START_MARKER,
    EXEMPLAR_END_MARKER,
    '',
    '## Staged Candidates (Pending Promotion)',
    '',
    STAGED_START_MARKER,
    STAGED_END_MARKER,
    '',
  ].join('\n');
  fs.writeFileSync(filePath, header + body, 'utf8');
}

function stripInvariantSourceSuffix(text) {
  return String(text || '')
    .trim()
    .replace(/\s*\((?:Source|ID|Kind):\s*[^)]*\)\s*\.?$/i, '')
    .replace(/\s*\((?:Source|ID|Kind):\s*[^)]*\)\s*\.?$/i, '')
    .replace(/\.\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeInvariantBullet(line) {
  const trimmed = String(line || '').trim();
  const match = trimmed.match(/^-\s+\*\*\[([^\]]+)\]\*\*:\s*(.+)$/);
  if (!match) return trimmed;
  const dom = match[1].trim().toLowerCase();
  const body = stripInvariantSourceSuffix(match[2]).toLowerCase();
  return `- **[${dom}]**: ${body}`;
}

function parseBulletDomainAndBody(line) {
  const match = String(line || '').trim().match(/^-\s+\*\*\[([^\]]+)\]\*\*:\s*(.+)$/);
  if (!match) return null;
  return {
    domain: match[1].trim(),
    body: stripInvariantSourceSuffix(match[2]),
    rawBody: match[2].trim(),
  };
}

function upsertInvariantRule(filePath, domain, ruleText, { promote = false, kind = 'regression', entryId = null } = {}) {
  ensureLearnedInvariantsFile(filePath);
  const current = fs.readFileSync(filePath, 'utf8');
  const eol = current.includes('\r\n') ? '\r\n' : '\n';
  const lines = current.split(/\r?\n/);

  const tag = entryId ? ` (ID: ${entryId})` : '';
  const formattedBullet = `- **[${domain}]**: ${ruleText}${tag}`;
  const normalizedTarget = normalizeInvariantBullet(formattedBullet);

  const matchIndices = [];
  for (let i = 0; i < lines.length; i++) {
    if (normalizeInvariantBullet(lines[i]) === normalizedTarget) {
      matchIndices.push(i);
    }
  }

  const sections = locateInvariantSections(lines);
  const isInRange = (idx, range) => Boolean(range && idx > range.start && idx < range.end);
  const targetRange = kind === 'exemplar' ? sections.exemplarRange : sections.promotedRange;

  const insertIntoTarget = targetLines => {
    const nextSections = locateInvariantSections(targetLines);
    if (!promote) {
      insertBulletIntoSection(targetLines, formattedBullet, {
        markerBlock: nextSections.stagedMarker,
        headingSection: nextSections.stagedHeading,
        fallbackHeading: '## Staged Candidates (Pending Promotion)',
        startMarker: STAGED_START_MARKER,
        endMarker: STAGED_END_MARKER,
      });
      return;
    }
    if (kind === 'exemplar') {
      const beforeStaged = nextSections.stagedHeading ? nextSections.stagedHeading.headingIdx : null;
      insertBulletIntoSection(targetLines, formattedBullet, {
        markerBlock: nextSections.exemplarMarker,
        headingSection: nextSections.exemplarHeading,
        fallbackHeading: '## Promoted Positive Exemplars',
        startMarker: EXEMPLAR_START_MARKER,
        endMarker: EXEMPLAR_END_MARKER,
        insertBeforeIndex: beforeStaged,
      });
      return;
    }
    insertBulletIntoSection(targetLines, formattedBullet, {
      markerBlock: nextSections.promotedMarker,
      headingSection: nextSections.promotedHeading,
      fallbackHeading: '## Promoted Project Invariants',
      startMarker: PROMOTED_START_MARKER,
      endMarker: PROMOTED_END_MARKER,
    });
  };

  if (matchIndices.length > 0) {
    const stagedMatches = matchIndices.filter(idx => isInRange(idx, sections.stagedRange));
    const targetMatches = matchIndices.filter(idx => isInRange(idx, targetRange));
    const anyMatchesOutside = matchIndices.some(
      idx => !isInRange(idx, sections.stagedRange) && !isInRange(idx, sections.promotedRange) && !isInRange(idx, sections.exemplarRange)
    );

    if (promote && stagedMatches.length > 0) {
      const stagedSet = new Set(stagedMatches);
      const nextLines = lines.filter((_, idx) => !stagedSet.has(idx));
      if (targetMatches.length === 0 && !anyMatchesOutside) {
        insertIntoTarget(nextLines);
      }
      fs.writeFileSync(filePath, nextLines.join(eol), 'utf8');
      const finalSections = locateInvariantSections(nextLines);
      return {
        deduplicated: false,
        promoted: true,
        exemplar_count: countBulletsInRange(nextLines, finalSections.exemplarRange),
      };
    }
    return {
      deduplicated: true,
      promoted: Boolean(promote),
      exemplar_count: countBulletsInRange(lines, sections.exemplarRange),
    };
  }

  insertIntoTarget(lines);
  fs.writeFileSync(filePath, lines.join(eol), 'utf8');
  const finalSections = locateInvariantSections(lines);
  return {
    deduplicated: false,
    promoted: Boolean(promote),
    exemplar_count: countBulletsInRange(lines, finalSections.exemplarRange),
  };
}

function removeBulletsFromLearnedInvariants(filePath, predicate, { includePromoted = true, includeExemplars = true, includeStaged = true } = {}) {
  if (!fs.existsSync(filePath)) return 0;
  const current = fs.readFileSync(filePath, 'utf8');
  const eol = current.includes('\r\n') ? '\r\n' : '\n';
  const lines = current.split(/\r?\n/);
  const sections = locateInvariantSections(lines);
  const isInRange = (idx, range) => Boolean(range && idx > range.start && idx < range.end);

  let removed = 0;
  const nextLines = lines.filter((line, idx) => {
    const inPromoted = includePromoted && isInRange(idx, sections.promotedRange);
    const inExemplars = includeExemplars && isInRange(idx, sections.exemplarRange);
    const inStaged = includeStaged && isInRange(idx, sections.stagedRange);
    if (!inPromoted && !inExemplars && !inStaged) return true;
    if (!/^- /.test(line)) return true;
    if (predicate(line, { inPromoted, inExemplars, inStaged })) {
      removed++;
      return false;
    }
    return true;
  });

  if (removed > 0) {
    fs.writeFileSync(filePath, nextLines.join(eol), 'utf8');
  }
  return removed;
}

function measureInvariantBudget(hp) {
  const primary = path.join(hp.root, '.agents', 'rules', 'learned-invariants.md');
  const candidates = [
    primary,
    path.join(hp.root, '.codex', 'rules', 'learned-invariants.md'),
    path.join(hp.root, '.claude', 'rules', 'learned-invariants.md'),
  ];
  const hasAnyRuleDir = candidates.some(p => fs.existsSync(path.dirname(p)));
  const resolved = hasAnyRuleDir ? resolveLearnedInvariantsPaths(hp.root) : [primary];
  const targetPath = resolved.find(p => fs.existsSync(p)) || primary;
  const relPath = toPosix(path.relative(hp.root, targetPath));

  if (!fs.existsSync(targetPath)) {
    return {
      path: relPath,
      bytes: 0,
      max_bytes_limit: INVARIANT_MAX_BYTES,
      soft_bytes_limit: INVARIANT_SOFT_BYTES,
      promoted_count: 0,
      exemplar_count: 0,
      exemplar_soft_limit: INVARIANT_EXEMPLAR_SOFT_LIMIT,
      staged_count: 0,
    };
  }

  const raw = fs.readFileSync(targetPath, 'utf8');
  const bytes = fs.statSync(targetPath).size;
  const lines = raw.split(/\r?\n/);
  const sections = locateInvariantSections(lines);
  return {
    path: relPath,
    bytes,
    max_bytes_limit: INVARIANT_MAX_BYTES,
    soft_bytes_limit: INVARIANT_SOFT_BYTES,
    promoted_count: countBulletsInRange(lines, sections.promotedRange),
    exemplar_count: countBulletsInRange(lines, sections.exemplarRange),
    exemplar_soft_limit: INVARIANT_EXEMPLAR_SOFT_LIMIT,
    staged_count: countBulletsInRange(lines, sections.stagedRange),
  };
}

function readJsonlLines(jsonlPath) {
  if (!fs.existsSync(jsonlPath)) return [];
  return fs.readFileSync(jsonlPath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => {
      try {
        return { raw: line, entry: JSON.parse(line) };
      } catch {
        return { raw: line, entry: null };
      }
    });
}

function writeJsonlLines(jsonlPath, items) {
  ensureDirs([path.dirname(jsonlPath)]);
  const body = items.length > 0
    ? items.map(item => (item.entry ? JSON.stringify(item.entry) : item.raw)).join('\n') + '\n'
    : '';
  writeFileAtomic(jsonlPath, body);
}

function buildActiveClusters(entries) {
  const domainMap = new Map();
  for (const entry of entries) {
    if (entry.graduated === true) continue;
    const dom = entry.domain || 'general';
    if (!domainMap.has(dom)) {
      domainMap.set(dom, {
        domain: dom,
        count: 0,
        regressions: 0,
        exemplars: 0,
        causes: [],
        recent_rules: [],
        repro_cmds: [],
      });
    }
    const cluster = domainMap.get(dom);
    cluster.count++;
    if (entry.kind === 'exemplar') cluster.exemplars++;
    else cluster.regressions++;

    const causeText = entry.cause || entry.root_cause;
    if (causeText && !cluster.causes.includes(causeText)) {
      cluster.causes.push(causeText);
    }
    if (entry.rule) {
      const idx = cluster.recent_rules.indexOf(entry.rule);
      if (idx !== -1) cluster.recent_rules.splice(idx, 1);
      cluster.recent_rules.unshift(entry.rule);
    }
    const cmdText = entry.repro_cmd || entry.evidence_cmd;
    if (cmdText && !cluster.repro_cmds.includes(cmdText)) {
      cluster.repro_cmds.push(cmdText);
    }
  }
  const clusters = Array.from(domainMap.values())
    .map(c => ({
      ...c,
      causes: c.causes.slice(0, 10),
      recent_rules: c.recent_rules.slice(0, 10),
      repro_cmds: c.repro_cmds.slice(0, 10),
    }))
    .sort((a, b) => b.count - a.count || a.domain.localeCompare(b.domain));
  return {
    clusters,
    graduation_candidates: clusters.filter(c => c.count >= DIGEST_DOMAIN_THRESHOLD),
  };
}

function recordFlywheelEntry(hp, opts) {
  const kind = String(opts.kind || 'regression').toLowerCase();
  const source = String(opts.source || 'verify').toLowerCase();
  const domain = String(opts.domain || 'general').trim() || 'general';
  const cause = String(opts.cause || '').trim();
  const rule = String(opts.rule || '').trim();
  const reproCmd = opts.reproCmd ? String(opts.reproCmd).trim() : null;
  const trigger = opts.trigger ? String(opts.trigger).trim() : null;
  const score = opts.score !== undefined && opts.score !== null && opts.score !== ''
    ? Number(opts.score)
    : null;
  const shouldPromote = Boolean(opts.promote); // ETH Zurich anti-bloat guard: NEVER auto-promote without --promote!
  const taskId = opts.taskId || resolveTaskId(hp, null) || 'unscoped';
  const shouldUpdateProgress = opts.updateProgress !== false;
  const shouldUpdateRules = opts.updateRules !== false;

  if (!['regression', 'exemplar'].includes(kind)) {
    throw new Error('Invalid --kind. Expected regression or exemplar.');
  }
  if (!['skeptic', 'verify', 'evaluator', 'user', 'swarm'].includes(source)) {
    throw new Error('Invalid --source. Expected skeptic, verify, evaluator, user, or swarm.');
  }
  if (!cause || !rule) {
    throw new Error('Both --cause and --rule are required.');
  }
  if (score !== null && !Number.isFinite(score)) {
    throw new Error(`Invalid --score "${opts.score}". Expected a numeric value.`);
  }

  ensureDirs([hp.evals]);
  const storePath = kind === 'exemplar' ? hp.exemplars : hp.regressions;
  const prefix = kind === 'exemplar' ? 'ex' : 'reg';
  const nowIso = new Date().toISOString();

  const existingItems = readJsonlLines(storePath);
  const normalizedRule = stripInvariantSourceSuffix(rule).toLowerCase();
  const matchIdx = existingItems.findIndex(item => {
    const e = item.entry;
    if (!e || e.graduated === true) return false;
    return (
      String(e.domain || '').toLowerCase() === domain.toLowerCase() &&
      stripInvariantSourceSuffix(e.rule).toLowerCase() === normalizedRule
    );
  });

  let record;
  let deduplicated = false;

  if (matchIdx !== -1) {
    deduplicated = true;
    const prev = existingItems[matchIdx].entry;
    record = {
      ...prev,
      kind,
      last_seen: nowIso,
      task_id: taskId,
      source,
      domain,
      cause: cause || prev.cause || prev.root_cause,
      rule,
      repro_cmd: reproCmd || prev.repro_cmd || null,
      trigger: trigger || prev.trigger || null,
      score: score !== null ? score : (prev.score ?? null),
      hits: (Number(prev.hits) || 1) + 1,
      helpful: Number(prev.helpful) || (kind === 'exemplar' ? 1 : 0),
      harmful: Number(prev.harmful) || 0,
      promoted: Boolean(prev.promoted) || shouldPromote,
      graduated: Boolean(prev.graduated),
    };
    existingItems[matchIdx] = { raw: JSON.stringify(record), entry: record };
    writeJsonlLines(storePath, existingItems);
  } else {
    const entryId = `${prefix}-${sha256(`${kind}:${domain}:${cause}:${rule}`).slice(0, 10)}`;
    record = {
      id: entryId,
      kind,
      timestamp: nowIso,
      last_seen: nowIso,
      task_id: taskId,
      source,
      domain,
      cause,
      rule,
      repro_cmd: reproCmd,
      trigger,
      score,
      hits: 1,
      helpful: kind === 'exemplar' ? 1 : 0,
      harmful: 0,
      promoted: shouldPromote,
      graduated: false,
    };
    fs.appendFileSync(storePath, JSON.stringify(record) + '\n', 'utf8');
  }

  let ruleUpdates = [];
  let advisory = null;
  if (shouldUpdateRules) {
    const ruleTargets = resolveLearnedInvariantsPaths(hp.root);
    ruleUpdates = ruleTargets.map(target => ({
      path: toPosix(path.relative(hp.root, target)),
      ...upsertInvariantRule(target, domain, rule, { promote: shouldPromote, kind, entryId: record.id }),
    }));
    if (shouldPromote && kind === 'exemplar') {
      const maxExCount = Math.max(0, ...ruleUpdates.map(u => Number(u.exemplar_count) || 0));
      if (maxExCount > INVARIANT_EXEMPLAR_SOFT_LIMIT) {
        advisory = `Promoted exemplars (${maxExCount}) exceeded soft cap (${INVARIANT_EXEMPLAR_SOFT_LIMIT}). Run 'harness.mjs flywheel digest --graduate ${domain}' or 'flywheel prune' to prevent context bloat.`;
      }
    }
  }

  if (shouldUpdateProgress) {
    try {
      const contract = loadContract(hp, taskId);
      // Only log regressions (NOT exemplars!) under Failed Hypotheses in PROGRESS.md
      updateProgressFile(hp, contract, {
        step: `Recorded flywheel ${kind} [${domain}] (${shouldPromote ? 'PROMOTED' : 'STAGED'})`,
        failedHypothesis: kind === 'regression' ? `${cause} -> Guardrail: ${rule}` : undefined,
      });
    } catch {
      // Contract optional when recording standalone flywheel lesson
    }
  }

  return { storePath, record, deduplicated, ruleUpdates, advisory };
}

function cmdFlywheelRecord(hp, flags) {
  const kind = flags.kind || 'regression';
  const taskId = resolveTaskId(hp, flags.task) || 'unscoped';
  const source = flags.source || 'verify';
  const domain = flags.domain || 'general';
  const cause = flags.cause;
  const rule = flags.rule;
  const reproCmd = flags.repro || flags.cmd || null;
  const trigger = flags.trigger || null;
  const score = flags.score !== undefined ? flags.score : null;
  const promote = Boolean(flags.promote);

  if (!cause || !rule) {
    throw new Error('Usage: harness.mjs flywheel record [--kind <regression|exemplar>] --source <skeptic|verify|evaluator|user|swarm> --domain <domain> --cause <text> --rule <text> [--repro <cmd>] [--trigger <text>] [--score <n>] [--promote]');
  }

  const { storePath, record, deduplicated, ruleUpdates, advisory } = recordFlywheelEntry(hp, {
    kind,
    taskId,
    source,
    domain,
    cause,
    rule,
    reproCmd,
    trigger,
    score,
    promote,
  });

  let budget = { bytes: 0, promoted_count: 0, exemplar_count: 0, staged_count: 0, curation_recommended: false };
  try {
    const measured = measureInvariantBudget(hp);
    const allEntries = [
      ...readJsonlLines(hp.regressions).map(i => i.entry).filter(Boolean),
      ...readJsonlLines(hp.exemplars).map(i => i.entry).filter(Boolean),
    ];
    const { graduation_candidates } = buildActiveClusters(allEntries);
    budget = {
      bytes: measured.bytes,
      promoted_count: measured.promoted_count,
      exemplar_count: measured.exemplar_count,
      staged_count: measured.staged_count,
      curation_recommended:
        measured.promoted_count >= INVARIANT_PROMOTED_SOFT_LIMIT ||
        measured.exemplar_count > INVARIANT_EXEMPLAR_SOFT_LIMIT ||
        measured.bytes >= INVARIANT_SOFT_BYTES ||
        graduation_candidates.length > 0,
    };
  } catch {
    // Telemetry must never fail flywheel record
  }

  console.log(JSON.stringify({
    ok: true,
    action: 'flywheel.record',
    store_path: toPosix(path.relative(hp.root, storePath)),
    regression_path: toPosix(path.relative(hp.root, hp.regressions)),
    deduplicated,
    record,
    rule_updates: ruleUpdates,
    ...(advisory ? { advisory } : {}),
    budget,
  }, null, 2));
}

function findFlywheelEntryById(hp, id) {
  for (const [kind, storePath] of [['regression', hp.regressions], ['exemplar', hp.exemplars]]) {
    const items = readJsonlLines(storePath);
    const idx = items.findIndex(item => item.entry && item.entry.id === id);
    if (idx !== -1) {
      return { kind: items[idx].entry.kind || kind, storePath, items, idx };
    }
  }
  return null;
}

function cmdFlywheelPromote(hp, flags) {
  const id = typeof flags.id === 'string' ? flags.id.trim() : '';
  if (!id) {
    throw new Error('Usage: harness.mjs flywheel promote --id <reg-...|ex-...>');
  }

  const found = findFlywheelEntryById(hp, id);
  if (!found) {
    throw new Error(`Flywheel entry "${id}" not found in regressions.jsonl or exemplars.jsonl.`);
  }

  const nowIso = new Date().toISOString();
  const entry = {
    ...found.items[found.idx].entry,
    kind: found.kind,
    promoted: true,
    promoted_at: nowIso,
    last_seen: nowIso,
  };
  found.items[found.idx] = { raw: JSON.stringify(entry), entry };
  writeJsonlLines(found.storePath, found.items);

  const ruleTargets = resolveLearnedInvariantsPaths(hp.root);
  const ruleUpdates = ruleTargets.map(target => ({
    path: toPosix(path.relative(hp.root, target)),
    ...upsertInvariantRule(target, entry.domain || 'general', entry.rule, {
      promote: true,
      kind: found.kind,
      entryId: entry.id,
    }),
  }));

  const budget = measureInvariantBudget(hp);
  let advisory = null;
  if (found.kind === 'exemplar' && budget.exemplar_count >= INVARIANT_EXEMPLAR_SOFT_LIMIT) {
    advisory = `Promoted exemplars at ${budget.exemplar_count}/${INVARIANT_EXEMPLAR_SOFT_LIMIT} cap. Graduate a cluster with 'harness.mjs flywheel digest --graduate ${entry.domain || 'general'}' to keep context lean.`;
  }

  console.log(JSON.stringify({
    ok: true,
    action: 'flywheel.promote',
    id: entry.id,
    kind: found.kind,
    domain: entry.domain,
    rule: entry.rule,
    rule_updates: ruleUpdates,
    ...(advisory ? { advisory } : {}),
    budget,
  }, null, 2));
}

function cmdFlywheelFeedback(hp, flags) {
  const id = typeof flags.id === 'string' ? flags.id.trim() : '';
  const vote = typeof flags.vote === 'string' ? flags.vote.trim().toLowerCase() : '';
  if (!id || !['helpful', 'harmful'].includes(vote)) {
    throw new Error('Usage: harness.mjs flywheel feedback --id <reg-...|ex-...> --vote <helpful|harmful>');
  }

  const found = findFlywheelEntryById(hp, id);
  if (!found) {
    throw new Error(`Flywheel entry "${id}" not found in regressions.jsonl or exemplars.jsonl.`);
  }

  const nowIso = new Date().toISOString();
  const prev = found.items[found.idx].entry;
  const entry = {
    ...prev,
    helpful: (Number(prev.helpful) || 0) + (vote === 'helpful' ? 1 : 0),
    harmful: (Number(prev.harmful) || 0) + (vote === 'harmful' ? 1 : 0),
    last_seen: nowIso,
  };
  found.items[found.idx] = { raw: JSON.stringify(entry), entry };
  writeJsonlLines(found.storePath, found.items);

  console.log(JSON.stringify({
    ok: true,
    action: 'flywheel.feedback',
    id: entry.id,
    kind: found.kind,
    vote,
    helpful: entry.helpful,
    harmful: entry.harmful,
    last_seen: entry.last_seen,
  }, null, 2));
}

function resolveGraduationEdition(root, editionFlag) {
  if (typeof editionFlag === 'string' && editionFlag.trim()) {
    const clean = editionFlag.trim().replace(/^\./, '').toLowerCase();
    if (!['agents', 'claude', 'codex'].includes(clean)) {
      throw new Error(`Invalid --edition "${editionFlag}". Expected agents, claude, or codex.`);
    }
    return clean;
  }
  for (const candidate of ['agents', 'claude', 'codex']) {
    if (fs.existsSync(path.join(root, `.${candidate}`))) return candidate;
  }
  return 'agents';
}

function buildGraduatedSkillMarkdown(domain, slug, regEntries, exEntries, extraBullets) {
  let desc = `Project-specific ${domain} engineering guardrails, verified playbooks, and regression checks graduated from the harness memory flywheel. Use when editing, reviewing, or testing ${domain} code.`;
  if (desc.length > 255) {
    desc = `Project ${domain.slice(0, 40)} guardrails and playbooks graduated from the harness flywheel. Use when editing or reviewing ${domain.slice(0, 40)} code.`;
  }
  if (desc.length < 80) {
    desc = `${desc} Applies verified invariants and checks automatically.`;
  }

  const pitfalls = [];
  const seenPitfalls = new Set();
  for (const e of regEntries) {
    const cause = e.cause || e.root_cause;
    const line = cause ? `- **${e.rule}** *(Cause: ${cause})*` : `- **${e.rule}**`;
    const key = stripInvariantSourceSuffix(e.rule).toLowerCase();
    if (!seenPitfalls.has(key)) {
      seenPitfalls.add(key);
      pitfalls.push(line);
    }
  }
  for (const b of extraBullets.regressions) {
    const key = stripInvariantSourceSuffix(b).toLowerCase();
    if (!seenPitfalls.has(key)) {
      seenPitfalls.add(key);
      pitfalls.push(`- **${b}**`);
    }
  }

  const playbooks = [];
  const seenPlaybooks = new Set();
  for (const e of exEntries) {
    const triggerNote = e.trigger ? ` *(When: ${e.trigger})*` : '';
    const line = `- **${e.rule}**${triggerNote}`;
    const key = stripInvariantSourceSuffix(e.rule).toLowerCase();
    if (!seenPlaybooks.has(key)) {
      seenPlaybooks.add(key);
      playbooks.push(line);
    }
  }
  for (const b of extraBullets.exemplars) {
    const key = stripInvariantSourceSuffix(b).toLowerCase();
    if (!seenPlaybooks.has(key)) {
      seenPlaybooks.add(key);
      playbooks.push(`- **${b}**`);
    }
  }

  const commands = [];
  const seenCmds = new Set();
  for (const e of [...regEntries, ...exEntries]) {
    const cmd = e.repro_cmd || e.evidence_cmd;
    if (cmd && !seenCmds.has(cmd)) {
      seenCmds.add(cmd);
      commands.push(cmd);
    }
  }

  const lines = [
    '---',
    `name: project-${slug}`,
    `description: "${desc.replace(/"/g, "'")}"`,
    '---',
    '',
    `# Project ${domain} Guardrails & Playbooks`,
    '',
    `Graduated from the Self-Improving Harness Memory Flywheel on ${new Date().toISOString().slice(0, 10)}.`,
    '',
    '## Pitfalls & Anti-Patterns',
    '',
    ...(pitfalls.length ? pitfalls : ['- No domain regressions recorded yet.']),
    '',
    '## Verified Playbooks & Exemplars',
    '',
    ...(playbooks.length ? playbooks : ['- No domain exemplars recorded yet.']),
    '',
    '## Verification Commands',
    '',
    ...(commands.length
      ? ['```bash', ...commands, '```']
      : ['- Add reproducible test commands via `harness.mjs flywheel record --repro "<cmd>"`.']),
    '',
  ];

  return lines.join('\n');
}

function cmdFlywheelDigest(hp, flags) {
  let graduateDomain = null;
  if (flags.graduate !== undefined) {
    if (typeof flags.graduate !== 'string' || !flags.graduate.trim()) {
      throw new Error('Usage: harness.mjs flywheel digest [--json] [--graduate <domain>] [--edition <agents|claude|codex>]');
    }
    graduateDomain = flags.graduate.trim();
  }

  const regLines = readJsonlLines(hp.regressions);
  const exLines = readJsonlLines(hp.exemplars);
  let graduatedCount = 0;
  let scaffoldedSkill = null;
  let removedInvariantBullets = 0;

  if (graduateDomain) {
    const domLower = graduateDomain.toLowerCase();
    const matchedRegs = [];
    const matchedExs = [];
    const nowIso = new Date().toISOString();

    const edition = resolveGraduationEdition(hp.root, flags.edition);
    const slug = graduateDomain.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'general';
    const skillPath = path.join(hp.root, `.${edition}`, 'skills', `project-${slug}`, 'SKILL.md');
    const relSkillPath = toPosix(path.relative(hp.root, skillPath));

    for (const item of regLines) {
      if (item.entry && item.entry.graduated !== true && String(item.entry.domain || '').toLowerCase() === domLower) {
        matchedRegs.push(item.entry);
        item.entry = { ...item.entry, graduated: true, graduated_at: nowIso, graduated_skill: relSkillPath };
        item.raw = JSON.stringify(item.entry);
        graduatedCount++;
      }
    }
    for (const item of exLines) {
      if (item.entry && item.entry.graduated !== true && String(item.entry.domain || '').toLowerCase() === domLower) {
        matchedExs.push(item.entry);
        item.entry = { ...item.entry, graduated: true, graduated_at: nowIso, graduated_skill: relSkillPath };
        item.raw = JSON.stringify(item.entry);
        graduatedCount++;
      }
    }

    const extraBullets = { regressions: [], exemplars: [] };
    const ruleTargets = resolveLearnedInvariantsPaths(hp.root);
    for (const target of ruleTargets) {
      removedInvariantBullets += removeBulletsFromLearnedInvariants(target, (line, loc) => {
        const parsed = parseBulletDomainAndBody(line);
        if (!parsed || parsed.domain.toLowerCase() !== domLower) return false;
        if (loc.inExemplars) extraBullets.exemplars.push(parsed.body);
        else extraBullets.regressions.push(parsed.body);
        return true;
      });
    }

    ensureDirs([path.dirname(skillPath)]);
    const skillContent = buildGraduatedSkillMarkdown(graduateDomain, slug, matchedRegs, matchedExs, extraBullets);
    fs.writeFileSync(skillPath, skillContent, 'utf8');
    scaffoldedSkill = relSkillPath;

    if (matchedRegs.length > 0) writeJsonlLines(hp.regressions, regLines);
    if (matchedExs.length > 0) writeJsonlLines(hp.exemplars, exLines);
  }

  const allEntries = [
    ...regLines.map(i => i.entry).filter(Boolean),
    ...exLines.map(i => i.entry).filter(Boolean),
  ];
  const activeCount = allEntries.filter(e => e.graduated !== true).length;
  const { clusters, graduation_candidates } = buildActiveClusters(allEntries);
  const budget = measureInvariantBudget(hp);
  const curation_recommended =
    budget.promoted_count >= INVARIANT_PROMOTED_SOFT_LIMIT ||
    budget.exemplar_count > INVARIANT_EXEMPLAR_SOFT_LIMIT ||
    budget.bytes >= INVARIANT_SOFT_BYTES ||
    graduation_candidates.length > 0;

  const result = {
    ok: true,
    action: 'flywheel.digest',
    regression_path: toPosix(path.relative(hp.root, hp.regressions)),
    exemplar_path: toPosix(path.relative(hp.root, hp.exemplars)),
    budget,
    total_entries: allEntries.length,
    active_entries: activeCount,
    graduated_entries: allEntries.length - activeCount,
    domains: clusters,
    graduation_candidates,
    curation_recommended,
  };

  if (graduateDomain) {
    result.graduated_domain = graduateDomain;
    result.graduated_count = graduatedCount;
    result.scaffolded_skill = scaffoldedSkill;
    result.removed_invariant_bullets = removedInvariantBullets;
  }

  console.log(JSON.stringify(result, null, 2));
}

function tokenizeText(text) {
  const words = stripInvariantSourceSuffix(text)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(w => w.length >= 2);
  return new Set(words);
}

function jaccardSimilarity(textA, textB) {
  const setA = tokenizeText(textA);
  const setB = tokenizeText(textB);
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const tok of setA) {
    if (setB.has(tok)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function cmdFlywheelPrune(hp, flags) {
  const maxAgeDays = Number(flags['max-age-days'] ?? 30);
  const dryRun = Boolean(flags['dry-run']);
  if (!Number.isFinite(maxAgeDays) || maxAgeDays < 0) {
    throw new Error('Invalid --max-age-days. Expected a non-negative number.');
  }

  const nowMs = Date.now();
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
  let mergedDuplicates = 0;
  let prunedStale = 0;
  let prunedHarmful = 0;
  const prunedIds = [];
  const prunedNormalizedRules = new Set();
  const harmfulNormalizedRules = new Set();

  const processStore = storePath => {
    const items = readJsonlLines(storePath);
    if (items.length === 0) return;

    const kept = [];
    const activeEntries = [];

    // 1. Jaccard dedup pass (threshold >= 0.75 within same domain among non-graduated entries)
    for (const item of items) {
      if (!item.entry) {
        kept.push(item);
        continue;
      }
      const entry = item.entry;
      if (entry.graduated === true) {
        kept.push(item);
        continue;
      }

      const dupTarget = activeEntries.find(existing =>
        String(existing.domain || '').toLowerCase() === String(entry.domain || '').toLowerCase() &&
        jaccardSimilarity(existing.rule, entry.rule) >= JACCARD_DEDUP_THRESHOLD
      );

      if (dupTarget) {
        mergedDuplicates++;
        prunedIds.push({ id: entry.id, reason: 'duplicate', merged_into: dupTarget.id });
        prunedNormalizedRules.add(normalizeInvariantBullet(`- **[${entry.domain || 'general'}]**: ${entry.rule}`));
        dupTarget.hits = (Number(dupTarget.hits) || 1) + (Number(entry.hits) || 1);
        dupTarget.helpful = (Number(dupTarget.helpful) || 0) + (Number(entry.helpful) || 0);
        dupTarget.harmful = (Number(dupTarget.harmful) || 0) + (Number(entry.harmful) || 0);
        dupTarget.promoted = Boolean(dupTarget.promoted) || Boolean(entry.promoted);
        if (!dupTarget.repro_cmd && entry.repro_cmd) dupTarget.repro_cmd = entry.repro_cmd;
        const tDup = Date.parse(dupTarget.last_seen || dupTarget.timestamp || '') || 0;
        const tCur = Date.parse(entry.last_seen || entry.timestamp || '') || 0;
        if (tCur > tDup) dupTarget.last_seen = entry.last_seen || entry.timestamp;
        continue;
      }

      activeEntries.push(entry);
    }

    // 2. Stale 1-hit unpromoted & net-harmful expiry pass
    for (const entry of activeEntries) {
      const helpful = Number(entry.helpful) || 0;
      const harmful = Number(entry.harmful) || 0;
      const hits = Number(entry.hits) || 1;
      const tsMs = Date.parse(entry.last_seen || entry.timestamp || entry.recorded_at || '') || nowMs;
      const ageMs = nowMs - tsMs;
      const normBullet = normalizeInvariantBullet(`- **[${entry.domain || 'general'}]**: ${entry.rule}`);

      if (harmful > helpful + 1) {
        prunedHarmful++;
        prunedIds.push({ id: entry.id, reason: 'net_harmful', helpful, harmful });
        prunedNormalizedRules.add(normBullet);
        harmfulNormalizedRules.add(normBullet);
        continue;
      }
      if (!entry.promoted && hits <= 1 && ageMs > maxAgeMs) {
        prunedStale++;
        prunedIds.push({ id: entry.id, reason: 'stale_unpromoted', age_days: Math.floor(ageMs / 86400000) });
        prunedNormalizedRules.add(normBullet);
        continue;
      }
      kept.push({ raw: JSON.stringify(entry), entry });
    }

    if (!dryRun) {
      writeJsonlLines(storePath, kept);
    }
  };

  processStore(hp.regressions);
  processStore(hp.exemplars);

  let removedStagedBullets = 0;
  const prunedIdSet = new Set(prunedIds.map(p => p.id));
  if (!dryRun && (prunedIds.length > 0 || prunedNormalizedRules.size > 0)) {
    const ruleTargets = resolveLearnedInvariantsPaths(hp.root);
    for (const target of ruleTargets) {
      removedStagedBullets += removeBulletsFromLearnedInvariants(
        target,
        (line, loc) => {
          const idMatch = line.match(/\(ID:\s*([^)]+)\)/i);
          const norm = normalizeInvariantBullet(line);
          if (loc.inStaged) {
            return (idMatch && prunedIdSet.has(idMatch[1].trim())) || prunedNormalizedRules.has(norm);
          }
          // Only remove promoted/exemplar bullets if explicitly pruned as net_harmful
          return harmfulNormalizedRules.has(norm);
        },
        { includePromoted: true, includeExemplars: true, includeStaged: true }
      );
    }
  }

  console.log(JSON.stringify({
    ok: true,
    action: 'flywheel.prune',
    dry_run: dryRun,
    max_age_days: maxAgeDays,
    merged_duplicates: mergedDuplicates,
    pruned_stale: prunedStale,
    pruned_harmful: prunedHarmful,
    removed_staged_bullets: removedStagedBullets,
    pruned_ids: prunedIds,
  }, null, 2));
}

function cmdFlywheelTest(hp, flags) {
  const filterDomain = typeof flags.domain === 'string' && flags.domain.trim() ? flags.domain.trim().toLowerCase() : null;
  const filterId = typeof flags.id === 'string' && flags.id.trim() ? flags.id.trim() : null;
  const timeoutSec = Math.max(1, Number(flags.timeout || 30));
  const timeoutMs = timeoutSec * 1000;
  const execCwd = hp.worktreeRoot || hp.root;

  const stores = [
    { kind: 'regression', path: hp.regressions, items: readJsonlLines(hp.regressions), dirty: false },
    { kind: 'exemplar', path: hp.exemplars, items: readJsonlLines(hp.exemplars), dirty: false },
  ];

  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const results = [];
  const nowIso = new Date().toISOString();

  for (const store of stores) {
    for (const item of store.items) {
      const entry = item.entry;
      if (!entry || entry.graduated === true) continue;
      if (filterId && entry.id !== filterId) continue;
      if (filterDomain && String(entry.domain || '').toLowerCase() !== filterDomain) continue;

      const cmd = entry.repro_cmd || entry.evidence_cmd || null;
      if (!cmd) {
        skipped++;
        results.push({
          id: entry.id,
          kind: entry.kind || store.kind,
          domain: entry.domain || 'general',
          status: 'skipped',
          reason: 'No repro_cmd/evidence_cmd recorded',
        });
        continue;
      }

      const run = runShellCommand(cmd, execCwd, timeoutMs);
      entry.last_verified = nowIso;
      store.dirty = true;

      if (run.passed) {
        passed++;
        entry.last_seen = nowIso;
        entry.helpful = (Number(entry.helpful) || 0) + 1;
        results.push({
          id: entry.id,
          kind: entry.kind || store.kind,
          domain: entry.domain || 'general',
          command: cmd,
          status: 'passed',
          exit_code: 0,
          duration_ms: run.duration_ms,
        });
      } else {
        failed++;
        results.push({
          id: entry.id,
          kind: entry.kind || store.kind,
          domain: entry.domain || 'general',
          command: cmd,
          status: 'failed',
          exit_code: run.exit_code,
          timed_out: run.timed_out,
          duration_ms: run.duration_ms,
          stderr_preview: run.stderr_preview,
        });
      }
      item.raw = JSON.stringify(entry);
    }
    if (store.dirty) {
      writeJsonlLines(store.path, store.items);
    }
  }

  console.log(JSON.stringify({
    ok: failed === 0,
    action: 'flywheel.test',
    passed,
    failed,
    skipped,
    results,
  }, null, 2));
  if (failed > 0) process.exit(1);
}

async function cmdEvalIngest(hp, flags) {
  if (!flags['from-json']) {
    throw new Error('Usage: harness.mjs eval ingest --from-json <file|-> [--task <id>]');
  }

  const data = await readJsonFromSource(String(flags['from-json']), hp.worktreeRoot || hp.root);
  const taskId = resolveTaskId(hp, flags.task || data.task_id) || 'unscoped';
  const scores = data.scores && typeof data.scores === 'object' ? data.scores : {};
  const numericScores = Object.values(scores).map(Number).filter(Number.isFinite);
  const average = Number.isFinite(Number(data.average))
    ? Number(data.average)
    : (numericScores.length ? Number((numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(2)) : null);

  const stagedRegressions = [];
  const stagedExemplars = [];
  const coveredRegAxes = new Set();

  const lessons = Array.isArray(data.lessons) ? data.lessons : [];
  for (const lesson of lessons) {
    if (!lesson || typeof lesson !== 'object' || !lesson.rule) continue;
    const kind = String(lesson.kind || 'regression').toLowerCase() === 'exemplar' ? 'exemplar' : 'regression';
    const dom = String(lesson.domain || 'quality').trim() || 'quality';
    if (kind === 'regression') coveredRegAxes.add(dom.toLowerCase());
    const staged = recordFlywheelEntry(hp, {
      kind,
      taskId,
      source: 'evaluator',
      domain: dom,
      cause: lesson.cause || `Evaluator ${kind} (average=${average ?? 'n/a'})`,
      rule: String(lesson.rule),
      reproCmd: lesson.repro_cmd || lesson.evidence_cmd || null,
      trigger: lesson.trigger || null,
      score: average,
      promote: false,
      updateProgress: false,
      updateRules: false,
    });
    if (kind === 'exemplar') stagedExemplars.push(staged.record.id);
    else stagedRegressions.push(staged.record.id);
  }

  // Axes <= 2 auto-stage regression candidates
  for (const [axis, rawVal] of Object.entries(scores)) {
    const val = Number(rawVal);
    if (!Number.isFinite(val) || val > 2) continue;
    const axisKey = axis.toLowerCase();
    if (coveredRegAxes.has(axisKey)) continue;
    const staged = recordFlywheelEntry(hp, {
      kind: 'regression',
      taskId,
      source: 'evaluator',
      domain: axisKey,
      cause: `Evaluator scored ${axis} at ${val}/5 on task ${taskId}`,
      rule: `Verify ${axis} rubric requirements with explicit evidence before delivery (prior score ${val}/5).`,
      score: val,
      promote: false,
      updateProgress: false,
      updateRules: false,
    });
    stagedRegressions.push(staged.record.id);
  }

  // Verified deliveries with average >= 4.5 auto-stage exemplar candidates
  if (average !== null && average >= 4.5 && stagedExemplars.length === 0) {
    const ruleText = typeof data.verdict === 'string' && data.verdict.trim()
      ? `Verified high-score delivery (${average}/5): ${data.verdict.trim()}`
      : `Replicate evidence-backed delivery structure from ${taskId} (average ${average}/5).`;
    const staged = recordFlywheelEntry(hp, {
      kind: 'exemplar',
      taskId,
      source: 'evaluator',
      domain: 'delivery',
      cause: `Agent evaluator verified delivery with average score ${average}/5`,
      rule: ruleText,
      score: average,
      promote: false,
      updateProgress: false,
      updateRules: false,
    });
    stagedExemplars.push(staged.record.id);
  }

  console.log(JSON.stringify({
    ok: true,
    action: 'eval.ingest',
    task_id: taskId,
    average,
    staged_regressions: stagedRegressions,
    staged_exemplars: stagedExemplars,
  }, null, 2));
}

function truncateUtf8Bytes(text, maxBytes) {
  if (Buffer.byteLength(text, 'utf8') <= maxBytes) return text;
  const suffix = '...';
  const budget = Math.max(0, maxBytes - Buffer.byteLength(suffix, 'utf8'));
  let out = '';
  for (const ch of text) {
    if (Buffer.byteLength(out + ch, 'utf8') > budget) break;
    out += ch;
  }
  return out.trimEnd() + suffix;
}

function collectGitStatusTokens(cwd) {
  const tokens = new Set();
  try {
    const out = execFileSync('git', ['status', '--porcelain'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    for (const line of out.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const filePart = trimmed.slice(2).trim().split(' -> ').pop().replace(/^"|"$/g, '');
      for (const tok of toPosix(filePart).toLowerCase().split(/[^a-z0-9]+/)) {
        if (tok.length >= 2) tokens.add(tok);
      }
    }
  } catch {
    // Non-git workspace
  }
  return tokens;
}

function readPromotedMarkdownEntries(hp) {
  const results = [];
  const primary = path.join(hp.root, '.agents', 'rules', 'learned-invariants.md');
  const candidates = [
    primary,
    path.join(hp.root, '.codex', 'rules', 'learned-invariants.md'),
    path.join(hp.root, '.claude', 'rules', 'learned-invariants.md'),
  ];
  const filePath = candidates.find(p => fs.existsSync(p));
  if (!filePath) return results;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const sections = locateInvariantSections(lines);
  const extract = (range, kind) => {
    if (!range) return;
    for (let i = range.start + 1; i < range.end; i++) {
      const parsed = parseBulletDomainAndBody(lines[i]);
      if (!parsed) continue;
      results.push({
        kind,
        domain: parsed.domain,
        rule: parsed.body,
        helpful: kind === 'exemplar' ? 1 : 0,
        harmful: 0,
        hits: 1,
        promoted: true,
        last_seen: '',
      });
    }
  };
  extract(sections.promotedRange, 'regression');
  extract(sections.exemplarRange, 'exemplar');
  return results;
}

function cmdMemoryBrief(hp, flags) {
  const hookHost = parseHookHost(flags.hook);
  const maxBytes = Math.max(100, Number(flags['max-bytes'] || 600));

  const emitEmpty = () => {
    if (hookHost === 'antigravity' || hookHost === 'claude') {
      console.log('{}');
    }
  };

  const parts = [];

  // 1. Unresolved PROGRESS.md failed hypotheses / active next step
  if (fs.existsSync(hp.progress)) {
    try {
      const raw = fs.readFileSync(hp.progress, 'utf8');
      const hypMatch = raw.match(/## Failed Hypotheses \(Do Not Repeat\)\r?\n([\s\S]*?)(?=\r?\n## |\s*$)/);
      if (hypMatch) {
        const hyps = hypMatch[1]
          .split(/\r?\n/)
          .map(l => l.trim())
          .filter(l => l.startsWith('- ') && l !== '- (none recorded)');
        if (hyps.length > 0) {
          parts.push(`Avoid: ${hyps[hyps.length - 1].replace(/^-\s*/, '')}`);
        }
      }
      const activeId = resolveTaskId(hp, flags.task);
      if (activeId) {
        const receiptFile = path.join(hp.receipts, `${activeId}.json`);
        let settled = false;
        if (fs.existsSync(receiptFile)) {
          try {
            const r = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
            settled = r.status === 'PASS' && r.skeptic_verdict === 'APPROVE';
          } catch {
            settled = false;
          }
        }
        if (!settled) {
          const nextMatch = raw.match(/## Next Atomic Step\r?\n([\s\S]*?)(?=\r?\n## |\s*$)/);
          if (nextMatch) {
            const nextLine = nextMatch[1]
              .split(/\r?\n/)
              .map(l => l.trim())
              .find(l => l.startsWith('- '));
            if (nextLine) {
              parts.push(`Active(${activeId}): ${nextLine.replace(/^-\s*/, '')}`);
            }
          }
        }
      }
    } catch {
      // ignore malformed PROGRESS.md
    }
  }

  // 2. Top 3 domain-matched invariants & positive exemplars
  const jsonlRegs = readJsonlLines(hp.regressions).map(i => i.entry).filter(e => e && e.graduated !== true);
  const jsonlExs = readJsonlLines(hp.exemplars).map(i => i.entry).filter(e => e && e.graduated !== true);
  const mdPromoted = readPromotedMarkdownEntries(hp);

  const combinedMap = new Map();
  for (const e of [...jsonlRegs, ...jsonlExs, ...mdPromoted]) {
    const key = `${e.kind || 'regression'}::${String(e.domain || 'general').toLowerCase()}::${stripInvariantSourceSuffix(e.rule).toLowerCase()}`;
    if (!combinedMap.has(key)) combinedMap.set(key, e);
  }
  const candidates = Array.from(combinedMap.values());
  const gitTokens = collectGitStatusTokens(hp.worktreeRoot || hp.root);

  const scored = candidates.map(e => {
    const domLower = String(e.domain || 'general').toLowerCase();
    const textTokens = tokenizeText(`${domLower} ${e.rule || ''} ${e.trigger || ''}`);
    let domainMatch = 0;
    if (gitTokens.has(domLower)) domainMatch += 100;
    for (const tok of gitTokens) {
      if (textTokens.has(tok)) domainMatch += 20;
    }
    const netAce = (Number(e.helpful) || 0) - (Number(e.harmful) || 0);
    const promotedBoost = e.promoted ? 15 : 0;
    const recencyMs = Date.parse(e.last_seen || e.timestamp || e.recorded_at || '') || 0;
    const score = domainMatch + netAce * 10 + promotedBoost + Math.min(Number(e.hits) || 1, 5) * 2;
    return { entry: e, score, recencyMs };
  });

  scored.sort((a, b) => b.score - a.score || b.recencyMs - a.recencyMs);
  const top3 = scored.slice(0, 3);
  for (const { entry } of top3) {
    const label = entry.kind === 'exemplar' ? 'Exemplar' : 'Rule';
    parts.push(`${label}[${entry.domain || 'general'}]: ${stripInvariantSourceSuffix(entry.rule)}`);
  }

  // 3. Curation alert if budget or cluster thresholds hit
  const budget = measureInvariantBudget(hp);
  const { graduation_candidates } = buildActiveClusters([...jsonlRegs, ...jsonlExs]);
  if (
    budget.bytes >= INVARIANT_SOFT_BYTES ||
    budget.promoted_count >= INVARIANT_PROMOTED_SOFT_LIMIT ||
    budget.exemplar_count > INVARIANT_EXEMPLAR_SOFT_LIMIT ||
    graduation_candidates.length > 0
  ) {
    const alertReason = graduation_candidates.length > 0
      ? `domain cluster >=3 (${graduation_candidates[0].domain})`
      : `${budget.promoted_count} rules / ${budget.bytes}B`;
    parts.push(`Curation: ${alertReason} — run 'harness.mjs flywheel digest'`);
  }

  // Clean workspace with zero project entries -> ZERO noise!
  if (parts.length === 0) {
    emitEmpty();
    return;
  }

  const brief = truncateUtf8Bytes(`[Harness Memory] ${parts.join(' | ')}`, maxBytes);

  if (hookHost === 'antigravity') {
    console.log(JSON.stringify({
      injectSteps: [
        {
          systemMessage: {
            systemMessage: brief,
          },
        },
      ],
    }));
    return;
  }
  if (hookHost === 'claude') {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: brief,
      },
    }));
    return;
  }
  console.log(brief);
}

function cmdTelemetry(hp, sub, flags) {
  if (sub === 'record') {
    const workflow = typeof flags.workflow === 'string' ? flags.workflow.trim() : '';
    const event = typeof flags.event === 'string' ? flags.event.trim() : '';
    const outcome = typeof flags.outcome === 'string' ? flags.outcome.trim().toLowerCase() : 'ok';

    if (!workflow || !event) {
      throw new Error('Usage: harness.mjs telemetry record --workflow <w> --event <e> [--strikes N] [--rework N] [--stalls N] [--scope-blocks N] [--outcome <ok|fail>]');
    }
    if (!['ok', 'fail'].includes(outcome)) {
      throw new Error(`Invalid --outcome "${outcome}". Expected ok or fail.`);
    }

    ensureDirs([hp.evals]);
    const record = {
      timestamp: new Date().toISOString(),
      workflow,
      event,
      task_id: resolveTaskId(hp, flags.task) || 'unscoped',
      strikes: Number(flags.strikes || 0),
      rework: Number(flags.rework || 0),
      stalls: Number(flags.stalls || 0),
      scope_blocks: Number(flags['scope-blocks'] || 0),
      outcome,
      ...(typeof flags.note === 'string' && flags.note.trim() ? { note: flags.note.trim() } : {}),
    };

    fs.appendFileSync(hp.metrics, JSON.stringify(record) + '\n', 'utf8');
    console.log(JSON.stringify({
      ok: true,
      action: 'telemetry.record',
      metrics_path: toPosix(path.relative(hp.root, hp.metrics)),
      record,
    }, null, 2));
    return;
  }

  if (sub === 'summary' || !sub) {
    const filterWorkflow = typeof flags.workflow === 'string' && flags.workflow.trim() ? flags.workflow.trim() : null;
    const all = readJsonlLines(hp.metrics)
      .map(i => i.entry)
      .filter(Boolean)
      .filter(e => !filterWorkflow || e.workflow === filterWorkflow);

    const outcomes = { ok: 0, fail: 0 };
    const totals = { strikes: 0, rework: 0, stalls: 0, scope_blocks: 0 };
    const byWorkflow = {};
    const byEvent = {};

    for (const e of all) {
      if (e.outcome === 'fail') outcomes.fail++;
      else outcomes.ok++;
      totals.strikes += Number(e.strikes) || 0;
      totals.rework += Number(e.rework) || 0;
      totals.stalls += Number(e.stalls) || 0;
      totals.scope_blocks += Number(e.scope_blocks) || 0;
      const wf = e.workflow || 'unknown';
      byWorkflow[wf] = (byWorkflow[wf] || 0) + 1;
      const ev = e.event || 'unknown';
      byEvent[ev] = (byEvent[ev] || 0) + 1;
    }

    console.log(JSON.stringify({
      ok: true,
      action: 'telemetry.summary',
      metrics_path: toPosix(path.relative(hp.root, hp.metrics)),
      total_events: all.length,
      outcomes,
      totals,
      by_workflow: byWorkflow,
      by_event: byEvent,
      recent: all.slice(-5),
    }, null, 2));
    return;
  }

  throw new Error(`Unknown telemetry subcommand "${sub}". Expected record or summary.`);
}

function cmdCheckpoint(hp, flags) {
  const contract = loadContract(hp, flags.task);
  const step = flags.step || flags.summary;
  const failedHypothesis = flags['failed-hypothesis'];

  if (!step && !failedHypothesis) {
    throw new Error('Usage: harness.mjs checkpoint --task <id> --step <text> [--failed-hypothesis <text>]');
  }

  updateProgressFile(hp, contract, { step, failedHypothesis });
  console.log(JSON.stringify({
    ok: true,
    action: 'checkpoint',
    task_id: contract.task_id,
    progress_path: toPosix(path.relative(hp.root, hp.progress)),
  }, null, 2));
}

function cmdInstallGitHook(hp) {
  const gitHooksDir = path.join(hp.root, '.git', 'hooks');
  ensureDirs([gitHooksDir]);
  const hookFile = path.join(gitHooksDir, 'pre-commit');
  const relScript = toPosix(path.relative(hp.root, path.resolve(process.argv[1])));
  const hookScript = [
    '#!/bin/sh',
    '# Installed by Self-Improving Agent Harness (harness.mjs install-git-hook)',
    'HARNESS_ROOT=$(cd "$(dirname "$0")/../.." 2>/dev/null && pwd || pwd)',
    `node "$HARNESS_ROOT/${relScript}" pre-commit-check`,
    '',
  ].join('\n');
  fs.writeFileSync(hookFile, hookScript, { encoding: 'utf8', mode: 0o755 });
  console.log(JSON.stringify({ ok: true, action: 'install-git-hook', hook_path: toPosix(path.relative(hp.root, hookFile)) }, null, 2));
}

function cmdPreCommitCheck(hp, flags) {
  const taskId = resolveTaskId(hp, flags.task);
  if (!taskId) {
    console.log(JSON.stringify({ ok: true, action: 'pre-commit-check', skipped: true, reason: 'No active harness task' }));
    return;
  }
  const receiptFile = path.join(hp.receipts, `${taskId}.json`);
  if (!fs.existsSync(receiptFile)) {
    console.error(`[HARNESS PRE-COMMIT BLOCK] Missing receipt .harness/receipts/${taskId}.json for active task "${taskId}".`);
    process.exit(1);
  }
  const receipt = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
  if (receipt.status !== 'PASS') {
    console.error(`[HARNESS PRE-COMMIT BLOCK] Receipt status for task "${taskId}" is "${receipt.status}" (must be PASS).`);
    process.exit(1);
  }
  if (receipt.skeptic_verdict !== 'APPROVE') {
    console.error(`[HARNESS PRE-COMMIT BLOCK] Skeptic verdict for task "${taskId}" is "${receipt.skeptic_verdict}" (must be APPROVE).`);
    process.exit(1);
  }
  const contract = loadContract(hp, taskId);
  const execCwd = getExecutionCwd(hp, contract);
  const { rawDiff, filesHash } = collectGitDiffAndFiles(execCwd);
  const currentHash = sha256(rawDiff);
  const diffMatches = currentHash === receipt.diff_sha256;
  const filesMatch = Boolean(receipt.files_sha256 && filesHash === receipt.files_sha256);
  if (!diffMatches && !filesMatch) {
    console.error(`[HARNESS PRE-COMMIT BLOCK] Working tree diff_sha256 (${currentHash.slice(0, 12)}) does not match verified receipt (${receipt.diff_sha256.slice(0, 12)}). Re-run verify and skeptic.`);
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, action: 'pre-commit-check', task_id: taskId, diff_sha256: currentHash, files_sha256: filesHash }, null, 2));
}

function printHelp() {
  console.log(`Self-Improving Agent Harness CLI (harness.mjs)

Usage:
  node harness.mjs <command> [subcommand] [flags]

Commands:
  contract init --task <id> --allow <csv_globs> --cmd <csv_commands> [--max-turns <n>] [--mode <adaptive|worktree|in-tree>]
      Initialize a worktree-scoped task contract in .harness/contracts/<id>.json and update .harness/PROGRESS.md.

  sensor check-file [--file <path>] [--task <id>] [--hook <antigravity|claude|codex>] [--require-contract]
      Sub-second PreToolUse/PostToolUse boundary sensor. Outputs AGY JSON decision for --hook antigravity (exit 0)
      or stderr + exit 2 for Claude/Codex.

  worktree <spawn|merge|abort> --task <id>
      Manage isolated git worktrees under .harness/worktrees/<id> (branch agent/<id>).

  verify run --task <id>
      Deterministic verifier: checks allowed_paths, runs acceptance_commands, tracks Strike-2/3 failures,
      auto-stages failures in regressions.jsonl, hashes git diff HEAD, and writes .harness/receipts/<id>.json.

  verify status-check [--task <id>] [--hook <antigravity|codex|claude>]
      Stop-hook gate verifying PASS receipt, non-REJECT skeptic verdict, and live diff_sha256 freshness.

  skeptic-packet --task <id>
      Emit cold-context brief .harness/context/<id>-brief.json containing strictly { contract, git_diff, receipt }.

  stamp-skeptic [--task <id>] (--verdict <APPROVE|REJECT> [--reason <text>] | --from-json <file|->)
      Stamp Skeptic verdict + Strike-2/3 tracking and auto-stage blocking issues & verified_exemplars.

  eval ingest --from-json <file|-> [--task <id>]
      Ingest agent-evaluator JSON: axes <= 2 stage regressions; verified average >= 4.5 stage exemplars.

  flywheel record [--kind <regression|exemplar>] --source <skeptic|verify|evaluator|user|swarm> --domain <d>
                  --cause <text> --rule <text> [--repro <cmd>] [--trigger <text>] [--score <n>] [--promote]
      Record failure in regressions.jsonl or winning playbook in exemplars.jsonl (staged unless --promote).

  flywheel promote --id <reg-...|ex-...>
      Promote a staged entry by ID into learned-invariants.md (Section 3 or Promoted Exemplars <= 8 cap).

  flywheel feedback --id <reg-...|ex-...> --vote <helpful|harmful>
      Increment ACE helpful/harmful counter and refresh last_seen.

  flywheel digest [--json] [--graduate <domain>] [--edition <agents|claude|codex>]
      Audit budget & clusters; --graduate scaffolds project-<domain>/SKILL.md and prunes superseded bullets.

  flywheel prune [--max-age-days 30] [--dry-run]
      Deduplicate (Jaccard >= 0.75) and prune stale 1-hit unpromoted or net-harmful entries.

  flywheel test [--domain <d>] [--id <id>] [--timeout 30]
      Execute recorded repro/evidence commands, update last_verified & helpful on pass; exit 1 on failure.

  memory brief [--hook <antigravity|claude|codex>] [--max-bytes 600]
      Emit compact SessionStart memory brief (zero output / {} on clean workspaces).

  telemetry record --workflow <w> --event <e> [--strikes N] [--rework N] [--stalls N] [--scope-blocks N] [--outcome <ok|fail>]
  telemetry summary [--workflow <w>]
      Append or summarize orchestration telemetry in .harness/evals/orchestration-metrics.jsonl.

  checkpoint --task <id> --step <text> [--failed-hypothesis <text>]
      Persist atomic progress and failed hypotheses in .harness/PROGRESS.md.

  install-git-hook | pre-commit-check [--task <id>]
      Install or run .git/hooks/pre-commit receipt & diff_sha256 verification.
`);
}

async function main() {
  const { positional, flags } = parseFlags(process.argv.slice(2));
  if (flags.help || positional.length === 0) {
    printHelp();
    return;
  }

  const [cmd, sub] = positional;
  const usesHookStdin =
    (cmd === 'sensor' && sub === 'check-file') ||
    (cmd === 'verify' && sub === 'status-check') ||
    (cmd === 'memory' && sub === 'brief');

  const stdinData = usesHookStdin ? await readStdinPayload() : null;
  const stdinCwd =
    (typeof stdinData?.cwd === 'string' && stdinData.cwd.trim())
      ? stdinData.cwd.trim()
      : (Array.isArray(stdinData?.workspacePaths) &&
          typeof stdinData.workspacePaths[0] === 'string' &&
          stdinData.workspacePaths[0].trim())
        ? stdinData.workspacePaths[0].trim()
        : null;

  const rawCwd = flags.cwd || stdinCwd || process.cwd();
  const absRawCwd = path.resolve(rawCwd);
  const root = resolveWorkspaceRoot(absRawCwd);
  const worktreeRoot = resolveWorktreeRoot(absRawCwd);
  const hp = harnessPaths(root, worktreeRoot);

  try {
    if (cmd === 'contract' && sub === 'init') return cmdContractInit(hp, flags);
    if (cmd === 'sensor' && sub === 'check-file') return cmdSensorCheckFile(hp, flags, stdinData);
    if (cmd === 'worktree') return cmdWorktree(hp, sub, flags);
    if (cmd === 'verify' && (sub === 'run' || !sub)) return cmdVerifyRun(hp, flags);
    if (cmd === 'verify' && sub === 'status-check') return cmdVerifyStatusCheck(hp, flags, stdinData);
    if (cmd === 'skeptic-packet') return cmdSkepticPacket(hp, flags);
    if (cmd === 'stamp-skeptic') return await cmdStampSkeptic(hp, flags);
    if (cmd === 'eval' && sub === 'ingest') return await cmdEvalIngest(hp, flags);
    if (cmd === 'flywheel' && (sub === 'record' || !sub)) return cmdFlywheelRecord(hp, flags);
    if (cmd === 'flywheel' && sub === 'promote') return cmdFlywheelPromote(hp, flags);
    if (cmd === 'flywheel' && sub === 'feedback') return cmdFlywheelFeedback(hp, flags);
    if (cmd === 'flywheel' && sub === 'digest') return cmdFlywheelDigest(hp, flags);
    if (cmd === 'flywheel' && sub === 'prune') return cmdFlywheelPrune(hp, flags);
    if (cmd === 'flywheel' && sub === 'test') return cmdFlywheelTest(hp, flags);
    if (cmd === 'memory' && (sub === 'brief' || !sub)) return cmdMemoryBrief(hp, flags);
    if (cmd === 'telemetry') return cmdTelemetry(hp, sub, flags);
    if (cmd === 'checkpoint') return cmdCheckpoint(hp, flags);
    if (cmd === 'install-git-hook') return cmdInstallGitHook(hp);
    if (cmd === 'pre-commit-check') return cmdPreCommitCheck(hp, flags);

    throw new Error(`Unknown command "${positional.join(' ')}". Run with --help for usage.`);
  } catch (err) {
    console.error(`[HARNESS ERROR] ${err.message}`);
    process.exit(1);
  }
}

await main();
