# Implementation evidence

## Session scope

The reviewer authorized unattended implementation, removal of `.temp/`, and a merge to `main`.
That instruction replaces the interactive reviewer gate in tasks 4.2–4.3: generate the viewer,
review failures autonomously, apply justified principle-level fixes, and deliver results for later
inspection. No human review or acceptance is claimed. Removing `.temp/` is an explicitly requested
extension to the final allowed-path check in task 5.2.

## Sources

- `writing-for-agents` was read from `mattpocock/skills`, including `SKILL-MECHANICS.md`.
  The repository changelog documents that `writing-great-skills` was renamed to it in version 1.1;
  these are the same guide, rather than two independent missing skills.
- `humanlayer/skills`'s `show-me` supplied the user-invoked, representational style reference.
- `anthropics/skills`'s `skill-creator`, `agents/grader.md`, `agents/analyzer.md`,
  `references/schemas.md`, `aggregate_benchmark.py` and `generate_review.py` provide the evaluation
  method. Independent executor agents read neither expectations nor planning artifacts.
- The capture-context and OpenSpec fixtures were copied byte-for-byte and checked with `diff -r`.
- `auto-subtitle` was cloned and checked out at
  `124ccb1ac17d5b7a27dd81b3d8f8fed6ef1a5408`; every vendored file was compared byte-for-byte
  with that checkout. Its MIT license is included.

## Rule derivation

This table maps every acceptance Feature rule to its producing skill sentence or notation.
The rule identifiers correspond to each Feature's original ordinal; the suite cites the same ids.

| Rule | Producing sentence or notation |
| --- | --- |
| DP1 | Package layout; “Host an external entity in its first reading context…” |
| DP2 | “Application state changes are commands… Pure results are queries…” |
| DP3 | “Slice multi-step flows across contexts, each with at least two use cases.” |
| DP4 | “Merge everything external to the language into one repository per context…” and direct constructor injection in Layers. |
| DP5 | “Describe application needs rather than feeding shapes.” |
| DP6 | Locality's transport/timing/result placement and bounded Opportunity comments. |
| DP7 | “Synchronous domain nouns compute, construct objects through domain factories, and verify model-independent criteria…” |
| DP8 | Layers' single-branch orchestration, explicit transformations; visibility principle; The cut's saga maps; diagram-free single-use-case entry. |
| DP9 | “Cross contexts only through direct domain-type aliases… carry derived values and nested data as attributes…” |
| DP10 | Package naming paragraph specifies files, types and variables. |
| DP11 | “Express established policies abstractly, keeping configuration values outside every artifact and comment.” and English artifacts without README. |
| DS1 | NOTATION's legend and single stateDiagram-v2 per saga file. |
| DS2 | “One successful trunk visits each step once. Variants get separate sagas…” |
| DS3 | Vocabulary table's parallel fork/join and plural map containers, shown in NOTATION. |
| DS4 | As-built's requested failure paths; Locality's requested catch, terminal failure, established retries and node notes. |
| DS5 | NOTATION's command/query class definitions, neutral containers and sub-sagas; Locality's node notes. |
| DS6 | NOTATION's relative HTML links and suffix-free step labels. |
| DS7 | Vocabulary table's neutral linked node and separate sub-saga file. |
| DS8 | “Host… a saga with its outcome.” |
| DS9 | “A saga flow gets one root sequence: trigger, suffix-free saga, boxed context lanes…”; NOTATION unfolds sub-sagas; single-use-case entry gets neither diagram. |
| DS10 | Closed six-row vocabulary table and exclusion of choices, waits, events and transition data. |
| RE1 | “Draw requested result-producing work, preserving order and concurrency…” |
| RE2 | “Extend failure paths only when asked.” |
| RE3 | As-built's “preserving order and concurrency”, normalization and accepted-improvement gate in Represent. |
| RE4 | As-built's requested result-changing work; command/query paragraph discards logs. |
| DL1 | “Split at unacceptable repetition; otherwise keep the unit whole…”; map repetition over use cases in a saga. |
| DL2 | “Serialized step outputs are durable saga progress even when a step saves nothing.” |
| DL3 | Locality's transport retry, step retry and requested diversion placement. |
| DL4 | Locality's tool-only feeding constraints versus timing; The cut's saga maps. |
| DL5 | “Modeling questions get a worked example.” Ask leaves all files untouched. |
| RV1 | Correct replaces in place and applies the principle to files, types, imports, links and diagrams. |
| RV2 | “Interpret dictated CTO/Share as DTO/shared.” |
| RV3 | Correct applies the principle everywhere and keeps uncertain analogous cases pending. |
| RV4 | Decide asks one question, recommended option and reason first, preserves pending state, names contradictory rules before editing. |
| EX1 | Ask overview connects parts, inputs, branches and secondary events. |
| EX2 | Ask worked example follows the successful path with representative magnitudes. |
| EX3 | Ask zoom orders sub-processes and identifies concurrency. |
| ET1 | Ask timing names each measured time and composes a critical-path total. |
| ET2 | Ask timing estimates each part as a percentage of its enclosing time. |
| ET3 | Ask timing uses generic pending-item counts and counts overlaps once; As-built distinguishes generic process from illustrative run. |

## Checks

- Initial SKILL.md: 888 words, English, nine principles; one disclosed runtime reference.
- No Feature scenario text or illustrative Feature table values were copied into the skill.
- The 13-eval JSON parses; every input path exists under the skill root; all 40 rule ids are covered.
- Answer-only evals explicitly check that every fixture file remains unchanged.
- Codex YAML parses and matches the existing feedback skill's interface/policy shape.
- `skills add --help` confirms package, `--skill`, and multi-agent `--agent` arguments used in README.
- `git check-ignore skills/blueprint-workspace/x` confirms the evaluation workspace stays ignored.

## Autonomous revision

The final skill has 900 words. Initial grading exposed configuration values in comments/notes,
application-state classification, transcription errors in dictated targets, and deletion of
uncertain analogues. The revision strengthens those principles, domain construction through
factory operations, and DTO requests/returns without adding a runtime reference.

The suite review also found that proposal evals asserted a canonical `Session` type and
derived timeline silences absent from their prompt. Those source facts were made explicit in
evals 3/4 before rerunning both configurations; expectations and initial grades were preserved.
Other baseline comparisons in the second iteration reuse their recorded first-iteration outputs
and are labelled as reused. Token usage is unavailable; misleading aggregator token estimates
were removed. The aggregator’s fixed default of three repetitions was corrected to the one
execution actually performed per eval/configuration.

## Final verification

The final YAML and JSON parse, all 13 input sets resolve, and all 40 acceptance-rule identifiers
are covered. The 94 vendored fixture files were checked against their original sources before
the explicitly requested `.temp/` deletion. The two Mermaid templates rendered in Chromium with
Mermaid 11.15.0; their command/query nodes and five distinct boxed actor lanes were inspected.
Strict OpenSpec validation, CLI discovery, workspace ignore and authored-file Git whitespace
checks pass. The unchanged third-party `auto_subtitle/cli.py` fixture preserves four upstream
trailing-whitespace lines (28, 37, 47 and 97); the full staged whitespace check reports those
inherited lines. Removing them would violate the required byte-identical vendoring.

The recorded case results, autonomous revisions and remaining model-performance limitations
are summarized in [evaluation-results.md](evaluation-results.md). Raw outputs, grades, timings,
benchmarks and static viewers remain in the intentionally ignored local evaluation workspace.
