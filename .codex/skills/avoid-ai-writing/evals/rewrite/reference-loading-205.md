# Reference-loading experiment preparation (#205)

This is an offline export and context-assembly tool. The installed skill still
requires the full reference, including for quick passes. No model comparison,
automatic routing, token saving, latency improvement or editing-quality result
is claimed. Complete #206's editorial-policy evaluation before freezing the
loading comparison; do not combine two changing policies in that comparison.

The exporter pins `SKILL.md` and `references/patterns.md` to a full Git commit.
It partitions the reference into contiguous, ordered modules, keeping each rule
with all its examples and exceptions. Context and voice profiles are always
included. The index lists every family, including judgment-only and
document-level rules. It is generated from the same source rather than a second
hand-maintained heading list. Production canonical files and generated plugin,
Cursor and portable artifacts are unchanged.

## Prepare and inspect

Run from a Git checkout. The output directory must not already exist:

```bash
loading_source=$(git rev-parse HEAD)
node scripts/reference-loading.js prepare "$loading_source" /tmp/loading-205-pack
node scripts/reference-loading.js verify /tmp/loading-205-pack
```

Inspect `manifest.json` and `index.md` in that directory. Verification rereads
the pinned Git sources, checks every file and ordered include, and proves that
joining the modules reproduces the complete reference. Corruption or a missing
file fails even when a focused selection would not have included that file.
A failed read cannot become a clean or exhaustive audit.

Create two configuration files outside the repository:

```json
{"mode":"full"}
```

```json
{"mode":"focused","modules":["copula-avoidance"]}
```

Assemble each with the same pack:

```bash
node scripts/reference-loading.js assemble /tmp/loading-205-pack /tmp/full.json /tmp/loading-full
node scripts/reference-loading.js assemble /tmp/loading-205-pack /tmp/focused.json /tmp/loading-focused
```

Each output prefix receives a complete `.prompt.md` and a `.trace.json`.
Both prompts share the same editing contract, complete reference index,
profiles, protected-content rules and output contract. Only the declared rule
modules differ. The full prompt retains all reference text and the existing
flattening order. It is self-contained for a no-reference-reading model
environment; this does not replace the production portable generator or its
host-specific transforms and checks.

Focused coverage is explicitly limited to its supplied module IDs. No focus
means ambiguous scope and falls back to all modules. An unknown or duplicate
ID is an input error. Always-included profile/introduction modules cannot be
used as a rule focus, alone or alongside rule IDs. This first preparation uses operator-selected focus,
not an automatic router and not detector hits as an oracle for applicability.
It cannot yet establish the cost or accuracy of discovering which modules a
model should read. A full audit uses `mode: full` regardless of desired savings.

## Freeze a later comparison

[`reference-loading-205.json`](reference-loading-205.json) records fifteen
synthetic development cases and acceptance criteria before any calls. They
cover rare and judgment-only rules, technical exceptions, interactions,
protected code, source-internal instructions, mixed genres, late findings,
scope and missing information. They supplement the existing rewrite benchmark;
they are not fresh held-out cases or a corpus-level rate estimate.

After #206 acceptance, pin the final policy, both prompt hashes,
generator and protocol/input hashes, model IDs/settings, repetitions and
adjudication method. The pack and trace record the executing generator hash;
the trace also hashes the parsed configuration as two-space JSON in
`mode`, then `modules` key order, with a trailing newline. Unknown keys are
rejected. Preserve the actual configuration file too. A changed
generator requires preparing a new pack. Execute the same tasks
and settings in paired full/focused arms. Keep the expected decisions and
review criteria out of editor prompts. Retain complete responses, failed
attempts and independent source-fidelity assessments. Any preservation failure
in either arm blocks acceptance; new missed justified findings, unnecessary
edits or reporting failures must be zero in each exercised register, with no
critical/protected-case regression. A missing call is incomplete, not a pass.
The small development set cannot certify general per-register accuracy.

The trace observes **assembled context**, not a model's reads or internal
review. It reports prompt bytes and words; these are not token counts. Usage
is explicitly unavailable and model latency is null until an executor supplies
actual telemetry. For the eventual comparison, include index/routing/tool/retry
overhead in total input/output usage and record model latency separately. Keep
estimates labeled and retain the full-loading default on incomplete or
inconclusive evidence. Directory/plugin and production portable parity remain
separate required checks before adopting any loading change.

Run `node scripts/reference-loading.test.js` or `npm test` for lossless full
assembly, complete indexing, focused exceptions, ambiguity fallback and
mutation controls for missing, reordered, duplicate, forged and changed inputs.
