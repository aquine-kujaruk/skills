# Diagram notation

Adapt names and relative links to the package. Each saga file starts with
`Blue = command · Green = query` and contains one state diagram. Step labels
omit role suffixes; containers and sub-sagas stay neutral. The catch and note
below illustrate requested failure handling: omit that diversion on a happy-path turn.
Use the code's concurrency; `1` here means sequential business units.

```mermaid
stateDiagram-v2
  direction TB
  state "PrepareInputs (parallel)" as PrepareInputs {
    state "<a href='../inputs/application/queries/load-source.use-case.ts'>LoadSource</a>" as LoadSource
    state "<a href='../inputs/application/queries/load-context.use-case.ts'>LoadContext</a>" as LoadContext
    state Fork <<fork>>
    state Join <<join>>
    [*] --> Fork
    Fork --> LoadSource
    Fork --> LoadContext
    LoadSource --> Join
    LoadContext --> Join
    Join --> [*]
  }
  state "ProcessItems (map, concurrency: 1)" as ProcessItems {
    state "<a href='../items/process-item.saga.md'>ProcessItem</a>" as ProcessItem
    [*] --> ProcessItem
    ProcessItem --> [*]
  }
  state "<a href='application/commands/publish-result.use-case.ts'>PublishResult</a>" as PublishResult
  state "<a href='application/commands/publish-alternative.use-case.ts'>PublishAlternative</a>" as PublishAlternative
  [*] --> PrepareInputs
  PrepareInputs --> ProcessItems
  ProcessItems --> PublishResult
  PublishResult --> [*]
  PublishResult --> PublishAlternative: catch InvalidResult
  PublishAlternative --> [*]
  note right of PublishResult: Risk of invalid result
  classDef command fill:#4C8DF626,stroke:#4C8DF6,stroke-width:2px
  classDef query fill:#009E7326,stroke:#009E73,stroke-width:2px
  class PublishResult,PublishAlternative command
  class LoadSource,LoadContext query
```

The sequence unfolds sub-sagas rather than adding saga participants. Add one
actor-box CSS rule per lane, retaining a different translucent tint and solid
border for each. A requested catch uses `break`; ordinary publication failure
has no diversion. Declare any caught error in its raising context's domain.

```mermaid
%%{init: {"themeCSS": "rect.actor[name=T]{fill:#9E9E9E26;stroke:#9E9E9E;stroke-width:2px} rect.actor[name=S]{fill:#CC79A726;stroke:#CC79A7;stroke-width:2px} rect.actor[name=I]{fill:#E69F0026;stroke:#E69F00;stroke-width:2px} rect.actor[name=C]{fill:#56B4E926;stroke:#56B4E9;stroke-width:2px} rect.actor[name=P]{fill:#D55E0026;stroke:#D55E00;stroke-width:2px}"}}%%
sequenceDiagram
  participant T as Trigger
  participant S as ProcessItems
  participant I as inputs
  participant C as items
  participant P as publication
  T->>S: Process(sourceId)
  par PrepareInputs
    S->>I: LoadSource(sourceId)
    I-->>S: SourceDTO
  and
    S->>I: LoadContext(sourceId)
    I-->>S: ContextDTO
  end
  loop each item, sequentially
    rect rgba(158, 158, 158, 0.12)
      Note over S,C: ProcessItem
      S->>C: SelectInputs(SourceDTO, ContextDTO)
      C-->>S: SelectedInputs
      S->>C: BuildItem(SelectedInputs)
      C-->>S: ItemDTO
    end
  end
  S->>P: PublishResult(ItemDTO[])
  break catch InvalidResult (only when requested)
    S->>P: PublishAlternative(ItemDTO[])
  end
  P-->>S: Publication
  S-->>T: Publication
```
