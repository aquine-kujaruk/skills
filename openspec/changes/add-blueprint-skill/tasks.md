# Tasks

## 1. Scaffold and fixtures

- [ ] 1.1 Create `skills/blueprint/agents/openai.yaml` (`display_name: "Blueprint"`, a one-line `short_description`, `default_prompt: "$blueprint"`, `allow_implicit_invocation: false`). Verify the YAML parses and matches the shape of `plugins/pr-review/skills/feedback/agents/openai.yaml`.
- [ ] 1.2 Copy `.temp/.review/` to `skills/blueprint/evals/fixtures/capture-context/` and `.temp/.review-openspec/` to `skills/blueprint/evals/fixtures/openspec/` unchanged. Verify that `diff -r` against each source prints nothing.
- [ ] 1.3 Vendor `m1guelpf/auto-subtitle` at `124ccb1ac17d5b7a27dd81b3d8f8fed6ef1a5408` into `skills/blueprint/evals/fixtures/auto-subtitle/` (`auto_subtitle/*.py`, `requirements.txt`, `setup.py`, `LICENSE`). Verify each file is byte-identical to a fresh clone at that SHA.
- [ ] 1.4 Add `skills/*-workspace/` to `.gitignore`. Verify that `git check-ignore skills/blueprint-workspace/x` matches.

## 2. Skill

- [ ] 2.1 Load `writing-for-agents` and `writing-great-skills`, then write `skills/blueprint/SKILL.md` with the shape in design D3: frontmatter with `disable-model-invocation: true` and a one-line description, the opening, Turns, Principles P1–P9, Package (layout tree and naming) and Diagrams (vocabulary table with a pointer to `NOTATION.md`). Verify that `wc -w` is at most 900, that the text is English only, and that no Feature text is copied: no `Scenario`, no example-table values such as `267` or `28 min`, no Feature sentences.
- [ ] 2.2 Walk the principle-to-rules table in design D3 against all seven Features. Every rule must follow from a principle or from the Turns section. Where one does not, sharpen that principle's wording rather than add a per-case sentence. Verify by listing each rule key (DP1–11, DS1–10, RE1–4, DL1–5, RV1–4, EX1–3, ET1–3) next to the `SKILL.md` sentence that produces it.
- [ ] 2.3 Write `skills/blueprint/NOTATION.md` with the saga template and the sequence template from design D4, each about 40 lines or fewer, with the exact colours, the HTML links in `state` labels, `(parallel)` with fork and join, `(map, concurrency: N)`, a sub-saga node, `catch <Error>`, a `note`, and `themeCSS` lane boxes with `par`, `loop`, `rect` plus `Note`, and `break`. Verify both templates render without parse errors in Mermaid (mermaid-cli, or a browser preview with mermaid from a CDN) and show the coloured nodes and boxed lanes.
- [ ] 2.4 Prune `SKILL.md` and `NOTATION.md` together: delete no-ops, rewrite prohibitions as the positive target (keeping a prohibition only as a guardrail paired with its positive), and give each meaning one home. Verify that the hex colours appear only in `NOTATION.md` and that the word count is still at most 900.

## 3. Evals

- [ ] 3.1 Write `skills/blueprint/evals/evals.json` (`skill_name: "blueprint"`) with the 13 evals of design D8. Each has its prompt, its `files` relative to the skill root, and an `expected_output` that names the Feature rule keys it covers and lists the known deviations of the fixture it uses. Verify the file loads as JSON and that every eval has `id`, `prompt`, `expected_output`, `files` and `expectations`.
- [ ] 3.2 Write objective `expectations` for each eval from the Feature scenarios, not from fixture diffs. Every answer-only eval (5, 6, 10, 11, 12) includes "every fixture file is unchanged", and eval 1 includes the fidelity checks in the evals spec. Verify with a one-line script that every rule key from 2.2 appears in at least one `expected_output`.

## 4. First eval iteration

- [ ] 4.1 Run iteration 1 as skill-creator does: for each eval, one run with the skill and one baseline without it, in the same turn, with outputs in `skills/blueprint-workspace/iteration-1/<eval-name>/{with_skill,without_skill}/` and timings captured. Verify that every eval directory holds both outputs and a `timing.json`.
- [ ] 4.2 Grade and aggregate with skill-creator's grader and `aggregate_benchmark`, then open the viewer for the reviewer. Verify that `benchmark.json` exists and the reviewer has seen the results.
- [ ] 4.3 Apply the fixes the reviewer agrees to, at the level of a principle's wording first, and rerun only the affected evals. Verify that the rerun expectations pass, or that the reviewer accepts each remaining failure as a known gap, and that `SKILL.md` still has at most 900 words.

## 5. Publish

- [ ] 5.1 Check the `skills` CLI install syntax with its `--help`. Then add a "Standalone skills" section to `README.md` with a `blueprint` row and its install command. Verify that the command matches the help output and that the README structure block lists `skills/blueprint/`.
- [ ] 5.2 Final check: `openspec validate add-blueprint-skill --strict` passes, and `git status` shows only `skills/blueprint/**`, `README.md`, `.gitignore` and the change folder.
