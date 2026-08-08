import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="view is-active" id="not-found" aria-label="Page not found">
      <div className="view-inner">
        <p className="crumb">~/reese</p>
        <h1 className="view-title">404 — no such path</h1>
        <p className="view-lead">
          That page doesn&apos;t exist. Nothing broke — the address just doesn&apos;t point
          anywhere.
        </p>
        <ul className="contact-list">
          <li>
            <span className="ck">work</span> <Link to="/work">selected projects</Link>
          </li>
          <li>
            <span className="ck">about</span> <Link to="/about">who I am</Link>
          </li>
          <li>
            <span className="ck">contact</span> <Link to="/contact">get in touch</Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
