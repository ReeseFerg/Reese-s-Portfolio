import * as React from 'react';

/*
 * Photo row with a custom-cursor hover hint: hovering a photo keeps it
 * dimmed-in (the sibling dim is plain CSS `:hover`, unchanged) and tracks a
 * small pill reading `label` ("View") next to the pointer, replacing the
 * system cursor over that photo. This is the one island on an otherwise
 * zero-JS page section — the mouse-tracking it needs can't be done in CSS.
 */

export type GalleryPhoto = {
  image: string;
  alt: string;
};

export type PhotoGalleryProps = {
  photos: GalleryPhoto[];
  /** Text shown in the cursor pill on hover. */
  label?: string;
  ariaLabel?: string;
};

export default function PhotoGallery({
  photos,
  label = 'View',
  ariaLabel = 'Photos of Reese',
}: PhotoGalleryProps) {
  const [pos, setPos] = React.useState(null as { x: number; y: number } | null);
  const [hoverIndex, setHoverIndex] = React.useState(null as number | null);

  const onMouseMove = (e: React.MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
  };

  const onMouseLeave = () => {
    setPos(null);
    setHoverIndex(null);
  };

  return (
    <div className="about-gallery-wrap" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <ul className="about-gallery" aria-label={ariaLabel}>
        {photos.map((p, i) => (
          <li
            key={p.image}
            style={hoverIndex === i ? { cursor: 'none' } : undefined}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <img src={p.image} alt={p.alt} loading="lazy" />
          </li>
        ))}
      </ul>
      {pos && hoverIndex !== null ? (
        <div className="gallery-cursor" style={{ left: pos.x, top: pos.y }} aria-hidden="true">
          <span className="gallery-cursor-label">{label}</span>
        </div>
      ) : null}
    </div>
  );
}
