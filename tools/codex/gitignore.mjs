import fs from 'node:fs';
import path from 'node:path';
import { isUtf8 } from 'node:buffer';
import { assertNoSymlinkAncestors, bundleRoot } from './lib.mjs';

export const localCodexIgnoreEntries = Object.freeze(['/.codex/', '/AGENTS.md', '/scratch/', '/.impeccable/']);

export function planGitignore(target, root = bundleRoot) {
  if (!path.isAbsolute(target)) throw new Error('The .gitignore target must be an absolute project path');
  const defaultsPath = path.join(root, 'project.gitignore');
  assertNoSymlinkAncestors(defaultsPath);
  const defaults = fs.readFileSync(defaultsPath);
  if (!isUtf8(defaults) || defaults.includes(0)) throw new Error('The bundled project.gitignore must be UTF-8 text');
  const sections = defaults.toString('utf8').replace(/^\uFEFF/, '').replaceAll('\r\n', '\n').trimEnd().split(/\n\s*\n/);
  const patterns = sections.flatMap(section => section.split('\n').filter(line => line && !line.startsWith('#')));
  const record = { path: '.gitignore', entries: [...new Set(patterns)] };
  const absolute = path.join(target, '.gitignore');
  assertNoSymlinkAncestors(absolute);
  const existed = fs.existsSync(absolute);
  if (existed && !fs.statSync(absolute).isFile()) throw new Error('The target .gitignore must be a regular file');
  const original = existed ? fs.readFileSync(absolute) : Buffer.alloc(0);
  if (!isUtf8(original) || original.includes(0)) throw new Error('The target .gitignore must be UTF-8 text; preserve it and review the encoding before installation');
  const text = original.toString('utf8');
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).map(line => line.trimEnd());
  const positions = new Map(lines.map((line, index) => [line, index]));
  let nextPosition = lines.length;
  const additions = [];
  for (const section of sections) {
    const missing = new Set();
    let exclusionPosition = -1;
    let previousWasNegation = false;
    for (const entry of section.split('\n').filter(line => line && !line.startsWith('#'))) {
      const negation = entry.startsWith('!');
      if (!negation && previousWasNegation) exclusionPosition = -1;
      // An unanchored exclusion also covers its rooted equivalent. Other
      // patterns, including negations, must match in full.
      const position = Math.max(positions.get(entry) ?? -1, entry.startsWith('/') ? positions.get(entry.slice(1)) ?? -1 : -1);
      // Keep exceptions after their exclusions, including when the existing
      // file contains an exception but its exclusion is newly appended.
      if (position < 0 || (negation && position < exclusionPosition)) {
        missing.add(entry);
        positions.set(entry, nextPosition++);
      }
      if (!negation) exclusionPosition = Math.max(exclusionPosition, positions.get(entry) ?? position);
      previousWasNegation = negation;
    }
    if (missing.size) additions.push(section.split('\n').filter(line => line.startsWith('#') || missing.has(line)).join('\n'));
  }
  const newline = text.includes('\r\n') ? '\r\n' : '\n';
  const separator = original.length ? (text.endsWith('\n') ? newline : newline + newline) : '';
  const addition = additions.length ? Buffer.from(separator + additions.join('\n\n').replaceAll('\n', newline) + newline) : Buffer.alloc(0);
  return { absolute, existed, original, addition, record, action: !existed ? 'created' : additions.length ? 'updated' : 'unchanged' };
}

export function applyGitignore(plan) {
  assertNoSymlinkAncestors(plan.absolute);
  const exists = fs.existsSync(plan.absolute);
  if (exists !== plan.existed || (exists && !fs.readFileSync(plan.absolute).equals(plan.original))) throw new Error('The target .gitignore changed during installation; review it before retrying');
  if (plan.action === 'created') fs.writeFileSync(plan.absolute, plan.addition, { flag: 'wx' });
  else if (plan.action === 'updated') fs.appendFileSync(plan.absolute, plan.addition);
  return { ...plan.record, action: plan.action };
}
