import { lazy, Suspense, useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import SiteHeader from './components/SiteHeader';
import Terminal from './components/Terminal/Terminal';
import ReadProgress from './components/case/ReadProgress';
import { useReducedMotion } from './lib/useReducedMotion';
import { metaForPath, SITE_URL } from './lib/site';
import Work from './routes/Work';
import About from './routes/About';
import Contact from './routes/Contact';
import CaseStudy from './routes/CaseStudy';
import NotFound from './routes/NotFound';

// Dev-only, and lazy so the font-preset panel never reaches a production bundle.
const DevPanel = import.meta.env.DEV ? lazy(() => import('./components/dev/DevPanel')) : null;

/**
 * Applies the per-route <title> and meta tags on navigation. The build also
 * writes these into each route's static HTML — this keeps them correct for
 * client-side navigation after the first paint.
 */
function useRouteMeta(pathname: string) {
  useEffect(() => {
    const meta = metaForPath(pathname);
    document.title = meta.title;

    const set = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
      if (!el) {
        el = selector.startsWith('link')
          ? document.createElement('link')
          : document.createElement('meta');
        const [, key, val] = selector.match(/\[(\w+)="([^"]+)"\]/) ?? [];
        if (key && val) el.setAttribute(key, val);
        document.head.append(el);
      }
      el.setAttribute(attr, value);
    };

    set('meta[name="description"]', 'content', meta.description);
    set('meta[property="og:title"]', 'content', meta.title);
    set('meta[property="og:description"]', 'content', meta.description);
    set('meta[property="og:url"]', 'content', SITE_URL + pathname);
    set('link[rel="canonical"]', 'href', SITE_URL + pathname);
  }, [pathname]);
}

/**
 * Moves focus to the new view and scrolls to the top on navigation — the same
 * two things the hand-rolled router did, and what keyboard and screen-reader
 * users need in place of the page load a real navigation would have given them.
 */
function useRouteFocus(pathname: string, reduced: boolean) {
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });

    // Don't steal focus on first load — a deep link should leave the visitor at
    // the top of the document, not jumped into <main>.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, reduced]);

  return mainRef;
}

/**
 * The site used to run on hash routes (`/#/work/savr-app`). Anything shared
 * before the move — a link in a job application, a message to a recruiter —
 * still arrives with that hash, so translate it to the real path once on load.
 */
function useLegacyHashRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#/')) return;
    navigate(hash.slice(1), { replace: true });
  }, [navigate]);
}

export default function App() {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  const mainRef = useRouteFocus(pathname, reduced);

  useLegacyHashRedirect();

  useRouteMeta(pathname);

  const isHome = pathname === '/';
  const isCase = pathname.startsWith('/work/');

  useEffect(() => {
    document.body.classList.toggle('routed', !isHome);
    document.body.classList.toggle('on-case', isCase);
  }, [isHome, isCase]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ReadProgress active={isCase} reduced={reduced} />
      <SiteHeader />

      {isHome && <Terminal reduced={reduced} />}

      <main className="views" id="main" ref={mainRef} tabIndex={-1}>
        <Routes>
          <Route path="/" element={null} />
          <Route path="/work" element={<Work />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/work/:slug" element={<CaseStudy reduced={reduced} />} />
          {/* Deep links shared before the move off hash routing still resolve. */}
          <Route path="/index.html" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {DevPanel && (
        <Suspense fallback={null}>
          <DevPanel />
        </Suspense>
      )}
    </>
  );
}
