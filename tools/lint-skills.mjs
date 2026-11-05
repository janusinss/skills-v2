import fs from 'node:fs';
import path from 'node:path';
import { repoRoot, sourceRoot, parseSkill } from './codex/lib.mjs';

// Lints top-level skills: description length (80-300), trigger wording, SKILL.md length (<=500).
// Existing violations are grandfathered in tools/lint-baseline.json; a NEW or WORSENED violation fails.
// Refresh the baseline after fixing skills with: node tools/lint-skills.mjs --write-baseline
const LIMITS = { descMin: 80, descMax: 300, lines: 500 };
const TRIGGER = /\b(use when|use this|use for|use after|use to|when the user|when you|when (?:building|designing|implementing|reviewing|asked)|activate|triggers?)\b/i;
const baselinePath = path.join(repoRoot, 'tools/lint-baseline.json');
const skillsRoot = path.join(sourceRoot, 'skills');

function measure() {
  const result = {};
  for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(skillsRoot, entry.name, 'SKILL.md');
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    const description = String(parseSkill(text, file).frontmatter.description ?? '').replace(/\s+/g, ' ').trim();
    result[entry.name] = {
      descLength: description.length,
      lines: text.split(/\r?\n/).length,
      hasTrigger: TRIGGER.test(description),
    };
  }
  return result;
}

function violations(m) {
  const found = [];
  if (m.descLength < LIMITS.descMin) found.push('description-too-short');
  if (m.descLength > LIMITS.descMax) found.push('description-too-long');
  if (!m.hasTrigger) found.push('no-trigger-wording');
  if (m.lines > LIMITS.lines) found.push('skill-too-long');
  return found;
}

const current = measure();
const totalChars = Object.values(current).reduce((sum, m) => sum + m.descLength, 0);

if (process.argv[2] === '--write-baseline') {
  const baseline = {};
  for (const [name, m] of Object.entries(current)) if (violations(m).length) baseline[name] = m;
  fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + '\n');
  console.log(`Baseline: ${Object.keys(baseline).length} skills with violations; description characters: ${totalChars}`);
  process.exit(0);
}

const baseline = fs.existsSync(baselinePath) ? JSON.parse(fs.readFileSync(baselinePath, 'utf8')) : {};
const errors = [];
for (const [name, m] of Object.entries(current)) {
  const now = violations(m);
  if (!now.length) continue;
  const was = baseline[name];
  if (!was) { errors.push(`${name}: new violation(s): ${now.join(', ')}`); continue; }
  const before = violations(was);
  for (const v of now) {
    if (!before.includes(v)) errors.push(`${name}: new violation ${v}`);
  }
  if (m.descLength > was.descLength && m.descLength > LIMITS.descMax) errors.push(`${name}: description grew (${was.descLength} to ${m.descLength})`);
  if (m.lines > was.lines && m.lines > LIMITS.lines) errors.push(`${name}: SKILL.md grew (${was.lines} to ${m.lines} lines)`);
}
const counts = { descTooShort: 0, descTooLong: 0, noTrigger: 0, tooLong: 0 };
for (const m of Object.values(current)) {
  const v = violations(m);
  if (v.includes('description-too-short')) counts.descTooShort++;
  if (v.includes('description-too-long')) counts.descTooLong++;
  if (v.includes('no-trigger-wording')) counts.noTrigger++;
  if (v.includes('skill-too-long')) counts.tooLong++;
}
console.log(JSON.stringify({ skills: Object.keys(current).length, descriptionCharacters: totalChars, ...counts, errors }, null, 2));
if (errors.length) process.exit(1);
