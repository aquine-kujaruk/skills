# Spec Delta

## Purpose

Defines the pseudocode design package that `blueprint` writes for one flow (its layout, layers and representation rules), so that every package reads the same whatever code, endpoint or imagined flow it describes.

## ADDED Requirements

### Requirement: The package represents only the requested flow and its successful path

The package SHALL represent only the flow the reviewer asked about, and only its successful path. Work the code performs that does not change the result of the flow (logs, metrics, timings, usage accounting) SHALL be cut. Failure handling SHALL appear only when the reviewer asks about it.

#### Scenario: Leave out a flow that was not asked for
- **WHEN** the code implements "processing a recorded session" and "listing sessions" and the reviewer asks how the first is built
- **THEN** the package contains no use case that only "listing sessions" needs

#### Scenario: Cut work that does not change the result
- **WHEN** `SynthesizeChapterUseCase` also records each model call for usage accounting
- **THEN** its representation does not record model calls

#### Scenario: Omit failure handling nobody asked about
- **WHEN** the code summarizes a chapter with a template after the model returns an invalid summary, and the reviewer did not ask about failures
- **THEN** the package contains neither the template use case nor a catch

### Requirement: The package is faithful to the code and normalized into the universe

Every represented step SHALL exist in the code, with the code's order and concurrency. Where the code breaks a representation rule, the package SHALL follow the rule; the agent reports the deviation in its reply, and the package carries no note about it. Mechanisms the code already has, such as a concurrency limit or a sequential order of business units, SHALL be represented where locality places them. Mechanisms the code lacks SHALL NOT be added unless the reviewer accepts them.

#### Scenario: Keep the code's order and concurrency
- **WHEN** the code prepares the images and the narration of a session concurrently and then builds its timeline
- **THEN** the saga shows both preparations in parallel before building the timeline, and no step the code does not perform

#### Scenario: Normalize a use case that calls another use case
- **WHEN** the code's `processChapters()` loops over chapters calling `processChapter()`
- **THEN** the package shows a saga mapping the chapter processing over each chapter, and no use case calls or receives another use case

### Requirement: The package is sliced by context with a fixed layout

The package SHALL have one folder per context. Each context folder SHALL contain `application/commands/*.use-case.ts`, `application/queries/*.use-case.ts`, one `application/<context>.repository.ts`, and `domain/*.ts` with one domain object per file. A saga hosted by the context SHALL sit at the context root as `<saga>.saga.md`. Cross-context DTOs SHALL live in a single `shared/dtos.ts`. A flow coordinated by a saga SHALL have `<main-saga>.sequence.md` at the package root. The package SHALL contain no README and no top-level folder per layer.

#### Scenario: Lay out a multi-context flow
- **WHEN** the agent designs "prepare the images and narration of a session, build its timeline, plan its chapters, process each chapter, then summarize and publish the session"
- **THEN** each context folder holds `application/` (commands, queries, repository) and `domain/`, the saga files sit at context roots, `shared/` holds only `dtos.ts`, and the package root holds the sequence diagram and no README

### Requirement: Contexts group use cases by shared vocabulary

Use cases SHALL be grouped into contexts by the vocabulary they share. In a flow of several steps, use cases SHALL span more than one context, and every context SHALL hold at least two use cases. An entity produced outside the flow SHALL be a domain type of the first context that reads it in the flow and SHALL be exposed through a DTO, with no context created only to hold it. A saga SHALL be hosted by the context that owns the saga's outcome.

#### Scenario: Host an externally produced entity
- **WHEN** `Session` is produced by capture, outside the flow, and read by evidence and publication
- **THEN** `Session` is a domain type of evidence only, exposed as `SessionDTO`

#### Scenario: Host the saga with its outcome
- **WHEN** `ProcessAudiovisualSessionSaga` runs use cases of evidence, chapters and publication and returns the publication
- **THEN** its file is `publication/process-audiovisual-session.saga.md`

### Requirement: Contexts exchange data only through alias DTOs

A context SHALL read another context's objects only through DTOs declared in `shared/dtos.ts`. Each DTO SHALL be a direct alias of the producer's domain type: it selects and omits no attributes, declares no methods and carries no comments. Only the file's imports show where each DTO comes from. A value the consumer needs that the producer derives SHALL travel as a DTO attribute. No step maps entities to DTOs.

#### Scenario: Read a timeline from another context
- **WHEN** chapters reads the `Timeline` produced by evidence, including its silences
- **THEN** `shared/dtos.ts` declares `export type TimelineDTO = Timeline;`, `Timeline` carries `silences` as an attribute, and chapters imports nothing from evidence

### Requirement: The domain is minimal, synchronous and unaware of repositories

Domain types SHALL carry only the attributes some step of the flow reads. Domain operations SHALL return their results without awaiting, SHALL import no repository, and SHALL belong to the domain noun they concern, never to a calculator, processor or rules object. Domain types SHALL NOT be classified as entities or value objects. A criterion that a model-produced object must meet with any model SHALL be a verification method of that object, which the use case calls after obtaining it. A policy that changes a result to reduce cost or latency SHALL be a domain type.

#### Scenario: Omit an attribute nobody reads
- **WHEN** the implemented system stores a revision on each timeline and no step reads it
- **THEN** no domain type declares a revision

#### Scenario: Express a model-independent criterion on the object
- **WHEN** `WriteArtifactUseCase` obtains `ArtifactContent` from a model and the content must be grounded in the exploration's findings whichever model wrote it
- **THEN** `ArtifactContent` declares a verification method that the use case calls, and no rules object or prompt carries the criterion

### Requirement: A use case orchestrates one context along a single branch

