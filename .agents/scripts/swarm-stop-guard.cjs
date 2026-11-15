#!/usr/bin/env node
/**
 * AGY-only Swarm Stop Guard hook (hooks.json Stop event).
 *
 * Inspects the documented conversation transcript (`transcriptPath` on stdin)
 * to detect unclosed `/swarm` sessions (workers added via `swarm` without `[done]`
 * or `kill`), missing `monitor` (`swarm_monitor`), or coordinator `swarm_wait`
 * calls using `mentions_only !== false`. Returns `{"decision":"continue"}` so
 * the coordinator re-checks `swarm{action:"status"}` and `read_board` instead of
 * leaving workers asleep.
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
  let lastWaitCall = null;
  let turnHadAdd = false;
  let seenBoardToolsInWave = false;

  for (const line of lines) {
    if (!line.trim()) continue;
    const step = parseJsonSafe(line);
    if (!step) continue;

    if (step.type === 'USER_INPUT') {
      lastWaitCall = null;
      turnHadAdd = false;
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
            for (const existing of [...activeWorkers]) {
              if (existing.startsWith(`${target}-`)) activeWorkers.delete(existing);
            }
            for (const existing of [...monitors]) {
              if (existing.startsWith(`${target}-`)) monitors.delete(existing);
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
        if (/^\[done\](?:\s|$)/i.test(text)) {
          activeWorkers.clear();
          monitors.clear();
          seenBoardToolsInWave = false;
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
    lastWaitCall,
    turnHadAdd,
    seenBoardToolsInWave,
  };
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
  if (!state || state.activeWorkers.length === 0) return null;

  const workerList = state.activeWorkers.slice(0, 5).join(', ');
  const suffix = state.activeWorkers.length > 5 ? ` (+${state.activeWorkers.length - 5} more)` : '';

  if (state.lastWaitCall) {
    if (state.monitors.length === 0) {
      return {
        decision: 'continue',
        reason: `Swarm guard: entering swarm_wait with active workers (${workerList}${suffix}) and no monitor worker. Check swarm{action:"status"} / read_board and spawn a monitor (swarm_monitor) before sleeping so the swarm cannot deadlock idle.`,
      };
    }
    if (state.lastWaitCall.mentionsOnly !== false) {
      return {
        decision: 'continue',
        reason: `Swarm guard: coordinator swarm_wait ran with mentions_only!=false while workers (${workerList}${suffix}) are open. Re-check swarm{action:"status"} / read_board and wait with mentions_only:false so unaddressed or peer posts still wake you.`,
      };
    }
    return null;
  }

  // Turn 1 spawns workers before post_message/read_board/swarm_wait exist in the toolset; allow clean turn end when a monitor is active.
  if (state.turnHadAdd && !state.seenBoardToolsInWave) {
    if (state.monitors.length === 0) {
      return {
        decision: 'continue',
        reason: `Swarm guard: spawned workers (${workerList}${suffix}) without a monitor worker. Spawn a monitor (swarm_monitor) so idle stalls auto-wake before ending Turn 1.`,
      };
    }
    return null;
  }

  return {
    decision: 'continue',
    reason: `Swarm guard: ending turn without [done] while workers (${workerList}${suffix}) remain active in transcript. Run swarm{action:"status"} and read_board to verify whether workers are done or stalled sleeping, wake/wait cleanly, or post [done] and kill finished workers.`,
  };
}

async function main() {
  try {
    const raw = await readStdin(1500);
    const input = parseJsonSafe(raw);
    const verdict = evaluateStop(input);
    if (verdict) {
      process.stdout.write(JSON.stringify(verdict) + '\n');
    }
  } catch {
    // Hook errors must never trap termination
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeTranscript, evaluateStop, decodeArg, expandAddedMembers, main };
