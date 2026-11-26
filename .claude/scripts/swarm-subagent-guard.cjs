'use strict';

const fs = require('node:fs');
const path = require('node:path');

const STDIN_TIMEOUT_MS = 1500;
const MAX_STDIN_BYTES = 1024 * 1024;
const MISSING_REPORT_MESSAGE = 'Report files modified or findings verified before closing this subagent.\n';

function evaluateSubagentStop(input) {
  if (!input || typeof input !== 'object') {
    return { exitCode: 0, stderr: '' };
  }
  if (input.stop_hook_active === true) {
    return { exitCode: 0, stderr: '' };
  }
  if (typeof input.last_assistant_message === 'string' && !input.last_assistant_message.trim()) {
    return { exitCode: 2, stderr: MISSING_REPORT_MESSAGE };
  }
  return { exitCode: 0, stderr: '' };
}

function recordOrchestrationMetric(input, result) {
  try {
    const baseCwd = input && typeof input.cwd === 'string' && input.cwd.trim()
      ? input.cwd
      : process.cwd();
    const harnessDir = path.join(baseCwd, '.harness');
    if (!fs.existsSync(harnessDir) || !fs.statSync(harnessDir).isDirectory()) {
      return;
    }
    const evalsDir = path.join(harnessDir, 'evals');
    fs.mkdirSync(evalsDir, { recursive: true });
    const blocked = Boolean(result && result.exitCode === 2);
    const agentType = input && typeof input.agent_type === 'string' && input.agent_type.trim()
      ? input.agent_type.trim()
      : (input && typeof input.subagent_type === 'string' && input.subagent_type.trim()
        ? input.subagent_type.trim()
        : 'unknown');
    const record = {
      timestamp: new Date().toISOString(),
      workflow: 'claude-swarm',
      event: blocked ? 'subagent_incomplete' : 'subagent_done',
      agent_type: agentType,
      outcome: blocked ? 'blocked' : 'completed'
    };
    fs.appendFileSync(path.join(evalsDir, 'orchestration-metrics.jsonl'), JSON.stringify(record) + '\n', 'utf8');
  } catch {
    // non-blocking telemetry
  }
}

function main() {
  if (process.stdin.isTTY) {
    process.exit(0);
    return;
  }

  let raw = '';
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    try {
      process.stdin.pause();
      process.stdin.destroy();
    } catch {
      // ignore stream teardown errors
    }

    const cleaned = (raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw).trim();
    if (!cleaned) {
      process.exit(0);
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      process.exit(0);
      return;
    }

    const result = evaluateSubagentStop(parsed);
    recordOrchestrationMetric(parsed, result);
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
    process.exit(result.exitCode);
  };

  const timer = setTimeout(finish, STDIN_TIMEOUT_MS);
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => {
    raw += chunk;
    if (Buffer.byteLength(raw, 'utf8') >= MAX_STDIN_BYTES) {
      finish();
    }
  });
  process.stdin.on('end', finish);
  process.stdin.on('error', finish);
}

module.exports = { evaluateSubagentStop, recordOrchestrationMetric, main };

if (require.main === module) {
  main();
}
