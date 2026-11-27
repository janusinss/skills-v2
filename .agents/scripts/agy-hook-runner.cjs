#!/usr/bin/env node
/**
 * Cross-platform AGY native hook runner (.agents/scripts/agy-hook-runner.cjs).
 *
 * Works identically under Windows (`cmd /c`) and Unix (`sh -c`) when invoked by
 * AGY's hooks engine with CWD set to `.agents/`.
 *
 * Modes:
 *   impeccable        - Runs `.agents/skills/impeccable/scripts/impeccable(.cmd) hook`
 *   tasteskill-gate   - Runs `.agents/skills/design-taste-frontend/scripts/gate.mjs --hook antigravity`
 *   avoid-ai-writing  - Audits modified/untracked Markdown files outside edition dirs
 *   memory-brief      - Runs `harness.mjs memory brief --hook antigravity` (fails open if absent)
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const STOP_BYPASS_REASONS = new Set([
  'USER_CANCELED',
  'ERROR',
  'MAX_INVOCATIONS',
  'MAX_FORCED_INVOCATIONS',
  'MAX_TOKEN_BUDGET_EXCEEDED',
]);

function readStdin(timeoutMs = 1500) {
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
      if (raw.length > 1024 * 1024) finish();
    });
    process.stdin.on('end', finish);
    process.stdin.on('error', finish);
  });
}

function parseJsonSafe(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const cleaned = raw.replace(/^\uFEFF/, '').trim();
    return cleaned ? JSON.parse(cleaned) : null;
  } catch {
    return null;
  }
}

function resolveWorkspaceRoot(stdinObj, fallbackDir) {
  const candidate =
    (typeof stdinObj?.cwd === 'string' && stdinObj.cwd.trim())
      ? stdinObj.cwd.trim()
      : (Array.isArray(stdinObj?.workspacePaths) &&
          typeof stdinObj.workspacePaths[0] === 'string' &&
          stdinObj.workspacePaths[0].trim())
        ? stdinObj.workspacePaths[0].trim()
        : fallbackDir;
  return path.resolve(candidate);
}

function shouldBypassStop(stdinObj) {
  if (!stdinObj || typeof stdinObj !== 'object') return false;
  const reason = stdinObj.terminationReason || stdinObj.stop_reason || stdinObj.stopReason;
  return (
    stdinObj.continuationActive === true ||
    stdinObj.stop_hook_active === true ||
    STOP_BYPASS_REASONS.has(reason)
  );
}

function emitJsonOrEmpty(stdoutText) {
  const cleaned = String(stdoutText || '').replace(/^\uFEFF/, '').trim();
  if (!cleaned) {
    process.stdout.write('{}\n');
    return;
  }
  const parsed = parseJsonSafe(cleaned);
  if (parsed && typeof parsed === 'object') {
    process.stdout.write(JSON.stringify(parsed) + '\n');
    return;
  }
  process.stdout.write('{}\n');
}

function runImpeccable(agentsDir, workspaceRoot, rawStdin) {
  const isWin = process.platform === 'win32';
  const scriptPath = path.join(
    agentsDir,
    'skills',
    'impeccable',
    'scripts',
    isWin ? 'impeccable.cmd' : 'impeccable'
  );
  if (!fs.existsSync(scriptPath)) {
    process.stdout.write('{}\n');
    return;
  }

  let res;
  if (isWin) {
    const comspec = process.env.ComSpec || 'cmd.exe';
    res = spawnSync(comspec, ['/d', '/s', '/c', `"${scriptPath}" hook`], {
      cwd: workspaceRoot,
      input: rawStdin,
      encoding: 'utf8',
      windowsVerbatimArguments: true,
      maxBuffer: 5 * 1024 * 1024,
    });
  } else {
    res = spawnSync(scriptPath, ['hook'], {
      cwd: workspaceRoot,
      input: rawStdin,
      encoding: 'utf8',
      maxBuffer: 5 * 1024 * 1024,
    });
  }

  emitJsonOrEmpty(res.stdout);
}

function runTasteskillGate(agentsDir, workspaceRoot, rawStdin, stdinObj) {
  if (shouldBypassStop(stdinObj)) {
    process.stdout.write('{}\n');
    return;
  }
  const gatePath = path.join(agentsDir, 'skills', 'design-taste-frontend', 'scripts', 'gate.mjs');
  if (!fs.existsSync(gatePath)) {
    process.stdout.write('{}\n');
    return;
  }

  const res = spawnSync(process.execPath, [gatePath, '--hook', 'antigravity'], {
    cwd: workspaceRoot,
    input: rawStdin,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });

  emitJsonOrEmpty(res.stdout);
}

function runAvoidAiWriting(agentsDir, workspaceRoot, stdinObj) {
  if (shouldBypassStop(stdinObj)) {
    process.stdout.write('{}\n');
    return;
  }

  const gatePath = path.join(agentsDir, 'skills', 'avoid-ai-writing', 'bin', 'avoid-ai-writing-gate.js');
  if (!fs.existsSync(gatePath)) {
    process.stdout.write('{}\n');
    return;
  }

  const top = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: workspaceRoot,
    encoding: 'utf8',
  });
  if (top.status !== 0 || !String(top.stdout || '').trim()) {
    process.stdout.write('{}\n');
    return;
  }

  const repoRoot = path.resolve(top.stdout.trim());
  const st = spawnSync(
    'git',
    ['-c', 'core.quotepath=false', 'status', '--porcelain', '--untracked-files=all'],
    { cwd: repoRoot, encoding: 'utf8' }
  );
  if (st.status !== 0) {
    process.stdout.write('{}\n');
    return;
  }

  const files = String(st.stdout || '')
    .split(/\r?\n/)
    .map(line => line.slice(3).split(' -> ').pop().trim().replace(/^"|"$/g, ''))
    .filter(rel => {
      if (!rel) return false;
      const posix = rel.split(path.sep).join('/');
      const lower = posix.toLowerCase();
      if (!lower.endsWith('.md') && !lower.endsWith('.mdx')) return false;
      if (['.agents/', '.codex/', '.claude/'].some(prefix => posix.startsWith(prefix))) return false;
      return fs.existsSync(path.join(repoRoot, rel));
    });

  if (files.length === 0) {
    process.stdout.write('{}\n');
    return;
  }

  const res = spawnSync(
    process.execPath,
    [
      gatePath,
      '--json',
      '--context',
      'technical',
      '--source-mode',
      'rendered-markdown',
      '--threshold',
      '6',
      '--',
      ...files,
    ],
    { cwd: repoRoot, encoding: 'utf8', maxBuffer: 5 * 1024 * 1024 }
  );

  if (res.status === 0) {
    process.stdout.write('{}\n');
    return;
  }

  let reason = String(res.stderr || res.stdout || 'avoid-ai-writing gate failed').trim();
  const parsed = parseJsonSafe(res.stdout);
  if (parsed && Array.isArray(parsed.files)) {
    const bad = parsed.files
      .filter(item => item && item.pass === false)
      .map(item => `${item.path} (${item.findings} findings: ${(item.types || []).join(', ')})`);
    if (bad.length > 0) {
      reason = `avoid-ai-writing failed threshold ${parsed.threshold}: ${bad.join('; ')} — rewrite AI-ism prose before finishing.`;
    }
  }

  process.stdout.write(JSON.stringify({ decision: 'continue', reason }) + '\n');
}

function truncateUtf8Bytes(text, maxBytes) {
  if (Buffer.byteLength(text, 'utf8') <= maxBytes) return text;
  let out = '';
  for (const ch of text) {
    if (Buffer.byteLength(out + ch + '...', 'utf8') > maxBytes) break;
    out += ch;
  }
  return `${out}...`;
}

function extractMarkerEntries(raw, startMarker, endMarker, label) {
  const lines = raw.split(/\r?\n/);
  const start = lines.findIndex(line => line.includes(startMarker));
  const end = start >= 0 ? lines.findIndex((line, idx) => idx > start && line.includes(endMarker)) : -1;
  if (start < 0 || end < 0) return [];
  const entries = [];
  for (let i = start + 1; i < end; i++) {
    const trimmed = lines[i].trim();
    const match = /^-\s+\*\*\[([^\]]+)\]\*\*:\s*(.+)$/.exec(trimmed);
    if (!match) continue;
    const domain = match[1].trim();
    const rule = match[2].replace(/\s*\(Source:[^)]+\)\s*\.?$/, '').trim();
    if (rule) entries.push({ label, domain, rule });
  }
  return entries;
}

function readDesignerMemoryBrief(agentsDir, workspaceRoot, maxBytes = 600) {
  const invPath = path.join(agentsDir, 'rules', 'learned-invariants.md');
  if (!fs.existsSync(invPath)) return '';
  const raw = fs.readFileSync(invPath, 'utf8');
  const entries = [
    ...extractMarkerEntries(raw, '<!-- flywheel-promoted-rules-start -->', '<!-- flywheel-promoted-rules-end -->', 'Rule'),
    ...extractMarkerEntries(raw, '<!-- flywheel-exemplars-start -->', '<!-- flywheel-exemplars-end -->', 'Exemplar'),
  ];
  if (entries.length === 0) return '';
  const gitTokens = new Set();
  const gitRes = spawnSync('git', ['status', '--porcelain'], { cwd: workspaceRoot, encoding: 'utf8' });
  if (gitRes.status === 0 && gitRes.stdout) {
    for (const part of gitRes.stdout.toLowerCase().split(/[^a-z0-9]+/)) {
      if (part.length >= 3) gitTokens.add(part);
    }
  }
  const scored = entries.map((entry, idx) => {
    let score = 0;
    const dom = entry.domain.toLowerCase();
    if (gitTokens.has(dom)) score += 100;
    for (const tok of `${dom} ${entry.rule.toLowerCase()}`.split(/[^a-z0-9]+/)) {
      if (tok.length >= 3 && gitTokens.has(tok)) score += 20;
    }
    return { entry, score, idx };
  });
  scored.sort((a, b) => b.score - a.score || a.idx - b.idx);
  const parts = scored.slice(0, 3).map(({ entry }) => `${entry.label}[${entry.domain}]: ${entry.rule}`);
  return truncateUtf8Bytes(`[Project Memory] ${parts.join(' | ')}`, maxBytes);
}

function runMemoryBrief(agentsDir, workspaceRoot, rawStdin) {
  const harnessPath = path.join(agentsDir, 'skills', 'continuous-agent-loop', 'scripts', 'harness.mjs');
  if (!fs.existsSync(harnessPath)) {
    const brief = readDesignerMemoryBrief(agentsDir, workspaceRoot, 600);
    if (!brief) {
      process.stdout.write('{}\n');
      return;
    }
    process.stdout.write(JSON.stringify({
      injectSteps: [
        {
          systemMessage: {
            systemMessage: brief,
          },
        },
      ],
    }) + '\n');
    return;
  }

  const res = spawnSync(
    process.execPath,
    [harnessPath, 'memory', 'brief', '--hook', 'antigravity'],
    {
      cwd: workspaceRoot,
      input: rawStdin,
      encoding: 'utf8',
      maxBuffer: 2 * 1024 * 1024,
    }
  );

  emitJsonOrEmpty(res.stdout);
}

async function main() {
  try {
    const mode = String(process.argv[2] || '').trim().toLowerCase();
    const rawStdin = await readStdin(1500);
    const stdinObj = parseJsonSafe(rawStdin);
    const agentsDir = path.resolve(__dirname, '..');
    const workspaceRoot = resolveWorkspaceRoot(stdinObj, path.resolve(agentsDir, '..'));

    if (mode === 'impeccable') {
      runImpeccable(agentsDir, workspaceRoot, rawStdin);
    } else if (mode === 'tasteskill-gate') {
      runTasteskillGate(agentsDir, workspaceRoot, rawStdin, stdinObj);
    } else if (mode === 'avoid-ai-writing') {
      runAvoidAiWriting(agentsDir, workspaceRoot, stdinObj);
    } else if (mode === 'memory-brief') {
      runMemoryBrief(agentsDir, workspaceRoot, rawStdin);
    } else {
      process.stdout.write('{}\n');
    }
  } catch {
    // Optional hook runners must fail open and emit valid AGY JSON
    process.stdout.write('{}\n');
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, resolveWorkspaceRoot };
