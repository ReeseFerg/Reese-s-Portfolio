import type { AstroIntegration } from 'astro';
import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  candidateFiles,
  findPlaceholderBlock,
  findUniqueMatch,
  validateReplacement,
} from './resolve.ts';
import { applyReplacement, readCandidates, saveMedia } from './write.ts';

type TextEdit = { route?: unknown; before?: unknown; after?: unknown };

function json(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readRaw(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

async function readBody(req: IncomingMessage): Promise<string> {
  return (await readRaw(req)).toString('utf8');
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

        server.middlewares.use('/__edit/media', (req, res, next) => {
          if (req.method !== 'POST') return next();

          void (async () => {
            try {
              // Parsed with the platform FormData rather than a multipart
              // dependency — this is a dev-only path and Node's Response can
              // already do it.
              const raw = await readRaw(req);
              // Uint8Array rather than Buffer: BodyInit accepts the former, and
              // a Buffer is one anyway, so this is a view not a copy.
              const form = await new Response(new Uint8Array(raw), {
                headers: { 'content-type': req.headers['content-type'] ?? '' },
              }).formData();

              const route = String(form.get('route') ?? '');
              const kind = String(form.get('kind') ?? '');
              const alt = String(form.get('alt') ?? '').trim();
              const width = Number(form.get('width'));
              const height = Number(form.get('height'));
              const placeholder = String(form.get('placeholder') ?? '');
              const file = form.get('file');
              const poster = form.get('poster');

              if (!(file instanceof File)) {
                return json(res, 400, { error: 'No file received.' });
              }
              if (kind !== 'image' && kind !== 'video') {
                return json(res, 400, { error: 'kind must be image or video.' });
              }
              // Shipping an image with no alt would fail eslint-plugin-jsx-a11y
              // on the next `npm run check`, and this is a portfolio for UX
              // roles — better to refuse at the point of drop.
              if (kind === 'image' && alt === '') {
                return json(res, 400, {
                  error: 'Alt text is required — describe what the image shows.',
                });
              }
              if (!Number.isFinite(width) || !Number.isFinite(height)) {
                return json(res, 400, { error: 'width and height must be numbers.' });
              }
              if (placeholder === '') {
                return json(res, 400, { error: 'No placeholder to replace.' });
              }

              const files = candidateFiles(route);
              if (files.length === 0) {
                return json(res, 403, { error: `No editable source for route ${route}.` });
              }

              // `placeholder` is the hint, not source text — the browser only
              // sees rendered DOM. Locate the whole <MediaFrame> element here.
              const contents = await readCandidates(repoRoot, files);
              const hits = contents
                .map((c) => ({ file: c.file, found: findPlaceholderBlock(c.text, placeholder) }))
                .filter((c) => c.found !== null);

              if (hits.length !== 1) {
                return json(res, 409, {
                  error:
                    hits.length === 0
                      ? `No unique placeholder with hint "${placeholder}" — reload, or make the hint unique in the source.`
                      : `That hint matches ${hits.length} files — make it unique first.`,
                });
              }

              const { file: targetFile, found } = hits[0];

              const result = await saveMedia(repoRoot, {
                kind,
                bytes: Buffer.from(await file.arrayBuffer()),
                filename: file.name,
                posterBytes:
                  poster instanceof File ? Buffer.from(await poster.arrayBuffer()) : null,
                slug: route.split('/').filter(Boolean).pop() ?? 'media',
                targetFile,
                alt,
                width,
                height,
                placeholder: found!.block,
                className: found!.className,
              });

              return json(res, 200, result);
            } catch (error) {
              return json(res, 500, { error: (error as Error).message });
            }
          })();
        });
      },
    },
  };
}
