import fs from 'node:fs';
import path from 'node:path';
import { repoRoot, sourceRoot, filesIn, payloadHash, sha256, slash } from './codex/lib.mjs';

const provenancePath = path.join(repoRoot, 'provenance.json');
const skillsRoot = path.join(sourceRoot, 'skills');

function detectLicense(directory, skillText) {
  const fromFrontmatter = /^license:\s*(.+)$/m.exec(skillText.split(/\r?\n---/)[0] || '');
  if (fromFrontmatter) return fromFrontmatter[1].trim().replace(/^["']|["']$/g, '');
  const licenseFile = fs.readdirSync(directory).find(name => /^LICENSE(?:[.-].*)?$/i.test(name));
  if (!licenseFile) return 'unverified';
  const head = fs.readFileSync(path.join(directory, licenseFile), 'utf8').slice(0, 600);
  if (/MIT License/i.test(head)) return 'MIT';
  if (/Apache License/i.test(head)) return 'Apache-2.0';
  return `see ${licenseFile}`;
}

function folderHash(directory) {
  const parts = filesIn(directory)
    .map(file => `${slash(path.relative(directory, file))}:${payloadHash(fs.readFileSync(file))}`)
    .sort();
  return sha256(parts.join('\n'));
}

export function buildProvenance() {
  const lock = JSON.parse(fs.readFileSync(path.join(repoRoot, 'skills-lock.json'), 'utf8')).skills || {};
  const previous = fs.existsSync(provenancePath) ? JSON.parse(fs.readFileSync(provenancePath, 'utf8')).skills : {};
  const skills = {};
  const names = fs.readdirSync(skillsRoot, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  for (const name of names) {
    const directory = path.join(skillsRoot, name);
    const skillFile = path.join(directory, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;
    const locked = lock[name];
    const kept = previous[name] || {};
    skills[name] = {
      // `source` and `modified` are curated by hand; regeneration preserves them.
      source: kept.source ?? (locked ? locked.source : 'unknown'),
      sourceType: kept.sourceType ?? (locked ? locked.sourceType : 'unknown'),
      commit: kept.commit ?? null,
      license: kept.license && kept.license !== 'unverified' ? kept.license : detectLicense(directory, fs.readFileSync(skillFile, 'utf8')),
      modified: kept.modified ?? null,
      contentHash: folderHash(directory),
    };
  }
  return skills;
}

function main() {
  const mode = process.argv[2];
  const current = buildProvenance();
  if (mode === '--write') {
    fs.writeFileSync(provenancePath, JSON.stringify({ version: 1, skills: current }, null, 2) + '\n');
    console.log(`Wrote provenance.json (${Object.keys(current).length} skills)`);
    return;
  }
  if (mode !== '--check') {
    console.error('Usage: node tools/provenance.mjs --write | --check');
    process.exit(2);
  }
  if (!fs.existsSync(provenancePath)) { console.error('provenance.json missing. Run: node tools/provenance.mjs --write'); process.exit(1); }
  const recorded = JSON.parse(fs.readFileSync(provenancePath, 'utf8')).skills;
  const errors = [];
  let unknown = 0;
  for (const [name, entry] of Object.entries(current)) {
    if (!recorded[name]) errors.push(`${name}: no provenance entry`);
    else if (recorded[name].contentHash !== entry.contentHash) errors.push(`${name}: content changed since provenance.json was written`);
    if (entry.source === 'unknown') unknown++;
  }
  for (const name of Object.keys(recorded)) if (!current[name]) errors.push(`${name}: recorded but missing on disk`);
  const summary = { skills: Object.keys(current).length, unknownSource: unknown, unverifiedLicense: Object.values(current).filter(entry => entry.license === 'unverified').length, errors };
  console.log(JSON.stringify(summary, null, 2));
  if (unknown) console.error(`WARNING: ${unknown} skills have unknown source.`);
  if (errors.length) { console.error('Fix: node tools/provenance.mjs --write'); process.exit(1); }
}

main();
