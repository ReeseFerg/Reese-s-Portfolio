export default function About() {
  return (
    <section className="view is-active" id="about" aria-label="About">
      <div className="view-inner">
        <p className="crumb">~/reese/about</p>
        <h1 className="view-title">About me</h1>
        <p className="about-lead">
          I'm Reese — a UX designer and business graduate who designs with AI in the loop. I
          shape interfaces in Figma and Paper, pressure-test them with real flows, then ship
          them with Claude Code. Less deck, more demo.
        </p>
        <h2 className="about-sub">Toolkit</h2>
        <ul className="tool-list">
          <li>Figma</li>
          <li>Paper</li>
          <li>Claude Code</li>
          <li>Conductor</li>
          <li>Framer</li>
          <li>Linear</li>
        </ul>
        <h2 className="about-sub">Experience</h2>
        <p className="about-copy2">
          [TODO: reverse-chronological experience — role, organization, dates. Add your business
          degree / education and any notable results.]
        </p>
      </div>
    </section>
  );
}
