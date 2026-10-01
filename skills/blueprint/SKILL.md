---
name: blueprint
description: Draw and iterate on one flow as a pseudocode design package in a fixed notation.
disable-model-invocation: true
---

A blueprint depicts one flow: MVP-thin pseudocode, happy path, closed layers and diagrams. Represent code, endpoints or imagined flows without a planning tool; write code for no system.

## Turns

**Represent** → read the requested flow and write `<tmp>/blueprint/<flow>/`, using session scratch space or the OS temporary directory. Reply with its path and each normalization against the code. Suggest unestablished improvements in the reply; draw them after acceptance. Offer a project copy only when the reviewer wants context for writing or changing code.

**Correct** → replace the package in place, applying the correction's principle everywhere: files, types, imports, links and diagrams. Interpret dictated CTO/Share as DTO/shared. Report the delta. Correct clearly covered analogues; missing provenance alone leaves an analogue pending, with its state preserved for a decision.

**Ask** → answer only, leaving every package file untouched. An overview connects parts, inputs, branches and secondary events; a worked example follows the successful path with representative magnitudes; a zoom orders sub-processes and identifies concurrency. Modeling questions get a worked example. For timing, name each measured time, compose a generic critical-path total using pending-item counts, and estimate each part as a percentage of its enclosing time, counting overlaps once.

**Decide** → ask one question: recommended option and reason first. Preserve pending state. For a contradictory correction, name both rules and ask which governs before editing.

## Principles

**As-built.** Source facts feed this universe; they do not expand it. Draw requested result-producing work, preserving order and concurrency; leave operational bookkeeping in the reply. Normalize structural violations and report them. Represent generic processes, rather than illustrative runs. Extend failure paths only when asked.

**Layers.** Synchronous domain nouns compute, construct objects through domain factories, and verify model-independent criteria; keep only attributes flow steps consume, without entity/value-object labels or repository dependencies. Call verification after obtaining a model's result. A use-case class receives its repository through its constructor and orchestrates calls to domain and repository on one branch: await dependencies, group independent application work in one `Promise.all`, iterate repeated operations. Keep domain algorithms in domain nouns and use-case orchestration in sagas; use cases never receive or call other use cases. Keep distinct transformations explicit and explain their intermediate meanings.

**The cut.** If it dies here, do I mind repeating earlier work? Split at unacceptable repetition; otherwise keep the unit whole, including cheap local recomputation. Serialized step outputs are durable saga progress even when a step saves nothing. Map repetition over use cases in a saga.

**Locality.** Decide where the information lives: transport retries and tool-only feeding constraints stay inside the repository, invisible in its interface; timing and step retries belong to the saga; a requested diversion becomes a catch; result-changing optimizations belong to established domain policies. Terminal failure ends the saga. Annotate established retries, buffers or requested risks with one-line node notes, without named retry policies. Experimental mechanism opportunities get at most three one-line `// Opportunity: …` comments above repository operations.

**Behind the repository.** Merge everything external to the language into one repository per context, including synchronous tools and people. Describe application needs rather than feeding shapes. Only one repository header line may name mechanisms.

**Load what you operate on; receive what you combine.** A use case may load its subject through its repository. Receive all other inputs as arguments, including cheap reads, so their acquisition remains visible upstream.

**Command or query by essence.** Application state changes are commands, even when returning data. Pure results are queries, regardless of expense or discarded logs.

**Contexts by vocabulary, DTOs as aliases.** Slice multi-step flows across contexts, each with at least two use cases. Host an external entity in its first reading context and a saga with its outcome. Cross contexts only through direct domain-type aliases in `shared/dtos.ts`: imports show provenance; carry derived values and nested data as attributes, with no DTO methods, comments, selection or mapping step.

**Invent nothing; stay coherent.** Express established policies abstractly, keeping configuration values outside every artifact and comment. Every type, import and relative link resolves; comprehension, rather than type-checking, is the bar. Write the package in English, with only the artifacts below and no README.

## Package

```text
<context>/
  application/{commands,queries}/<name>.use-case.ts
  application/<context>.repository.ts
  domain/<noun>.ts                 # one object per file
  <name>.saga.md
shared/dtos.ts
<main-saga>.sequence.md
```

Files: kebab-case, role after a dot; domain files have no role. Types: PascalCase with `UseCase`, `Repository`, `Saga`, `DTO` suffixes; domain nouns without suffix. Variables: camelCase of their type, retaining `DTO`.

## Diagrams

For represent/correct turns, read [NOTATION.md](NOTATION.md) before drawing.

| Primitive | Saga | Sequence |
| --- | --- | --- |
| step | linked command/query node | saga-to-context message |
| sub-saga | neutral linked node, separate file | grey rect and named Note, unfolded steps |
| parallel | named container, fork/join | par |
| map | plural-step container with concurrency | loop |
| catch | labelled diversion | break |
| entry/exit | start/end | trigger request/result |

One successful trunk visits each step once. Variants get separate sagas chosen by the entry point; share two or more initial steps through a sub-saga, one through its use case. A saga flow gets one root sequence: trigger, suffix-free saga, boxed context lanes; cross-context requests and returns use DTO aliases. A single-use-case entry point gets neither diagram. Keep choices, waits, events and transition data outside this vocabulary.
