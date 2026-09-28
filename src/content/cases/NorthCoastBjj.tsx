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
          Sports-Club-Funnelling-Site <span className="accent">·</span> Client-project{' '}
          <span className="accent">·</span> 2025-2026
        </p>
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
              <button className="toc-link" data-target="bjj-solution">
                <span className="toc-num">02</span> Solution
              </button>
            </li>
            <li>
              <button className="toc-link" data-target="bjj-build">
                <span className="toc-num">03</span> Build
              </button>
            </li>
            <li>
              <button className="toc-link" data-target="bjj-outcome">
                <span className="toc-num">04</span> Outcome
              </button>
            </li>
            <li>
              <button className="toc-link" data-target="bjj-reflection">
                <span className="toc-num">05</span> Reflection
              </button>
            </li>
          </ol>
          <button className="toc-top" data-target="top">
            ↑ back to top
          </button>
        </aside>

        <div className="case-main">
          <div className="case-intro">
            <h1 className="case-title">
              Converting Potential User Nerves Into Sign-Ups For A New BJJ Gym
            </h1>
            <p className="case-lead">
              Pro bono work redesigning North Coast's local business website by building trust
              signals and funnelling users to class sign-ups.
            </p>

            <dl className="case-facts">
              <div className="case-fact">
                <dt>Role</dt>
                <dd>Solo Product Designer</dd>
              </div>
              <div className="case-fact">
                <dt>Timeline</dt>
                <dd className="is-mono">Seven Months · Nov 2025 - Apr 2026 &amp; Jul 2026</dd>
              </div>
              <div className="case-fact">
                <dt>Tools</dt>
                <dd className="is-hubot">Figma · Framer · Claude Code · Linear</dd>
              </div>
            </dl>

            <MediaFrame className="case-cover" shape="video" hint="hero — gif/video">
              the finished, live site
            </MediaFrame>

            <div className="impact-row">
              <div>
                <p className="stat-value">92</p>
                <p className="stat-label">SEO score evaluation from Lighthouse on mobile</p>
              </div>
              <div>
                <p className="stat-value">50</p>
                <p className="stat-label">forum enquiries in the first 30 days of the site</p>
              </div>
              <div>
                <p className="stat-value">227</p>
                <p className="stat-label">Unique users visited the site in the last 30 days</p>
              </div>
            </div>
          </div>

          <a
            className="case-explore"
            href="https://northcoastbjj.co.uk"
            target="_blank"
            rel="noopener"
          >
            Explore the website <span aria-hidden="true">↗</span>
          </a>

          <section className="chapter" id="bjj-context">
            <p className="eyebrow">Context</p>
            <h2>Helping a Local Business</h2>
            <p>
              North Coast Brazilian Jiu Jitsu is a local club that opened within the last three
              years on a shoestring budget, and Coach Dan has ambitions to expand it in the
              future. Upon deciding that I wanted to help a local business succeed, he gave me a
              simple brief:
            </p>

            <ol className="pain-list">
              <li>
                <span>
                  <strong>Get New Sign-ups</strong> - In order to justify the pricing, the site
                  would need people to actually sign up for classes
                </span>
              </li>
              <li>
                <span>
                  <strong>Reasonably Cheap</strong> - The monthly cost of the site had to be
                  under £20pm
                </span>
              </li>
              <li>
                <span>
                  <strong>Easy to Maintain</strong> - As a layman, Coach Dan wanted an easy way
                  to maintain his new site
                </span>
              </li>
              <li>
                <span>
                  <strong>MVP by Christmas</strong> - The earliest build needed to be completed
                  by Christmas to maximise holiday sign-ups
                </span>
              </li>
            </ol>
          </section>

          <section className="chapter" id="bjj-solution">
            <p className="eyebrow">Solution</p>
            <h2>Site Structure and Trust building</h2>
            <p>
              To get new sign-ups, I needed to understand the barriers to entry for potential
              members. To do this, I conducted user research and testing, using qualitative data
              to inform design choices.
            </p>

            <h3>User Interviews</h3>
            <p>
              Through user testing with a variety of participants from within the club and
              outside the club, of differing ages and genders, I found three findings that
              influenced the design and structure of the site:
            </p>

            <div className="comparison">
              <MediaFrame hint="user interview photo">participant session</MediaFrame>
              <MediaFrame hint="user interview photo">participant session</MediaFrame>
            </div>

            <blockquote className="callout">
              <p>“I was anxious but Dan's way of running (the) class made me feel safe”</p>
              <cite>- Participant B</cite>
            </blockquote>

            <div className="card-grid">
              <div className="insight-card">
                <h3>Community Spirit</h3>
                <p>
                  People within the club expressed how highly they value the community spirit
                  within the club and how the community was one of the most influential factors
                  swaying them to join after their free trial class
                </p>
              </div>
              <div className="insight-card">
                <h3>Social Proof for Women</h3>
                <p>
                  Although social proofing matters to everyone, the female participants
                  highlighted it as very important. Seeing other women in the space would ease
                  fears that the club might be overly masculine and a barrier to entry.
                </p>
              </div>
              <div className="insight-card">
                <h3>Previous Martial Arts Experience</h3>
                <p>
                  Most of the people interviewed from the club had previous experience in other
                  forms of martial arts, stating that the most important information such as
                  what the club atmosphere is like, and the practicalities like class times and
                  location.
                </p>
              </div>
            </div>

            <h3>Funnelling Users Through Trust Signals</h3>
            <p>
              Competitor research showed a lack of social proof and information designed to put
              potential sign-ups at ease. With the hero section pulling people in for more
              information, building user trust as they moved through the sign-up flow was
              crucial to encouraging sign-ups.
            </p>

            <MediaFrame shape="video" hint="gif/video — trust-signal sections">
              the trust-signal sections in use
            </MediaFrame>

            <ol className="pain-list">
              <li>
                <span>
                  <strong>Google Reviews</strong> - Presenting a tamper proof, high trust marker
                  establishes legitimacy
                </span>
              </li>
              <li>
                <span>
                  <strong>Ethos Section</strong> - Gives the user understanding of what the club
                  is about
                </span>
              </li>
              <li>
                <span>
                  <strong>Afilliations Section</strong> - Provides another layer of legitimacy
                  through showing brand connections
                </span>
              </li>
              <li>
                <span>
                  <strong>Pricing</strong> - Eliminating the fear of uncertainty by providing
                  clear pricing guides
                </span>
              </li>
              <li>
                <span>
                  <strong>Timetable</strong> - Once users know they can afford the classes,
                  knowing if they can attend is next
                </span>
              </li>
            </ol>

            <h3>Using Gestalt Principles and Novelty</h3>
            <p>
              Research showed that many of the competitors' websites made the booking process
              clinical and more complex than it needed to be. To funnel users into signing up or
              enquiring, I decided to implement a new approach that would help users remember
              times more easily.
            </p>

            <div className="comparison">
              <MediaFrame hint="competitor timetable" caption="Competitors">
                competitor booking calendar
              </MediaFrame>
              <MediaFrame hint="my timetable design" caption="My Design">
                belt-coloured timetable
              </MediaFrame>
            </div>

            <div className="card-grid">
              <div className="insight-card">
                <h3>Reducing Complexity</h3>
                <p>
                  Competitor websites mostly used the same clinical looking calander booking
                  plugin for their site, with multiple sessions of sometimes differing martial
                  arts. By limiting complexity it reduces choice overload allowing the users to
                  fetch the information quicker by taking into consideration Miller's Law by
                  only having 5 days, whilst making the site some more unique.
                </p>
              </div>
              <div className="insight-card">
                <h3>Colour Chunking</h3>
                <p>
                  Colour chunking by using the colours of BJJ's belt system for each day allowed
                  for information to be easier and quicker to understand with common regions. It
                  also added some fun on brand uniqueness with the novelty helping users remeber
                  class times better.
                </p>
              </div>
            </div>
          </section>

          <section className="chapter" id="bjj-build">
            <p className="eyebrow">Build</p>
            <h2>Designed in Figma, Built in Framer</h2>
            <p>
              Research for this project showed that many web builders (Webflow, Wix &amp;
              Squarespace) have similarly priced entry points, so we chose Framer for these key
              reasons:
            </p>

            <div className="build-reasons">
              <div className="reason-stack">
                <div className="insight-card reason-card">
                  <h3>Reasonable Entry Price Point</h3>
                  <p>
                    Priced at £8 per month, Framer provided everything that was needed, coming
                    in slightly cheaper than the competition: Wix £9/month, Webflow £11.50/month
                    &amp; Squarespace £12/month.
                  </p>
                </div>
                <div className="insight-card reason-card">
                  <h3>Figma to Framer Translation Layer</h3>
                  <p>
                    Using the Framer Plugin in Figma allowed me to translate my designs into
                    Framer more easily than other web builders. It would also bring the added
                    benefit of not purchasing Framers subscription plan till later in the
                    timeline.
                  </p>
                </div>
                <div className="insight-card reason-card">
                  <h3>Great Built in SEO Optimisation</h3>
                  <p>
                    Improved search engine optimisation would help NC BJJ rank higher in search
                    results, increasing the number of unique visitors.
                  </p>
                </div>
                <div className="insight-card reason-card">
                  <h3>Framers Easy to Use GUI</h3>
                  <p>
                    The Framer GUI inside the app is easy to use and similar to Figma, making it
                    easier for the client to use after handover.
                  </p>
                </div>
              </div>

              {/* Figma mark → arrows → Framer mark. Real marks exported from
                  Paper; animated later. */}
              <MediaFrame
                className="framer-graphic"
                shape="square"
                hint="Figma → Framer graphic"
              >
                animated later
              </MediaFrame>
            </div>

            <h3 className="is-lg">Utilising Framers “In Page Editing” Capabilities</h3>
            <p>
              Experimenting with converting Framer designs into Framer code components taught
              that custom components could utilise Framer's editing tool on the live site. After
              speaking with Coach Dan during a bi-weekly check-in, he told me he didn't feel
              comfortable using the Framer app. So I decided the time trade-off of converting
              all the sections into Framer Components was worth it for the guardrails it added
              to live-site editing.
            </p>

            <MediaFrame shape="video" hint="gif/video — Framer in-page editing">
              Framer in-page editing on the live site
            </MediaFrame>

            <h3 className="is-lg">Reduced Scope for the MVP</h3>
            <p>
              Due to the time constraints (2 months from design to launch) on the minimum viable
              product, it was decided that the scope would be reduced by:
            </p>

            <div className="card-grid">
              <div className="insight-card">
                <h3>Homepage Only</h3>
                <p>
                  Focusing only on the homepage, let me ensure the basics were done correctly.
                  It meant that, rather than doing half measures, the accessibility and main
                  functions were done correctly and on time for Christmas.
                </p>
              </div>
              <div className="insight-card">
                <h3>No Animations for the MVP</h3>
                <p>
                  One of the main concerns was animating the carousel hero section; this would
                  take time away from other, more important areas of the build, such as pricing
                  and the timetable. So I used a single static image.
                </p>
              </div>
              <div className="insight-card">
                <h3>User Testing after MVP launch</h3>
                <p>
                  Ideally, once the site had been moved from Figma to Framer, I would have
                  conducted some more user testing; however, this was pushed back till after
                  Christmas and the MVP launch.
                </p>
              </div>
            </div>
          </section>

          <section className="chapter" id="bjj-outcome">
            <p className="eyebrow">Outcome</p>
            <h2 className="is-light">A User Flow That Gets Sign-ups</h2>

            <blockquote className="callout">
              <p>
                “Reese went above and beyond my expectations of what the site could be, im
                really happy with it”
              </p>
              <cite>- Coach Daniel Havelock</cite>
            </blockquote>

            <MediaFrame shape="video" hint="gif/video — outcome showcase">
              another video showcase
            </MediaFrame>

            <div className="impact-row impact-row--4">
              <div>
                <p className="stat-value">50</p>
                <p className="stat-label">forum enquiries in the first 30 days of the site</p>
              </div>
              <div>
                <p className="stat-value">92 Score</p>
                <p className="stat-label">SEO score on lighthouse for mobile</p>
              </div>
              <div>
                <p className="stat-value">No. 1 Website</p>
                <p className="stat-label">
                  On Google search results for bjj clubs in the local area
                </p>
              </div>
              <div>
                <p className="stat-value">227</p>
                <p className="stat-label">Unique users visited the site in the last 30 days</p>
              </div>
            </div>

            <div className="card-stack">
              <div className="insight-card">
                <h3>Increased Sign-ups</h3>
                <p>
                  The website's impact was immediate: many new potential members signed up for
                  free classes, and some even decided to stick with Dan and NC BJJ. Club members
                  also shared their opinions and loved the new website because it highlights the
                  community spirit.
                </p>
              </div>
              <div className="insight-card">
                <h3>Framer was the right choice</h3>
                <p>
                  Many of Framer's features, including its competitive pricing, have
                  significantly improved SEO compared to the previous site, and Framer's
                  “In-page” editing makes it easy for Coach Dan to update his site and for me to
                  experiment with AI tools with code components.
                </p>
              </div>
              <div className="insight-card">
                <h3>Full Site Launched by March</h3>
                <p>
                  Soon after the MVP, we launched additional site pages, including an About page
                  highlighting the club's timeline and more information about Coach Dan, further
                  reducing anxiety for potential sign-ups. The photo gallery soon followed,
                  easing many women's fears by letting them see other women participating in the
                  sport.
                </p>
              </div>
            </div>

            <p>
              Overall, I'm happy with the site, as it ticks all the boxes Coach Dan wanted for
              the project. There was one unforeseen effect of using a third-party form for
              sign-ups, and that affected the bounce rate results for the site because it could
              not be tracked properly, which raised the bounce rate and limited my ability to
              judge how effective the site has been.
            </p>
          </section>

          <section className="chapter" id="bjj-reflection">
            <p className="eyebrow">Reflection</p>
            <h2>Things I would Change or Improve</h2>
            <p>
              Although overall I am quite pleased with my first real product design project,
              there is always room for reflection and improvement of my designs and process.
            </p>

            <div className="card-grid">
              <div className="insight-card">
                <h3>Using Code Inside Framer</h3>
                <p>
                  Creating custom code components was a great idea and worth exploring, but
                  because of the code's nature, not having CSS files creates long, unmanageable
                  code that is unnecessary otherwise. If I were to do the site again, I would
                  build it myself with AI to allow for more control and cleaner code.
                </p>
              </div>
              <div className="insight-card">
                <h3>Reduce The Bounce Rate</h3>
                <p>
                  Coach Dan wanted to implement a third-party form, which increased the bounce
                  rate. The form didn't work as intended, and he asked me to return to my
                  original idea of a WhatsApp button on the sign-up page. Moving forward, I will
                  push back on ideas that I don't think will work.
                </p>
              </div>
              <div className="insight-card">
                <h3>Scope Creep</h3>
                <p>
                  As a new designer, you feel there is always room for more polish and
                  refinement; however, knowing when to stop matters, so in the future, having a
                  clearer idea of what “finished” looks like will be important for me.
                </p>
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
