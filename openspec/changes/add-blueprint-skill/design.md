# Design

## Context

- The source material is local and git-ignored, in `.temp/`:
  - `.review-skill/features/*.feature.md` holds seven `@ai` Features, the acceptance contract.
  - `.review-skill/dissonances.md` lists the open and resolved tensions.
  - `.review-skill/handoff.md` gives the reasons behind the rules.
  - `.review/` and `.review-openspec/` are the two reference packages.
- The repository distributes plugins (`plugins/<name>/`) and announces `skills/<name>/` for standalone skills; none exists yet. The reviewer installs standalone skills with the `skills` CLI (`~/.agents/skills`, `.skill-lock.json`).
- In this repository, skill evals live beside the skill (`plugins/pr-review/skills/*/evals/evals.json`, skill-creator schema).
- Style references: `writing-for-agents` (leading words, positive prompting, no-ops, disclosure by branch), `humanlayer/skills` and `mattpocock/skills` (300–900-word `SKILL.md`, glossary-like principles, sibling uppercase reference files such as `ADR-FORMAT.md`), and `show-me`, the analogue, which is user-invoked and only representational.
- `openspec/specs/` is empty; this change introduces the first capabilities.

## Goals / Non-Goals

**Goals:**
- A `SKILL.md` that gives the model a frame to think with, not a rulebook. About 9 principles derive every Feature rule, and a rule that follows from a principle is not written separately.
- A single disclosed reference, `NOTATION.md`, holding only what the model gets wrong without a template.
- An eval suite where every Feature rule has an objective expectation, runnable from a fresh clone.

