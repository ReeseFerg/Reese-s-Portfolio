/**
 * Shared prop plumbing for the layout primitives (Box, Flex, Grid, Container,
 * Section). Radix-Themes-modeled API, but resolved to plain HTML at build time:
 * enumerated props (direction/align/justify/wrap/flow) become cacheable utility
 * classes defined once in src/styles/layout.css, while value props (gap,
 * columns, rows, padding, margin) become inline style so arbitrary values work
 * without a class per value. Nothing here ships to the client.
 */

/** A step on the numbered spacing scale in tokens.css (--space-1 … --space-9). */
export type SpaceScale = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

/** A spacing value: a scale step (mapped to a token) or any raw CSS length. */
export type Space = SpaceScale | (string & {});

/** Resolve a spacing value to a token reference or a verbatim CSS length. */
export function space(value: Space | undefined): string | undefined {
  if (value == null) return undefined;
  return /^[1-9]$/.test(value) ? `var(--space-${value})` : value;
}

/** Padding props, mirroring Radix: `p` is the base, axis and side props win. */
export interface PaddingProps {
  p?: Space;
  px?: Space;
  py?: Space;
  pt?: Space;
  pr?: Space;
  pb?: Space;
  pl?: Space;
}

/** Margin props, same precedence as padding. */
export interface MarginProps {
  m?: Space;
  mx?: Space;
  my?: Space;
  mt?: Space;
  mr?: Space;
  mb?: Space;
  ml?: Space;
}

/** Common props every primitive accepts. The polymorphic `as` prop and the
    element's own HTML attributes (`class`, `id`, aria-*, …) are supplied by each
    component via astro/types' `Polymorphic`, so they're intentionally not here. */
export interface BaseLayoutProps extends PaddingProps, MarginProps {
  width?: string;
  maxWidth?: string;
  minWidth?: string;
}

function box(
  base: Space | undefined,
  axis: Space | undefined,
  side: Space | undefined,
): string | undefined {
  return space(side ?? axis ?? base);
}

/**
 * Build the `style` attribute string for a primitive from its value props.
 * Returns undefined when there's nothing to set, so the attribute is omitted.
 */
export function layoutStyle(
  props: BaseLayoutProps & Record<string, unknown>,
  extra: Record<string, string | undefined> = {},
): string | undefined {
  const decls: Record<string, string | undefined> = {};

  // Longhand per side, not a `padding`/`margin` shorthand: a shorthand assigns
  // all four sides, so a lone `pt` would force the other three to 0 and clobber
  // any padding a class sets on them. Longhands left out of `decls` (still
  // undefined here) are dropped by the filter below, leaving those sides alone.
  decls['padding-top'] = box(props.p, props.py, props.pt);
  decls['padding-right'] = box(props.p, props.px, props.pr);
  decls['padding-bottom'] = box(props.p, props.py, props.pb);
  decls['padding-left'] = box(props.p, props.px, props.pl);

  decls['margin-top'] = box(props.m, props.my, props.mt);
  decls['margin-right'] = box(props.m, props.mx, props.mr);
  decls['margin-bottom'] = box(props.m, props.my, props.mb);
  decls['margin-left'] = box(props.m, props.mx, props.ml);

  decls.width = props.width;
  decls['max-width'] = props.maxWidth;
  decls['min-width'] = props.minWidth;

  Object.assign(decls, extra);

  const out = Object.entries(decls)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');

  return out || undefined;
}

/** Join a class list, dropping falsy entries — mirrors Button.astro's idiom. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** Grid `columns`: a plain count becomes equal minmax(0,1fr) tracks. */
export function gridTemplate(value: string | number | undefined): string | undefined {
  if (value == null) return undefined;
  const v = String(value);
  return /^\d+$/.test(v) ? `repeat(${v}, minmax(0, 1fr))` : v;
}
