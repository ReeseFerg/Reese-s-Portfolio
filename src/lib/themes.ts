/**
 * Clicking a tool name re-themes the whole terminal to that brand's accent and
 * swaps the pixel mascot. Values match Reese's Paper mock (artboard "Home —
 * current build", 3TO-0) exactly, in oklch so they sit next to --accent's own
 * oklch definition in tokens.css — this is the single source of truth for
 * both the pinned global accent and each tool word's hover colour.
 */
export const THEMES = {
  claude: 'oklch(67.2% 0.131 39deg)', // Claude Code
  figma: 'oklch(63% 0.24 2deg)', // Figma magenta-pink
  conductor: 'oklch(93.2% 0.003 68deg)', // conductor.build warm cream
  paper: 'oklch(73.9% 0.104 258deg)', // paper.design accent blue
  framer: 'oklch(58.2% 0.229 261.4deg)', // Framer brand blue
  linear: 'oklch(57.8% 0.158 272.3deg)', // Linear indigo
} as const;

export type ThemeName = keyof typeof THEMES;

/** Order shown in the tools line under the mascot. */
export const TOOLS: { name: ThemeName; label: string }[] = [
  { name: 'claude', label: 'Claude Code' },
  { name: 'conductor', label: 'Conductor' },
  { name: 'figma', label: 'Figma' },
  { name: 'framer', label: 'Framer' },
  { name: 'linear', label: 'Linear' },
  { name: 'paper', label: 'Paper' },
];
