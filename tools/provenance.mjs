import fs from 'node:fs';
import path from 'node:path';
import { repoRoot, sourceRoot, filesIn, payloadHash, parseSkill, sha256, slash } from './codex/lib.mjs';

const provenancePath = path.join(repoRoot, 'provenance.json');
const skillsRoot = path.join(sourceRoot, 'skills');

const KNOWN_UPSTREAMS = {
  'agent-browser': { source: 'vercel-labs/agent-browser', sourceType: 'github', license: 'Apache-2.0' },
  'avoid-ai-writing': { source: 'conorbronsdon/avoid-ai-writing', sourceType: 'github', license: 'MIT' },
  'design': { source: 'nextlevelbuilder/ui-ux-pro-max-skill', sourceType: 'github', license: 'MIT' },
  'design-system': { source: 'nextlevelbuilder/ui-ux-pro-max-skill', sourceType: 'github', license: 'MIT' },
  'impeccable': { source: 'pbakaus/impeccable', sourceType: 'github', license: 'Apache-2.0' },
  'mcp-builder': { source: 'anthropics/skills', sourceType: 'github', license: 'Apache-2.0' },
  'playwright-skill': { source: 'lackeyjb/playwright-skill', sourceType: 'github', license: 'MIT' },
  'postgres-best-practices': { source: 'supabase/agent-skills', sourceType: 'github', license: 'MIT' },
  'react-best-practices': { source: 'vercel-labs/agent-skills', sourceType: 'github', license: 'MIT' },
  'security-audit': { source: 'cloudflare/security-audit-skill', sourceType: 'github', license: 'MIT' },
  'ui-styling': { source: 'nextlevelbuilder/ui-ux-pro-max-skill', sourceType: 'github', license: 'MIT' },
  'ui-ux-pro-max': { source: 'nextlevelbuilder/ui-ux-pro-max-skill', sourceType: 'github', license: 'MIT' },
  'untangle-codebase': { source: 'caldoai/skills', sourceType: 'github', license: 'MIT' },
  'prompt-enhancer': { source: 'original', sourceType: 'original', license: 'MIT' },
  'prompt-enhancer-backend': { source: 'original', sourceType: 'original', license: 'MIT' },
  'prompt-enhancer-frontend': { source: 'original', sourceType: 'original', license: 'MIT' },
  'anti-ai-slop': { source: 'original', sourceType: 'original', license: 'MIT' },
};

const SOURCE_COMMITS = {
  'Leonxlnx/imagegen-skills': 'beb16b0d0f4dae9a6f5cb04ea41e97b93a54ab8e',
  'Leonxlnx/taste-skill': 'f6b76575f949707b4e3c37cd86cb44b0b98643e8',
  'VoltAgent/awesome-design-md': 'fcc70284932276d085f01ef9f83edde90b1258cb',
  'affaan-m/everything-claude-code': 'd2ef2680594f9a17526a6e1a2e18b3d242c5d17b',
  'anthropics/skills': '2c5958ecac7cee2b583967a2c4981d0f4a75c579',
  'basementstudio/scrollytelling': '0c26959b106d9e81931c30af7dfeebfd83d0a379',
  'caldoai/skills': 'f3cf47774975a7d9fca45730babf4ff7ad765ada',
  'cloudflare/security-audit-skill': 'c1c8a8c1471069fb0e188eeaff69b8e8db6564a8',
  'conorbronsdon/avoid-ai-writing': 'a04645a5d915d83ad1741a92d989dfc4bc6f1867',
  'lackeyjb/playwright-skill': 'dd47a6a023e249eb1b36e9e943eab89d0900865d',
  'mrgoonie/claudekit-skills': '80113d86bc4407f105af40a2c4ea58194f7c370a',
  'nextlevelbuilder/ui-ux-pro-max-skill': '6ae86f61f520d6ca229d2f40e070410638c908c5',
  'pbakaus/impeccable': '61e73eebd34a845df0bfef463eb0d31ed4eab581',
  'sickn33/antigravity-awesome-skills': '560b762c309d6b96315855d7968727d3bca7df20',
  'supabase/agent-skills': 'c9be0e931b7930f7d02126d04774d904c381e7d7',
  'tt-a1i/archify': 'e37848822238e3a61b12739185cdadd49843a620',
  'usestrix/strix': '4719329d1c3eb0db796714397551945c514a2301',
  'vercel-labs/agent-browser': 'f18b8bb5275ea2be22fca5e6856886827468f41e',
  'vercel-labs/agent-skills': '1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62',
  'vibeforge1111/vibeship-spawner-skills': '70b2e1062fc6a38fce854226c27097a87732cb5f',
};

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

