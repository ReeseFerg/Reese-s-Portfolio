import type { ImageMetadata } from 'astro';

type Shape = 'wide' | 'phone' | 'square' | 'tall' | 'video';

type Props = {
  /**
   * Imported image, e.g. `import cover from '../../assets/bjj-cover.png'`.
   * Importing rather than using a string path is what lets Vite hash, compress
   * and cache-bust the file. Leave it out to keep the placeholder box.
   *
   * Astro types an image import as ImageMetadata — an object carrying `src`,
   * `width` and `height` — not the bare string Vite gave us before the
   * migration. Both are accepted: a string for anything already in public/.
   */
  src?: ImageMetadata | string;
  /** What the image shows, for anyone who can't see it. Required with `src`. */
  alt?: string;
  /** Intrinsic pixel size. Used to reserve exact space before the file loads. */
  width?: number;
  height?: number;
  /**
   * Public path to a silent looping clip, e.g. "/media/bjj-booking.mp4".
   * Video lives in public/ rather than being imported: these are multi-megabyte
   * binaries that gain nothing from Vite's image pipeline.
   */
  video?: string;
  /** Public path to the still shown before play and under reduced motion. */
  poster?: string;
  shape?: Shape;
  /** Placeholder only: the dimensions hint, e.g. "1600×900". */
  hint?: string;
  /** Placeholder only: what the image will eventually show. */
  children?: React.ReactNode;
  caption?: React.ReactNode;
  className?: string;
};

const SHAPE_CLASS: Record<Shape, string> = {
  wide: '',
  phone: 'media--phone',
  square: 'media--square',
  tall: 'media--tall',
  video: 'media--video',
};

/**
 * One media block in a case study, in either of two states.
 *
 * Without `src` it renders the dashed placeholder that's in the case studies
 * now — so a chapter can be laid out before the screenshot exists. With `src`
 * it renders the real image, sized from `width`/`height` so the browser
 * reserves the right space before the file arrives and the text below it never
 * jumps. Everything below the fold loads lazily.
 *
 *   <MediaFrame hint="1600×900">hero shot of the live site</MediaFrame>
 *   <MediaFrame src={cover} alt="…" width={1600} height={900} caption="…" />
 */
export default function MediaFrame({
  src,
  alt,
  width,
  height,
  video,
  poster,
  shape = 'wide',
  hint,
  children,
  caption,
  className,
}: Props) {
  const figureClass = ['media', SHAPE_CLASS[shape], className].filter(Boolean).join(' ');

  // An ImageMetadata import already knows its own dimensions, so fall back to
  // them rather than making every call site repeat what the file states.
  const imgSrc = typeof src === 'string' ? src : src?.src;
  const imgWidth = width ?? (typeof src === 'object' ? src.width : undefined);
  const imgHeight = height ?? (typeof src === 'object' ? src.height : undefined);

  return (
    <figure className={figureClass}>
      <div className="media-frame">
        {video ? (
          // Prototype walkthroughs, so no controls and no sound. Under reduced
          // motion CSS hides the video and shows the poster instead, so nothing
          // moves — matching how the rest of the site treats motion.
          <>
            <video
              className="media-video"
              src={video}
              poster={poster}
              width={width}
              height={height}
              autoPlay
              loop
              muted
              playsInline
              aria-label={alt}
              style={width && height ? { aspectRatio: `${width} / ${height}` } : undefined}
            />
            {poster && (
              <img
                className="media-video-still"
                src={poster}
                alt={alt ?? ''}
                width={width}
                height={height}
                style={width && height ? { aspectRatio: `${width} / ${height}` } : undefined}
              />
            )}
          </>
        ) : imgSrc ? (
          <img
            src={imgSrc}
            alt={alt ?? ''}
            width={imgWidth}
            height={imgHeight}
            loading="lazy"
            decoding="async"
            style={
              imgWidth && imgHeight
                ? { aspectRatio: `${imgWidth} / ${imgHeight}` }
                : undefined
            }
          />
        ) : (
          // data-hint is how the dev editor identifies which placeholder a
          // dropped file belongs to — the browser can't see the JSX source, so
          // the hint is the handle. Dev-only, so it never reaches production.
          <div className="media-slot" data-hint={import.meta.env.DEV ? hint : undefined}>
            {hint && <span className="slot-hint">{hint}</span>}
            {children}
          </div>
        )}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
