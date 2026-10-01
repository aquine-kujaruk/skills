`@ai`
# Feature: Design the application and domain of a proposal

The agent turns a proposal — a flow the reviewer imagines, however unusual —
into a pseudocode design package. A human reads the package to verify their
understanding, to see what the AI proposes, and to spot its incoherences and
opportunities. The package favours the lowest cognitive load, neither
implements the system nor models every attribute, and is not tied to any
planning tool. Its rules also govern the representation of existing code.

Open decisions:
- Whether a context may hold more than one repository interface, and when a
  single wide interface stops being simple.
- Which of its reading contexts hosts an entity produced outside the proposal
  (the worked example uses the first one, evidence).
- Who maps an entity to its DTO, and whether that mapping is visible in the
  saga or in a use case.
- Whether a domain depending on another context's entity through `shared/` is
  acceptable.
- Whether variables and parameters also carry role suffixes.
- When parallelism inside a use case is infrastructure rather than domain.
- Whether building domain objects inside a use case, such as mapping plan
  intervals to chapters, is application logic or hidden domain logic.
- Whether names of external tools may appear in comments of repository
  interfaces.
- Whether the TypeScript files must type-check.
- How these rules change when the proposal is event-driven.

## Rule: The package is sliced by context

### Scenario: Group each context's use cases, repository and domain types in its own folder

* Given the proposal describes this flow:
  """
  Prepare the images and the narration of a recorded session, build its
  timeline, plan its chapters, process each chapter, then summarize the
  session and publish it.
  """
* When the application and domain design of the proposal is produced
* Then the package has one folder per context
* And each context folder contains an "application" folder and a "domain" folder
* And the "application" folder holds a "commands" folder, a "queries" folder and the context's repository interface
* And the "domain" folder holds one file per domain object
* And a saga hosted by a context sits at the root of that context folder, beside "application" and "domain"
* And the package has no top-level folder per layer for use cases, repository interfaces or domain types
* And the "shared" folder contains a single file, which declares every cross-context DTO

### Scenario Outline: Expose `<entity>`, produced outside the proposal, through `<dto>` instead of creating a context for it

* Given the entity "`<entity>`" is read by the contexts "`<firstReader>`" and "`<secondReader>`"
* And the capability that produces "`<entity>`" is outside the proposal
* When the application and domain design of the proposal is produced
* Then "`<entity>`" is a domain type of exactly 1 of the contexts that read it
* And the shared DTO file exposes it as "`<dto>`"
* And no context exists only to hold "`<entity>`"

#### Examples:

  | entity  | firstReader | secondReader | dto        |
  | Session | evidence    | publication  | SessionDTO |

## Rule: A use case is a command or a query by what it essentially does to the state

### Scenario Outline: Place `<useCase>` among the `<folder>` because it `<effect>`

* Given the use case "`<useCase>`" `<effect>`
* When the application and domain design of the proposal is produced
* Then "`<useCase>`" is in the "`<folder>`" folder of its context's "application" folder

#### Examples:

  | useCase                 | effect                                                    | folder   |
  | BuildTimelineUseCase    | saves the timeline it builds                              | commands |
  | LoadActivityUseCase     | only reads the recorded activity                          | queries  |
  | PrepareNarrationUseCase | transcribes audio through a paid model and saves nothing  | queries  |

### Scenario: Keep a command that returns its result a command

* Given the use case "BuildTimelineUseCase" saves the timeline
* And the next step of the saga needs that timeline
* When the application and domain design of the proposal is produced
* Then "BuildTimelineUseCase" is a command that returns the timeline

### Scenario: Keep a query that only leaves a log a query

* Given the code of "LoadActivityUseCase" reads the recorded activity and writes a log line
* When the application and domain design of the proposal is produced
* Then "LoadActivityUseCase" is in the "queries" folder
* And its representation does not write the log line

## Rule: A context groups the use cases that share its vocabulary; no context holds every use case and no context holds a single one

### Scenario: Split a flow into contexts that each hold several use cases

* Given the proposal describes this flow:
  """
  Prepare the images and the narration of a recorded session, build its
  timeline, plan its chapters, process each chapter, then summarize the
  session and publish it.
  """
