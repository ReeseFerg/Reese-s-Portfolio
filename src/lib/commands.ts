/**
 * The slash commands the terminal accepts. Each one echoes a line and then
 * navigates, so typing `/work` and clicking "Work" are the same action.
 */
export type Command = {
  cmd: string;
  desc: string;
  out: string;
  route: string;
};

export const COMMANDS: Command[] = [
  { cmd: '/about', desc: 'who I am', out: 'opening about…', route: '/about' },
  {
    cmd: '/work',
    desc: 'selected projects',
    out: 'opening work — 4 selected projects',
    route: '/work',
  },
  {
    cmd: '/contact',
    desc: 'get in touch',
    out: 'opening contact — reesefergie@gmail.com',
    route: '/contact',
  },
  {
    cmd: '/north-coast-bjj',
    desc: 'client project',
    out: 'opening north-coast-bjj…',
    route: '/work/north-coast-bjj',
  },
  {
    cmd: '/project-cadence',
    desc: 'case study, 2026',
    out: 'opening project-cadence…',
    route: '/work/project-cadence',
  },
  {
    cmd: '/databrew',
    desc: 'client project',
    out: 'opening databrew…',
    route: '/work/databrew',
  },
  {
    cmd: '/savr-app',
    desc: 'case study, 2026',
    out: 'opening savr-app…',
    route: '/work/savr-app',
  },
];

export const SHORTCUTS_TEXT =
  'shortcuts — /about, /work, /contact · /north-coast-bjj, /project-cadence, /databrew, /savr-app for project details · ↑↓ + enter picks an option above · click a tool name to re-theme the terminal';

export const ASK_OPTIONS = [
  { cmd: '/about', label: '1. About', desc: '— who I am' },
  { cmd: '/work', label: '2. Work', desc: '— selected projects' },
  { cmd: '/contact', label: '3. Contact', desc: '— get in touch' },
];
