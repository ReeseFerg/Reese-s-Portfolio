import { robots } from '../lib/seo.ts';

export const GET = () =>
  new Response(robots(), {
    headers: { 'Content-Type': 'text/plain' },
  });
