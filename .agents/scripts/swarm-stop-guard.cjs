#!/usr/bin/env node
/**
 * AGY-only Swarm Stop Guard hook (hooks.json Stop event).
 *
 * Inspects the documented conversation transcript (`transcriptPath` on stdin)
 * to detect unclosed `/swarm` sessions (workers added via `swarm` without `[done]`
 * or `kill`) or missing `monitor` (`swarm_monitor`) workers when spawning Wave 1
 * or entering `swarm_wait`. Allows coordinator `swarm_wait` with
 * `mentions_only: true` only when an active `monitor` is present to guard
 * against stalls. Returns `{"decision":"continue"}` so the coordinator
 * re-checks `swarm{action:"status"}` and `read_board` instead of leaving
 * workers asleep.
 *
 * Respects `continuationActive`, `USER_CANCELED`, `ERROR`, and invocation-cap exits,
 * and silently allows exit (`0`) outside AGY or when no transcript is available.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const STOP_BYPASS_REASONS = new Set([
  'USER_CANCELED',
  'ERROR',
  'MAX_INVOCATIONS',
  'MAX_FORCED_INVOCATIONS',
  'MAX_TOKEN_BUDGET_EXCEEDED',
]);

/** Read hook stdin JSON up to `timeoutMs` so open pipes never stall Turn Stop. */
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

/**
 * Transcript `tool_calls[].args` stores values as JSON-encoded strings
 * (e.g. `"\"kill\""`, `"false"`). Decode cleanly with raw-value fallback.
 */
function decodeArg(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (
    trimmed === 'true' ||
    trimmed === 'false' ||
    trimmed === 'null' ||
    trimmed.startsWith('"') ||
    trimmed.startsWith('{') ||
    trimmed.startsWith('[') ||
    /^-?\d+(?:\.\d+)?$/.test(trimmed)
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }
  return value;
}

function isShardedAdd(args) {
  const name = String(decodeArg(args?.name) || '').trim();
  if (!name) return false;
  const tasks = decodeArg(args?.tasks);
  if (Array.isArray(tasks) && tasks.length > 0) return true;
  const n = Number(decodeArg(args?.n));
  return Number.isInteger(n) && n > 1;
}

function expandAddedMembers(args) {
  const name = String(decodeArg(args?.name) || '').trim();
  if (!name) return [];
  const tasks = decodeArg(args?.tasks);
  if (Array.isArray(tasks) && tasks.length > 0) {
    return tasks.map((_, i) => `${name}-${i + 1}`);
  }
  const n = Number(decodeArg(args?.n));
  if (Number.isInteger(n) && n > 1) {
    return Array.from({ length: n }, (_, i) => `${name}-${i + 1}`);
  }
  return [name];
}

function isMonitorMember(name, brief) {
  if (/^monitor(?:-\d+)?$/.test(name)) return true;
  return typeof brief === 'string' && brief.includes('swarm_monitor');
}

function isNarratorMember(name) {
  return /^narrator(?:-\d+)?$/.test(name);
}

