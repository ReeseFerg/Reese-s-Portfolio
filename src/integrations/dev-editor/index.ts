import type { AstroIntegration } from 'astro';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { candidateFiles, findUniqueMatch, validateReplacement } from './resolve.ts';
import { applyReplacement, readCandidates } from './write.ts';

type TextEdit = { route?: unknown; before?: unknown; after?: unknown };

function json(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf8');
}

/**
 * In-browser editing that writes back to source, for drafting portfolio copy.
 *
 * Mounted from `astro:server:setup`, which only runs under `astro dev`. The site
 * is `output: 'static'` with no adapter, so there is no production server for
 * this to exist on — it cannot ship, which is a stronger guarantee than an
 * `import.meta.env.DEV` guard (see the orphaned DevPanel chunk noted in
 * CLAUDE.md, which that guard fails to remove).
 *
 * Every failure path refuses rather than guesses. Guessing which of two
 * identical paragraphs the user meant would silently corrupt the other.
 */
export default function devEditor(): AstroIntegration {
  return {
    name: 'dev-editor',
    hooks: {
      'astro:server:setup': ({ server }) => {
        const repoRoot = process.cwd();

        server.middlewares.use('/__edit/text', (req, res, next) => {
          if (req.method !== 'POST') return next();

          void (async () => {
            try {
              const body = JSON.parse(await readBody(req)) as TextEdit;
              const { route, before, after } = body;

              if (
                typeof route !== 'string' ||
                typeof before !== 'string' ||
                typeof after !== 'string'
              ) {
                return json(res, 400, {
                  error: 'route, before and after must be strings.',
                });
              }

              const valid = validateReplacement(after);
              if (!valid.ok) return json(res, 400, { error: valid.reason });

              const files = candidateFiles(route);
              if (files.length === 0) {
                return json(res, 403, { error: `No editable source for route ${route}.` });
              }

              const contents = await readCandidates(repoRoot, files);
              const match = findUniqueMatch(contents, before);

              if (!match.ok) {
                const error =
                  match.reason === 'not-found'
                    ? 'That text is no longer in the source — reload the page and try again.'
                    : `That text appears ${match.count} times — make it unique in the source first.`;
                return json(res, 409, { error });
              }

              await applyReplacement(repoRoot, match.file, before, after);
              return json(res, 200, { file: match.file });
            } catch (error) {
              return json(res, 500, { error: (error as Error).message });
            }
          })();
        });
      },
    },
  };
}
