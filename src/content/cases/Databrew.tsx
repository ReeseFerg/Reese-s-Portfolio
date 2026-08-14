export default function Databrew() {
  return (
    <article
      className="view case is-active"
      id="case-databrew"
      aria-label="databrew case study"
    >
      <header className="case-hero case-shell">
        <a className="back-link" href="/work">
          ❮ back to work
        </a>
        <p className="crumb">~/reese/work/databrew</p>
        <p className="eyebrow">
          Chromium extension <span className="accent">·</span> Shipping{' '}
          <span className="accent">·</span> [TODO: year]
        </p>
        <h1 className="case-title">[TODO: a statement, not the slug.]</h1>
        <p className="case-lead">
          [TODO: two sentences. What databrew does, who it's for, and what state it's in. Say
          "v1" out loud — a real tool in progress beats a finished-looking concept, but only if
          you're straight about it.]
        </p>

        <figure className="media case-cover">
          <div className="media-frame">
            <div className="media-slot">
              <span className="slot-hint">cover — 1600×900</span>
              the extension open in a browser
            </div>
          </div>
        </figure>
      </header>

      <div className="case-body case-body--brief case-shell">
        <div className="case-main">
          <dl className="case-meta">
            <div>
              <dt>Role</dt>
              <dd>
                [TODO: front end and UI — name it exactly. e.g. Product design, UI, front-end
                build]
              </dd>
            </div>
            <div>
              <dt>Timeline</dt>
              <dd>[TODO: e.g. Ongoing since Mar 2026]</dd>
            </div>
            <div>
              <dt>Team</dt>
              <dd>
                [TODO: you on design + front end, and your data engineer on the back end —
                credit them by name.]
              </dd>
            </div>
            <div>
              <dt>Tools</dt>
              <dd>Figma · Paper · Claude Code</dd>
            </div>
          </dl>

          <section className="chapter" id="databrew-what">
            <p className="eyebrow">01 — What it is</p>
            {/* ~60 words */}
            <h2>[TODO: what it does, in one claim.]</h2>
            <p>
              [TODO: the tool in three sentences. Who asked for it and why it needed to exist.]
            </p>
          </section>

          <section className="chapter" id="databrew-problem">
            <p className="eyebrow">02 — The problem</p>
            {/* ~70 words */}
            <h2>[TODO: the problem as a sentence someone would say out loud.]</h2>
            <p>
              [TODO: what the manual version cost — the time, the tab-switching, the thing that
              got missed. You have a real user sitting next to you; quote them.]
            </p>
          </section>

          <section className="chapter" id="databrew-design">
            <p className="eyebrow">03 — What I designed</p>
            {/* ~110 words. This is the chapter that earns the page — go deeper here
                 than anywhere else in this case study. */}
            <h2>[TODO: the design decision you're proudest of.]</h2>
            <p>
              [TODO: the constraints an extension puts on you — small surface, no attention to
              spare, someone mid-task. What did you cut to fit, and why that and not something
              else?]
            </p>

            <figure className="media media--wide">
              <div className="media-frame">
                <div className="media-slot">
                  <span className="slot-hint">2000×1250</span>the main view, full width
                </div>
              </div>
              <figcaption>
                [TODO: caption — what this shows and what it settled. It has to stand on its own
                for someone who read nothing else.]
              </figcaption>
            </figure>

            <figure className="media">
              <div className="media-frame">
                <div className="media-grid media-grid--2">
                  <div className="media-slot">
                    <span className="slot-hint">1200×900</span>a state worth explaining — empty,
                    loading, error
                  </div>
                  <div className="media-slot">
                    <span className="slot-hint">1200×900</span>a detail you sweated
                  </div>
                </div>
              </div>
              <figcaption>[TODO: caption — say what it shows, not what it is.]</figcaption>
            </figure>
          </section>

          <section className="chapter" id="databrew-next">
            <p className="eyebrow">04 — Where it's going</p>
            {/* ~60 words */}
            <h2>[TODO: what happens next.]</h2>
            <p>
              [TODO: what's built, what isn't, and what "done" looks like. Naming what's left
              reads as judgement, not as an excuse.]
            </p>
          </section>
        </div>
      </div>

      <footer className="case-footer case-shell">
        <a className="next-case" href="/work/savr-app">
          <div>
            <p className="eyebrow">Next project</p>
            <p className="next-case-title">savr-app</p>
            <p className="next-case-desc">
              [TODO: one line on why someone who read this should read that one.]
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
