/**
 * Pixel-diffs two screenshot directories produced by capture.mjs.
 *
 * For each PNG present in both directories (or just the names given on the
 * command line), reports the pixelmatch-counted differing pixels and, for
 * any image that differs, the bounding box and contiguous y-bands of the
 * differing rows — read straight from the two source images' raw RGBA data.
 * (An earlier version of this derived the bbox from pixelmatch's own output
 * image, but that image draws untouched pixels as dimmed greyscale rather
 * than transparent, so every pixel reads as "non-zero" and the bbox always
 * covered the whole image. Comparing the sources directly avoids that.)
 *
 *   node scripts/pixeldiff.mjs <beforeDir> <afterDir> [name...]
 *
 * With no names given, diffs every *.png present in both directories.
 * Exits non-zero if any image differs or any pair mismatches in size.
 */
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { readFileSync, readdirSync } from 'node:fs';

const [beforeDir, afterDir, ...names] = process.argv.slice(2);

if (!beforeDir || !afterDir) {
  console.error('usage: node scripts/pixeldiff.mjs <beforeDir> <afterDir> [name...]');
  process.exit(1);
}

const pngBasenames = (dir) =>
  new Set(
    readdirSync(dir)
      .filter((f) => f.endsWith('.png'))
      .map((f) => f.slice(0, -'.png'.length)),
  );

const beforeNames = pngBasenames(beforeDir);
const afterNames = pngBasenames(afterDir);

const targets =
  names.length > 0
    ? names.map((n) => n.replace(/\.png$/, ''))
    : [...beforeNames].filter((n) => afterNames.has(n)).sort();

if (targets.length === 0) {
  console.error('no matching .png files found in both directories');
  process.exit(1);
}

// Contiguous runs of true -> [start, end] (inclusive) bands.
const bands = (rowFlags) => {
  const out = [];
  let start = -1;
  for (let y = 0; y < rowFlags.length; y++) {
    if (rowFlags[y] && start === -1) {
      start = y;
    } else if (!rowFlags[y] && start !== -1) {
      out.push([start, y - 1]);
      start = -1;
    }
  }
  if (start !== -1) out.push([start, rowFlags.length - 1]);
  return out;
};

let failed = false;

for (const name of targets) {
  if (!beforeNames.has(name)) {
    console.log(`${name}: MISSING in ${beforeDir}`);
    failed = true;
    continue;
  }
  if (!afterNames.has(name)) {
    console.log(`${name}: MISSING in ${afterDir}`);
    failed = true;
    continue;
  }

  const before = PNG.sync.read(readFileSync(`${beforeDir}/${name}.png`));
  const after = PNG.sync.read(readFileSync(`${afterDir}/${name}.png`));

  if (before.width !== after.width || before.height !== after.height) {
    console.log(
      `${name}: SIZE MISMATCH before=${before.width}x${before.height} after=${after.width}x${after.height}`,
    );
    failed = true;
    continue;
  }

  const { width, height } = before;
  const total = width * height;
  const diff = new PNG({ width, height });
  const numDiff = pixelmatch(before.data, after.data, diff.data, width, height, {
    threshold: 0.1,
  });

  console.log(`${name}: ${numDiff} / ${total} differing pixels`);

  if (numDiff === 0) continue;
  failed = true;

  // Bounding box + per-row flags, from the two source images directly.
  let minX = width,
    maxX = -1,
    minY = height,
    maxY = -1;
  const rowDiffers = new Array(height).fill(false);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (
        before.data[idx] !== after.data[idx] ||
        before.data[idx + 1] !== after.data[idx + 1] ||
        before.data[idx + 2] !== after.data[idx + 2] ||
        before.data[idx + 3] !== after.data[idx + 3]
      ) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        rowDiffers[y] = true;
      }
    }
  }

  console.log(`  bbox: x[${minX},${maxX}] y[${minY},${maxY}]`);
  for (const [start, end] of bands(rowDiffers)) {
    console.log(`  y-band: ${start}-${end}`);
  }
}

process.exit(failed ? 1 : 0);