* When the application and domain design of the proposal is produced
* Then the use cases are distributed across more than one context
* And every context contains at least 2 use cases

## Rule: A context's stores and external tools are merged behind one repository interface

### Scenario Outline: Merge the stores and external tools of `<context>` behind `<repository>`

* Given the context "`<context>`" needs these external mechanisms:
  | mechanism    |
  | <firstTool>  |
  | <secondTool> |
  | <thirdTool>  |
* When the application and domain design of the proposal is produced
* Then "`<context>`" declares exactly 1 repository interface, named "`<repository>`"
* And "`<repository>`" declares the operations the use cases of "`<context>`" need from "`<firstTool>`", "`<secondTool>`" and "`<thirdTool>`"

#### Examples:

  | context  | repository         | firstTool | secondTool | thirdTool                   |
  | chapters | ChapterRepository  | SQLite    | Prem       | OpenAI                      |
  | evidence | EvidenceRepository | SQLite    | FFmpeg     | OpenAI speech transcription |

### Scenario: Put an external tool behind the repository even when calling it is synchronous

* Given the context "evidence" extracts images with FFmpeg through a synchronous call
* When the application and domain design of the proposal is produced
* Then extracting images is an operation of the evidence repository interface
* And no domain type invokes FFmpeg

### Scenario Outline: Inject `<repository>` directly into `<useCase>`

* Given the use case "`<useCase>`" needs operations of "`<repository>`"
* When the application and domain design of the proposal is produced
* Then "`<useCase>`" is a class that receives "`<repository>`" through its constructor
* And no type exists only to group the dependencies of "`<useCase>`"

#### Examples:

  | useCase             | repository        |
  | PlanChaptersUseCase | ChapterRepository |

## Rule: Repository operations and domain types describe the application's need, not how an external mechanism is fed

### Scenario Outline: Score images without exposing that `<provider>` receives them as `<mechanismShape>`

* Given the provider "`<provider>`" scores candidate images that it receives batched as `<mechanismShape>`
* When the application and domain design of the proposal is produced
* Then the chapter repository interface scores a list of images
* And no repository operation, domain type or use case mentions `<mechanismShape>`
* And no use case fans out calls that exist only because the provider receives `<mechanismShape>`

#### Examples:

  | provider | mechanismShape |
  | Prem     | grids          |

## Rule: An optimization lives where its reason lives: a tool's constraint in the repository, the timing of business units in the saga, a change of result in the domain

### Scenario Outline: Keep `<optimization>` inside the repository because only `<provider>` needs it

* Given the provider "`<provider>`" `<constraint>`
* And `<optimization>` exists only because of that constraint and leaves every result unchanged
* When the application and domain design of the proposal is produced
* Then no use case, saga or domain type expresses `<optimization>`
* And the repository operation that uses "`<provider>`" is declared without any trace of `<optimization>`

#### Examples:

  | provider                    | constraint                          | optimization                      |
  | Prem                        | receives images arranged in grids   | batching images into grids        |
  | OpenAI speech transcription | limits the audio size of a request  | splitting the audio into fragments |
  | Prem                        | accepts at most 4 simultaneous calls | limiting calls to 4 at a time     |

### Scenario Outline: Show `<optimization>` in the saga because it changes when `<outcome>` is available

* Given the proposal applies `<optimization>`
* And `<optimization>` changes when `<outcome>` is available without changing its content
* When the application and domain design of the proposal is produced
* Then the saga shows `<optimization>`
* And no repository hides `<optimization>`

#### Examples:

  | optimization                                                         | outcome         |
  | preparing the images and the narration at the same time             | the timeline    |
  | processing each chapter as soon as its evidence is complete, while recording continues | the publication |

### Scenario Outline: Model `<optimization>` as a domain policy because it changes `<result>`

* Given the proposal applies `<optimization>` to reduce cost or latency
* And `<optimization>` changes `<result>`
* When the application and domain design of the proposal is produced
* Then a domain type expresses `<optimization>` as a policy
* And no repository or saga hides `<optimization>`

#### Examples:

  | optimization                                 | result                                    |
  | limiting the frames of a chapter to a budget | which frames the reading agent receives   |

### Scenario Outline: Note `<opportunity>` as a one-line comment on `<operation>`

