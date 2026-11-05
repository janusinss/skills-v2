import fs from 'node:fs';
import path from 'node:path';
import { repoRoot, sourceRoot, parseSkill } from './codex/lib.mjs';

// Regenerates the count line, profile table and subagent table in README.MD from
// .claude/manifest.json, .codex/profiles.json and .agents/agents/*.md.
//   node tools/readme-sync.mjs --write | --check
const readmePath = path.join(repoRoot, 'README.MD');
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, '.claude/manifest.json'), 'utf8')).summary;
const profiles = JSON.parse(fs.readFileSync(path.join(repoRoot, '.codex/profiles.json'), 'utf8'));
const allSkills = fs.readdirSync(path.join(sourceRoot, 'skills'), { withFileTypes: true })
  .filter(entry => entry.isDirectory() && fs.existsSync(path.join(sourceRoot, 'skills', entry.name, 'SKILL.md'))).map(entry => entry.name);

const preview = names => names.slice(0, 5).map(name => `\`${name}\``).join(', ') + (names.length > 5 ? `, +${names.length - 5} more` : '');
const profileRows = [
  ['all', allSkills, 'Every skill, rule and subagent.'],
  ['minimal', profiles.minimal],
  ['frontend', profiles.frontend],
  ['backend', profiles.backend],
  ['security', profiles.security],
  ['fullstack', [...new Set([...profiles.frontend, ...profiles.backend])]],
].map(([name, skills, note]) => `| **\`${name}\`** | ${skills.length} | ${note || preview(skills)} |`);

const agents = fs.readdirSync(path.join(sourceRoot, 'agents')).filter(file => file.endsWith('.md')).sort().map(file => {
  const { frontmatter } = parseSkill(fs.readFileSync(path.join(sourceRoot, 'agents', file), 'utf8'), file);
  const description = String(frontmatter.description || '').replace(/\s+/g, ' ').trim();
  const first = description.split(/(?<=\.)\s/)[0].replace(/\|/g, '\\|');
  return `| **\`${frontmatter.name || path.basename(file, '.md')}\`** | ${first} |`;
});

const blocks = {
  counts: `A curated collection of **${manifest.topLevelSkills} top-level AI agent skills**, ${manifest.discoverableAgents} specialized subagents, ${manifest.rules} architectural rules and ${manifest.customCommands} Claude Code slash commands, with multi-profile installers across three editions: **AGY / Gemini**, **GPT / Codex** and **Anthropic / Claude Code**.`,
  profiles: ['| Profile | Skills | Contents |', '| :--- | :---: | :--- |', ...profileRows].join('\n'),
  agents: ['| Subagent | Role |', '| :--- | :--- |', ...agents].join('\n'),
};

let text = fs.readFileSync(readmePath, 'utf8');
const eol = text.includes('\r\n') ? '\r\n' : '\n';
let next = text;
for (const [name, body] of Object.entries(blocks)) {
  const pattern = new RegExp(`(<!-- generated:${name} -->)[\\s\\S]*?(<!-- /generated:${name} -->)`);
  if (!pattern.test(next)) { console.error(`README.MD is missing the generated:${name} markers`); process.exit(2); }
  next = next.replace(pattern, (_, open, close) => `${open}${eol}${body.replace(/\n/g, eol)}${eol}${close}`);
}

if (process.argv[2] === '--write') {
  if (next !== text) fs.writeFileSync(readmePath, next);
  console.log(`README.MD synced (${agents.length} agents, ${profileRows.length} profiles)`);
} else if (process.argv[2] === '--check') {
  if (next !== text) { console.error('README.MD is out of date. Run: node tools/readme-sync.mjs --write'); process.exit(1); }
  console.log('README.MD is up to date');
} else { console.error('Usage: node tools/readme-sync.mjs --write | --check'); process.exit(2); }
