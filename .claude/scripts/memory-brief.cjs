#!/usr/bin/env node
/**
 * Cross-mode SessionStart Active Memory Brief runner (.claude/scripts/memory-brief.cjs).
 *
 * - Harness mode (when `.claude/skills/continuous-agent-loop/scripts/harness.mjs` exists):
 *   delegates to `harness.mjs memory brief --hook claude`.
 * - Designer mode / partial profiles without `harness.mjs`:
 *   reads promoted invariants and exemplars directly from `.claude/rules/learned-invariants.md`
 *   and emits a <= 600 B `[Project Memory]` context block (or `{}` when empty).
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

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

function collectGitTokens(cwd) {
  const tokens = new Set();
  const res = spawnSync('git', ['status', '--porcelain'], { cwd, encoding: 'utf8' });
  if (res.status !== 0 || !res.stdout) return tokens;
  for (const part of res.stdout.toLowerCase().split(/[^a-z0-9]+/)) {
    if (part.length >= 3) tokens.add(part);
  }
  return tokens;
}

function readDesignerMemoryBrief(claudeDir, workspaceRoot, maxBytes = 600) {
  const invPath = path.join(claudeDir, 'rules', 'learned-invariants.md');
  if (!fs.existsSync(invPath)) return '';
  const raw = fs.readFileSync(invPath, 'utf8');
  const entries = [
    ...extractMarkerEntries(raw, '<!-- flywheel-promoted-rules-start -->', '<!-- flywheel-promoted-rules-end -->', 'Rule'),
    ...extractMarkerEntries(raw, '<!-- flywheel-exemplars-start -->', '<!-- flywheel-exemplars-end -->', 'Exemplar'),
  ];
  if (entries.length === 0) return '';
  const gitTokens = collectGitTokens(workspaceRoot);
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

async function main() {
  try {
    const rawStdin = await readStdin(1500);
    const stdinObj = parseJsonSafe(rawStdin);
    const claudeDir = path.resolve(__dirname, '..');
    const workspaceRoot =
      typeof stdinObj?.cwd === 'string' && stdinObj.cwd.trim()
        ? path.resolve(stdinObj.cwd.trim())
        : path.resolve(claudeDir, '..');

    const harnessPath = path.join(claudeDir, 'skills', 'continuous-agent-loop', 'scripts', 'harness.mjs');
    if (fs.existsSync(harnessPath)) {
      const res = spawnSync(process.execPath, [harnessPath, 'memory', 'brief', '--hook', 'claude'], {
        cwd: workspaceRoot,
        input: rawStdin,
        encoding: 'utf8',
        maxBuffer: 2 * 1024 * 1024,
      });
      const out = String(res.stdout || '').replace(/^\uFEFF/, '').trim();
      const parsed = parseJsonSafe(out);
      process.stdout.write(`${JSON.stringify(parsed && typeof parsed === 'object' ? parsed : {})}\n`);
      return;
    }

    const brief = readDesignerMemoryBrief(claudeDir, workspaceRoot, 600);
    if (!brief) {
      process.stdout.write('{}\n');
      return;
    }
    process.stdout.write(`${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: brief,
      },
    })}\n`);
  } catch {
    process.stdout.write('{}\n');
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, readDesignerMemoryBrief };