* Given the agent detects that `<operation>` could benefit from `<opportunity>`
* And `<opportunity>` depends on experimenting with the external mechanism
* When the application and domain design of the proposal is produced
* Then the repository interface carries a one-line comment starting with "Opportunity:" above `<operation>`
* And no saga, use case or domain type mentions `<opportunity>`
* And the package carries at most 3 such comments

#### Examples:

  | operation           | opportunity                                       |
  | scoreImages         | arranging the images in grids to make fewer calls |
  | transcribeNarration | transcribing audio fragments concurrently         |

## Rule: Domain types carry only the attributes needed to follow the flow and never depend on repositories

### Scenario: Omit an attribute that no step of the flow reads

* Given the implemented system stores a revision on each timeline
* And no step of the proposed flow reads that revision
* When the application and domain design of the proposal is produced
* Then no domain type declares a revision attribute

### Scenario: Keep domain operations synchronous and unaware of repositories

* Given the proposal computes chapter cut points from the visits and silences of a timeline
* When the application and domain design of the proposal is produced
* Then the cut-point computation is a domain operation that returns its result without awaiting
* And no domain type imports a repository interface
* And no domain type is classified as an entity or a value object

### Scenario: Give a computation to the domain noun it concerns instead of a calculator

* Given the proposal computes the boundaries of chapters
* When the application and domain design of the proposal is produced
* Then the boundary computation is an operation of a chapter-related domain type
* And no domain type is named as a calculator or a processor

### Scenario Outline: Express that `<object>` must `<criterion>` as a verification method of `<object>`

* Given the use case "`<useCase>`" obtains "`<object>`" from a model
* And "`<object>`" must `<criterion>` whichever model produces it
* When the application and domain design of the proposal is produced
* Then "`<object>`" declares a method that verifies it `<criterion>`
* And "`<useCase>`" calls that method after obtaining "`<object>`"
* And no separate rules or policy object carries the criterion
* And no repository operation carries the criterion inside a prompt

#### Examples:

  | useCase              | object          | criterion                                  |
  | WriteArtifactUseCase | ArtifactContent | is grounded in the findings of the exploration |
  | ImplementTaskUseCase | CodeChange      | stays within the scope of its task         |

## Rule: A use case shows its single branch as explicit steps over domain objects, from its input to its output

### Scenario: Express order, independence and repetition without conditionals

* Given the proposal loads a session and its activity independently, builds a timeline from them, and then stores each image of the timeline
* When the application and domain design of the proposal is produced
* Then the use case awaits its dependent steps in order
* And the independent loads appear inside one `Promise.all`
* And storing each image appears as an iteration
* And the use case contains no conditional branch
* And the use case contains no body of a domain algorithm

### Scenario Outline: Receive `<lightInput>` as an argument even when obtaining it is a cheap read

* Given the use case "`<useCase>`" builds "`<result>`" from `<firstInput>`, `<secondInput>` and `<lightInput>`
* And obtaining `<lightInput>` is only a read of already recorded data
* When the application and domain design of the proposal is produced
* Then "`<useCase>`" receives `<firstInput>`, `<secondInput>` and `<lightInput>` as arguments
* And "`<useCase>`" loads none of them itself
* And the saga shows the step that obtains `<lightInput>` before "`<useCase>`"

#### Examples:

  | useCase              | result   | firstInput | secondInput   | lightInput   |
  | BuildTimelineUseCase | Timeline | the images | the narration | the activity |

### Scenario: Make an intermediate transformation an explicit, explained step

* Given the proposal derives chapters from a timeline through a plan of intervals
* When the application and domain design of the proposal is produced
* Then one use case turns the timeline into a chapter plan
* And another use case turns the chapter plan into identified chapters
* And the design states that a chapter plan proposes intervals without identity while a chapter is an identified unit
* And neither transformation is hidden inside a single domain method that performs the whole flow

### Scenario: State that chapters are computed rather than received

* Given the proposal computes the chapters of a session from its timeline
* When the application and domain design of the proposal is produced
* Then no use case receives the chapters as an input of the flow
* And the use case that produces the chapters receives the data they are computed from

### Scenario: Describe the generic process instead of the run that illustrated it

