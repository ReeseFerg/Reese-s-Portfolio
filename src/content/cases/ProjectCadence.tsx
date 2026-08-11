export default function ProjectCadence() {
  return (
    <article
      className="view case is-active"
      id="case-project-cadence"
      aria-label="project-cadence case study"
    >
      <header className="case-hero case-shell">
        <a className="back-link" href="/work">
          ❮ back to work
        </a>
        <p className="crumb">~/reese/work/project-cadence</p>
        <p className="eyebrow">
          [TODO: work type] <span className="accent">·</span>{' '}
          <span className="case-status">In progress</span> <span className="accent">·</span>{' '}
          2026
        </p>
        <h1 className="case-title">[TODO: a statement, not the slug.]</h1>
        <p className="case-lead">
          [TODO: two sentences on what it is and who it's for — then say where it actually is.
          "Early. I paused it to build this site" is a perfectly good sentence and a better one
          than an implied finish.]
        </p>

        <figure className="media case-cover">
          <div className="media-frame">
            <div className="media-slot">
              <span className="slot-hint">cover — 1600×900</span>
              whatever exists — early screens, a flow, even the sketch
            </div>
          </div>
        </figure>
      </header>

      <div className="case-body case-body--brief case-shell">
        <div className="case-main">
          <dl className="case-meta">
            <div>
              <dt>Role</dt>
              <dd>[TODO: design and front end]</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>[TODO: e.g. Early — direction set, build not started]</dd>
            </div>
            <div>
              <dt>Team</dt>
              <dd>
                [TODO: you on design + front end, your data engineer on the back end — credit
                them by name.]
              </dd>
            </div>
            <div>
              <dt>Tools</dt>
              <dd>Figma · Paper · Claude Code</dd>
            </div>
          </dl>

          <section className="chapter" id="cadence-what">
            <p className="eyebrow">01 — What it is</p>
            {/* ~70 words */}
            <h2>[TODO: the idea in one claim.]</h2>
            <p>
              [TODO: what it does and why it's worth building. An early project is judged on
              whether the thinking is good, so put the thinking here.]
            </p>
          </section>

          <section className="chapter" id="cadence-where">
            <p className="eyebrow">02 — Where it's at</p>
            {/* ~70 words */}
            <h2>[TODO: what's decided and what isn't.]</h2>
            <p>
              [TODO: what exists today, what you're weighing next, and what you'll know once
              you've built it. Naming the open question is the whole point of showing an
              unfinished project — it's the thing you can talk about for ten minutes in an
              interview.]
            </p>
          </section>
        </div>
      </div>

      <footer className="case-footer case-shell">
        <a className="next-case" href="/work/north-coast-bjj">
          <div>
            <p className="eyebrow">Next project</p>
            <p className="next-case-title">north-coast-bjj</p>
            <p className="next-case-desc">
              [TODO: one line — this is the one you most want them to read, so make it pull.]
            </p>
          </div>
          <div className="media-slot">
            <span className="slot-hint">800×500</span>thumbnail
          </div>
        </a>
        <p className="case-closing">
          [TODO: a closing line with some personality.]{' '}
          <span className="accent">Let's build something.</span>
        </p>
        <p className="case-contact">
          <a href="mailto:reesefergie@gmail.com">reesefergie@gmail.com</a>{' '}
          <span className="sep">·</span> <a href="/contact">more ways to reach me</a>
        </p>
      </footer>
    </article>
  );
}
