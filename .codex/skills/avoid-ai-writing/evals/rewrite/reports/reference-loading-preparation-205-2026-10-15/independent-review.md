# Independent offline reference-loading review

Prepared artifacts are usable as **context inputs** for a later paired editing comparison. They are not completed editing tasks or measured model results. All generated material is under `/tmp/loading205-independent-OrSYBW`; the repository was not modified. No model provider was called.

## Commands and evidence

Working directory: `/workspace/scratch/c4c54a2bbd99/avoid-ai-writing-loading`. Source policy commit: `174336f7c784d028af81d9886f835204e7a90d71` (also the observed HEAD). Read the named preparation instructions, CLI, its direct tests/flattening implementation, linked development cases, and generated artifacts only; no other agents' work or prior reports was inspected.

```bash
node scripts/reference-loading.js prepare 174336f7c784d028af81d9886f835204e7a90d71 /tmp/loading205-independent-OrSYBW/pack
node scripts/reference-loading.js verify /tmp/loading205-independent-OrSYBW/pack
node scripts/reference-loading.js assemble /tmp/loading205-independent-OrSYBW/pack /tmp/loading205-independent-OrSYBW/full.json /tmp/loading205-independent-OrSYBW/full
node scripts/reference-loading.js assemble /tmp/loading205-independent-OrSYBW/pack /tmp/loading205-independent-OrSYBW/focused.json /tmp/loading205-independent-OrSYBW/focused
node scripts/reference-loading.js assemble /tmp/loading205-independent-OrSYBW/pack /tmp/loading205-independent-OrSYBW/unspecified.json /tmp/loading205-independent-OrSYBW/unspecified
node scripts/reference-loading.test.js
node /tmp/loading205-independent-OrSYBW/check-artifacts.cjs
```

Configurations: `full.json` is `{"mode":"full"}`; `focused.json` is `{"mode":"focused","modules":["false-agency","vague-attributions"]}`; `unspecified.json` is `{"mode":"focused"}`. “Attribution” was operationalized as the catalog's `vague-attributions` family; neighboring families such as `vague-third-party-validation` are outside that declared focus.

Each successful assembly produced matching `.prompt.md`, `.trace.json`, and captured `.stdout.json` files. `verify.stdout.json` reports success and 81 modules. The focused trace includes the two selected rule modules plus `catalog-intro`, `context-profiles`, `voice-profiles`, and `return-to-the-output-contract`.

| Assembly | Coverage / loading mode | UTF-8 bytes | Whitespace words | Prompt SHA-256 |
|---|---|---:|---:|---|
| full | exhaustive / full | 148840 | 22411 | `6623f0759c385914047dedd91b30a542aa7856b6c0ebd74c74587e6919288d2e` |
| focused | declared-focus-only / focused | 51869 | 7542 | `a3c96145dd1dce9c060e10cd3c3620e4ed43e171f3cb33c7f2c0a289eee76372` |
| unspecified | exhaustive / fallback-full | 148840 | 22411 | `6623f0759c385914047dedd91b30a542aa7856b6c0ebd74c74587e6919288d2e` |

The standalone `check-artifacts.cjs` verifies all prompt hashes, byte/word counts, selected module contents, removal of include markers, exact concatenation of the 81 modules into the pinned reference, full-arm parity with canonical flattening after removing the inserted index/coverage block, and byte-identical full/fallback prompts. Results are in `check-artifacts.stdout.txt` and `integrity-checks.json`. The dedicated test exited 0: lossless full assembly, declared focus, fallback, nine corruption controls, and twelve development cases passed (`tests.stdout.txt`). Bytes and whitespace words are not token measurements.

## Failure paths

```bash
node scripts/reference-loading.js assemble /tmp/loading205-independent-OrSYBW/pack /tmp/loading205-independent-OrSYBW/malformed.json /tmp/loading205-independent-OrSYBW/malformed
node scripts/reference-loading.js assemble /tmp/loading205-independent-OrSYBW/pack /tmp/loading205-independent-OrSYBW/missing-config.json /tmp/loading205-independent-OrSYBW/missing
node scripts/reference-loading.js assemble /tmp/loading205-independent-OrSYBW/missing-module-pack /tmp/loading205-independent-OrSYBW/focused.json /tmp/loading205-independent-OrSYBW/missing-module
```

