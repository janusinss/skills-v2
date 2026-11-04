# Independent loading recheck

The four original findings are addressed in the exercised paths. Fresh artifacts and complete command/stdout/stderr/exit-code evidence are under `/tmp/loading205-independent-recheck-vGl9jN`. The original `/tmp/loading205-independent-review.md` was retained unchanged; its SHA-256 is `a883c5071020f79ccea792b45ed8e492a49dd5f9b951e174f3554596fb9bfaab`. No repository file was edited and no model provider was called.

From `/workspace/scratch/c4c54a2bbd99/avoid-ai-writing-loading`, the recheck ran:

```bash
node scripts/reference-loading.js prepare 174336f7c784d028af81d9886f835204e7a90d71 /tmp/loading205-independent-recheck-vGl9jN/pack
node scripts/reference-loading.js verify /tmp/loading205-independent-recheck-vGl9jN/pack
node scripts/reference-loading.js assemble /tmp/loading205-independent-recheck-vGl9jN/pack /tmp/loading205-independent-recheck-vGl9jN/full.json /tmp/loading205-independent-recheck-vGl9jN/full
node scripts/reference-loading.js assemble /tmp/loading205-independent-recheck-vGl9jN/pack /tmp/loading205-independent-recheck-vGl9jN/focused.json /tmp/loading205-independent-recheck-vGl9jN/focused
node scripts/reference-loading.js assemble /tmp/loading205-independent-recheck-vGl9jN/pack /tmp/loading205-independent-recheck-vGl9jN/unspecified.json /tmp/loading205-independent-recheck-vGl9jN/unspecified
node scripts/reference-loading.test.js
```

`python /tmp/loading205-independent-recheck-vGl9jN/recheck.py` executed these and the negative probes; its exact expanded commands are saved in `commands.json`. The script is preserved for inspection; it expects a fresh output directory when rerun.

Observed results:

- Full, focused (`false-agency`, `vague-attributions`), and unspecified-focus assemblies exit 0. Full/fallback prompts are byte-identical, while fallback is correctly labeled `fallback-full`. Full prompt SHA-256: `c17bee3780dae70ebf1f879eeba901058baea2aa1245183cbeebb3ac1e7c38d6`; focused: `5f03e5569f40c5f2d8d126f50101c84e4138136a17e8d39935f6ad6fbd6f3631`.
- Each of `catalog-intro`, `context-profiles`, `voice-profiles`, and `return-to-the-output-contract` fails both alone and alongside `false-agency`: eight exit-1 results containing `focus must name rule families; ... is always included`, with no prompt/trace files. Unknown-ID and missing-config probes also fail.
- Manifest and traces record generator SHA-256 `51cd43b41c503e346ca645d26bd9fc5468c11860d64a90973940c13c6fbf9c11`, independently recomputed from the saved executing CLI. A copied CLI with an appended comment fails verification: exit 1, `generator changed; prepare a new pack`. Config and prompt hashes and prompt byte counts were independently recomputed successfully.
- All generated arms contain the explicit instruction limiting later findings, clean assessments, and stop reasons to declared coverage, while applying fidelity/protection globally. This resolves the earlier textual scope tension; response behavior remains untested.
- The protocol now contains 15 cases, including `agency-personification`, `agency-hidden-choice`, `agency-supplied-actor`, and `agency-emergent-change`. Their criteria distinguish hidden accountable choices from supplied actors, personification, and emergent change. Dedicated tests exit 0 and report lossless full assembly, fallback, ten corruption controls, and fifteen development cases.

One minor documentation issue remains: “canonical” configuration hashing is actually insertion-order-preserving `JSON.stringify(config, null, 2) + '\n'`. Reordering object keys in `reordered.json` produces the same focused prompt but a different config hash: `8b8ac112855b973f5e7d122535882a95265ddcbd11c5595dc0583bb45d92efc3` versus `28313d15b843c6df5e01eda09a215ffb8aa28e31e1ec719a63c3258d9f4b1398`. Call it normalized parsed-JSON serialization, or sort keys if semantically canonical hashes are intended. This does not damage assembly integrity; retained exact configurations remain reproducible.

No further concrete assembly defect was observed. `results.json` contains summarized hashes/results and the inspected tool/protocol snapshots are retained. Policy acceptance, actual paired execution, independent source-fidelity adjudication, usage/latency telemetry, and production artifact parity remain outside this offline recheck. No editing-quality or token-saving result is established.
