import { NavLink, Link } from 'react-router-dom';

const NAV = [
  { to: '/work', label: 'Work' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="logo" to="/">
        Reese Ferguson
      </Link>
      <nav className="site-nav" aria-label="Primary">
        {NAV.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => 'nav-link' + (isActive ? ' is-active' : '')}
          >
            {label}
          </NavLink>
        ))}
        <a className="nav-link" href="/resume.pdf" target="_blank" rel="noopener">
          Résumé ↗
        </a>
      </nav>
    </header>
  );
}
