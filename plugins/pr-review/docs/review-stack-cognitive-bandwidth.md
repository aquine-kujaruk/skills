# PR review layers and reviewer cognitive bandwidth

## Bottom line

Layering is justified when it gives a reviewer a **complete, independently
understandable intermediate change** and reduces the amount of code/context that
must be held at once. It is *not* justified merely because a line, file, or elapsed
time counter crosses a limit. Direct modern-code-review studies consistently find
associations between larger changes and slower or less-useful review, but they are
mostly observational and project-specific; they do not establish a universal causal
size threshold. [Sadowski et al. 2018](https://storage.googleapis.com/gweb-research2023-media/pubtools/4476.pdf)
[Bosu, Greiler & Bird 2015](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/bosu2015useful.pdf)

Therefore the plugin should use measurements as **soft warning signals** and offer
an explained, reviewer-facing split. It must never force a split. Stop splitting—and
record the exception—when another layer would (a) fragment one conceptual unit,
(b) make a reviewer switch back and forth across PRs to understand it, or (c) fail
to leave a valid, reviewable intermediate tree. This is a design conclusion from
the evidence below, not a measured optimum.

## Evidence directly about code review

### Change size, flow, and useful feedback

- A controlled experiment with 28 professional and graduate developers compared
  one pull request that tangled a refactoring with a feature against two PRs that
  separated those concepts. Decomposition produced fewer false positives and
  changed review navigation, but did not improve rationale understanding or the
  number of defects found. This directly supports separating different concepts,
  not slicing one concept to satisfy a size counter.
  [di Biase et al. 2018](https://arxiv.org/abs/1805.10978)
  ([open journal version](https://pmc.ncbi.nlm.nih.gov/articles/PMC7924728/)).

- A mixed-method reviewability study combined literature, interviews with ten
  professional developers, and ratings of 98 real changes by 35 developers. It
  defines reviewability through explanation, appropriate size/self-containment,
  and coherent history. Size is therefore only one part of a legible change.
  [Ram et al. 2018](https://anandsaw.github.io/publications/fse2018.pdf).

- A mixed-method Microsoft study identifies **understanding code and the change**
  as the central review need; it observed/interviewed/surveyed practitioners and
  classified hundreds of comments. It supports making the story of a PR legible,
  but does not test a maximum size or prove that splitting causes better outcomes.
  [Bacchelli & Bird 2013](https://doi.org/10.1109/ICSE.2013.6606617)
  ([open manuscript](https://doi.org/10.5281/zenodo.1401198)).

- In Microsoft data spanning **1.5 million comments from five projects**, the
  proportion of author-rated useful comments was lower when a change contained
  more files. This is direct evidence for keeping a review's context compact, but
  it is an association and the paper does not supply a portable file-count cutoff.
  [Bosu, Greiler & Bird 2015](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/bosu2015useful.pdf).

- A distributed-development case study found patch size negatively associated with
  review duration, participation, and comment density; its effect estimates are
  from one project and should not be converted into a global policy limit.
  [Dos Santos & Nunes 2018](https://doi.org/10.1186/s40411-018-0058-0).

- In 10,012 WebKit patches, increasing size was associated with longer response
  times and more revisions: the four size quartiles (4, 17, 54, and 432 LOC) had
  accepted-patch median response times of 39, 46, 48, and 64 minutes. The rank
  correlations were weak, however, and review-start time was unobserved. Use this
  as evidence for a *probabilistic* warning signal, not a size rule.
  [Baysal et al. 2013](https://www.cs.ubc.ca/~rtholmes/papers/wcre_2013_baysal.pdf).

- Google's peer-reviewed case study combines Critique logs for approximately
  **9 million changes**, 12 interviews, and 44 survey responses. Its median change
  was **24 modified lines**; 90% touched fewer than 10 files; initial feedback was
  under one hour for small changes and about five hours for very large ones. These
  are a useful production benchmark and show a size/latency gradient, not a causal
  prescription of “24 lines.” The authors explicitly attribute differences partly
  to local culture, process, and reviewer count.
  [Sadowski et al. 2018, pp. 4–7](https://storage.googleapis.com/gweb-research2023-media/pubtools/4476.pdf).

- The same Google study reports a median of one reviewer and fewer than 25% of
  changes with more than one reviewer. That is evidence that a lightweight process
  can operate at scale; it is **not** evidence that one reviewer is optimal for a
  particular risk, ownership, or security boundary.
  [Sadowski et al. 2018, p. 6](https://storage.googleapis.com/gweb-research2023-media/pubtools/4476.pdf).

- In the Google survey, the least satisfied responses included changes as small
  as one word or two lines and tiny configuration changes whose review added
  little value. The sample is small and does not measure stack fragmentation, but
  it warns against assuming that ever-smaller review units are always less tedious.
  [Sadowski et al. 2018, pp. 6–7](https://storage.googleapis.com/gweb-research2023-media/pubtools/4476.pdf).

### Coverage and participation matter too

- In Qt, VTK, and ITK, lower review coverage and lower reviewer participation were
  statistically linked to more post-release defects (model estimates up to two and
  five additional defects respectively). This argues against reducing review burden
  by simply omitting or rushing layers. It is a repository-mining case study, so it
  cannot prove review caused the defect difference or set a layer-size cap.
  [McIntosh et al. 2014](https://users.encs.concordia.ca/~shang/soen691/current/papers/MSR2014_TheImpactOfCodeReviewCoverageAndCodeReviewParticipationOnSoftwareQuality_ACaseStudyOfTheQt%2CVTK%2CAndITKProjects.pdf).

- Google measured reviewer activity as contiguous interaction blocks separated by
  no more than 10 minutes and found a median **2.6 review hours per developer per
  week**. This measures one mature organisation's workload, not an individual
  capacity or quota; it nevertheless supports exposing stack-wide reviewer load
  before publishing many layers at once.
  [Sadowski et al. 2018, p. 7](https://storage.googleapis.com/gweb-research2023-media/pubtools/4476.pdf).

- The relevant causal evidence is still sparse. A controlled ICSE 2024 experiment
  (20 participants, a two-hour C++ review/test task) found that the *combination*
  of in-person and on-screen interruptions changed review time; exact interruption
  combinations had different effects, while individual main effects were not
  significant. It supports avoiding arbitrary interruptions during a review, but
  does not justify a fixed session length or demonstrate defect-detection effects.
  [Huang et al. 2024](https://yuhuang-lab.github.io/paper/icse24.pdf)
  ([study data](https://doi.org/10.6084/m9.figshare.24944568.v2)).

## Transferable evidence on interruption and working context

This section is not code-review outcome evidence. It supports interface and
workflow safeguards, not numeric PR sizing.

- An observational study of **10,000 programming sessions from 85 programmers**
  found only 10% resumed coding within a minute and only 7% resumed without
  navigating elsewhere first. Programmers sought external task context on
  resumption. For this plugin, each layer should therefore state its purpose,
  prerequisite/base, and what becomes true after it, so a reviewer can resume a
  paused stack without reconstructing it from Git history.
  [Parnin & Rugaber 2011](https://chrisparnin.me/pdf/parnin-icpc09.pdf).

- A survey of 371 programmers plus a controlled lab study found that developers
  relied heavily on notes when resuming interrupted programming tasks and tested
  automated resumption cues against note-taking. This supports persistent layer
  summaries and explicit review order; it does not establish that a particular PR
  description format improves defect detection in production review.
  [Parnin & DeLine 2010](https://doi.org/10.1145/1753326.1753342).

- General experimental interruption research finds resumption costs and shows that
  longer interruptions worsen accuracy and resumption lag in a working-memory
  task. The task is not code review, so use it only for the conservative inference:
  avoid requiring unnecessary cross-layer switching and leave cues at each handoff.
  [Foroughi et al. 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8247645/).

- A workplace-computing field study of 27 people over two weeks found alert-driven
  switches averaged roughly 10 minutes, followed by another 10–15 minutes before a
  focused return; 27% of suspensions lasted more than two hours. Programming was
  among the activities, but the study was not about PR review. It strengthens the
  case for retaining visible, stable review-resumption cues rather than promising a
  particular review speed.
  [Iqbal & Horvitz 2007](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/11/CHI_2007_Iqbal_Horvitz-1.pdf).

- Working-memory capacity is limited and task-irrelevant interruption can reduce
  recall in laboratory paradigms. This gives a mechanism for preferring a single
  coherent review narrative over a large, heterogeneous diff, but cannot translate
  “chunks” into lines of code because code complexity and expertise differ sharply.
  [Cowan 2001](https://doi.org/10.1017/S0140525X01003922)
  [Hakim et al. 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7310497/).

## Evidence-to-policy table

| Evidence | Strength / boundary | Plugin policy implication |
| --- | --- | --- |
| Larger/more-file changes correlate with lower useful-comment proportion and worse review-process outcomes. | Direct review evidence; observational, organisation/project-specific. | Warn on unusually large **diff and file breadth**, then offer a conceptual split. Never auto-split or reject. |
| Review coverage/participation correlate with fewer post-release defects. | Direct review evidence; observational case study. | Do not trade reviewability for unreviewed gaps. Every published layer needs a real, reviewable diff and an explicit reviewer path. |
| Mature Google process uses small changes, quick iteration, and limited reviewer load. | Large first-party dataset; descriptive and confounded by local tooling/culture. | Show size, files, expected review order, and stack depth as context; use no Google-derived hard limits. |
| Programmers reconstruct context after interruption; cues/notes help resumption. | Direct programming evidence, plus controlled cue study; not PR-review defect evidence. | Put a short “why this layer / depends on / validates” summary in each PR; make the base and next layer obvious; preserve stable PR URLs. |
| Working-memory interruption experiments show resumption cost. | Strong experimental causality, but a transfer across tasks. | Minimise cross-PR hopping; preserve one conceptual narrative per PR; avoid layers whose only meaning is distributed across neighbours. |
| Controlled code-review interruption study finds an interaction between in-person and on-screen interruptions. | Direct but small lab experiment; outcome was time, not defects. | Do not impose a session timer; preserve an easy “resume here” path and avoid making reviewers repeatedly change PRs. |

## Numeric signals: what is defensible

No reviewed source above validates a universal maximum LOC, files, PR count, or
review-session duration. The only defensible numbers here are **descriptive
baselines**, such as Google's 24-line median and its observed latency gradient;
they are useful for a warning UI or future local calibration, never for enforcement.

Recommended adaptive signals (combine them; do not rank by LOC alone):

1. Diff breadth: changed lines, files, and subsystems; flag an outlier relative to
   this repository's own recent review distribution.
2. Conceptual cohesion: can the layer be described in one sentence and reviewed
   without opening a sibling PR? If no, either merge it with its prerequisite or
   add a summary/cue; splitting further is counterproductive.
3. Intermediate-tree validity: tests/build/semantic invariants that the repository
   considers necessary must hold at each published layer. A broken intermediate
   layer is not made reviewable by being smaller.
4. Context-switch cost: flag a layer when its rationale, tests, or required code
   are primarily in non-adjacent layers. Prefer a single coherent layer or an
   explicit exception over a mechanically uniform stack.
5. Reviewer situation: incorporate assigned-reviewer availability, expertise,
   outstanding stack depth, and risk/ownership. These are product inputs, not
   evidence-backed thresholds.

## Concrete implications for `pr-review`

- Keep a draft layer self-contained: concise intent, base/ordering, tests or
  validation, and the expected GitHub-visible file list. This doubles as a
  resumption cue.
- Treat the source branch and zero-diff top PR as navigation/feedback boundaries,
  not as extra conceptual work for a reviewer. Feedback correction layers should
  say which stable comment/problem they address and preserve the surrounding
  layer's story.
- Before publishing, prompt the author to justify any warning override with one of
  three explicit reasons: **one conceptual unit**, **avoid cross-PR context
  switching**, or **preserve a valid intermediate tree**. Permit other reasons,
  but require a short explanation.
- Prefer fewer, coherent layers to many micro-PRs. More PRs can reduce per-diff
  size while increasing queueing, navigation, and resumption costs; the supplied
  evidence does not measure that trade-off well enough to optimise it automatically.
- Collect local, privacy-safe outcome data before introducing calibration: per-layer
  diff breadth, latency, review rounds, reviewer count, and author/reviewer
  assessment of cohesion. Evaluate proposed signals by repository and risk class,
  not against a cross-company magic number.

## Limits and research gaps

The strongest direct studies are observational repository analyses or mixed-method
case studies. They show useful, repeated associations but leave confounding by
change risk, author experience, tooling, reviewer availability, and organisational
norms. The interruption studies provide causal cognitive mechanisms but are not
experiments on stacked GitHub PRs. Accordingly, this research supports an adaptive,
explainable policy and resumption-friendly metadata; it does not support forced
numeric limits or a claim that more layers automatically find more defects.