A use case SHALL be a class that receives its context's repository through its constructor and SHALL use no type that only groups dependencies. Its body SHALL show a single branch from input to output: dependent steps awaited in order, independent work the use case needs inside one `Promise.all`, and repetition as iteration. It SHALL contain no conditional, no body of a domain algorithm (constructing domain objects is a domain operation), and no retry, catch, batch or concurrency limit. A use case SHALL never call or receive another use case. A use case MAY load through its repository the object it operates on, and SHALL receive as arguments everything else it combines, even when obtaining it is a cheap read.

#### Scenario: Receive what is combined
- **WHEN** `BuildTimelineUseCase` builds a timeline from the images, the narration and the recorded activity
- **THEN** it receives all three as arguments, and the saga shows the step that loads the activity before it

#### Scenario: Load what is operated on
- **WHEN** `SynthesizeChapterUseCase` needs the evidence of the chapter it synthesizes
- **THEN** it may load that evidence through `ChapterRepository`

#### Scenario: Move construction into the domain
- **WHEN** chapters are built from the intervals of a chapter plan
- **THEN** the construction is an operation of a chapter-related domain type, not a `map` in the use case

### Requirement: Use cases are commands or queries by essence

A use case that changes state SHALL be a command, even if it returns its result. A use case that changes no state SHALL be a query, even if it is expensive or writes a log. Commands SHALL live in `application/commands/` and queries in `application/queries/`, whatever the code calls them.

#### Scenario: Classify by effect
- **WHEN** `BuildTimelineUseCase` saves and returns the timeline, and `PrepareNarrationUseCase` transcribes audio through a paid model and saves nothing
- **THEN** `BuildTimelineUseCase` is in `commands/` and `PrepareNarrationUseCase` is in `queries/`

### Requirement: Saga steps are cut where repeating earlier work is unacceptable

A unit of work SHALL be split into two use cases joined by a saga transition exactly when repeating its earlier work after a later failure is unacceptable. Otherwise it remains one use case, and cheap local recomputation stays inside the use case that needs it. The saga's serialized state, the output of each step, SHALL be the flow's durable progress, so a step that saves nothing is a valid step. Iterating a use case over items SHALL be a saga map.

#### Scenario: Split when repetition hurts
- **WHEN** a use case scores images with Prem and then summarizes with OpenAI, and repeating the scoring after a summary failure is unacceptable
- **THEN** it becomes two use cases joined by a saga transition

#### Scenario: Accept a step that saves nothing
- **WHEN** `PrepareNarrationUseCase` returns the narration without saving it and `BuildTimelineUseCase` needs it
- **THEN** it is a valid saga step whose output the saga keeps until `BuildTimelineUseCase` runs

### Requirement: Each decision lives where the information to make it lives

Everything external to the language (stores, tools, APIs, models, people) SHALL sit behind exactly one repository interface per context. Repository operations and domain types SHALL describe the application's need, never how a mechanism is fed. Each decision goes where its information lives:

- A transport retry and an optimization that exists only for a tool's constraint go in the repository, leaving no trace in its declaration.
- A step retry and an optimization that changes *when* a result is available go in the saga.
- An alternative path is a saga catch.
- An optimization that changes the result is a domain policy.

The repository interface MAY carry one header line naming the mechanisms behind it. No other part of the package names a tool. The package SHALL carry at most three `// Opportunity: …` comments, each one line directly above a repository operation, for opportunities that depend on experimenting with the mechanism.

#### Scenario: Hide a provider's feeding shape
- **WHEN** Prem scores images it receives arranged in grids and accepts at most 4 simultaneous calls
- **THEN** `ChapterRepository` scores a list of images, and no operation, domain type, use case or saga mentions grids or the limit

#### Scenario: Show a timing optimization in the saga
- **WHEN** the images and the narration are prepared at the same time to obtain the timeline sooner
- **THEN** the saga shows the parallel preparation

#### Scenario: Make a result-changing optimization a domain policy
- **WHEN** the frames of a chapter are limited to a budget, which changes which frames the reading agent receives
- **THEN** a domain type expresses the budget as a policy

### Requirement: Types and files follow one naming scheme

File names SHALL be kebab-case with the role after a dot (`plan-chapters.use-case.ts`, `chapter.repository.ts`, `process-chapter.saga.md`); a domain file has no role (`chapter-plan.ts`). Type names SHALL carry their role as a suffix (`PlanChaptersUseCase`, `ChapterRepository`, `TimelineDTO`, `ProcessChapterSaga`), except domain types (`Chapter`, `ChapterPlan`). Variables and parameters SHALL be camelCase of their type, keeping the `DTO` suffix when the type is a DTO (`timelineDTO`).

#### Scenario: Name a use case and its file
- **WHEN** the design needs a use case for planning chapters
- **THEN** it is `PlanChaptersUseCase` in `plan-chapters.use-case.ts`

### Requirement: The package invents nothing and stays coherent

The package SHALL contain no policy the code or proposal does not establish, and no configuration value even for an established policy. It SHALL describe the generic flow, not the run that illustrated it. Every import and every diagram link SHALL resolve to a file of the package, and every type used SHALL be declared. The package SHALL NOT be required to type-check. Package content SHALL be written in English.

#### Scenario: Leave out configuration values
- **WHEN** the implementation retries a failed synthesis with a delay of 1000 ms and a backoff rate of 2
- **THEN** neither value appears in the package, and no retry appears unless the proposal establishes it

#### Scenario: Declare every type used
- **WHEN** a saga catches `InvalidSummary`
- **THEN** `InvalidSummary` is declared in the domain of the context that raises it
