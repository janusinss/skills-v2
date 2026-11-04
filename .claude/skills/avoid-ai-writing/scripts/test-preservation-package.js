#!/usr/bin/env node
'use strict';

const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(process.argv[2] || '.');
const validatorPath = path.join(
  root,
  'skills',
  'preservation-verifier',
  'scripts',
  'validate.js',
);

let validator;
try {
  validator = require(validatorPath);
} catch (error) {
  console.error(`failed to load packaged preservation validator: ${error.message}`);
  process.exit(1);
}

const sample = [
  'The release note lists the change and its reason.',
  'The review keeps the original facts and file names.',
  'The final text stays close to the source.',
].join(' ');

const result = validator.validate(sample, sample);
const residual = result && result.stats && result.stats.residual;

if (!residual) {
  console.error(
    'packaged preservation validator did not load its residual detector; stats.residual is null',
  );
  process.exit(1);
}

for (const field of ['issuesBefore', 'issuesAfter', 'scoreBefore', 'scoreAfter']) {
  if (typeof residual[field] !== 'number') {
    console.error(`invalid residual detector field ${field}: ${residual[field]}`);
    process.exit(1);
  }
}

const before = sample + ' `config.json`';
const after = 'We leverage a robust and comprehensive framework to delve into the landscape of tooling, showcasing a seamless paradigm. `config.json`';
const legacy = validator.validate(before, after);
const editorial = validator.validate(before, after, { residualPolicy: 'warn' });
assert.equal(legacy.ok, false);
assert.ok(legacy.errors.some(e => e.code === 'residual-grew'));
assert.equal(editorial.ok, true);
assert.equal(editorial.preservation.ok, true);
assert.ok(editorial.warnings.some(w => w.code === 'residual-grew'));
const damaged = validator.validate(before, after.replace('`config.json`', ''), { residualPolicy: 'warn' });
assert.equal(damaged.ok, false);
assert.ok(damaged.preservation.errors.some(e => e.code === 'inline-code-missing'));
console.log(JSON.stringify({ ok: true, residual, advisoryAndDamageControls: true }, null, 2));
