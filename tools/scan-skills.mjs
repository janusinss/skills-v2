import fs from 'node:fs';
import path from 'node:path';
import { repoRoot, sourceRoot, filesIn, slash } from './codex/lib.mjs';

// Flags remote-execution patterns in skill and agent content. Known benign lines
// are listed in tools/scan-allowlist.json as { file, contains }; any new match fails.
const patterns = [
  { name: 'download piped to shell', regex: /\b(?:curl|wget)\b[^\n|]*\|\s*(?:sudo\s+)?(?:sh|bash|zsh)\b/ },
  { name: 'download piped to iex', regex: /\b(?:irm|iwr|Invoke-WebRequest|Invoke-RestMethod)\b[^\n|]*\|\s*iex\b/i },
  { name: 'Invoke-Expression', regex: /\bInvoke-Expression\b/ },
  { name: 'unpinned npx -y', regex: /\bnpx\s+(?:-y|--yes)\s+(?![^\s]+@\d)/ },
];
const scanned = /\.(?:md|js|mjs|cjs|sh|ps1|cmd|bat|py|json)$/i;
const allowlistPath = path.join(repoRoot, 'tools/scan-allowlist.json');
const allowlist = fs.existsSync(allowlistPath) ? JSON.parse(fs.readFileSync(allowlistPath, 'utf8')) : [];

const findings = [];
for (const file of filesIn(sourceRoot)) {
  if (!scanned.test(file)) continue;
  const relative = slash(path.relative(repoRoot, file));
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const { name, regex } of patterns) {
      if (!regex.test(line)) continue;
      if (allowlist.some(entry => entry.file === relative && line.includes(entry.contains))) continue;
      findings.push(`${relative}:${index + 1}: ${name}: ${line.trim().slice(0, 140)}`);
    }
  });
}

console.log(JSON.stringify({ findings: findings.length }, null, 2));
if (findings.length) {
  for (const finding of findings) console.error(finding);
  console.error('Fix the line, or add a reviewed { file, contains } entry to tools/scan-allowlist.json.');
  process.exit(1);
}
