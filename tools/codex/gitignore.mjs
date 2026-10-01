import fs from 'node:fs';
import path from 'node:path';
import { isUtf8 } from 'node:buffer';
import { assertNoSymlinkAncestors } from './lib.mjs';

export const projectIgnoreEntries = Object.freeze(['/.codex/', '/AGENTS.md', '/scratch/', '/.impeccable/']);
export const gitignoreRecord = () => ({ path: '.gitignore', entries: [...projectIgnoreEntries] });

export function planGitignore(target) {
  if (!path.isAbsolute(target)) throw new Error('The .gitignore target must be an absolute project path');
  const absolute = path.join(target, '.gitignore');
  assertNoSymlinkAncestors(absolute);
  const existed = fs.existsSync(absolute);
  if (existed && !fs.statSync(absolute).isFile()) throw new Error('The target .gitignore must be a regular file');
  const original = existed ? fs.readFileSync(absolute) : Buffer.alloc(0);
  if (!isUtf8(original) || original.includes(0)) throw new Error('The target .gitignore must be UTF-8 text; preserve it and review the encoding before installation');
  const text = original.toString('utf8');
  const entries = new Set(text.replace(/^\uFEFF/, '').split(/\r?\n/).map(line => line.trimEnd()));
  const missing = projectIgnoreEntries.filter(entry => !entries.has(entry) && !entries.has(entry.slice(1)));
  const newline = text.includes('\r\n') ? '\r\n' : '\n';
  const separator = original.length ? (text.endsWith('\n') ? newline : newline + newline) : '';
  const addition = missing.length ? Buffer.from(separator + '# Local Codex skills, instructions, and workflow artifacts' + newline + missing.join(newline) + newline) : Buffer.alloc(0);
  return { absolute, existed, original, addition, action: !existed ? 'created' : missing.length ? 'updated' : 'unchanged' };
}

export function applyGitignore(plan) {
  assertNoSymlinkAncestors(plan.absolute);
  const exists = fs.existsSync(plan.absolute);
  if (exists !== plan.existed || (exists && !fs.readFileSync(plan.absolute).equals(plan.original))) throw new Error('The target .gitignore changed during installation; review it before retrying');
  if (plan.action === 'created') fs.writeFileSync(plan.absolute, plan.addition, { flag: 'wx' });
  else if (plan.action === 'updated') fs.appendFileSync(plan.absolute, plan.addition);
  return { ...gitignoreRecord(), action: plan.action };
}
