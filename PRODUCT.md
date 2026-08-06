# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: hiring managers and recruiters for junior-to-mid UX and product design roles.**
They arrive from a job application, a LinkedIn profile, or a link someone sent them. They
are scanning, not reading, often on a phone, and often with a stack of other candidates
open. Their job is a single binary decision: is this person worth an interview?

They are not looking for a comprehensive record of everything Reese has done. They are
looking for evidence that Reese can identify a real problem, make defensible decisions
about it, and finish. Most junior portfolios fail that test by showing polished screens
with no reasoning attached.

**Secondary: Reese.** The site is maintained in code by one person who is a designer
first. Anything that makes editing it feel like software engineering will rot.

## Product Purpose

Get Reese interviews.

That is the whole purpose and the only success measure. Not traffic, not time on page,
not a design-community audience. A visit that ends in a message is a success; a visit
that ends in admiration is not.

Reese is targeting a mixture of junior/graduate UX designer and product designer roles.
Design-engineering ability is developing in practice — they design and ship front end
with Claude Code — but that is a growing capability, not the job title being applied for.
The site should not narrow to a design-engineering pitch.

## Positioning

**Reese's work leaves the Figma file.** A live client site, a working extension, and a
portfolio that is hand-built rather than templated. For a candidate at this level, that
is the uncommon part — most competing portfolios stop at mockups, and the ability to
carry a decision all the way into something people can use is what separates them.

The related claim — that Reese designs *with AI in the loop* — is currently **undecided**
as a positioning commitment (see Open Decisions). It is present throughout the existing
site and its content rules, but Reese has not confirmed whether it should be the
headline, a factual credit inside the work, or played down. Future work must not resolve
this unilaterally in either direction.

## Operating Context

- The read is roughly three minutes, total, across the whole site. Case study copy is
  budgeted to about 700 words each for exactly this reason; the budgets are in
  `CASE-STUDIES.md` and are a product constraint, not a style preference.
- Readers scan eyebrows, headlines and captions before they read body copy. The
  content rules require that pass alone to explain a project.
- The site is itself a piece of evidence. It is hand-built, and one of the three entries
  in the "things that are live" strip is this repository.
- Reese works with Claude Code in the loop, in Conductor workspaces, alongside Figma,
  Paper, Framer and Linear.

## Capabilities and Constraints

- Static site: Vite + React + TypeScript, built to static files. No backend, no database,
  no CMS. All content lives in the repo and is edited as code.
- Four projects, at deliberately uneven depth: one full case study, two brief, one
  briefest. This is a decision already made — four half-finished case studies read worse
  than one that goes all the way.
- Reese owns design and front end. On databrew and project-cadence, a data engineer owns
  the back end. That engineer's name is not yet recorded here and must be credited by
  name in both case studies.
- The case study copy does not exist yet: 121 `[TODO: …]` markers remain in
  `src/content/cases/`.
- Motion must respect `prefers-reduced-motion`; the existing build honours it throughout
  and any future animation work inherits that constraint.

## Brand Commitments

- **Name:** Reese Ferguson. Contact email `reesefergie@gmail.com` is real and public.
- **Incumbent identity:** a terminal interface, styled after the Claude Code welcome
  screen. This is the existing visual world and is treated as authority, not as a
  placeholder awaiting replacement.
- **Voice (confirmed, from `CASE-STUDIES.md`):** no acronyms, no buzzwords, no lofty
  language. Written the way Reese would say it out loud, then tightened. If everything is
  "award-winning" and "revolutionising", it is trying too hard.
- **Honest credit (confirmed):** say what Reese owned and what they did not — including
  which parts a collaborator carried and which parts the AI carried. Vagueness about role
  is the specific thing interviewers screen for.
- **Brag where earned.** The portfolio is the one place that gets a free pass.

## Evidence on Hand

Confirmed by Reese. **Anything not listed here does not exist and must not be written
into a case study.**

**north-coast-bjj** — the only project with a real client, and the only one with primary
user research.
- Live, with a public URL. The URL itself is not yet recorded in the repo.
- Built with Framer.
- **Usability testing across multiple versions of the site**, with **interviews conducted
  after the sessions**. Reese has notes from these. Testing more than one version is a
  stronger method than most portfolios at this level can show, and it is the spine of the
  Research chapter.
- Notes and recollection from the stakeholder side: conversations with the club owner.
- Reese's own first-hand experience of the old site.
- Quantitative data: Google Business Profile analytics and Framer analytics. These are the
  realistic source of the three impact stats.

Participant count, session format, and whether the notes contain verbatim quotes are not
yet recorded here — see Open Decisions. Write the Research chapter from the notes, not
from memory of them.

**databrew** — a private repository and working prototype. Not public, not installable,
no store listing, no external users yet. Design and front end by Reese; back end by the
data engineer.

**savr-app** — a Google UX Certificate course project. What documentation survives from it
was not established in this interview; treat its contents as unknown until Reese checks.
Its labelling is settled regardless: "course project" appears in both the eyebrow and the
lead, because a hiring manager working that out for themselves is the damaging outcome.

**project-cadence** — early. Nothing public, no users.

**This repository** — real, and cited on the work page as evidence.

**Absent:** testimonials, press, named clients beyond the jiu-jitsu club, published
metrics, and any employment history in the About page (still a TODO). `public/resume.pdf`
is a generated placeholder, not a real CV.

## Product Principles

1. **Shipped beats speculative.** Lead with what left the Figma file and reached a real
   user. It is the strongest and least common thing this candidate has.
2. **Never fabricate evidence.** Where research did not happen, say what did happen
   instead. Stakeholder conversations, first-hand use and analytics are real inputs and
   can carry a case study honestly; invented interviews cannot survive an interview.
3. **Credit precisely, including the parts Reese did not do.** Collaborators by name, and
   the AI's contribution stated plainly.
4. **Three minutes is the whole budget.** Depth is spent where it has been earned, which
   currently means one project. Over budget means cutting a point, not tightening the
   leading.
5. **It has to sound like a person.** The reader should finish with a sense of who Reese
   is — that is most of what separates them from the other qualified candidate.

## Accessibility & Inclusion

No client requirement was established. The build already honours `prefers-reduced-motion`
throughout, is keyboard-navigable end to end including the terminal, and ships a skip
link — future work maintains this rather than treating it as optional.

## Open Decisions

Recorded as undecided. Do not resolve these without Reese.

- **The AI-in-the-loop position** — headline differentiator, honest factual credit, or
  played down. Undecided.
- **Role focus** — currently a mixture of junior UX designer and product designer, with
  design-engineering ability growing. Not narrowed.
- **Hosting and domain** — undecided. `SITE_URL` in `src/lib/site.ts` is a placeholder
  guess and drives every canonical URL, sitemap entry and social tag.
- **Case study typeface** — four presets remain live behind the dev panel.
- **north-coast-bjj research detail** — how many people took part, what the sessions
  looked like, which versions were compared, and whether the notes hold verbatim quotes.
  The research happened and the notes exist; the specifics just aren't written down here
  yet, and the Research chapter needs them to name the method precisely.
- **Unrecorded facts** — the data engineer's name, the north-coast-bjj live URL, the
  LinkedIn URL, and the real résumé.
