`@ai`
# Feature: Represent how an existing flow is built

The reviewer points the agent at code — a tool, an endpoint or a use case,
often vibe-coded — and asks how one specific flow is built inside. The agent
answers with the design package. The package is a closed universe: it always
follows the representation rules of the other Features. It serves
comprehension and stays faithful to the code. Later iterations improve the
flow under the same rules.

Open decisions:
- When the code breaks a rule of the universe, such as a use case that calls
  another use case, whether the representation normalizes it or marks it as
  an incoherence.
- When an iteration improves the flow, whether the package distinguishes what
  the code does today from what is proposed.

## Rule: The representation covers only the flow the reviewer asked about

### Scenario Outline: Represent `<requestedFlow>` without `<otherFlow>`

* Given the code of "`<codebase>`" implements the flows "`<requestedFlow>`" and "`<otherFlow>`"
* When the reviewer asks how "`<requestedFlow>`" is built
* Then the package represents "`<requestedFlow>`"
* And the package contains no use case that only "`<otherFlow>`" needs

#### Examples:

  | codebase        | requestedFlow                 | otherFlow        |
  | capture-context | processing a recorded session | listing sessions |

## Rule: The representation shows the successful path; failure handling appears only when the reviewer asks for it

### Scenario Outline: Leave out `<failureHandling>` when the reviewer did not ask about failures

* Given the code handles "`<failure>`" by `<failureHandling>`
* When the reviewer asks how the flow is built, without asking about failures
* Then the package shows the successful path of the flow
* And the package does not show `<failureHandling>`

#### Examples:

  | failure                             | failureHandling                          |
  | the model returns an invalid summary | summarizing the chapter with a template |

### Scenario Outline: Show `<failureHandling>` when the reviewer asks how `<failure>` is handled

* Given the code handles "`<failure>`" by `<failureHandling>`
* When the reviewer asks how the flow handles "`<failure>`"
* Then the package shows `<failureHandling>` as a diversion from the step that fails

#### Examples:

  | failure                             | failureHandling                          |
  | the model returns an invalid summary | summarizing the chapter with a template |

## Rule: Every represented step exists in the code, with its order and its concurrency

### Scenario: Keep the order and concurrency the code has

* Given the code prepares the images and the narration of a session concurrently and then builds its timeline
* When the reviewer asks how the flow is built
* Then the saga shows image and narration preparation in parallel before building the timeline
* And the package shows no step the code does not perform

## Rule: What the code does beyond the requested flow is cut from the representation

### Scenario Outline: Represent `<useCase>` without `<extra>`

* Given the code of "`<useCase>`" also `<extra>`
* And `<extra>` does not change the result of the requested flow
* When the reviewer asks how the flow is built
* Then "`<useCase>`" is represented without `<extra>`

#### Examples:

  | useCase                  | extra                                          |
  | SynthesizeChapterUseCase | records each model call for usage accounting   |
  | SelectChapterFramesUseCase | records the duration of each processing stage |
