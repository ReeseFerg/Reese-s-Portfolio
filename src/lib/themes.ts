/**
 * Clicking a tool name re-themes the whole terminal to that brand's accent and
 * swaps the pixel mascot. Accents are pulled from each product's own site, then
 * adjusted only where contrast on black demanded it.
 */
export const THEMES = {
  claude: '#d97757', // Claude Code
  figma: '#f24e1e', // Figma brand red-orange
  conductor: '#eae8e6', // conductor.build theme color (warm cream)
  paper: '#81acec', // paper.design accent blue
  framer: '#2e6bff', // brand #0055ff, brightened for contrast on black
  linear: '#5e6ad2', // Linear indigo
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
