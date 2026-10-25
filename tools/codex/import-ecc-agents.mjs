import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const repoRoot = process.cwd();
const targetDir = path.join(repoRoot, '.agents/agents');

const curatedAgents = [
  // Core Lifecycle & Architecture
  'planner.md',
  'code-architect.md',
  'architect.md',
  'a11y-architect.md',
  'agent-evaluator.md',
  'spec-miner.md',

  // Quality Gates, Refactoring & Failure Hunters
  'silent-failure-hunter.md',
  'code-simplifier.md',
  'code-reviewer.md',
  'refactor-cleaner.md',
  'tdd-guide.md',

  // Build Error Resolvers
  'build-error-resolver.md',
  'react-build-resolver.md',
  'go-build-resolver.md',
  'rust-build-resolver.md',
  'cpp-build-resolver.md',
  'django-build-resolver.md',
  'pytorch-build-resolver.md',

  // Language & Stack Reviewers
  'typescript-reviewer.md',
  'react-reviewer.md',
  'vue-reviewer.md',
  'fastapi-reviewer.md',
  'go-reviewer.md',
  'rust-reviewer.md',
  'php-reviewer.md',
  'database-reviewer.md',
  'e2e-runner.md',
  'performance-optimizer.md',
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node-ECC-Importer' }, rejectUnauthorized: false }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${url} (HTTP ${res.statusCode})`));
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function normalizeAgent(rawContent) {
  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return rawContent;

  const yamlBlock = match[1];
  const body = match[2];

  // Extract fields
  const nameMatch = yamlBlock.match(/^name:\s*(.+)$/m);
  const descMatch = yamlBlock.match(/^description:\s*(.+)$/m);
  const toolsMatch = yamlBlock.match(/^tools:\s*(.+)$/m);

  const name = nameMatch ? nameMatch[1].trim() : 'custom-agent';
  let description = descMatch ? descMatch[1].trim() : `${name} specialist agent`;
  if (!description.startsWith('"') && !description.startsWith("'")) {
    description = `"${description.replace(/"/g, '\\"')}"`;
  }

  const rawTools = toolsMatch ? toolsMatch[1] : 'Read, Grep, Glob';

  const toolSet = new Set();
  toolSet.add('view_file');
  toolSet.add('grep_search');
  toolSet.add('find_by_name');
  toolSet.add('list_dir');

  if (/edit|write/i.test(rawTools)) {
    toolSet.add('write_to_file');
    toolSet.add('replace_file_content');
  }
  if (/bash/i.test(rawTools)) {
    toolSet.add('run_command');
  }

  const toolsYaml = Array.from(toolSet)
    .map((t) => `  - ${t}`)
    .join('\n');

  return `---
name: ${name}
description: ${description}
tools:
${toolsYaml}
mainAgent: true
subagent: true
commandExecutionPolicy: auto
---

${body.trim()}
`;
}

async function run() {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Importing ${curatedAgents.length} curated agents from affaan-m/ECC...`);

  let imported = 0;
  for (const filename of curatedAgents) {
    const url = `https://raw.githubusercontent.com/affaan-m/ECC/main/agents/${filename}`;
    try {
      const raw = await fetchUrl(url);
      const normalized = normalizeAgent(raw);
      const outPath = path.join(targetDir, filename);
      fs.writeFileSync(outPath, normalized, 'utf8');
      imported++;
      console.log(`[OK] Imported ${filename}`);
    } catch (err) {
      console.error(`[ERR] Failed to import ${filename}: ${err.message}`);
    }
  }

  console.log(`Successfully imported ${imported}/${curatedAgents.length} agents into .agents/agents/.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
