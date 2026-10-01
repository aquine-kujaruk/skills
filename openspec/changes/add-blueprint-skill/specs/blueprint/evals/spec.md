# Spec Delta

## Purpose

Defines the eval suite that verifies `blueprint` against its acceptance Features on versioned fixtures, so that changes to the skill can be measured rather than argued.

## ADDED Requirements

### Requirement: The suite is versioned with the skill

The suite SHALL live in `skills/blueprint/evals/evals.json` in the skill-creator schema (`skill_name`, and per eval `id`, `prompt`, `expected_output`, `files`, `expectations`). Its inputs SHALL live under `skills/blueprint/evals/fixtures/`:

- `capture-context/`: the `.review` package.
- `openspec/`: the `.review-openspec` package.
- `auto-subtitle/`: the source of `m1guelpf/auto-subtitle` at commit `124ccb1ac17d5b7a27dd81b3d8f8fed6ef1a5408`, with its MIT license.

Fixtures SHALL be copied unchanged; their known deviations from the rules SHALL be recorded in the `expected_output` of the evals that use them, so graders do not treat a deviation as a target.

#### Scenario: Run from a fresh clone
- **WHEN** someone clones the repository and runs the suite
- **THEN** every file an eval references exists under `skills/blueprint/`, with no dependency on `.temp/` or the network

### Requirement: Every Feature rule is asserted

Every Rule of the seven acceptance Features (design proposal, saga diagrams, representing an existing flow, modeling questions, revising a design, explaining a flow, estimating time) SHALL be checked by at least one expectation. Each expectation SHALL be objectively verifiable from the produced files or the reply. Each eval's `expected_output` SHALL name the Feature rules it covers.

#### Scenario: Check coverage
- **WHEN** the Feature rules are matched against the expectations
- **THEN** no rule is left without an expectation

### Requirement: The suite includes a new "how is this flow built?" case

The suite SHALL ask how the subtitle generation flow of the `auto-subtitle` fixture is built. Its expectations SHALL check fidelity to that code:

- Order and concurrency: audio extraction for every video, then subtitle generation for every video, then burning for every video.
- Nothing for the `--srt_only` variant.
- No logs, warnings or configuration values (model name, codec, sample rate, style).
- FFmpeg and Whisper only behind repositories.
- A temporary location outside the repository.

#### Scenario: Keep the code's three loops
- **WHEN** the skill represents the auto-subtitle flow
- **THEN** the saga shows three maps in the code's order, not a per-video pipeline

### Requirement: Answer-only evals prove the package is untouched

Every eval whose turn asks a question about the design, rather than requesting a representation or a correction, SHALL include an expectation that every fixture file is unchanged after the run.

#### Scenario: Detect an accidental edit
- **WHEN** a run answering a modeling question edits a package file
- **THEN** that eval fails

### Requirement: Runs compare against a baseline outside the skill folder

Each eval SHALL be run with the skill and without it, following skill-creator. Run outputs SHALL go to `skills/blueprint-workspace/`, which git ignores.

#### Scenario: Keep run artifacts out of the repository
- **WHEN** an iteration of the suite completes
- **THEN** its outputs exist under `skills/blueprint-workspace/iteration-<N>/` and `git status` shows none of them
