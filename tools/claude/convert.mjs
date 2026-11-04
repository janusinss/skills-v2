import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter, slash, sourceRoot } from './lib.mjs';

const descriptions = {
  'impeccable': 'Design, review, and polish frontend interfaces using Impeccable playbooks. Use for UI, typography, layout, accessibility, or interaction work.',
  'design': 'Create brand assets, logos, icons, and identity collateral using the bundled design references and scripts. Image generation requires an available provider.',
  'penetration-testing-with-strix': 'Run an authorized penetration test with Strix and report evidence of exploitable vulnerabilities in web apps, APIs, or repositories.',
  'playwright-skill': 'Automate and verify websites with Playwright. Use for browser interactions, screenshots, responsive checks, or testing user journeys.',
  'prompt-enhancer': 'Deconstruct concepts into domain-adaptive P0-P3 product architecture, data models, PRODUCT.md specs, and execution-ready Master Prompts.',
  'prompt-enhancer-frontend': 'Expand UI concepts into exhaustive P0-P3 page/component matrices, interaction states, responsive journeys, and frontend Master Prompts.',
  'prompt-enhancer-backend': 'Expand backend concepts into exhaustive P0-P3 API contracts, database schemas, state machines, auth/security rules, and backend Master Prompts.',
  'scrollytelling': 'Build declarative scroll-driven animations, pinned sections, parallax, waypoints, canvas sequences, and R3F 3D scroll scenes with @bsmnt/scrollytelling and GSAP.',
};

const toolMap = {
  'view_file': 'Read',
  'read_file': 'Read',
  'grep_search': 'Grep',
  'find_by_name': 'Glob',
  'list_dir': 'Glob',
  'glob': 'Glob',
  'edit_file': 'Edit',
  'replace_file_content': 'Edit',
  'write_file': 'Write',
  'write_to_file': 'Write',
  'run_command': 'Bash',
  'bash': 'Bash'
};

export function adaptMarkdown(text, sourceFile) {
  let result = text;
  result = result.replaceAll('~/.agents/skills/', '.claude/skills/').replaceAll('.agents/skills/', '.claude/skills/');
  result = result.replaceAll('~/.codex/skills/', '.claude/skills/').replaceAll('.codex/skills/', '.claude/skills/');
  result = result.replaceAll('via `view_file`', 'using the Read tool');
  result = result.replaceAll('`run_command`', 'the Bash tool');

  // Rebase internal relative links if needed
  result = result.replace(/(\[[^\]\n]*\]\()([^\s)]+)(\))/g, (whole, prefix, target, suffix) => {
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target)) return whole;
    const [bare, anchor] = target.split('#', 2);
    const rootRelative = bare.replace(/^\.\//, '');
    let resolved = /^(?:\.agents|\.codex|\.claude)\//.test(rootRelative)
      ? path.resolve(sourceRoot, rootRelative.replace(/^(?:\.agents|\.codex|\.claude)\//, ''))
      : path.resolve(path.dirname(sourceFile), bare);
    if (!fs.existsSync(resolved)) return whole;
    const relative = slash(path.relative(path.dirname(sourceFile), resolved)) || '.';
    return `${prefix}${relative}${anchor ? '#' + anchor : ''}${suffix}`;
  });

  // Rewrite root command examples from .agents/ or .codex/ to .claude/
  return result.replace(/(^|[\s"'`(=:\[]|\.\/)\.(?:agents|codex)\/(skills|rules|resources|agents)(\/|[)\]#\s]|$)/gm, '$1.claude/$2$3')
    .replace(/(^|[\s"'`(=:\[])\.(?:agents|codex)\\(skills|rules|resources|agents)(\\|[)\]#\s]|$)/gm, '$1.claude\\$2$3');
}

export function convertSkill(text, sourceFile) {
  const { frontmatter, body } = parseFrontmatter(text, sourceFile);
  const name = frontmatter.name;
  const description = descriptions[name] || frontmatter.description;
  const yamlOut = [
    '---',
    `name: ${name}`,
    `description: ${JSON.stringify(description)}`
  ];
  if (frontmatter.license) yamlOut.push(`license: ${frontmatter.license}`);
  if (frontmatter.compatibility) yamlOut.push(`compatibility: ${JSON.stringify(frontmatter.compatibility)}`);
  yamlOut.push('---');

  return {
    frontmatter: { name, description },
    text: `${yamlOut.join('\n')}\n${adaptMarkdown(body, sourceFile)}`
  };
}

export function convertAgent(text, sourceFile) {
  const { frontmatter, body } = parseFrontmatter(text, sourceFile);
  const name = frontmatter.name || path.basename(sourceFile, '.md');
  const description = frontmatter.description;
  const rawTools = Array.isArray(frontmatter.tools) ? frontmatter.tools : (frontmatter.tools ? String(frontmatter.tools).split(',').map(t => t.trim()) : []);
  
  const mappedTools = new Set();
  for (const t of rawTools) {
    const mapped = toolMap[t.toLowerCase()] || t;
    mappedTools.add(mapped);
  }
  // Default to Read, Grep, Glob if none specified
  if (mappedTools.size === 0) {
    mappedTools.add('Read');
    mappedTools.add('Grep');
    mappedTools.add('Glob');
  }

  const toolsStr = [...mappedTools].join(', ');
  const yamlOut = [
    '---',
    `name: ${name}`,
    `description: ${JSON.stringify(description)}`,
    `tools: ${toolsStr}`,
    'model: sonnet',
    '---'
  ];

  return {
    frontmatter: { name, description, tools: toolsStr, model: 'sonnet' },
    text: `${yamlOut.join('\n')}\n${adaptMarkdown(body, sourceFile)}`
  };
}

export function generateClaudeMd(agentsMdText) {
  // Extract content before <!-- source-repository-only -->
  const content = agentsMdText.split('<!-- source-repository-only -->')[0].trim();
  let result = content.replace(
    /^# AGENTS\.md(?:\r?\n\r?\nInstructions, operating rules, and skill mappings for AI agents \(Codex, Antigravity, and compatible harnesses\)\.)?/m,
    '# CLAUDE.md\n\nInstructions, operating rules, and skill mappings for Anthropic Claude Code.'
  );
  
  // Rewrite .agents/ paths to .claude/
  result = result.replace(/(^|[\s"'`(=:\[]|\.\/)\.(?:agents|codex)\/(skills|rules|resources|agents)(\/|[)\]#\s]|$)/gm, '$1.claude/$2$3')
    .replace(/(^|[\s"'`(=:\[])\.(?:agents|codex)\\(skills|rules|resources|agents)(\\|[)\]#\s]|$)/gm, '$1.claude\\$2$3');

  // Mention Claude Code subagent addressing syntax: @agent-name
  result = result.replace(/Delegate specialized lifecycle tasks to the agents defined under \[\.claude\/agents\/\]\(\.claude\/agents\/\):/g,
    'Delegate specialized lifecycle tasks to the agents defined under [.claude/agents/](.claude/agents/) using `@agent-name`:');

  return result + '\n';
}
