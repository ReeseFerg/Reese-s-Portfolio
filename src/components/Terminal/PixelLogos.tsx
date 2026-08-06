import type { ThemeName } from '../../lib/themes';

/**
 * The mascot under the welcome line. Each brand mark is a hand-placed pixel grid
 * rather than the real logo file: the single-colour ones use currentColor, so
 * they inherit whichever accent the active tool theme set.
 */
const LOGOS: Record<ThemeName, React.JSX.Element> = {
  // Claude Code — the resident pixel mascot (follows the accent color)
  claude: (
    <svg
      data-logo="claude"
      width="96"
      height="72"
      viewBox="0 0 96 72"
      shapeRendering="crispEdges"
      aria-label="Claude Code pixel mascot"
    >
      <g fill="currentColor">
        <rect x="24" y="0" width="48" height="12" />
        <rect x="12" y="12" width="72" height="12" />
        <rect x="0" y="24" width="24" height="12" />
        <rect x="36" y="24" width="24" height="12" />
        <rect x="72" y="24" width="24" height="12" />
        <rect x="0" y="36" width="96" height="12" />
        <rect x="12" y="48" width="72" height="12" />
        <rect x="12" y="60" width="12" height="12" />
        <rect x="72" y="60" width="12" height="12" />
      </g>
      <g fill="#141414">
        <rect x="24" y="24" width="12" height="12" />
        <rect x="60" y="24" width="12" height="12" />
      </g>
    </svg>
  ),
  // Figma — the five brand shapes, pixelated
  figma: (
    <svg
      data-logo="figma"
      width="72"
      height="72"
      viewBox="0 0 72 72"
      shapeRendering="crispEdges"
      aria-label="Figma pixel logo"
    >
      <rect x="12" y="0" width="24" height="24" fill="#f24e1e" />
      <rect x="36" y="0" width="24" height="24" fill="#ff7262" />
      <rect x="12" y="24" width="24" height="24" fill="#a259ff" />
      <rect x="36" y="24" width="24" height="24" fill="#1abcfe" />
      <rect x="12" y="48" width="24" height="24" fill="#0acf83" />
    </svg>
  ),
  // Conductor — blocky C lettermark
  conductor: (
    <svg
      data-logo="conductor"
      width="72"
      height="72"
      viewBox="0 0 72 72"
      shapeRendering="crispEdges"
      aria-label="Conductor pixel logo"
    >
      <g fill="currentColor">
        <rect x="12" y="0" width="48" height="12" />
        <rect x="0" y="12" width="24" height="48" />
        <rect x="48" y="12" width="12" height="12" />
        <rect x="12" y="60" width="48" height="12" />
        <rect x="48" y="48" width="12" height="12" />
      </g>
    </svg>
  ),
  // Paper — folded-corner page glyph
  paper: (
    <svg
      data-logo="paper"
      width="72"
      height="72"
      viewBox="0 0 72 72"
      shapeRendering="crispEdges"
      aria-label="Paper pixel logo"
    >
      <g fill="currentColor">
        <rect x="12" y="0" width="36" height="12" />
        <rect x="12" y="12" width="48" height="60" />
      </g>
      <rect x="48" y="12" width="12" height="12" fill="#000000" opacity="0.55" />
    </svg>
  ),
  // Framer — descending staircase F-mark
  framer: (
    <svg
      data-logo="framer"
      width="72"
      height="72"
      viewBox="0 0 72 72"
      shapeRendering="crispEdges"
      aria-label="Framer pixel logo"
    >
      <g fill="currentColor">
        <rect x="0" y="6" width="72" height="16" />
        <rect x="0" y="28" width="48" height="16" />
        <rect x="0" y="50" width="24" height="16" />
      </g>
    </svg>
  ),
  // Linear — parallel diagonal steps
  linear: (
    <svg
      data-logo="linear"
      width="72"
      height="72"
      viewBox="0 0 72 72"
      shapeRendering="crispEdges"
      aria-label="Linear pixel logo"
    >
      <g fill="currentColor">
        <rect x="0" y="60" width="18" height="6" />
        <rect x="6" y="54" width="18" height="6" />
        <rect x="12" y="48" width="18" height="6" />
        <rect x="18" y="42" width="18" height="6" />
        <rect x="24" y="36" width="18" height="6" />
        <rect x="30" y="30" width="18" height="6" />
        <rect x="36" y="24" width="18" height="6" />
        <rect x="42" y="18" width="18" height="6" />
        <rect x="48" y="12" width="18" height="6" />
        <rect x="54" y="6" width="18" height="6" />
        <rect x="0" y="36" width="18" height="6" />
        <rect x="6" y="30" width="18" height="6" />
        <rect x="12" y="24" width="18" height="6" />
        <rect x="18" y="18" width="18" height="6" />
        <rect x="24" y="12" width="18" height="6" />
        <rect x="30" y="54" width="18" height="6" />
        <rect x="36" y="48" width="18" height="6" />
        <rect x="42" y="42" width="18" height="6" />
        <rect x="48" y="36" width="18" height="6" />
        <rect x="54" y="30" width="18" height="6" />
      </g>
    </svg>
  ),
};

export default function PixelLogos({ active }: { active: ThemeName }) {
  return (
    <div className="avatar" id="avatar">
      {LOGOS[active]}
    </div>
  );
}
