import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { parseSkill, supportedFields, isRecord, parseYaml, slash, sourceRoot } from './lib.mjs';

const descriptions = {
  '21st-ai': 'Generate, preview, and iterate UI drafts with the 21st AI CLI when exploring or handing off a design.',
  '21st-cli-use': 'Use the 21st CLI to obtain design context, inspiration, and implementation guidance for a UI task.',
  '21st-design-sync': 'Synchronize a project design system with 21st design context when its tokens or components change.',
  '21st-registry': 'Find and install UI components from a 21st or compatible registry using its supported tooling.',
  '21st-ui-build': 'Build or change production UI using the existing design system and 21st inspiration. Use for implementation of pages, components, or responsive layouts.',
  '21st-ui-explore': 'Explore distinct UI directions when the user requests alternatives, visual concepts, or an undecided redesign.',
  '21st-ui-review': 'Review UI for visual defects, accessibility, responsiveness, and interaction quality. Use for critique and design QA.',
  'impeccable': 'Design, review, and polish frontend interfaces using Impeccable playbooks. Use for UI, typography, layout, accessibility, or interaction work.',
  'banner-design': 'Design and export social, advertising, or website banners at requested sizes using brand assets and available image tools.',
  'design': 'Create brand assets, logos, icons, and identity collateral using the bundled design references and scripts. Image generation requires an available provider.',
  'penetration-testing-with-strix': 'Run an authorized penetration test with Strix and report evidence of exploitable vulnerabilities in web apps, APIs, or repositories.',
  'managed-pentesting-with-strix': 'Run an authorized managed Strix scan when the user requests a cloud penetration test and has the required account and budget.',
  'api-security-testing': 'Test an authorized API with Strix for authentication, authorization, injection, and API-specific vulnerabilities, with verified evidence.',
  'application-security-testing': 'Assess application security across code, web apps, APIs, and CI using Strix. Use when the user requests an AppSec review or assessment.',
  'web-app-penetration-testing': 'Penetration-test an authorized web application with Strix for exploitable web vulnerabilities and report proof of findings.',
  'find-security-vulnerabilities-in-code': 'Review source code with Strix for security vulnerabilities when the user requests a code security audit or vulnerability investigation.',
  'fix-security-vulnerabilities-with-strix': 'Fix verified security findings from Strix by addressing their root causes and checking that the original exploits fail.',
  'ci-security-scanning-with-strix': 'Configure Strix security scanning in CI when the user requests automated security checks or gates for code changes.',
  'playwright-skill': 'Automate and verify websites with Playwright. Use for browser interactions, screenshots, responsive checks, or testing user journeys.',
  'prompt-enhancer': 'Clarify a task prompt when the user requests prompt improvement or the task lacks details needed for execution.',
  'prompt-enhancer-frontend': 'Clarify frontend requirements, components, and interaction states for a substantial UI task with unresolved scope.',
  'prompt-enhancer-backend': 'Clarify backend requirements, API contracts, and data boundaries for a substantial server task with unresolved scope.',
};

export function normalizeFrontmatter(original) {
  const result = { name: original.name, description: descriptions[original.name] || original.description };
  for (const key of ['license', 'compatibility', 'allowed-tools']) if (original[key] !== undefined) result[key] = original[key];
  const metadata = {};
  for (const [key, value] of Object.entries(isRecord(original.metadata) ? original.metadata : {})) metadata[key] = typeof value === 'string' ? value : JSON.stringify(value);
  for (const [key, value] of Object.entries(original)) if (!supportedFields.has(key)) metadata[`upstream-${key}`] = typeof value === 'string' ? value : JSON.stringify(value);
  if (Object.keys(metadata).length) result.metadata = metadata;
  return result;
}

export const yamlText = data => YAML.stringify(data, { lineWidth: 0, defaultStringType: 'QUOTE_DOUBLE', defaultKeyType: 'PLAIN' });

