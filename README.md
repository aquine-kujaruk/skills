# skills

Four skills that take an **empty GitHub repository** to a deployed web app, and then keep
it moving — driven entirely by someone describing what they want, in plain words.

There is no code template here. The application is scaffolded at setup time by the
framework's own CLI, so a project started next year starts on next year's Next.js rather
than on whatever was current when this was written. What these skills carry is the part a
CLI can't: the security shape, the deployment path, and the working method.

**The stack is Next.js on Vercel with Supabase, and setup picks it without asking** —
frontend and backend in one deployable unit, managed Postgres behind it, a deploy path
that needs no credentials, and an ecosystem deep enough that almost any later request has a
well-trodden answer. Setup only raises the question when something in the request genuinely
rules it out: a native app, a data-residency rule, long-running or heavily concurrent work,
an existing codebase to fit into. It scaffolds with `create-next-app` **bare** rather than
a Supabase starter, because those put a database key in the browser and make RLS policies
the guard — the inverse of the shape below.

| Skill | When it runs |
| --- | --- |
| **`setup`** | First message in an empty repository. Picks the stack, scaffolds the app, creates the database, gets it deployed, verifies it is live *and* closed from outside, then writes the project's `CLAUDE.md`, `ADR.md` and `CONTEXT.md`. |
| **`next`** | Every request after that. Interviews in plain language, writes an issue, hands it to agents, waits for a green check, merges, and verifies production. Nobody types it — it is the default way of working. |
| **`gaps`** | At the end of a delivery, names **one** thing the app is missing that nobody knew to ask for — terms of use, a privacy notice, sign-in, backups, rate limiting. One per session, in plain language, and always as its own separate issue. |
| **`graphify`** | A local knowledge graph of the repository, so a change is planned against what it actually touches instead of against grep. |

Above all four sits one rule: **production stays up.** The health check runs before every
merge and again after every deploy, and nothing is ever reverted or redeployed on an
agent's own judgement.

## Installing them

Into a project, one command:

```bash
npx skills add aquine-kujaruk/skills --all
```

They land in `.claude/skills/` and get committed with the project, so they travel with it.

Or as a Claude Code plugin, which namespaces them as `/webapp:setup` and `/webapp:next`:

```
/plugin marketplace add aquine-kujaruk/skills
/plugin install webapp@aquine-skills
```

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

## What gets built

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
- Each project's `CLAUDE.md` is written at setup and diverges from here afterwards. That
  is intended: these skills hold the method, the project holds its own facts. Improvements
  worth keeping come back here by hand.
