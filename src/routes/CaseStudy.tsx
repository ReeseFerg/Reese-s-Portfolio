import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { CASE_SLUGS, type CaseSlug } from '../lib/site';
import NorthCoastBjj from '../content/cases/NorthCoastBjj';
import Databrew from '../content/cases/Databrew';
import SavrApp from '../content/cases/SavrApp';
import ProjectCadence from '../content/cases/ProjectCadence';
import NotFound from './NotFound';

const CASES: Record<CaseSlug, () => React.JSX.Element> = {
  'north-coast-bjj': NorthCoastBjj,
  databrew: Databrew,
  'savr-app': SavrApp,
  'project-cadence': ProjectCadence,
};

/** The chapter is "current" once its top has passed this far down the viewport. */
const READING_BAND = 140;

/**
 * Highlights the table-of-contents entry for whichever chapter you're reading,
 * and reveals blocks as they scroll in. Both read the DOM inside this article
 * rather than taking a list of chapters as props, so a case study can add,
 * rename or drop chapters without any wiring changing.
 */
function useCaseChrome(rootRef: React.RefObject<HTMLDivElement | null>, reduced: boolean) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const chapters = [...root.querySelectorAll<HTMLElement>('.chapter')];
    const tocLinks = [...root.querySelectorAll<HTMLElement>('.toc-link')];

    const setActive = (id: string | null) => {
      tocLinks.forEach((l) => {
        const on = !!id && l.dataset.target === id;
        l.classList.toggle('is-active', on);
        if (on) l.setAttribute('aria-current', 'true');
        else l.removeAttribute('aria-current');
      });
    };

    setActive(chapters[0]?.id ?? null);

    let ticking = false;
    const update = () => {
      ticking = false;
      let current = chapters[0] ?? null;
      for (const c of chapters) {
        if (c.getBoundingClientRect().top <= READING_BAND) current = c;
      }
      setActive(current?.id ?? null);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Reveal once, then stop watching. Skipped under reduced motion, which also
    // means the .reveal class (opacity: 0) is never applied in that case.
    let observer: IntersectionObserver | null = null;
    if (!reduced && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add('is-in');
            obs.unobserve(e.target);
          });
        },
        { rootMargin: '0px 0px -12% 0px' },
      );
      root.querySelectorAll('.case-cover, .impact-row, .chapter, .next-case').forEach((el) => {
        el.classList.add('reveal');
        observer!.observe(el);
      });
    }

    // TOC entries are buttons rather than anchors: an in-page #hash would be
    // read as a route by the router and bounce you off the page.
    const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth';
    const onTocClick = (e: Event) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('.toc-link, .toc-top');
      if (!btn || !root.contains(btn)) return;
      if (btn.dataset.target === 'top') return window.scrollTo({ top: 0, behavior });
      document
        .getElementById(btn.dataset.target ?? '')
        ?.scrollIntoView({ behavior, block: 'start' });
    };
    root.addEventListener('click', onTocClick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      root.removeEventListener('click', onTocClick);
      observer?.disconnect();
    };
  }, [rootRef, reduced]);
}

export default function CaseStudy({ reduced }: { reduced: boolean }) {
  const { slug } = useParams<{ slug: string }>();
  const rootRef = useRef<HTMLDivElement>(null);

  const known = CASE_SLUGS.includes(slug as CaseSlug);
  useCaseChrome(rootRef, reduced);

  if (!known) return <NotFound />;

  const Body = CASES[slug as CaseSlug];
  return (
    <div ref={rootRef}>
      <Body />
    </div>
  );
}