export function openaiMetadata(original, skill) {
  const result = original ? structuredClone(original) : {};
  const display = result.interface?.display_name || skill.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const fullShort = result.interface?.short_description || skill.description;
  let short = fullShort.trim();
  if (short.length > 64) {
    const candidate = short.slice(0, 61);
    short = candidate.slice(0, candidate.lastIndexOf(' ') > 35 ? candidate.lastIndexOf(' ') : candidate.length) + '...';
  }
  if (short.length < 25) short = `${display}: ${short}`.slice(0, 64);
  if (short.length < 25) short = `Guidance for ${display} workflows`.slice(0, 64);
  let prompt = result.interface?.default_prompt || `Use $${skill.name} for the relevant part of this task.`;
  if (!prompt.includes(`$${skill.name}`)) prompt = `Use $${skill.name}. ${prompt}`;
  result.interface = { ...result.interface, display_name: display, short_description: short, default_prompt: prompt };
  // Preserve an existing policy. New metadata keeps normal automatic discovery.
  return result;
}

export function adaptMarkdown(text, sourceFile, duplicatePaths = new Map()) {
  let result = text.replaceAll('~/.claude/skills/', '.agents/skills/').replaceAll('.claude/skills/', '.agents/skills/');
  result = result.replaceAll('via `view_file`', 'using the available file-reading tool or shell');
  result = result.replaceAll('(`ask_question`)', '(when the existing user instructions leave a material choice unresolved)');
  result = result.replaceAll('AskUserQuestion', 'the available user-input tool');
  // Repair repository-root links into relative links that work in both the
  // staged bundle (skills/) and the installed edition (.agents/skills/).
  result = result.replace(/(\[[^\]\n]*\]\()([^\s)]+)(\))/g, (whole, prefix, target, suffix) => {
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target)) return whole;
    const [bare, anchor] = target.split('#', 2);
    const rootRelative = bare.replace(/^\.\//, '');
    let resolved = rootRelative.startsWith('.agents/') ? path.resolve(sourceRoot, rootRelative.slice(8)) : path.resolve(path.dirname(sourceFile), bare);
    resolved = duplicatePaths.get(resolved) || resolved;
    if (!fs.existsSync(resolved) && ![...duplicatePaths.values()].includes(resolved)) return whole;
    const relative = slash(path.relative(path.dirname(sourceFile), resolved)) || '.';
    return `${prefix}${relative}${anchor ? '#' + anchor : ''}${suffix}`;
  });
  for (const [from, to] of duplicatePaths) {
    const relative = slash(path.relative(path.dirname(sourceFile), from));
    if (!relative.startsWith('../')) result = result.replaceAll(relative, slash(path.relative(path.dirname(sourceFile), to)));
    result = result.replaceAll(slash(path.relative(path.dirname(sourceRoot), from)), slash(path.relative(path.dirname(sourceRoot), to)));
  }
  return result;
}

export function convertSkill(text, sourceFile, duplicates) {
  const { frontmatter, body } = parseSkill(text, sourceFile);
  const normalized = normalizeFrontmatter(frontmatter);
  return { frontmatter: normalized, text: `---\n${yamlText(normalized)}---\n${adaptMarkdown(body, sourceFile, duplicates)}` };
}

export function adaptPlaywrightRunner(text) {
  let result = text.replace("const { spawn, execSync } = require('node:child_process');", "const { spawn } = require('node:child_process');");
  result = result.replace(/  \/\/ Central skills repository on this machine[\s\S]*?  candidates.push\(centralSkills\);\r?\n\r?\n/, '');
  result = result.replace("  // User home directory (.agents, .claude)", '  // User-scoped Agent Skills directory');
  result = result.replace(/,\r?\n    path.join\(home, '\.claude', 'skills', 'playwright-skill', 'node_modules'\)/, '');
  result = result.replace(/  \/\/ If not found in any candidate path, attempt automatic setup[\s\S]*?\r?\n}\r?\n\r?\nfunction saveScript/, `  console.error('Playwright is unavailable. Install the dependencies and browser for this skill with npm run setup, then retry.');\n  process.exit(1);\n}\n\nfunction saveScript`);
  if (result.includes('centralSkills') || result.includes('execSync(')) throw new Error('Playwright runner adaptation no longer matches its upstream source');
  return result;
}

export function readOriginalMetadata(skillFile) {
  const file = path.join(path.dirname(skillFile), 'agents/openai.yaml');
  return fs.existsSync(file) ? parseYaml(fs.readFileSync(file, 'utf8'), file) : undefined;
}