* Given the proposal was explored with a run in which 4 of 7 chapters were already processed when recording stopped
* When the application and domain design of the proposal is produced
* Then the design assumes no chapter is already processed

### Scenario: Show a use case invoked directly by an entry point without a saga

* Given the proposal exposes an endpoint that invokes a single use case
* When the application and domain design of the proposal is produced
* Then the design contains that use case
* And the design contains no saga for that endpoint

### Scenario: Leave iteration over use cases to a saga

* Given the proposal processes every chapter one after another
* When the application and domain design of the proposal is produced
* Then no use case receives another use case as a dependency
* And a saga iterates over the chapters

### Scenario: Keep saga concepts out of use cases and domain types

* Given the proposal retries chapter processing and processes chapters one at a time
* When the application and domain design of the proposal is produced
* Then no use case or domain type expresses a retry, catch, batch or concurrency limit

## Rule: A context reads another context's objects only through data-only DTOs declared in one shared file

### Scenario Outline: `<consumer>` reads `<entity>` from `<producer>` through `<dto>`

* Given the context "`<consumer>`" reads the entity "`<entity>`" produced by the context "`<producer>`"
* When the application and domain design of the proposal is produced
* Then the shared DTO file declares "`<dto>`" as "`<entity>`" itself, without selecting or omitting attributes
* And only the imports of the shared DTO file show that "`<dto>`" comes from "`<producer>`", without comments
* And "`<consumer>`" imports "`<dto>`" from the shared DTO file
* And "`<consumer>`" imports nothing from "`<producer>`"

#### Examples:

  | consumer | entity   | producer | dto         |
  | chapters | Timeline | evidence | TimelineDTO |

### Scenario: Deliver a derived value as data because a saga serializes what crosses contexts

* Given the context "chapters" needs the silences of a timeline
* And the silences are derived by the context "evidence"
* When the application and domain design of the proposal is produced
* Then "TimelineDTO" carries the silences as an attribute
* And no DTO declares a method

## Rule: A type's name carries its role as a suffix, except a domain object's name

### Scenario Outline: Name the `<role>` for `<concept>` as `<typeName>`

* Given the proposal needs a `<role>` for "`<concept>`"
* When the application and domain design of the proposal is produced
* Then its type is named "`<typeName>`"

#### Examples:

  | role                 | concept                     | typeName            |
  | use case             | planning chapters           | PlanChaptersUseCase |
  | repository interface | the chapters context        | ChapterRepository   |
  | DTO                  | a timeline read by chapters | TimelineDTO         |
  | saga                 | processing one chapter      | ProcessChapterSaga  |

### Scenario Outline: Name the file of `<typeName>` as `<fileName>`

* Given the design declares "`<typeName>`"
* When the application and domain design of the proposal is produced
* Then "`<typeName>`" is in the file "`<fileName>`"

#### Examples:

  | typeName            | fileName                        |
  | PlanChaptersUseCase | plan-chapters.use-case.ts       |
  | ChapterRepository   | chapter.repository.ts           |
  | ProcessChapterSaga  | process-chapter.saga.md         |
  | ChapterPlan         | chapter-plan.ts                 |

### Scenario Outline: Name the domain object `<domainName>` without a role suffix

* Given the proposal handles the domain concept "`<domainName>`"
* When the application and domain design of the proposal is produced
* Then its domain type is named "`<domainName>`"

#### Examples:

  | domainName  |
  | Chapter     |
  | ChapterPlan |

## Rule: The package is pseudocode for comprehension and invents nothing

### Scenario: Leave out a policy the proposal does not establish

* Given the implemented system retries a failed synthesis
* And the proposal establishes no retry policy for synthesis
* When the application and domain design of the proposal is produced
* Then no retry policy for synthesis appears in the package

### Scenario Outline: Leave out `<configValue>` even when the policy it configures is established

* Given the proposal establishes that a failed synthesis is retried
* And the implemented system configures that retry with `<configValue>`
* When the application and domain design of the proposal is produced
* Then `<configValue>` appears nowhere in the package

#### Examples:

  | configValue           |
  | a delay of 1000 ms    |
  | a backoff rate of 2   |

### Scenario: Deliver the design without a README

* Given the proposal describes a flow across several contexts
* When the application and domain design of the proposal is produced
* Then the package contains no README