**Non-Goals:**
- Fixing the fixtures. They are kept verbatim as references, with their deviations recorded in the evals.
- An OpenSpec integration, event-driven rules or a choice primitive (dissonances #14, #15, #3).
- Optimizing the skill description for triggering. The skill is user-invoked.
- Iterating the skill until it reaches a pass-rate target. This change delivers the skill, the suite and one recorded iteration.

## Decisions

### D1. Name and leading word: `blueprint`

The skill draws in a fixed notation and does not judge. `architecture-review` collided with `code-review` and `pr-review`. A blueprint is a drawing in a standard, closed notation, used both for as-built drawings (existing code) and for proposals (iterations). *As-built* is the second leading word: it names fidelity to the code without a sentence of explanation.

### D2. Invocation: user-invoked, standalone skill

`disable-model-invocation: true`, as in `show-me`, plus `agents/openai.yaml` with `allow_implicit_invocation: false` for Codex parity. Rejected: model invocation, because the skill writes files and would spend context on every turn for a tool the reviewer reaches for deliberately. The skill lives at `skills/blueprint/`, not inside a plugin. The README already announces that layout, and the reviewer's install path is the `skills` CLI.

### D3. Shape of `SKILL.md`

The file targets ≤ 900 words, all in English, with these sections:

```text
frontmatter (name, one-line human-facing description, disable-model-invocation)
opening: what a blueprint is — one flow, happy path, MVP-thin, as-built, closed universe; writes code for no system
## Turns          represent → write package · correct → change everywhere · ask → reply only · decide → one question
## Principles     the 9 below, each a short paragraph, positive phrasing
## Package        layout tree + naming (one block each)
## Diagrams       vocabulary table (6 primitives, saga form / sequence form) + pointer to NOTATION.md
```

The principles, and the Feature rules each one generates, show that no rule needs its own patch:

| # | Principle (leading phrase) | Rules it generates |
| --- | --- | --- |
| P1 | **As-built**: faithful steps, order and concurrency; normalize into the universe and report it; cut what does not change the result; only the requested flow, happy path, MVP | represent-existing (all), invent-nothing, generic process |
| P2 | **Layers**: domain is synchronous and repository-blind (nouns, minimal attributes, verification methods); a use case orchestrates one context along one branch; a saga coordinates use cases | domain rules, single-branch use case, no use case calls another, saga concepts stay out of use cases |
| P3 | **The cut**: "if it dies here, do I mind repeating what came before?"; the serialized saga state is the durable progress | delimit (split, keep, composite as saga, saves-nothing step), sub-saga extraction |
| P4 | **Locality**: each decision goes where its information lives (the transport/step/alternative and tool/timing/result splits) | optimizations, provider limits, retries, catch, Opportunity comments |
| P5 | **Behind the repository**: everything outside the language goes behind one repository per context, which describes need, not feeding; one header line may name the mechanisms | repository merge, no grids or fragments, FFmpeg behind the repository even when synchronous |
| P6 | **Load what you operate on; receive what you combine** | visibility (BuildTimeline), constructor injection |
| P7 | **Command or query by essence** | folders, colours, an expensive query is still a query, a log does not make a command |
| P8 | **Contexts by vocabulary, DTOs as aliases**: a saga lives with its outcome; an external entity lives with its first reader | context slicing, shared DTOs, saga host, `SessionDTO` |
| P9 | **Invent nothing; stay coherent**: no unestablished policy, no config values, no README; links, imports and types resolve | invent-nothing, coherence |

The conversation contract (the "Turns" section) produces the revise, explain, estimate and delimit behaviours. Dictated terms get one clause there, not a section.

Alternatives rejected: transcribing the Features as rules, which is accumulation and duplicates the contract, and a checklist per artifact type, which is sprawl and repeats the principles at each site.

### D4. `NOTATION.md` is the only reference

It holds two minimal Mermaid templates, each under about 40 lines.

- **Saga**: the legend line, linked `state` declarations, a `(parallel)` container with fork and join, a `(map, concurrency: N)` container holding a sub-saga node, one `catch <Error>` transition marked as only-when-asked, one `note`, and the two `classDef` lines with exact colours plus `class` assignment.
- **Sequence**: an `%%{init: {"themeCSS": …}}%%` line with one translucent-fill rule per lane; lanes in the order trigger, saga, contexts; `par`, `loop`, a grey `rect` with a `Note` for the sub-saga, and `break`.

It is disclosed rather than inline because only the represent and correct turns need it. Question turns never draw. Rejected: no reference, because exact hex values, the `themeCSS` selector syntax and HTML links in `state` labels are easy to get wrong; and copying a fixture, which carries its deviations along.

### D5. The package is a temporary exploration

The package is written to `<tmp>/blueprint/<flow>/`, where `<tmp>` is the session's scratchpad when one exists and the OS temporary directory otherwise. An iteration replaces the package in place and the reply summarizes the delta. The agent offers to copy the package into the project only when the reviewer wants it as context for code. Rejected: a project folder by default, git history, and keeping as-built and proposed packages side by side.

### D6. Fidelity: normalize, then report in the reply

When code breaks a rule, the package follows the rule and the reply lists each normalization. This extends what command/query classification already did. Rejected: `// Incoherence:` markers, because they add notation, and drawing the violation, because the universe would no longer be closed.

### D7. Resolved tensions

Each tension was resolved with the reviewer, one at a time:

| Source | Resolution |
| --- | --- |
| #1 catch vs trunk | A requested catch is a labelled diversion; the trunk rule governs the happy path |
| #2 "3 sagas" | Each variant has its own saga; a common segment of ≥ 2 steps is a sub-saga run first; the entry point chooses |
| #4 `Promise.all` | Only for independent work the use case needs; fan-out caused by a tool goes into the repository |
| #5 pending | D6 and D5 |
| #8 suffixes | `Name (parallel)`, `Name (map, concurrency: N)` with the plural of the inner step; variables in camelCase of the type, with the `DTO` suffix kept |
| #9 saga host | The context owning the outcome |
| #10 wide repository | One per context, always; the reply may suggest splitting the context |
| #11 tool names | One header line on the repository |
| #12 times | Reply only; the legend sums the critical path |
| #13 transition data | None in sagas; DTOs go in sequence messages |
| #16 initiative | Drawn if the code has it or the reviewer accepts it; otherwise suggested in the reply |
| #17 / #18 | Aliases mean no mapping step; nested types travel; `shared/` depending on contexts is accepted |
| #19 type-check | Not required; coherence is required |
| #20 exploration | In scope, answer-only |
| Visibility (found in the fixtures) | D3 P6 |
| Use case building domain objects | Construction is a domain operation |
| Cheap recomputation | Stays inside the use case that needs it |
| revise: contradiction (pending) | Accepted: name both rules and ask which governs |
| #14, #15, #22 | Out of scope |

### D8. Eval suite

The suite sits in `skills/blueprint/evals/`. `evals.json` follows the skill-creator schema, and the fixtures are copied verbatim:

| Folder | Source |
| --- | --- |
| `fixtures/capture-context/` | `.temp/.review/` |
| `fixtures/openspec/` | `.temp/.review-openspec/` |
| `fixtures/auto-subtitle/` | `m1guelpf/auto-subtitle@124ccb1` (`auto_subtitle/*.py`, `LICENSE`) |

| id | name | Fixture | Turn | Feature rules covered |
| --- | --- | --- | --- | --- |
| 1 | auto-subtitle-how-built | auto-subtitle | "How is the subtitle generation flow built?" | RE3–4, DP1–4, DP9–11, DS1, DS3, DS5–6, DS9; temporary location; normalizations reported |
| 2 | auto-subtitle-srt-only | auto-subtitle | "How is generating only the .srt files built?" | RE1 (no burning use case), DS2 trunk |
| 3 | capture-context-propose | none (proposal in prompt; fixture is the grader reference) | Proposal text, plus facts: Prem grids, 4-call limit, audio size limit, frames budget, stored timeline revision, synthesis retry with 1000 ms, usage accounting, approval before publishing, a summary that must cite only selected frames | DP1–11, DS1–3, DS5–10, RE2 (absent), RE4 |
| 4 | capture-context-catch-on-request | none (same proposal) | "How does it handle an invalid summary? Highlight that risk; mark ProcessChapter as buffered." | RE2 (shown), DS4, DS5 (risk), DS10 |
| 5 | capture-context-modeling | capture-context | Split, keep, composite, saves-nothing and placement questions | DL1–4; files unchanged |
| 6 | capture-context-how-would | capture-context | "How would a choice between audio-only and audiovisual be modeled?" | DL5, DS2 variants, DS10 excluded; files unchanged |
| 7 | capture-context-dictated-rename | capture-context | Spanish dictation: "renombra el CTO de imagen a FrameCTO en Share; SelectChapterFrames pasa a ChooseChapterFrames" | RV1, RV2, DS6; package stays English |
| 8 | capture-context-principle | capture-context | "ChapterPolicy is invented; remove it" | RV3 (`loadPolicy` and the `policy` parameter removed, cuts moved to a domain noun; `PlanId` left pending), RV4 |
| 9 | openspec-rename-context | openspec | "Rename the changes context to proposals" | RV1 across cross-context links, sequence lane, DTO imports |
| 10 | openspec-contradiction | openspec | "VerifyTask is expensive; move it to commands" | Accepted contradiction rule, RV4; files unchanged |
| 11 | auto-subtitle-explain | auto-subtitle | Overview, then a worked example for 3 videos, then a zoom into subtitle generation | EX1–3; no package written |
| 12 | capture-context-time | capture-context | "Where does the time go?" (a run with 4 of 7 chapters done) | ET1–3; files unchanged |
| 13 | endpoint-single-use-case | none | "An endpoint returns the published summary of a session" | DP8 (entry point, no saga), DS9 (no sequence) |

Rule keys: DP is design-proposal, DS diagram-saga, RE represent-existing-flow, DL delimit-saga-and-use-case, RV revise-design, EX explain-flow and ET estimate-time-distribution, each followed by the rule's ordinal in its Feature file.

Known fixture deviations, recorded in each affected `expected_output` so graders do not reward them:

- `capture-context`: Evidence and Chapters both extract images; `InvalidSummary` is undeclared; `ChapterPolicy`, `loadPolicy` and `PlanId` are possibly invented; `GenerateChapters` maps inside the use case.
- `openspec`: `ArchiveChange` reads `today()`.

### D9. Repository plumbing

- A `README.md` section "Standalone skills" holds a one-row table and an install line for the `skills` CLI. The exact command is verified against the CLI's `--help` during apply.
- `.gitignore` gets `skills/*-workspace/`.
- The marketplace catalogs do not change, because they list plugins only.

## Risks / Trade-offs

- [A short, principle-based `SKILL.md` under-specifies a rule] → The evals expose it. Fix the principle's wording before adding a rule; add a rule only when no principle covers it.
- [Mermaid previewers differ: GitHub may sanitize `<a href>` in state labels or ignore `themeCSS`] → The target is the reviewer's local Markdown preview. `NOTATION.md` uses only syntax both fixtures already render.
- [Graders reward fixture deviations] → Deviations are listed in `expected_output`, and expectations come from the Features, not from fixture diffs.
- [The auto-subtitle case trips the "≥ 2 use cases per context" rule because the flow is small] → The expectation checks that the slicing follows vocabulary and that every context holds ≥ 2 use cases; a reasoned exception the reply explains is graded as a pass.
- [Publishing the capture-context design and a third-party snapshot] → The reviewer approved; the MIT `LICENSE` ships with the snapshot.
- [Eval cost: 13 cases × 2 runs] → Accepted for one recorded iteration; later iterations can rerun only failing cases.

## Migration Plan

Additive only. Rollback deletes `skills/blueprint/` and reverts the README and `.gitignore` lines.

## Open Questions

- Handoff ideas not adopted: a dashed border for unchanged steps, which an in-place replacement makes unnecessary, and drawing a risk separately from its retry or catch. They can be revisited after the first eval iteration without changing these specs.
