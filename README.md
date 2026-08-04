# Aquine Skills

Public catalog for installable plugins and standalone skills. The repository root is itself the
`webapp` plugin: its six bundled skills form an agentic delivery workflow for a non-technical owner,
and can also be copied individually into a project. Additional plugins live under
`plugins/<plugin-name>/`. Every plugin is listed in both marketplace files.

## Plugin catalog

| Plugin | Purpose |
| --- | --- |
| **`webapp`** | Agentic delivery for a non-technical owner: scaffold or adopt a deployed web app, then evolve it from plain-language requests. |
| **`pr-review`** | Keep one mergeable primary PR plus a parallel draft review stack, tracked feedback, and automatic cleanup. |

Install only the plugins you want. Registering the marketplace is a one-time step per host.

### Codex

From a terminal:

```bash
codex plugin marketplace add aquine-kujaruk/skills --ref main
codex plugin add webapp@aquine-skills
codex plugin add pr-review@aquine-skills
```

You can also install them from `/plugins` after adding the marketplace. Start a new Codex task or
CLI session after installation.

### Claude Code

Inside Claude Code:

```text
/plugin marketplace add aquine-kujaruk/skills
/plugin install webapp@aquine-skills
/plugin install pr-review@aquine-skills
```

Run `/reload-plugins` if Claude Code asks for it.

### Plugin invocations

| Plugin | Codex | Claude Code |
| --- | --- | --- |
| `webapp` | `$webapp:setup`, `$webapp:adopt`, `$webapp:next` | `/webapp:setup`, `/webapp:adopt`, `/webapp:next` |
| `pr-review` | `$pr-review:config`, `$pr-review:start`, `$pr-review:feedback` | `/pr-review:config`, `/pr-review:start`, `/pr-review:feedback` |

Run `pr-review:config` once in each repository before using `start` or `feedback`.

Refresh the catalog after future releases with `codex plugin marketplace upgrade aquine-skills`
or `/plugin marketplace update aquine-skills` in Claude Code.