function inferUpstream(name, directory, skillText, locked) {
  if (locked) {
    const detected = detectLicense(directory, skillText);
    return {
      source: locked.source,
      sourceType: locked.sourceType || 'github',
      license: detected !== 'unverified' ? detected : (KNOWN_UPSTREAMS[name]?.license || 'unverified'),
    };
  }
  if (KNOWN_UPSTREAMS[name]) return KNOWN_UPSTREAMS[name];
  const { frontmatter } = parseSkill(skillText, path.join(directory, 'SKILL.md'));
  const fmSource = String(frontmatter.source || '');
  const fmAuthor = String(frontmatter.author || frontmatter.metadata?.author || '');
  const fmOrigin = String(frontmatter.origin || frontmatter.metadata?.origin || '');
  if (/vibeship-spawner-skills/i.test(fmSource)) {
    return { source: 'vibeforge1111/vibeship-spawner-skills', sourceType: 'github', license: 'Apache-2.0' };
  }
  if (fmOrigin === 'ECC') {
    return { source: 'affaan-m/everything-claude-code', sourceType: 'github', license: 'MIT' };
  }
  if (fmAuthor === 'claudekit') {
    return { source: 'mrgoonie/claudekit-skills', sourceType: 'github', license: 'MIT' };
  }
  if (fmAuthor === 'zebbern') {
    return { source: 'sickn33/antigravity-awesome-skills', sourceType: 'github', license: 'MIT' };
  }
  if (fmSource === 'community' || ('risk' in frontmatter && 'date_added' in frontmatter)) {
    return { source: 'sickn33/antigravity-awesome-skills', sourceType: 'github', license: 'MIT' };
  }
  return { source: 'unknown', sourceType: 'unknown', license: detectLicense(directory, skillText) };
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
    const skillText = fs.readFileSync(skillFile, 'utf8');
    const locked = lock[name];
    const kept = previous[name] || {};
    const inferred = inferUpstream(name, directory, skillText, locked);
    const hash = folderHash(directory);
    const changedSincePrevious = kept.contentHash && kept.contentHash !== hash;
    const source = inferred.source !== 'unknown' ? inferred.source : (kept.source || 'unknown');
    skills[name] = {
      source,
      sourceType: inferred.sourceType !== 'unknown' ? inferred.sourceType : (kept.sourceType || 'unknown'),
      commit: locked?.commit ?? SOURCE_COMMITS[source] ?? kept.commit ?? null,
      license: inferred.license !== 'unverified' ? inferred.license : (kept.license || 'unverified'),
      modified: kept.modified ?? (changedSincePrevious ? 'description/references updated in skills-v2' : null),
      contentHash: hash,
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
    if ((recorded[name]?.source || entry.source) === 'unknown') unknown++;
  }
  for (const name of Object.keys(recorded)) if (!current[name]) errors.push(`${name}: recorded but missing on disk`);
  const summary = { skills: Object.keys(current).length, unknownSource: unknown, unverifiedLicense: Object.values(current).filter(entry => entry.license === 'unverified').length, errors };
  console.log(JSON.stringify(summary, null, 2));
  if (unknown) console.error(`WARNING: ${unknown} skills have unknown source.`);
  if (errors.length) { console.error('Fix: node tools/provenance.mjs --write'); process.exit(1); }
}

main();
