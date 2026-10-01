`@ai`
# Feature: Revise a design from reviewer feedback

The reviewer corrects the design package, or iterates from the representation
of existing code towards improvements, with remarks that are often general
principles illustrated by one example, dictated by voice. The agent applies
each correction throughout the package under the same representation rules and
surfaces what the correction leaves undecided.

Proposed, pending confirmation: when a new correction contradicts an earlier
accepted rule, the agent names both and asks which one governs before changing
the package.

## Rule: A correction reaches every affected occurrence and keeps the package consistent

### Scenario Outline: Replace `<oldElement>` with `<newElement>` everywhere it appears

* Given the package refers to "`<oldElement>`" in use cases, repository interfaces and saga diagrams
* And the reviewer asks to replace "`<oldElement>`" with "`<newElement>`"
* When the correction is applied
* Then no file of the package refers to "`<oldElement>`"
* And every saga node link resolves to an existing file

#### Examples:

  | oldElement            | newElement         |
  | ProcessChapterUseCase | ProcessChapterSaga |

## Rule: A dictated term is read as the design term it transcribes

### Scenario Outline: Read "`<heard>`" as `<meant>`

* Given the reviewer's correction says "`<heard>`" where the design has "`<meant>`"
* When the correction is applied
* Then the correction is applied to "`<meant>`"

#### Examples:

  | heard  | meant  |
  | CTO    | DTO    |
  | Share  | shared |

## Rule: A general principle is applied beyond the example that illustrated it

### Scenario Outline: Apply the principle behind `<example>` and flag `<analogousCase>`

* Given the reviewer rejects "`<example>`" because `<principle>`
* And "`<analogousCase>`" matches that principle only under an interpretation the reviewer has not confirmed
* When the correction is applied
* Then "`<example>`" no longer appears in the package
* And "`<analogousCase>`" is presented to the reviewer as a pending decision

#### Examples:

  | example   | principle                                                   | analogousCase                   |
  | scoreGrid | grids are how the provider is fed, not an application need | transcribing audio in fragments |

### Scenario Outline: Remove `<analogousCase>` together with `<example>` when the same principle clearly applies

* Given the reviewer rejects "`<example>`" because `<principle>`
* And the package also contains "`<analogousCase>`", which that principle clearly covers
* When the correction is applied
* Then neither "`<example>`" nor "`<analogousCase>`" appears in the package

#### Examples:

  | example            | principle                                | analogousCase     |
  | a delay of 1000 ms | configuration values are not pseudocode  | a retry count of 2 |

## Rule: A decision the reviewer must make is asked one question at a time, with a recommendation

### Scenario: Ask one pending decision with the recommended option first

* Given the correction leaves 2 decisions open for the reviewer
* When the correction is applied
* Then the agent asks exactly 1 question
* And the question lists the recommended option first and says why
* And the package keeps its state for that decision until the reviewer answers