See the official [Codex plugin packaging guide](https://developers.openai.com/plugins/build/plugins)
and [Claude Code marketplace guide](https://code.claude.com/docs/en/plugin-marketplaces).

## Webapp plugin

Six skills that take a web app from wherever it is today — an **empty GitHub repository**,
or **one that is already live on somebody else's stack** — to something that keeps shipping
because a person described what they wanted, in plain words.

There is no code template here. The application is scaffolded at setup time by the
framework's own CLI, so a project started next year starts on next year's Next.js rather
than on whatever was current when this was written. What these skills carry is the part a
CLI can't: the security shape, the deployment path, and the working method.

**The stack is Next.js on Vercel with Supabase, and setup picks it without asking** —
frontend and backend in one deployable unit, managed Postgres behind it, a deploy path
that needs no credentials, and an ecosystem deep enough that almost any later request has a
well-trodden answer. Setup only raises the question when something in the request genuinely
rules it out: a native app, a data-residency rule, long-running or heavily concurrent work.
An existing codebase is the fourth, and it isn't a stop — it's `adopt`'s job. Setup
scaffolds with `create-next-app` **bare** rather than a Supabase starter, because those put
a database key in the browser and make RLS policies the guard — the inverse of the shape
below.

**Only that greenfield path is Vercel + Supabase.** Everything after it is
provider-agnostic: `next` reads the project's `CLAUDE.md` for the repository, the host, the
database and the commands, and never hardcodes any of them — which is what lets an adopted
app carry on running exactly where it already runs.

| Skill | When it runs |
| --- | --- |
| **`setup`** | First message in an empty repository. Picks the stack, scaffolds the app, creates the database, gets it deployed, verifies it is live *and* closed from outside, then writes the project's `CLAUDE.md`, `ADR.md` and `CONTEXT.md`. |
| **`adopt`** | First message in a repository that already has a live app and no `CLAUDE.md` from this method. Surveys what it really runs on, establishes a health check **before touching anything**, interviews the client about everything pointed at it, lays out what could move here and what should stay, adds a CI gate, writes the same three files. It never changes application code. |
| **`next`** | Every request after that. Interviews in plain language, writes an issue, hands it to agents, waits for a green check, merges, and verifies production. Nobody types it — it is the default way of working. |
| **`migrate`** | When data that already exists has to move. Read-only export first, a profile of what the source really contains confirmed with the client, a load into a copy that is verified before anything points at it, a freeze window they agreed, and a cutover with a health check either side. The source is never deleted. |
| **`gaps`** | At the end of a delivery, names **one** thing the app is missing that nobody knew to ask for — terms of use, a privacy notice, sign-in, backups, rate limiting. One per session, in plain language, and always as its own separate issue. |
| **`graphify`** | A local knowledge graph of the repository, so a change is planned against what it actually touches instead of against grep. |

Above all six sits one rule: **production stays up.** The health check runs before every
merge and again after every deploy, and nothing is ever reverted or redeployed on an
agent's own judgement. On an adopted project that rule arrives before anything else does —
there is already a production, and it is somebody's livelihood.

## Installing webapp skills individually

The six root skills can be copied into a project without installing the `webapp` plugin:

```bash
npx skills add aquine-kujaruk/skills --skill '*' --agent claude-code --copy -y
```

They land in `.claude/skills/` and get committed with the project, so they travel with it. To copy
only one, replace `--skill '*'` with a skill name such as `--skill setup`.

Don't use `--all` here: it is shorthand for `--agent '*'`, which writes the same skills into
fifty-odd other agents' directories. `--copy` matters too — the default symlinks into a
cache that won't exist on anyone else's machine or in CI.

Either way, the next thing to do is just talk to it.

## Starting a project from nothing

1. Create an **empty** repository on GitHub. Don't tick "Add a README" — the Next.js
   scaffolder refuses to write into a directory that already has one, and setup then has
   to work around it.
2. Open it in Claude Code — [claude.ai/code](https://claude.ai/code) needs nothing
   installed.
3. Say: *"install the skills from github.com/aquine-kujaruk/skills and set this up"*.

From there it asks, you answer. About fifteen minutes, most of it waiting on Vercel.

You need free accounts on **Vercel** and **Supabase**, and their two connectors enabled in
Claude's settings — that is the first thing setup checks.

**Three steps in the middle are yours**, because no connector is allowed to do them:
connecting the repository to Vercel, copying one secret key out of Supabase, and pasting
it into Vercel. Each one comes with exactly where to click and what you should see when it
worked.

After that you never touch any of it again. You say *"let people add a photo to each
entry"* and it gets built, checked and deployed.

## Bringing in a project that already exists

Same three skills afterwards, a different door in.

1. Open the repository the app already lives in — the real one, with its history.
2. Say: *"install the skills from github.com/aquine-kujaruk/skills and adopt this"*.
3. Answer the questions. Most are things the code can't tell it: who uses it, where the
   domain is registered, whether there's email on that domain, what must never break.

It reads the project before it asks you anything, and **the first thing it does after that
is find out whether the app is healthy right now.** If it can't tell, it stops there and
says so — nothing is changed on top of a production nobody can verify.

What you end up with is a check that runs on every change from then on, three files
describing what you actually own, and a written proposal of what could move onto this
method's own stack — cheapest and most reversible first, with what each one buys you and
what it risks. **Nothing moves unless you say so**, each thing you accept ships on its own,
and leaving everything exactly where it is is a perfectly normal outcome. It doesn't touch
your application code either way.

Moving the data is never part of adoption. That is `migrate`, on its own day, with a
window you agreed — and the old copy kept forever, because it is the only rollback there is.

## What gets built

This is what `setup` produces from nothing. An adopted project keeps its own shape until
its owner decides otherwise — this is the target `adopt` describes to them, not something
it imposes.

```
Browser ──fetch /api/*──► Vercel Lambda ──service_role──► Supabase
(no keys)                 (Next.js)                       (RLS closed)
```

The browser never holds a database credential. Tables have row-level security on with **no
policies**, so the public key grants nothing and every read and write goes through the
server. Two properties enforce it at build time rather than by discipline: no variable
carries a `NEXT_PUBLIC_` prefix, and the file that reads credentials imports `server-only`,
so the build *fails* if client code ever touches it.

Setup verifies both directions before calling itself done — that the app can reach the
database, and that nobody outside can.

## Notes for whoever runs this for other people

- **Visibility matters.** `npx skills add` clones the repository, so if this one is
  private, a client can't install from it without being given access. Public is the
  frictionless option; per-client collaborator access is the controlled one.
- **One Supabase project and one Vercel project per client.** Nothing is shared.
- Doing the three human steps yourself before handing the repository over is fine — setup
  detects what's already done, verifies it, and moves on.
- Each project's `CLAUDE.md` is written once — by `setup` or by `adopt` — and diverges
  from here afterwards. That
  is intended: these skills hold the method, the project holds its own facts. Improvements
  worth keeping come back here by hand.