`malformed.json` requests `false-agency` and `unknown-attribution`: exit 1, `unknown requested module: unknown-attribution`. The absent config fails with exit 1 and ENOENT. A copied pack with the **unselected** `modules/formatting.md` removed also fails with exit 1 and ENOENT. None produces a prompt or trace. Exact commands, stderr, exit codes, and output-existence checks are retained in `negative-paths.json` and `missing-module-negative.json`. This supports the documentation's fail-closed missing-module claim.

## Findings requiring attention

1. **Concrete validation gap: a required-only selection suppresses ambiguity fallback without selecting a rule family.**
   `required-only.json` contains `{"mode":"focused","modules":["context-profiles"]}`. Running `node scripts/reference-loading.js assemble /tmp/loading205-independent-OrSYBW/pack /tmp/loading205-independent-OrSYBW/required-only.json /tmp/loading205-independent-OrSYBW/required-only` exits 0, reports `loading_mode: focused`, `fallback_reason: null`, and includes zero of the 77 rule modules. CLI lines 103–110 validate membership in all modules and test only requested-array length. The index marks this module “always included”; naming it supplies no substantive focus. Reject required-only requests or determine ambiguity from selected **rule** IDs, and add coverage for this path. Evidence: `required-only.trace.json` and `.prompt.md`.

2. **Reproducibility gap: policy commit does not freeze the assembler or evaluation protocol.**
   `snapshot()` pins only `SKILL.md` and `references/patterns.md`; traces identify those hashes and the resulting prompt, but not the executing CLI, partition/index algorithm, config file, or development protocol. The working CLI/docs/tests/protocol were untracked at the observed policy HEAD. This is not false policy provenance, but retaining that commit alone cannot reproduce this workflow. The exact read tool/docs/protocol files were copied into `tool-snapshot/`; their SHA-256 values are recorded in `integrity-checks.json`. CLI SHA-256: `49680cc10a59af3ab00e28ce48d6491e850a64d28732e9f98d13363ffc510dd6`. Freeze this tool revision and protocol/config hashes before execution, in addition to the documented prompt/input/model freeze.

3. **False-agency development coverage needs alignment with the pinned policy.**
   `reference-loading-205.json`'s sole false-agency case (`rare-agency`, line 19) uses “The log wants us to restart the worker” and the criterion “Remove attributed intent only within scope.” The actual module gates findings on an obscured accountable person/team making a consequential choice, and explicitly preserves conventional personification, literal system behavior, and collective shorthand. The case does not clearly establish that gate and cannot substitute for positive/negative coverage of it. Add a hidden-decision-maker case, a source-provided actor case, and conventional-personification/emergent-change preservation cases; clarify the current criterion before adjudicating responses. This is a fixture-policy ambiguity, not an observed model failure.

4. **Focused prompt reporting scope remains a review risk.**
   The inserted text correctly prohibits exhaustive claims (`focused.prompt.md:32,116`), but retained instructions also say “identify every justified AI-ism present” (lines 217,225), “every rule exception still apply” (line 32), and “say it is clean” (line 185). Only two rule bodies are loaded. The later execution/adjudication should explicitly distinguish “no findings in declared families” from an exhaustive clean audit and test that reporting behavior. The index disclaimer provides a defensible scoped reading, so this is an instruction-tension observation, not proven misleading output.

## Unresolved limits

The contexts preserve the full editing contract, protected-content rules, profiles, and output contract; the full arm retains every reference byte in its established flattening order. The focused arm preserves complete selected rule text but deliberately omits other rule bodies; its full index is discovery metadata, not their exceptions. Existing tests primarily establish assembly integrity and fixture shape, not editorial decision correctness.

The `.prompt.md` files contain policy context, not a source draft, request, model configuration, or execution wrapper. Before comparison, complete the documented #206 policy acceptance; freeze the source task/input hash, tool/protocol revision, exact contexts, model/settings/repetitions, and independent adjudication method. Keep expected decisions out of editor prompts. A no-tools environment must honor the retained manual/unavailable-check reporting instructions for the marks normalizer and validators. Production directory/plugin/portable parity was not checked. Traces correctly report usage as unavailable and latency as null. No editing-quality, routing-accuracy, latency, token-saving, or general per-register-accuracy conclusion follows from this offline preparation.