/** Load matching un-truncated steps from sibling `transcript_full.jsonl` when needed. */
function loadFullStepsByIndex(transcriptPath) {
  const fullPath = path.join(path.dirname(transcriptPath), 'transcript_full.jsonl');
  const map = new Map();
  if (!fs.existsSync(fullPath)) return map;
  try {
    const lines = fs.readFileSync(fullPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      if (!line) continue;
      if (!/\"swarm\"|\"post_message\"|\"swarm_wait\"/.test(line)) continue;
      const obj = parseJsonSafe(line);
      if (obj && Number.isInteger(obj.step_index)) {
        map.set(obj.step_index, obj);
      }
    }
  } catch {
    return map;
  }
  return map;
}

/** Walk the transcript to determine live swarm workers, monitors, and the latest turn's wait state. */
function analyzeTranscript(transcriptPath) {
  let content;
  try {
    content = fs.readFileSync(transcriptPath, 'utf8');
  } catch {
    return null;
  }

  const lines = content.split(/\r?\n/);
  let fullSteps = null;
  const activeWorkers = new Set();
  const monitors = new Set();
  const shardedGroups = new Set();
  let lastWaitCall = null;
  let turnHadAdd = false;
  let turnHadDone = false;
  let seenBoardToolsInWave = false;

  for (const line of lines) {
    if (!line.trim()) continue;
    const step = parseJsonSafe(line);
    if (!step) continue;

    if (step.type === 'USER_INPUT') {
      lastWaitCall = null;
      turnHadAdd = false;
      turnHadDone = false;
      continue;
    }

    if (step.type !== 'PLANNER_RESPONSE') continue;

    let effectiveStep = step;
    if (
      Array.isArray(step.truncated_fields) &&
      step.truncated_fields.includes('tool_calls')
    ) {
      if (fullSteps === null) fullSteps = loadFullStepsByIndex(transcriptPath);
      const fullStep = fullSteps.get(step.step_index);
      if (fullStep && Array.isArray(fullStep.tool_calls)) effectiveStep = fullStep;
    }
    if (!Array.isArray(effectiveStep.tool_calls)) continue;

    for (const tc of effectiveStep.tool_calls) {
      const name = tc?.name;
      const args = tc?.args || tc?.arguments || {};

      if (name === 'swarm') {
        const action = String(decodeArg(args.action) || '').toLowerCase();
        if (action === 'add') {
          const brief = String(decodeArg(args.brief) || '');
          const baseName = String(decodeArg(args.name) || '').trim();
          if (baseName && isShardedAdd(args)) {
            shardedGroups.add(baseName);
          }
          for (const member of expandAddedMembers(args)) {
            if (isNarratorMember(member)) continue;
            if (isMonitorMember(member, brief)) monitors.add(member);
            else activeWorkers.add(member);
          }
          turnHadAdd = true;
          lastWaitCall = null;
        } else if (action === 'kill') {
          const target = String(decodeArg(args.name) || '').trim();
          if (target) {
            activeWorkers.delete(target);
            monitors.delete(target);
            if (shardedGroups.has(target)) {
              for (const existing of [...activeWorkers]) {
                if (existing.startsWith(`${target}-`)) activeWorkers.delete(existing);
              }
              for (const existing of [...monitors]) {
                if (existing.startsWith(`${target}-`)) monitors.delete(existing);
              }
              shardedGroups.delete(target);
            }
            if (activeWorkers.size === 0) {
              seenBoardToolsInWave = false;
            }
          }
          lastWaitCall = null;
        } else {
          lastWaitCall = null;
        }
      } else if (name === 'post_message') {
        seenBoardToolsInWave = true;
        const text = String(decodeArg(args.text) || '').trimStart();
        if (/^(?:@[a-z0-9_-]+\s+)?\[done\](?:\s|$)/i.test(text)) {
          activeWorkers.clear();
          shardedGroups.clear();
          seenBoardToolsInWave = false;
          turnHadDone = true;
        }
        lastWaitCall = null;
      } else if (name === 'swarm_wait') {
        seenBoardToolsInWave = true;
        const mentionsOnly = decodeArg(args.mentions_only);
        lastWaitCall = {
          mentionsOnly: mentionsOnly === undefined || mentionsOnly === null ? true : Boolean(mentionsOnly),
        };
      } else if (name === 'read_board') {
        seenBoardToolsInWave = true;
        lastWaitCall = null;
      } else {
        lastWaitCall = null;
      }
    }
  }

  return {
    activeWorkers: [...activeWorkers],
    monitors: [...monitors],
    shardedGroups: [...shardedGroups],
    lastWaitCall,
    turnHadAdd,
    turnHadDone,
    seenBoardToolsInWave,
  };
}

/** Resolve workspace root from hook stdin payload if available. */
function resolveMetricWorkspaceRoot(input) {
  const candidate =
    (typeof input?.cwd === 'string' && input.cwd.trim())
      ? input.cwd.trim()
      : (Array.isArray(input?.workspacePaths) &&
          typeof input.workspacePaths[0] === 'string' &&
          input.workspacePaths[0].trim())
        ? input.workspacePaths[0].trim()
        : null;
  if (!candidate) return null;
  let curr = path.resolve(candidate);
  while (true) {
    if (fs.existsSync(path.join(curr, '.harness'))) return curr;
    if (fs.existsSync(path.join(curr, '.git'))) return curr;
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }
  return path.resolve(candidate);
}

/** Non-blockingly append orchestration telemetry ONLY if `.harness/` already exists. */
function appendSwarmMetricIfHarnessExists(input, record) {
  try {
    const root = resolveMetricWorkspaceRoot(input);
    if (!root) return;
    const harnessDir = path.join(root, '.harness');
    if (!fs.existsSync(harnessDir)) return;
    const evalsDir = path.join(harnessDir, 'evals');
    fs.mkdirSync(evalsDir, { recursive: true });
    const metricsFile = path.join(evalsDir, 'orchestration-metrics.jsonl');
    const payload = {
      timestamp: new Date().toISOString(),
      workflow: 'swarm',
      ...record,
    };
    fs.appendFileSync(metricsFile, JSON.stringify(payload) + '\n', 'utf8');
  } catch {
    // Telemetry must never block or trap Stop
  }
}

/** Decide whether a Stop event requires forcing a continuation re-check. */
function evaluateStop(input) {
  if (!input || typeof input !== 'object') return null;
  if (input.continuationActive === true) return null;
  if (STOP_BYPASS_REASONS.has(input.terminationReason)) return null;

  const transcriptPath = input.transcriptPath || input.transcript_path;
  if (!transcriptPath || typeof transcriptPath !== 'string' || !fs.existsSync(transcriptPath)) {
    return null;
  }

  const state = analyzeTranscript(transcriptPath);
  if (!state) return null;
  if (state.activeWorkers.length === 0) {
    if (state.turnHadDone) {
      appendSwarmMetricIfHarnessExists(input, {
        event: 'swarm_done',
        strikes: 0,
        rework: 0,
        stalls: 0,
        scope_blocks: 0,
        outcome: 'ok',
      });
    }
    return null;
  }

  const workerList = state.activeWorkers.slice(0, 5).join(', ');
  const suffix = state.activeWorkers.length > 5 ? ` (+${state.activeWorkers.length - 5} more)` : '';

  if (state.lastWaitCall) {
    if (state.monitors.length === 0) {
      const waitNote = state.lastWaitCall.mentionsOnly !== false
        ? ' with mentions_only!=false and no monitor worker'
        : ' with no monitor worker';
      const verdict = {
        decision: 'continue',
        reason: `Swarm guard: entering swarm_wait${waitNote} while active workers (${workerList}${suffix}) remain open. Check swarm{action:"status"} / read_board and spawn a monitor (swarm_monitor) before sleeping so the swarm cannot deadlock idle.`,
      };
      appendSwarmMetricIfHarnessExists(input, {
        event: 'stop_guard_block',
        strikes: 0,
        rework: 0,
        stalls: 1,
        scope_blocks: 0,
        outcome: 'fail',
        active_workers: state.activeWorkers.length,
      });
      return verdict;
    }
    return null;
  }

  // Turn 1 spawns workers before post_message/read_board/swarm_wait exist in the toolset; allow clean turn end when a monitor is active.
  if (state.turnHadAdd && !state.seenBoardToolsInWave) {
    if (state.monitors.length === 0) {
      const verdict = {
        decision: 'continue',
        reason: `Swarm guard: spawned workers (${workerList}${suffix}) without a monitor worker. Spawn a monitor (swarm_monitor) so idle stalls auto-wake before ending Turn 1.`,
      };
      appendSwarmMetricIfHarnessExists(input, {
        event: 'stop_guard_block',
        strikes: 0,
        rework: 0,
        stalls: 1,
        scope_blocks: 0,
        outcome: 'fail',
        active_workers: state.activeWorkers.length,
      });
      return verdict;
    }
    return null;
  }

  const verdict = {
    decision: 'continue',
    reason: `Swarm guard: ending turn without [done] while workers (${workerList}${suffix}) remain active in transcript. Run swarm{action:"status"} and read_board to verify whether workers are done or stalled sleeping, wake/wait cleanly, or post [done] and kill finished workers.`,
  };
  appendSwarmMetricIfHarnessExists(input, {
    event: 'stop_guard_block',
    strikes: 0,
    rework: 0,
    stalls: 1,
    scope_blocks: 0,
    outcome: 'fail',
    active_workers: state.activeWorkers.length,
  });
  return verdict;
}

async function main() {
  try {
    const raw = await readStdin(1500);
    const input = parseJsonSafe(raw);
    const verdict = evaluateStop(input);
    process.stdout.write(JSON.stringify(verdict || {}) + '\n');
  } catch {
    // Hook errors must never trap termination
    process.stdout.write('{}\n');
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeTranscript, evaluateStop, decodeArg, expandAddedMembers, main };
