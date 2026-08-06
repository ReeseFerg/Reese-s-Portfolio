# Case study content

Write the copy here first, then paste it into `index.html`. That order is deliberate —
writing to fit a layout is how case studies end up saying nothing at length.

Sources these rules come from:
- [How to write case studies for your portfolio](https://www.semplice.com/how-to-write-case-studies-for-your-portfolio) — Semplice
- [How to create your about page](https://www.semplice.com/how-to-create-your-about-page) — Semplice

---

## The rules

**Three minutes, tops.** That's the whole read. Budget roughly 700 words of body copy:

| Section | Words |
|---|---|
| Lead | 40 |
| 01 Context | 70 |
| 02 Problem | 90 |
| 03 Research | 110 |
| 04 Solution | 150 |
| 05 Craft | 80 |
| 06 Outcome | 70 |
| 07 Reflection | 60 |
| Each caption | ~15 |

Over budget means cutting a point, not tightening the leading. "We don't get extra
points for word count anymore."

**People scan, they don't read.** The test: read only the eyebrows, headlines and
captions, top to bottom, and nothing else. If that pass doesn't explain the project,
the captions are doing too little. A caption that names the artefact ("affinity map")
is wasted — say what it shows and what it settled.

**Name the work type.** "Nike Air Max ecommerce experience", not "Nike Air Max". On this
site it goes in the eyebrow, which leaves the title free to be a claim rather than a
label.

**Credit honestly.** Say what you owned and what you didn't. Being straight about your
role "can mean the difference between getting hired or not" — and on this portfolio it
extends to the AI: which parts you shaped, which parts Claude Code carried, what you
pressure-tested before you trusted it. Interviewers are already wondering. Answering it
first is the strong move.

**Your voice.** No acronyms, no buzzwords, no lofty language. Write it how you'd say it
out loud, then tighten. If everything is "award-winning" and "revolutionising", you're
trying too hard. Someone should finish the page with a sense of your personality —
that's most of what separates you from the other qualified candidate.

**Brag where you've earned it.** This is the one place you get a free pass.

**Answer "why" repeatedly.** Why this shape, why not the obvious one, why you changed
your mind. The decisions are the portfolio; the screens are evidence.

**Each story is its own shape.** The seven chapters are a default, not a template.
Treat each case like a magazine feature — a different one. The TOC and scroll-spy read
whatever `.chapter` sections they find inside the article, so dropping, renaming or
reordering chapters per project costs nothing beyond editing the TOC list next to it.
Four identically-structured case studies read as a CMS; four differently-shaped ones
read as someone who thought about each project.

---

## One deep, three brief

Four half-finished case studies read worse than one that goes all the way. The site is
now built around that, ordered strongest first:

| Project | Depth | Why |
|---|---|---|
| **north-coast-bjj** | Full — 7 chapters, sticky TOC, impact stats, every component | The only one with a real client, real user research and a finished product. This is the portfolio. |
| **databrew** | Brief — 4 chapters, no rail | A real tool for a real user, shipping. Weight goes on "What I designed". |
| **savr-app** | Brief — 4 chapters | Course project. Labelled as one. Its value is the documented testing. |
| **project-cadence** | Briefest — 2 chapters, "In progress" chip | Early. Framed as something you're building, not something that stopped. |

**Write north-coast-bjj first and don't start the others until it's done.** It's the one
that gets you interviews. The other three exist so the site doesn't look empty and so
there's something to talk about once you're in the room.

### On savr-app

Google UX Certificate projects are recognisable on sight, and a lot of applicants
have something very like it. That's survivable — labelled honestly it's fine, and it's
where your most rigorous documented research lives. What isn't survivable is letting a
hiring manager work out for themselves that a "case study" was a course brief. The
eyebrow says **Course project** and the lead says it in words. Leave both in.

### On databrew and project-cadence

You do design and front end; your data engineer does the back end. Say that in the Team
field, by name, on both. It costs nothing and it's the exact thing that reads badly if
someone finds it out later.

---

## Briefs

Field names match the markup, so moving it across is mechanical. Word counts in
brackets are the budget, not a target.

### north-coast-bjj — the deep one

- **Work type** (eyebrow):
- **Title** (40–60 chars, a claim):
- **Lead** [40]:
- **Role** — what you owned:
- **Timeline**:
- **Team** — everyone, by name and contribution:
- **Live URL**:
- **Impact stats** — three. No metrics? Use scope: pages, flows, members onboarded.
  1.
  2.
  3.

| Chapter | Headline | Body |
|---|---|---|
| 01 Context [70] | | |
| 02 Problem [90] | | |
| 03 Research [110] | | |
| 04 Solution [150] | | |
| 05 Craft [80] | | |
| 06 Outcome [70] | | |
| 07 Reflection [60] | | |

- **Pain points** (3, concrete):
- **Problem callout** — the quote or number that made it undeniable, + source:
- **User quotes** (2, verbatim, messy grammar intact — ideally two that disagree):
- **Insights** (3, each with what it meant for the design):
- **Captions** — one per image, each able to stand alone:
- **Closing line** — personality, not a sign-off:

### databrew — brief

- **Title / Lead** [40] · **Role** · **Timeline** · **Team** (incl. your engineer) · **Link**:

| Chapter | Headline | Body |
|---|---|---|
| 01 What it is [60] | | |
| 02 The problem [70] | | |
| 03 What I designed [110] | | |
| 04 Where it's going [60] | | |

### savr-app — brief

- **Title / Lead** [40] — the lead must say "course project" in words:

| Chapter | Headline | Body |
|---|---|---|
| 01 The brief [60] | | |
| 02 Research and testing [100] | | |
| 03 What I designed [100] | | |
| 04 What I'd change [60] | | |

### project-cadence — briefest

- **Title / Lead** [40] — say where it actually is:

| Chapter | Headline | Body |
|---|---|---|
| 01 What it is [70] | | |
| 02 Where it's at [70] | | |

---

## Things that are live

The strip at the bottom of `#/work`. Cheapest credibility on the site — proof that work
leaves the Figma file. Needs real URLs:

- [ ] north-coast-bjj — the live site
- [ ] databrew — repo or store listing
- [ ] this portfolio — the repo

---

## Before it ships

- [ ] Every `[TODO:` is gone (`grep -c 'TODO' index.html`)
- [ ] Caption-only pass explains the project
- [ ] Body copy is inside the word budget
- [ ] Role and team credits are specific, including your engineer and the AI's part
- [ ] savr-app is labelled a course project in the eyebrow *and* the lead
- [ ] The three live links resolve
- [ ] No acronyms or buzzwords survived the last edit
- [ ] Read it out loud — it sounds like you
