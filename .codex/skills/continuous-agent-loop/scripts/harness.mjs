#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';

/**
 * Self-Improving Agent Harness CLI (Zero External Dependencies)
 * Implements the 6-Stage Compounding Loop:
 *   1. Contract Gate (`contract init`)
 *   2. Adaptive Worktree Sandbox (`worktree spawn|merge|abort`)
 *   3. Boundary Sensor (`sensor check-file`)
 *   4. Deterministic Receipt Verifier (`verify run|status-check`)
 *   5. Cold-Context Skeptic Packet & Stamp (`skeptic-packet`, `stamp-skeptic`)
 *   6. Calibrated Dual-Store Memory Flywheel & Compaction (`flywheel record`, `checkpoint`)
 *   + Git Hook Gate (`install-git-hook`, `pre-commit-check`)
 */

const HARNESS_DIR = '.harness';
const PROTECTED_GLOBS = [
  '.harness/receipts/**',
  '.harness/contracts/**',
  '.git/hooks/**',
  '.git/config',
];

function toPosix(p) {
  return String(p || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function sha256(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
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
    if (fs.existsSync(path.join(curr, '.git')) || fs.existsSync(path.join(curr, HARNESS_DIR))) {
      return curr;
    }
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }
  return cwd;
}

function harnessPaths(root) {
  const base = path.join(root, HARNESS_DIR);
  return {
    root,
    base,
    contracts: path.join(base, 'contracts'),
    receipts: path.join(base, 'receipts'),
    worktrees: path.join(base, 'worktrees'),
    context: path.join(base, 'context'),
    evals: path.join(base, 'evals'),
    regressions: path.join(base, 'evals', 'regressions.jsonl'),
    progress: path.join(base, 'PROGRESS.md'),
    activeTask: path.join(base, 'active-task.json'),
  };
}

function ensureDirs(dirs) {
  for (const d of dirs) {
    fs.mkdirSync(d, { recursive: true });
  }
}

function resolveTaskId(hp, explicitTask) {
  if (explicitTask && typeof explicitTask === 'string') return explicitTask;
  if (fs.existsSync(hp.activeTask)) {
    try {
      const data = JSON.parse(fs.readFileSync(hp.activeTask, 'utf8'));
      if (data.task_id) return data.task_id;
    } catch {
      // ignore
    }
  }
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

  ensureDirs([hp.contracts, hp.receipts, hp.context, hp.evals]);

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
  fs.writeFileSync(hp.activeTask, JSON.stringify({ task_id: taskId, updated_at: contract.created_at }, null, 2) + '\n', 'utf8');

  updateProgressFile(hp, contract, {
    step: `Initialized contract ${taskId} (mode=${mode}, allow=${allow.join(',')})`,
    statusNote: 'ACTIVE',
  });

  console.log(JSON.stringify({ ok: true, action: 'contract.init', contract_path: toPosix(path.relative(hp.root, contractFile)), contract }, null, 2));
}

function extractFileFromStdin() {
  if (process.stdin.isTTY) return null;
  try {
    const raw = fs.readFileSync(0, 'utf8').trim();
    if (!raw) return null;
    const data = JSON.parse(raw);
    const input = data.tool_input || data.input || data;
    return input.file_path || input.path || input.TargetFile || input.File || null;
  } catch {
    return null;
  }
}

function cmdSensorCheckFile(hp, flags) {
  const candidate = flags.file || extractFileFromStdin();
  if (!candidate || typeof candidate !== 'string') {
    // If invoked as a generic hook where no file path is present, allow pass-through
    console.log(JSON.stringify({ ok: true, action: 'sensor.check-file', skipped: true, reason: 'No target file argument found' }));
    return;
  }

  const absCandidate = path.resolve(hp.root, candidate);
  const relPath = toPosix(path.relative(hp.root, absCandidate));

  if (relPath.startsWith('../') || relPath === '..') {
    console.error(`[HARNESS SENSOR BLOCK] Path escapes workspace root: ${candidate}`);
    process.exit(2);
  }

  if (matchesAnyGlob(relPath, PROTECTED_GLOBS)) {
    console.error(`[HARNESS SENSOR BLOCK] Direct agent tampering with protected harness/git path is forbidden: ${relPath}`);
    process.exit(2);
  }

  const taskId = resolveTaskId(hp, flags.task);
  if (!taskId) {
    if (flags['require-contract']) {
      console.error(`[HARNESS SENSOR BLOCK] No active contract found in .harness/contracts/. Run 'harness.mjs contract init' first.`);
      process.exit(2);
    }
    console.log(JSON.stringify({ ok: true, action: 'sensor.check-file', file: relPath, contract: null, note: 'No active contract; protected path check passed' }));
    return;
  }

  const contract = loadContract(hp, taskId);
  if (relPath === '.harness/PROGRESS.md') {
    console.log(JSON.stringify({ ok: true, action: 'sensor.check-file', file: relPath, task_id: contract.task_id }));
    return;
  }

  if (!matchesAnyGlob(relPath, contract.allowed_paths)) {
    console.error(
      `[HARNESS SENSOR BLOCK] File "${relPath}" is outside contract "${contract.task_id}" allowed_paths: [${contract.allowed_paths.join(', ')}]`
    );
    process.exit(2);
  }

  console.log(JSON.stringify({ ok: true, action: 'sensor.check-file', file: relPath, task_id: contract.task_id }));
}

function getExecutionCwd(hp, contract) {
  const wtDir = path.join(hp.worktrees, contract.task_id);
  if (fs.existsSync(wtDir)) return wtDir;
  return hp.root;
}

function cmdWorktree(hp, subaction, flags) {
  const contract = loadContract(hp, flags.task);
  const taskId = contract.task_id;
  const wtPath = path.join(hp.worktrees, taskId);
  const branchName = `agent/${taskId}`;

  if (subaction === 'spawn') {
    ensureDirs([hp.worktrees]);
    if (fs.existsSync(wtPath)) {
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

function collectGitDiffAndFiles(execCwd) {
  let rawDiff = '';
  let changedFiles = [];
  let changedLines = 0;

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
    const statusOut = execFileSync('git', ['status', '--porcelain'], { cwd: execCwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const set = new Set();
    for (const line of statusOut.split(/\r?\n/)) {
      if (!line.trim()) continue;
      const filePart = line.slice(3).trim().split(' -> ').pop();
      const norm = toPosix(filePart.replace(/^"|"$/g, ''));
      if (norm && !norm.startsWith('.harness/')) {
        set.add(norm);
      }
    }
    changedFiles = [...set];
  } catch {
    changedFiles = [];
  }

  for (const line of rawDiff.split(/\r?\n/)) {
    if ((line.startsWith('+') && !line.startsWith('+++')) || (line.startsWith('-') && !line.startsWith('---'))) {
      changedLines++;
    }
  }

  return { rawDiff, changedFiles, changedLines };
}

function runAcceptanceCommand(cmdStr, execCwd) {
  const start = Date.now();
  const isWin = process.platform === 'win32';
  const shellBin = isWin ? (process.env.ComSpec || 'cmd.exe') : '/bin/sh';
  const shellArgs = isWin ? ['/d', '/s', '/c', cmdStr] : ['-c', cmdStr];

  const res = spawnSync(shellBin, shellArgs, {
    cwd: execCwd,
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 10 * 1024 * 1024,
  });

  const durationMs = Date.now() - start;
  const stdout = (res.stdout || '').trim();
  const stderr = (res.stderr || '').trim();
  const exitCode = typeof res.status === 'number' ? res.status : 1;

  return {
    command: cmdStr,
    exit_code: exitCode,
    passed: exitCode === 0,
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
  const inWorktree = execCwd !== hp.root;

  const { rawDiff, changedFiles, changedLines } = collectGitDiffAndFiles(execCwd);

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

  const commandResults = contract.acceptance_commands.map(cmd => runAcceptanceCommand(cmd, execCwd));
  const allCommandsPassed = commandResults.every(r => r.passed);
  const status = scopeViolations.length === 0 && protectedViolations.length === 0 && allCommandsPassed ? 'PASS' : 'FAIL';

  const diffHash = sha256(rawDiff);
  ensureDirs([hp.receipts]);
  const receiptFile = path.join(hp.receipts, `${taskId}.json`);
  let existingSkeptic = null;
  if (fs.existsSync(receiptFile)) {
    try {
      const prev = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
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

  const receipt = {
    schema_version: 1,
    task_id: taskId,
    verified_at: new Date().toISOString(),
    status,
    execution_context: inWorktree ? 'worktree' : 'in-tree',
    changed_files: changedFiles,
    changed_lines: changedLines,
    scope_violations: [...scopeViolations, ...protectedViolations],
    isolation_warning: isolationWarning,
    diff_sha256: diffHash,
    command_results: commandResults,
    skeptic_verdict: existingSkeptic ? existingSkeptic.skeptic_verdict : 'PENDING',
    skeptic_reason: existingSkeptic ? existingSkeptic.skeptic_reason : null,
    skeptic_stamped_at: existingSkeptic ? existingSkeptic.skeptic_stamped_at : null,
  };

  fs.writeFileSync(receiptFile, JSON.stringify(receipt, null, 2) + '\n', 'utf8');
  updateProgressFile(hp, contract, {
    step: `Ran deterministic verify: status=${status} (diff_sha256=${diffHash.slice(0, 12)})`,
    statusNote: status === 'PASS' ? 'VERIFIED_PENDING_SKEPTIC' : 'VERIFY_FAILED',
  });

  console.log(JSON.stringify({ ok: status === 'PASS', action: 'verify.run', receipt_path: toPosix(path.relative(hp.root, receiptFile)), receipt }, null, 2));
  if (status !== 'PASS') process.exit(1);
}

function cmdVerifyStatusCheck(hp, flags) {
  const taskId = resolveTaskId(hp, flags.task);
  if (!taskId) {
    console.log(JSON.stringify({ ok: true, action: 'verify.status-check', active_contract: null }));
    return;
  }
  const receiptFile = path.join(hp.receipts, `${taskId}.json`);
  if (!fs.existsSync(receiptFile)) {
    console.error(`[HARNESS STOP CHECK] Active contract "${taskId}" has no verification receipt (.harness/receipts/${taskId}.json). Run 'harness.mjs verify run --task ${taskId}' and checkpoint .harness/PROGRESS.md before finishing.`);
    process.exit(1);
  }
  const receipt = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
  console.log(JSON.stringify({
    ok: receipt.status === 'PASS',
    action: 'verify.status-check',
    task_id: taskId,
    receipt_status: receipt.status,
    skeptic_verdict: receipt.skeptic_verdict,
  }));
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

function cmdStampSkeptic(hp, flags) {
  const contract = loadContract(hp, flags.task);
  const taskId = contract.task_id;
  const verdict = String(flags.verdict || '').toUpperCase();
  const reason = flags.reason || '';

  if (!['APPROVE', 'REJECT'].includes(verdict)) {
    throw new Error('Usage: harness.mjs stamp-skeptic --task <id> --verdict <APPROVE|REJECT> [--reason <text>]');
  }

  const receiptFile = path.join(hp.receipts, `${taskId}.json`);
  if (!fs.existsSync(receiptFile)) {
    throw new Error(`Receipt not found for task "${taskId}". Run 'harness.mjs verify run --task ${taskId}' first.`);
  }

  const receipt = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
  receipt.skeptic_verdict = verdict;
  receipt.skeptic_reason = reason || (verdict === 'APPROVE' ? 'All contract invariants and boundaries verified.' : 'Rejected by Cold-Context Skeptic.');
  receipt.skeptic_stamped_at = new Date().toISOString();

  fs.writeFileSync(receiptFile, JSON.stringify(receipt, null, 2) + '\n', 'utf8');
  updateProgressFile(hp, contract, {
    step: `Stamped Skeptic verdict: ${verdict}${reason ? ` (${reason})` : ''}`,
    failedHypothesis: verdict === 'REJECT' ? `Skeptic rejected diff: ${reason}` : undefined,
    statusNote: verdict === 'APPROVE' ? 'SKEPTIC_APPROVED' : 'SKEPTIC_REJECTED',
  });

  console.log(JSON.stringify({ ok: verdict === 'APPROVE', action: 'stamp-skeptic', task_id: taskId, verdict, reason: receipt.skeptic_reason }, null, 2));
}

function resolveLearnedInvariantsPaths(root) {
  const candidates = [
    path.join(root, '.agents', 'rules', 'learned-invariants.md'),
    path.join(root, '.codex', 'rules', 'learned-invariants.md'),
    path.join(root, '.claude', 'rules', 'learned-invariants.md'),
  ];
  const active = candidates.filter(p => fs.existsSync(path.dirname(p)));
  if (active.length === 0) {
    const fallback = path.join(root, '.agents', 'rules', 'learned-invariants.md');
    ensureDirs([path.dirname(fallback)]);
    return [fallback];
  }
  return active;
}

function ensureLearnedInvariantsFile(filePath) {
  if (fs.existsSync(filePath)) return;
  const isAgents = filePath.includes(`${path.sep}.agents${path.sep}`);
  const header = isAgents
    ? [
        '---',
        'trigger: model_decision',
        'description: Auto-promoted root-cause invariants and regression guardrails captured by the Self-Improving Harness Memory Flywheel.',
        '---',
        '',
      ].join('\n')
    : '';
  const body = [
    '# Learned Invariants & Memory Flywheel Rules',
    '',
    'This file is maintained by `harness.mjs flywheel record`. Rules in **Promoted Guardrails** are mandatory workspace invariants.',
    '',
    '## Promoted Guardrails',
    '',
    '## Staged Candidates (Pending Promotion)',
    '',
  ].join('\n');
  fs.writeFileSync(filePath, header + body, 'utf8');
}

function upsertInvariantRule(filePath, domain, ruleText, promote) {
  ensureLearnedInvariantsFile(filePath);
  const current = fs.readFileSync(filePath, 'utf8');
  const formattedBullet = `- **[${domain}]**: ${ruleText}`;

  if (current.includes(formattedBullet)) {
    if (promote && current.includes('## Staged Candidates') && current.indexOf(formattedBullet) > current.indexOf('## Staged Candidates')) {
      // Move from Staged to Promoted
      const withoutStaged = current.replace(formattedBullet + '\n', '').replace(formattedBullet + '\r\n', '');
      const updated = withoutStaged.replace('## Promoted Guardrails\n', `## Promoted Guardrails\n${formattedBullet}\n`);
      fs.writeFileSync(filePath, updated, 'utf8');
      return { deduplicated: false, promoted: true };
    }
    return { deduplicated: true, promoted: Boolean(promote) };
  }

  const targetHeading = promote ? '## Promoted Guardrails' : '## Staged Candidates (Pending Promotion)';
  if (current.includes(targetHeading)) {
    const updated = current.replace(targetHeading, `${targetHeading}\n${formattedBullet}`);
    fs.writeFileSync(filePath, updated, 'utf8');
  } else {
    fs.writeFileSync(filePath, `${current.trimEnd()}\n\n${targetHeading}\n${formattedBullet}\n`, 'utf8');
  }
  return { deduplicated: false, promoted: Boolean(promote) };
}

function cmdFlywheelRecord(hp, flags) {
  const taskId = resolveTaskId(hp, flags.task) || 'unscoped';
  const source = flags.source || 'verify';
  const domain = flags.domain || 'general';
  const cause = flags.cause;
  const rule = flags.rule;
  const reproCmd = flags.cmd || null;

  if (!['skeptic', 'verify', 'user'].includes(source)) {
    throw new Error('Invalid --source. Expected skeptic, verify, or user.');
  }
  if (!cause || !rule) {
    throw new Error('Usage: harness.mjs flywheel record --task <id> --source <skeptic|verify|user> --domain <domain> --cause <text> --rule <text> [--cmd <repro_cmd>] [--promote]');
  }

  ensureDirs([hp.evals]);

  let existingEntries = [];
  if (fs.existsSync(hp.regressions)) {
    existingEntries = fs.readFileSync(hp.regressions, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .map(line => {
        try { return JSON.parse(line); } catch { return null; }
      })
      .filter(Boolean);
  }

  const priorCount = existingEntries.filter(e => e.rule === rule || (e.domain === domain && e.root_cause === cause)).length;
  const shouldPromote = Boolean(flags.promote) || source === 'user' || priorCount >= 1;

  const entryId = `reg-${sha256(`${domain}:${cause}:${rule}`).slice(0, 10)}`;
  const record = {
    id: entryId,
    recorded_at: new Date().toISOString(),
    task_id: taskId,
    source,
    domain,
    root_cause: cause,
    rule,
    repro_cmd: reproCmd,
    promoted: shouldPromote,
  };

  fs.appendFileSync(hp.regressions, JSON.stringify(record) + '\n', 'utf8');

  const ruleTargets = resolveLearnedInvariantsPaths(hp.root);
  const ruleUpdates = ruleTargets.map(target => ({
    path: toPosix(path.relative(hp.root, target)),
    ...upsertInvariantRule(target, domain, rule, shouldPromote),
  }));

  try {
    const contract = loadContract(hp, taskId);
    updateProgressFile(hp, contract, {
      step: `Recorded flywheel rule [${domain}] (${shouldPromote ? 'PROMOTED' : 'STAGED'})`,
      failedHypothesis: `${cause} -> Guardrail: ${rule}`,
    });
  } catch {
    // Contract optional when recording standalone flywheel lesson
  }

  console.log(JSON.stringify({
    ok: true,
    action: 'flywheel.record',
    regression_path: toPosix(path.relative(hp.root, hp.regressions)),
    record,
    rule_updates: ruleUpdates,
  }, null, 2));
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
    `node "${relScript}" pre-commit-check`,
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
  const { rawDiff } = collectGitDiffAndFiles(execCwd);
  const currentHash = sha256(rawDiff);
  if (currentHash !== receipt.diff_sha256) {
    console.error(`[HARNESS PRE-COMMIT BLOCK] Working tree diff_sha256 (${currentHash.slice(0, 12)}) does not match verified receipt (${receipt.diff_sha256.slice(0, 12)}). Re-run verify and skeptic.`);
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, action: 'pre-commit-check', task_id: taskId, diff_sha256: currentHash }, null, 2));
}

function printHelp() {
  console.log(`Self-Improving Agent Harness CLI (harness.mjs)

Usage:
  node harness.mjs <command> [subcommand] [flags]

Commands:
  contract init --task <id> --allow <csv_globs> --cmd <csv_commands> [--max-turns <n>] [--mode <adaptive|worktree|in-tree>]
      Initialize a pre-flight task contract in .harness/contracts/<id>.json and update .harness/PROGRESS.md.

  sensor check-file [--file <path>] [--task <id>] [--require-contract]
      Sub-second (<50ms) PreToolUse boundary check. Validates <path> against active contract allowed_paths
      and blocks direct writes to .harness/receipts/** or .git/hooks/**.

  worktree <spawn|merge|abort> --task <id>
      Manage isolated git worktrees under .harness/worktrees/<id> (branch agent/<id>).

  verify run --task <id>
      Deterministic model-free verifier: checks changed files against allowed_paths, executes all
      acceptance_commands, hashes git diff HEAD (diff_sha256), and emits .harness/receipts/<id>.json.

  verify status-check [--task <id>]
      Stop-hook gate verifying that an active contract has a passing verification receipt.

  skeptic-packet --task <id>
      Emit cold-context brief .harness/context/<id>-brief.json containing strictly { contract, git_diff, receipt }.

  stamp-skeptic --task <id> --verdict <APPROVE|REJECT> [--reason <text>]
      Record the Cold-Context Skeptic verdict inside .harness/receipts/<id>.json.

  flywheel record --task <id> --source <skeptic|verify|user> --domain <domain> --cause <text> --rule <text> [--cmd <repro_cmd>] [--promote]
      Append structured failure to .harness/evals/regressions.jsonl and stage/promote deduplicated
      guardrail rules into .<edition>/rules/learned-invariants.md.

  checkpoint --task <id> --step <text> [--failed-hypothesis <text>]
      Persist atomic progress and failed hypotheses in .harness/PROGRESS.md across context compactions.

  install-git-hook
      Install optional .git/hooks/pre-commit receipt & diff_sha256 verifier.

  pre-commit-check [--task <id>]
      Verify staged/working tree diff matches an APPROVED receipt before git commit.
`);
}

function main() {
  const { positional, flags } = parseFlags(process.argv.slice(2));
  if (flags.help || positional.length === 0) {
    printHelp();
    return;
  }

  const root = flags.cwd ? path.resolve(flags.cwd) : resolveWorkspaceRoot();
  const hp = harnessPaths(root);
  const [cmd, sub] = positional;

  try {
    if (cmd === 'contract' && sub === 'init') return cmdContractInit(hp, flags);
    if (cmd === 'sensor' && sub === 'check-file') return cmdSensorCheckFile(hp, flags);
    if (cmd === 'worktree') return cmdWorktree(hp, sub, flags);
    if (cmd === 'verify' && (sub === 'run' || !sub)) return cmdVerifyRun(hp, flags);
    if (cmd === 'verify' && sub === 'status-check') return cmdVerifyStatusCheck(hp, flags);
    if (cmd === 'skeptic-packet') return cmdSkepticPacket(hp, flags);
    if (cmd === 'stamp-skeptic') return cmdStampSkeptic(hp, flags);
    if (cmd === 'flywheel' && (sub === 'record' || !sub)) return cmdFlywheelRecord(hp, flags);
    if (cmd === 'checkpoint') return cmdCheckpoint(hp, flags);
    if (cmd === 'install-git-hook') return cmdInstallGitHook(hp);
    if (cmd === 'pre-commit-check') return cmdPreCommitCheck(hp, flags);

    throw new Error(`Unknown command "${positional.join(' ')}". Run with --help for usage.`);
  } catch (err) {
    console.error(`[HARNESS ERROR] ${err.message}`);
    process.exit(1);
  }
}

main();
