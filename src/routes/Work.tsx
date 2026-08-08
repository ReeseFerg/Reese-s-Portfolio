import { Link } from 'react-router-dom';

export default function Work() {
  return (
    <section className="view is-active" id="work" aria-label="Selected work">
      <div className="view-inner">
        <p className="crumb">~/reese/work</p>
        <h1 className="view-title">Selected work</h1>
        <p className="view-lead">
          I design interfaces and then build them — Figma and Paper for the thinking, Claude
          Code for the shipping. Start with north-coast-bjj; it's the one that went all the way.
        </p>

        {/* Ordered strongest first. north-coast-bjj is the only one with a real client,
             real research and a finished product, so it leads and it's the only one that
             gets the full-depth treatment. */}
        <div className="work-grid">
          <Link className="work-card wc-lead" to="/work/north-coast-bjj">
            <span className="wc-title">north-coast-bjj</span>
            <span className="wc-outcome">
              [TODO: one line — real client, real users, live site. Lead with what changed for
              the club.]
            </span>
            <span className="wc-meta">
              <span className="wc-role">[TODO: role]</span> ·{' '}
              <span className="wc-year">[TODO: year]</span> ·{' '}
              <span className="wc-tag">Client · full case study</span>
            </span>
          </Link>
          <Link className="work-card" to="/work/databrew">
            <span className="wc-title">databrew</span>
            <span className="wc-outcome">
              [TODO: one line — a Chromium extension people will actually install. Say what it
              saves them.]
            </span>
            <span className="wc-meta">
              <span className="wc-role">Design &amp; front end</span> ·{' '}
              <span className="wc-year">[TODO: year]</span> ·{' '}
              <span className="wc-tag">Shipping</span>
            </span>
          </Link>
          <Link className="work-card" to="/work/savr-app">
            <span className="wc-title">savr-app</span>
            <span className="wc-outcome">
              [TODO: one line — lead with what user testing changed, not with the concept.]
            </span>
            <span className="wc-meta">
              <span className="wc-role">Solo</span> · <span className="wc-year">2026</span> ·{' '}
              <span className="wc-tag">Course project</span>
            </span>
          </Link>
          <Link className="work-card" to="/work/project-cadence">
            <span className="wc-title">project-cadence</span>
            <span className="wc-outcome">
              [TODO: one line on the idea. It's early — the interesting part is the open
              question.]
            </span>
            <span className="wc-meta">
              <span className="wc-role">Design &amp; front end</span> ·{' '}
              <span className="wc-year">2026</span> ·{' '}
              <span className="wc-tag">In progress</span>
            </span>
          </Link>
        </div>

        <section className="shipped">
          <h2 className="shipped-title">Things that are live</h2>
          <ul className="shipped-list">
            <li>
              <a href="[TODO: north coast bjj URL]" target="_blank" rel="noopener">
                <span className="sh-name">north-coast-bjj</span>
                <span className="sh-desc">[TODO: one line — the site, in the wild]</span>
                <span className="sh-arrow">↗</span>
              </a>
            </li>
            <li>
              <a href="[TODO: databrew repo or store listing]" target="_blank" rel="noopener">
                <span className="sh-name">databrew</span>
                <span className="sh-desc">
                  [TODO: v1 of the extension — link the repo if it isn't listed yet]
                </span>
                <span className="sh-arrow">↗</span>
              </a>
            </li>
            <li>
              <a href="[TODO: this repo's URL]" target="_blank" rel="noopener">
                <span className="sh-name">this site</span>
                <span className="sh-desc">
                  Hand-built — routing, terminal and all. Designed in Figma and Paper, shipped
                  with Claude Code.
                </span>
                <span className="sh-arrow">↗</span>
              </a>
            </li>
          </ul>
        </section>
      </div>
    </section>
  );
}
