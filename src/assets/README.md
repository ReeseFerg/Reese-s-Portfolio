# src/assets/

Case study screenshots go here — not in `public/`.

Importing an image from this folder lets Vite hash the filename, compress it and
cache-bust it on deploy. Files in `public/` are copied as-is and get none of that.

```tsx
import cover from '../../assets/bjj-cover.png';

<MediaFrame src={cover} alt="The finished booking site on desktop"
  width={1600} height={900} caption="…" />
```

Always pass the real `width` and `height`. That's what reserves the space before
the file loads, so the text underneath doesn't jump as images arrive.
