import { execFileSync } from 'node:child_process';

// Fails when a commit subject in <range> is not conventional-commit style.
//   node tools/check-commits.mjs <base>..<head>
// History before this check was added is not rewritten; CI passes only the new range.
const range = process.argv[2];
if (!range) { console.error('Usage: node tools/check-commits.mjs <base>..<head>'); process.exit(2); }

const pattern = /^(?:feat|fix|docs|chore|refactor|test|ci|perf|style|build|revert)(?:\([\w./-]+\))?!?: \S.*/;
let subjects;
try {
  subjects = execFileSync('git', ['log', '--format=%s', '--no-merges', range], { encoding: 'utf8' }).split('\n').filter(Boolean);
} catch (error) {
  console.error(`Cannot read range ${range}: ${error.message}`);
  process.exit(2);
}
const bad = subjects.filter(subject => !pattern.test(subject));
console.log(JSON.stringify({ range, commits: subjects.length, invalid: bad.length }, null, 2));
if (bad.length) {
  for (const subject of bad) console.error(`Not a conventional commit: ${subject}`);
  console.error('Expected: type(scope)?: summary, e.g. "fix: anchor dist rule". Types: feat fix docs chore refactor test ci perf style build revert.');
  process.exit(1);
}
