# Blueprint evaluation results

The suite covers all 40 acceptance-rule identifiers with 59 assertions across 13 cases.
The first iteration ran every case once with the skill and once without it (26 executions).
A principle-level revision reran cases 1, 3, 4, 7 and 8 with the skill. Cases 3/4 also
reran without it after missing source facts were clarified in their prompts. The other
three comparison baselines reuse their original outputs. Initial outputs and grades remain
preserved. The table selects the latest available run per case; it is not a fresh execution
of the entire suite against the final skill.

The initial macro-average assertion pass rate was 83.3% with the skill.
The latest available macro-average is 98.2% with the skill and 39.1%
without it. Counting individual assertions instead gives 56/59 with the skill
and 19/59 without it. Cases have different assertion counts.

| Case | Initial with skill | Latest with skill | Latest comparison baseline | Latest source |
| --- | ---: | ---: | ---: | --- |
| 1. auto-subtitle-how-built | 7/10 | 10/10 | 0/10 | iteration-2 |
| 2. auto-subtitle-srt-only | 2/2 | 2/2 | 0/2 | iteration-1 |
| 3. capture-context-propose | 5/13 | 10/13 | 0/13 | iteration-2 |
| 4. capture-context-catch-on-request | 3/4 | 4/4 | 0/4 | iteration-2 |
| 5. capture-context-modeling | 4/4 | 4/4 | 4/4 | iteration-1 |
| 6. capture-context-how-would | 3/3 | 3/3 | 1/3 | iteration-1 |
| 7. capture-context-dictated-rename | 2/3 | 3/3 | 2/3 | iteration-2 |
| 8. capture-context-principle | 1/3 | 3/3 | 1/3 | iteration-2 |
| 9. openspec-rename-context | 3/3 | 3/3 | 3/3 | iteration-1 |
| 10. openspec-contradiction | 2/2 | 2/2 | 0/2 | iteration-1 |
| 11. auto-subtitle-explain | 5/5 | 5/5 | 5/5 | iteration-1 |
| 12. capture-context-time | 4/4 | 4/4 | 3/4 | iteration-1 |
| 13. endpoint-single-use-case | 3/3 | 3/3 | 0/3 | iteration-1 |

## Remaining failures

- Case 3: DP8: BuildTimeline receives images, narration and activity as arguments and an upstream LoadActivity step is visible; use cases follow a single branch with ordered awaits, one Promise.all for independent application work where needed, no conditionals, domain algorithm bodies, retry/catch/limits, or use-case dependencies.
  Evidence: SynthesizeChapterSummaryUseCase lines 20-22 has if (!chapterSummary.verify(frameSelection)) followed by template replacement. SummarizeSessionUseCase lines 11-13 repeats the pattern. These violate single-branch application orchestration, despite correct inputs and upstream acquisition.
- Case 3: DP10: Files use kebab-case and dot roles, domain nouns omit role suffixes, role types have UseCase/Repository/Saga/DTO suffixes, and variables are camelCase of their types preserving DTO.
  Evidence: chapters/domain/processed-chapter.ts line 9 declares readonly summary: ChapterSummary as a constructor-property parameter; prescribed type-based camelCase is chapterSummary. Other file/type conventions pass.
- Case 3: DP11/RE2/RE4/DS10: The package has no README, unestablished policies, usage accounting, numeric retry settings, approval wait, choice, events, template fallback or catch; synthesis retry is only an established one-line saga note.
  Evidence: Two application use cases retain conditional template fallback. PublishSessionUseCase line 15 separately awaits approvePublication, exposed by PublicationRepository line 7. Those retained application alternatives/approval violate package-omission clauses. Numeric settings, accounting, revision, README, catch, choice and events are absent.

## Interpretation and limits

- This is one execution per case/configuration, not a repeated-run reliability estimate.
  Unchanged cases were not rerun with the final skill. No pass-rate target was required.
- Proposal prompts originally omitted the canonical external `Session` type and derived
  `Timeline.silences` consumed by planning. Cases 3/4 now state both facts explicitly;
  their expectations and initial grades were not changed to hide failures.
- Independent executors did not read expectations or planning artifacts. Graders checked
  output files and transcripts against the assertions and documented fixture deviations.
- Case 4's four assertions check the requested catch rather than the whole package. Its grader
  also found unaliased `SessionSummary`/`Publication` sequence messages, incomplete broader
  verification criteria and provider-feeding comments. These unasserted gaps are recorded
  separately; passing the four catch assertions does not establish whole-package compliance.
- Exact model identifier and token counts are unavailable. All agents inherited the session
  model. Mislabelled character-count token estimates were removed from the upstream report.
- Recorded durations are actual wall clock; timing setup differs between executors, and
  resumed proposal executions include the interruption interval. Timing is descriptive.
- The user explicitly delegated assessment and implementation for this unattended session.
  The static viewers were delivered for later inspection; no human review or acceptance
  is claimed.

## Artifacts and validation

- Versioned suite: [evals.json](../../../skills/blueprint/evals/evals.json).
- Local, intentionally ignored evidence: `skills/blueprint-workspace/iteration-{1,2}/`
  contains outputs, transcripts, timings, assertion grades, benchmark JSON/Markdown and
  static `review.html` viewers. Both iterations have a skill snapshot.
- `NOTATION.md` rendered with Mermaid 11.15.0 in Chromium: four coloured state nodes
  and five distinct translucent, bordered actor lanes were verified and visually inspected.
- Final checks passed: 900-word English skill with nine principles; YAML/JSON parsing;
  all 40 rule identifiers covered; suite input paths resolve; immutable fixtures compared byte-for-byte;
  pinned third-party source and license; skills CLI discovery; workspace ignore rule;
  strict OpenSpec validation and authored-file Git whitespace checks.
- The pinned `auto_subtitle/cli.py` snapshot preserves four upstream trailing-whitespace lines.
  The full staged whitespace check reports them; all authored changes pass when this immutable
  third-party fixture is excluded. The snapshot was kept byte-identical as required.
- `.temp/` was deleted only after preserving and verifying its two reference packages in
  the versioned fixtures, as explicitly requested.
- Final `SKILL.md` SHA-256: `2aa2675366cf872e16e4198c5b11d359b6b9c1f8266e8e304ee6b653e39f00cf`.
