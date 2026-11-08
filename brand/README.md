# LIIT Lighting — Brand Assets

## Colors

| Name | Hex | Use |
|---|---|---|
| Filament Gold | `#DA9D41` | Accent (gold bar, highlights) |
| Ivory | `#EDE5D2` | Lettering on dark backgrounds |
| Charcoal | `#292929` | Primary background / lettering on light backgrounds |
| Light background | `#F5F0E6` | Background for the light logo version |

These are screen (RGB) values. Ask print vendors to proof or match them to CMYK/Pantone — the gold is most likely to shift.

## Logos

- `logos/vector/` — **use these for print** (signs, wraps, shirts, embroidery). PDF/EPS for print shops, SVG for web and design tools.
- `logos/png/` — raster versions for quick online use (1080px squares and ~800px transparent).

Each comes in four versions:

| File | Description |
|---|---|
| `liit-logo-dark-background` | Ivory lettering on charcoal (the original) |
| `liit-logo-light-background` | Charcoal lettering on ivory |
| `liit-logo-transparent-for-dark-backgrounds` | Ivory lettering, no background |
| `liit-logo-transparent-for-light-backgrounds` | Charcoal lettering, no background |

The vectors were traced from the 1080px original logo: the gold bar and side rules are exact
geometric shapes, and the lettering was traced at 8× and smoothed. If the original font files are
ever located, rebuilding from them would be the most exact version.

## Google Business Profile images

`google-business-profile/`

- `liit-holiday-roofline.png`, `liit-every-evening.png`, `liit-one-system-every-season.png`,
  `liit-holiday-estimate-square.png` — **illustrated** promotional graphics. Post these as
  Updates/Offers, not in the Photos section (Photos should show real installs).
- `liit-roofline-logo-center-number-blurred.jpg` — real install photo with logo; house number blurred
  for the homeowner's privacy.
- `liit-security-lights-logo-sky.jpg` / `liit-security-lights-logo.jpg` — website photo with logo
  (sky placement recommended). If this isn't a LIIT install, don't use it in the Photos section.

## Tools

`tools/render-gbp-graphics.js` regenerates the illustrated graphics (Node + Playwright):

```
node brand/tools/render-gbp-graphics.js <output-dir>
```
