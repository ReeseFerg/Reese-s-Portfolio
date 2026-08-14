export default function SavrApp() {
  return (
    <article
      className="view case is-active"
      id="case-savr-app"
      aria-label="savr-app case study"
    >
      <header className="case-hero case-shell">
        <a className="back-link" href="/work">
          ❮ back to work
        </a>
        <p className="crumb">~/reese/work/savr-app</p>
        <p className="eyebrow">
          Mobile app concept <span className="accent">·</span> Course project{' '}
          <span className="accent">·</span> 2026
        </p>
        <h1 className="case-title">[TODO: a statement, not the slug.]</h1>
        <p className="case-lead">
          [TODO: two sentences. What the app is and who it's for. Then say plainly that it's a
          self-directed concept from the Google UX Design Certificate, taken to high-fidelity
          Figma prototype and user-tested — not shipped.]
        </p>

        <figure className="media case-cover">
          <div className="media-frame">
            <div className="media-slot">
              <span className="slot-hint">cover — 1600×900</span>
              hero shot of the prototype
            </div>
          </div>
        </figure>
      </header>

      <div className="case-body case-body--brief case-shell">
        <div className="case-main">
          <dl className="case-meta">
            <div>
              <dt>Role</dt>
              <dd>[TODO: solo — research, IA, UI, prototype]</dd>
            </div>
            <div>
              <dt>Timeline</dt>
              <dd>[TODO: e.g. 6 weeks, 2026]</dd>
            </div>
            <div>
              <dt>Team</dt>
              <dd>Solo — self-directed course project</dd>
            </div>
            <div>
              <dt>Tools</dt>
              <dd>Figma</dd>
            </div>
          </dl>

          <section className="chapter" id="savr-brief">
            <p className="eyebrow">01 — The brief</p>
            {/* ~60 words */}
            <h2>[TODO: the problem you chose, in one claim.]</h2>
            <p>
              [TODO: the brief was yours to set — so say why you picked this one. The choice is
              the signal here, more than the execution.]
            </p>
          </section>

          <section className="chapter" id="savr-research">
            <p className="eyebrow">02 — Research and testing</p>
            {/* ~100 words. The strongest part of this project — you have documented
                 process here that the client work may not. Lead with what changed. */}
            <h2>[TODO: what the testing changed about your design.]</h2>
            <p>
              [TODO: method and sample in one line, then the specific thing a participant did
              that made you go back and redraw something. A design that survived testing
              unchanged is a design that wasn't really tested.]
            </p>

            <blockquote className="callout">
              <p>[TODO: the quote or observation that forced a change.]</p>
              <cite>[TODO: source — usability test, participant 03]</cite>
            </blockquote>
          </section>

          <section className="chapter" id="savr-design">
            <p className="eyebrow">03 — What I designed</p>
            {/* ~100 words */}
            <h2>[TODO: the solution in one claim.]</h2>
            <p>[TODO: the idea in three sentences, framed around what it does for the user.]</p>

            <figure className="media media--phone">
              <div className="media-frame">
                <div className="media-grid media-grid--3">
                  <div className="media-slot">
                    <span className="slot-hint">1179×2556</span>step 1
                  </div>
                  <div className="media-slot">
                    <span className="slot-hint">1179×2556</span>step 2
                  </div>
                  <div className="media-slot">
                    <span className="slot-hint">1179×2556</span>step 3
                  </div>
                </div>
              </div>
              <figcaption>
                [TODO: the core flow, in three states. Say what each one decides.]
              </figcaption>
            </figure>

            <figure className="media media--wide">
              <div className="media-frame">
                <div className="media-grid media-grid--2">
                  <div className="media-slot">
                    <span className="slot-hint">1200×900</span>before — the version testing
                    killed
                  </div>
                  <div className="media-slot">
                    <span className="slot-hint">1200×900</span>after
                  </div>
                </div>
              </div>
              <figcaption>
                [TODO: a before/after is the most persuasive image in this whole case study. Say
                what moved and why.]
              </figcaption>
            </figure>
          </section>

          <section className="chapter" id="savr-reflection">
            <p className="eyebrow">04 — What I'd change</p>
            {/* ~60 words */}
            <h2>[TODO: what you'd do differently now.]</h2>
            <p>
              [TODO: you've done real client work since this. Say what you'd approach
              differently with that behind you — that contrast is the most useful thing this
              project can do for you now.]
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
