/**
 * Guards against a published case study linking to a draft one.
 *
 * The case studies point at each other through `.next-case` links, so
 * publishing only some of them leaves the published ones ending in a link to a
 * route that no longer exists in the build — a dead link at the end of the
 * strongest piece of work on a site arguing its author finishes things.
 *
 * Rewriting the link automatically would mean editing case-study content, which
 * is out of bounds (see CASE-STUDIES.md). Failing the build costs one manual
 * edit per re-ordering and makes shipping the dead link impossible.
 */
export type DeadLink = { from: string; to: string };

export function findDeadDraftLinks(
  sources: ReadonlyArray<{ slug: string; text: string }>,
  publishedSlugs: readonly string[],
): DeadLink[] {
  const published = new Set(publishedSlugs);
  const dead: DeadLink[] = [];

  for (const { slug, text } of sources) {
    if (!published.has(slug)) continue;
    for (const [, target] of text.matchAll(/href="\/work\/([a-z0-9-]+)"/g)) {
      if (!published.has(target)) dead.push({ from: slug, to: target });
    }
  }

  return dead;
}

export function deadLinkMessage(dead: DeadLink[]): string {
  const lines = dead.map(
    ({ from, to }) =>
      `  ${from} links to /work/${to}, which is a draft and will not exist in the build.`,
  );
  return [
    'Published case studies link to draft ones:',
    ...lines,
    '',
    'Point those links at /work, or drop `draft: true` from the targets in src/lib/site.ts.',
  ].join('\n');
}
