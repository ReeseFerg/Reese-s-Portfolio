import MediaFrame from '../../components/case/MediaFrame';

export default function NorthCoastBjj() {
  return (
    <article
      className="view case is-active"
      id="case-north-coast-bjj"
      aria-label="north-coast-bjj case study"
    >
      <header className="case-hero case-shell">
        <a className="back-link" href="/work">
          ❮ back to work
        </a>
        <p className="crumb">~/reese/work/north-coast-bjj</p>
        <p className="eyebrow">
          [TODO: work type — e.g. Booking site] <span className="accent">·</span> Client project{' '}
          <span className="accent">·</span> [TODO: year]
        </p>
        {/* Title: 40–60 characters, a claim rather than a label.
             Lead: ~40 words. Between the eyebrow, the title and this, a stranger should
             know what kind of thing this is before they scroll. */}
        <h1 className="case-title">High Impact, Low Cost</h1>
        <p className="case-lead">
          [TODO: two sentences. What the club needed, and what changed because you worked on it.
          This is the only project where you had a real client, real users and a finished
          product — say so early.]
        </p>

        {/* Worked example of MediaFrame. To drop the real screenshot in:
              import cover from '../../assets/bjj-cover.png';
              <MediaFrame className="case-cover" src={cover} width={1600} height={900}
                alt="The finished booking site on desktop" /> */}
        <MediaFrame className="case-cover" hint="cover — 1600×900">
          hero shot of the finished, live site
        </MediaFrame>
      </header>

      <div className="case-body case-shell">
        {/* Buttons, not anchors: the site is hash-routed, so an in-page #anchor
             would be read as a route and bounce you back to the terminal. */}
        <aside className="case-toc" aria-label="Contents">
          <p className="toc-label">Contents</p>
          <ol>
            <li>
              <button className="toc-link" data-target="bjj-context">
                <span className="toc-num">01</span> Context
              </button>
            </li>
            <li>
              <button className="toc-link" data-target="bjj-problem">
                <span className="toc-num">02</span> Problem
              </button>
            </li>
            <li>
              <button className="toc-link" data-target="bjj-research">
                <span className="toc-num">03</span> Research
              </button>
            </li>
            <li>
              <button className="toc-link" data-target="bjj-solution">
                <span className="toc-num">04</span> Solution
              </button>
            </li>
            <li>
              <button className="toc-link" data-target="bjj-craft">
                <span className="toc-num">05</span> Craft
              </button>
            </li>
            <li>
              <button className="toc-link" data-target="bjj-outcome">
                <span className="toc-num">06</span> Outcome
              </button>
            </li>
            <li>
              <button className="toc-link" data-target="bjj-reflection">
                <span className="toc-num">07</span> Reflection
              </button>
            </li>
          </ol>
          <button className="toc-top" data-target="top">
            ↑ back to top
          </button>
        </aside>

        <div className="case-main">
          <dl className="case-meta">
            <div>
              <dt>Role</dt>
              <dd>Solo Product Designer</dd>
            </div>
            <div>
              <dt>Timeline</dt>
              <dd>Six Months · Nov 25 - Apr 26</dd>
            </div>
            <div>
              <dt>Team</dt>
              <dd>
                [TODO: who else, and what they did. "Solo, with the club owner as stakeholder"
                is a real answer.]
              </dd>
            </div>
            <div>
              <dt>Tools</dt>
              <dd>Figma · Framer · Claude Code</dd>
            </div>
          </dl>

          <div className="impact-row">
            <div>
              <p className="stat-value">260x</p>
              <p className="stat-label">Increase in site users compared to old website</p>
            </div>
            <div>
              <p className="stat-value">66% Less</p>
              <p className="stat-label">
                The bounce rate reduced to 33% compared from old site
              </p>
            </div>
            <div>
              <p className="stat-value">[0×]</p>
              <p className="stat-label">
                [TODO: speed, reach, or scale. No number? Use scope — "3 pages, 1 booking flow,
                12 members onboarded".]
              </p>
            </div>
          </div>

          <section className="chapter" id="bjj-context">
            <p className="eyebrow">01 — Context</p>
            {/* ~70 words */}
            <h2>What Makes Us Different?</h2>
            <p>
              [TODO: who the club is and where things stood when you arrived. An interviewer
              needs the stakes before they'll care about the problem.]
            </p>
            <p>
              [TODO: your remit. What were you actually asked to do, and what did you decide to
              do instead?]
            </p>
          </section>

          <section className="chapter" id="bjj-problem">
            <p className="eyebrow">02 — Problem</p>
            {/* ~90 words including the list. e.g. "The cracks were small, but they were everywhere." */}
            <h2>[TODO: the problem as a sentence someone would say out loud.]</h2>
            <p>
              [TODO: what was broken, for whom, and what it cost the club — enquiries lost,
              questions answered twice, people who never walked in.]
            </p>

            <ol className="pain-list">
              <li>[TODO: first pain point, stated concretely.]</li>
              <li>[TODO: second pain point.]</li>
              <li>[TODO: third pain point.]</li>
            </ol>

            <blockquote className="callout">
              <p>[TODO: the single quote or data point that made the problem undeniable.]</p>
              <cite>[TODO: source — member interview, the owner, enquiry log]</cite>
            </blockquote>
          </section>

          <section className="chapter" id="bjj-research">
            <p className="eyebrow">03 — Research</p>
            {/* ~110 words including the insight cards. Quotes don't count against it.
                 This chapter is your edge over every other junior portfolio — you talked
                 to actual users of an actual business. Most course projects didn't. */}
            <h2>[TODO: what you went looking for, and the thing you didn't expect to find.]</h2>
            <p>
              [TODO: method and sample in one line — "6 member interviews, 2 sessions watching
              people try to book." Then what it told you.]
            </p>

            <div className="quote-stack">
              <div className="quote-user">
                <p>[TODO: verbatim quote. Leave the grammar messy — it reads as real.]</p>
                <span className="attr">[TODO: e.g. member, 8 months training]</span>
              </div>
              <div className="quote-user">
                <p>
                  [TODO: a second quote that contradicts the first, if you have one. Tension is
                  more interesting than consensus.]
                </p>
                <span className="attr">[TODO: e.g. prospective member, never trained]</span>
              </div>
            </div>

            <div className="card-grid">
              <div className="insight-card">
                <h3>[TODO: insight one]</h3>
                <p>[TODO: one or two lines on what it meant for the design.]</p>
              </div>
              <div className="insight-card">
                <h3>[TODO: insight two]</h3>
                <p>[TODO: one or two lines.]</p>
              </div>
              <div className="insight-card">
                <h3>[TODO: insight three]</h3>
                <p>[TODO: one or two lines.]</p>
              </div>
            </div>

            <figure className="media media--wide">
              <div className="media-frame">
                <div className="media-grid media-grid--2">
                  <div className="media-slot">
                    <span className="slot-hint">1200×900</span>affinity map / research wall
                  </div>
                  <div className="media-slot">
                    <span className="slot-hint">1200×900</span>journey map or current-state flow
                  </div>
                </div>
              </div>
              <figcaption>
                [TODO: caption — what this shows and what it settled. It has to stand on its own
                for someone who read nothing else.]
              </figcaption>
            </figure>
          </section>

          <section className="chapter" id="bjj-solution">
            <p className="eyebrow">04 — Solution</p>
            {/* ~150 words — the longest chapter, and the only one that earns it.
                 Frame it around what it does for the user, not what you built.
                 Answer "why" at every turn: why this shape, why not the obvious one. */}
            <h2>[TODO: the solution in one claim.]</h2>
            <p>
              [TODO: the idea in three sentences. If you can't explain it without a screenshot,
              it isn't clear yet.]
            </p>

            <figure className="media media--wide">
              <div className="media-frame">
                <div className="media-slot">
                  <span className="slot-hint">2000×1250</span>the key screen, full width
                </div>
              </div>
              <figcaption>
                [TODO: point at the one decision this screen is evidence of.]
              </figcaption>
            </figure>

            <h3>[TODO: first key flow or feature]</h3>
            <p>
              [TODO: what the user does, what the interface does back, and the decision you made
              here. <span className="mark">Highlight the phrase you want remembered</span> —
              sparingly, once or twice a page.]
            </p>

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
              <figcaption>[TODO: the flow, in three states.]</figcaption>
            </figure>

            <h3>[TODO: second key flow or feature]</h3>
            <p>[TODO: same shape — action, response, decision.]</p>

            <figure className="media">
              <div className="media-frame">
                <div className="media-slot">
                  <span className="slot-hint">1440×900</span>supporting screen or component
                  detail
                </div>
              </div>
              <figcaption>
                [TODO: caption — what this shows and what it settled. It has to stand on its own
                for someone who read nothing else.]
              </figcaption>
            </figure>
          </section>

          <section className="chapter" id="bjj-craft">
            <p className="eyebrow">05 — Craft</p>
            {/* ~80 words. This is the section that separates you from other candidates —
                 be specific, and be straight about which parts the AI carried. */}
            <h2>[TODO: how it actually got built.]</h2>
            <p>
              [TODO: AI in the loop, specifically. Which parts did you shape in Figma or Paper,
              what did you pressure-test, and what did you ship with Claude Code? Name the
              trade-off you made to move faster.]
            </p>

            <figure className="media media--wide media--video">
              <div className="media-frame">
                <div className="media-slot">
                  <span className="slot-hint">screen recording — 1600×1000</span>
                  the live site being used, or the build in progress
                </div>
              </div>
              <figcaption>[TODO: what to watch for in the recording.]</figcaption>
            </figure>
          </section>

          <section className="chapter" id="bjj-outcome">
            <p className="eyebrow">06 — Outcome</p>
            {/* ~70 words. Didn't succeed? Say so, then say what made it worth doing anyway. */}
            <h2>[TODO: what actually changed.]</h2>
            <p>
              [TODO: results against the stats at the top. If you don't have numbers, say what
              shipped, who uses it, and what the owner said — honest beats inflated, and
              interviewers can tell. A live URL is worth more here than a percentage you can't
              source.]
            </p>

            <figure className="media">
              <div className="media-frame">
                <div className="media-slot">
                  <span className="slot-hint">1440×900</span>shipped site, in context
                </div>
              </div>
              <figcaption>
                [TODO: caption — what this shows and what it settled. It has to stand on its own
                for someone who read nothing else.]
              </figcaption>
            </figure>
          </section>

          <section className="chapter" id="bjj-reflection">
            <p className="eyebrow">07 — Reflection</p>
            {/* ~60 words including the cards. */}
            <h2>[TODO: what you'd do differently.]</h2>
            <p>[TODO: one real regret and one thing you'd keep. Specific beats humble.]</p>

            <div className="card-grid">
              <div className="insight-card">
                <h3>[TODO: what worked]</h3>
                <p>[TODO: and why you'd do it again.]</p>
              </div>
              <div className="insight-card">
                <h3>[TODO: what didn't]</h3>
                <p>[TODO: and what you'd change.]</p>
              </div>
              <div className="insight-card">
                <h3>[TODO: what's next]</h3>
                <p>[TODO: where you'd take it with more time.]</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="case-footer case-shell">
        {/* Points at /work while databrew is still a draft — see draft: true in
            src/lib/site.ts. The build refuses to ship a link to an unpublished
            case, so change this back to /work/databrew when that one goes live. */}
        <a className="next-case" href="/work">
          <div>
            <p className="eyebrow">Next project</p>
            <p className="next-case-title">databrew</p>
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
