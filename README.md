# Staylab — Landing Page

Premium dark-mode landing page for Staylab, the operating system for hotel asset monetization.

## Design concept

**"A hotel at night: dark facade, lit windows."** The identity avoids both hospitality clichés and default dark-SaaS palettes. Warm ink background with a brass/champagne accent drawn from the hotel world (brass keys, lobby light) expressed through a fintech lens. The recurring motif — a dark grid of windows where brass ones light up — represents hidden revenue being found, and appears in the logo, the hero visualization, the problem section's "asset map," and the favicon.

- **Type**: Instrument Sans (UI/headlines) · Newsreader italic (pivotal words) · Geist Mono (data labels)
- **Signature**: zero-dependency 3D canvas hero — a rotating tower of window-points with brass "monetized" nodes emitting revenue particles into orbital rings
- **The Asset Engine**: a scroll-driven sticky scene where a line-art hotel wakes up — eight assets light one by one, each feeding a golden revenue line into a central engine (the Staylab mark)
- **The pipeline**: an animated conceptual flow — Hotel → Assets → Pricing engine → Demand signals → Marketplace → Revenue → Profit
- **Narrative arc**: numbered chapters — 01 The old lens (occupancy) → 02 The new lens (assets) → 03 Inside the engine → 04 The infrastructure → 05 The horizon
- **No frameworks**: hand-rolled vanilla JS, CSS custom properties, IntersectionObserver reveals, scroll-linked moments

## Files

- `index.html` — semantic single-page markup
- `styles.css` — mobile-first styles, design tokens at the top
- `main.js` — hero canvas scene, scroll interactions, facade asset map, form
- `favicon.svg` — window-grid mark

## Run locally

Any static server works:

```sh
python3 -m http.server 4870
# → http://localhost:4870
```

## Notes

- `?static` query param previews the reduced-motion experience (all reveals shown, animations off)
- `prefers-reduced-motion` is fully respected: static hero frame, no marquee, no reveals
- The email form is front-end only — wire the submit handler in `main.js` to your backend or a form service when ready
