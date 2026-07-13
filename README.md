# Staylab — Landing Page

Premium dark-mode landing page for Staylab, the operating system for hotel asset monetization.

## Design concept

**"A hotel at night: dark facade, lit windows."** The identity avoids both hospitality clichés and default dark-SaaS palettes. Warm ink background with a brass/champagne accent drawn from the hotel world (brass keys, lobby light) expressed through a fintech lens. The recurring motif — a dark grid of windows where brass ones light up — represents hidden revenue being found, and appears in the logo, the hero visualization, the problem section's "asset map," and the favicon.

- **Type**: Instrument Sans (UI/headlines) · Newsreader italic (pivotal words) · Geist Mono (data labels)
- **Signature**: zero-dependency 3D canvas hero — a rotating tower of window-points with brass "monetized" nodes emitting revenue particles into orbital rings
- **The Asset Engine**: a scroll-driven sticky scene where a line-art hotel wakes up — eight assets light one by one, each feeding a golden revenue line into a central engine (the Staylab mark)
- **The pipeline**: an animated conceptual flow — Hotel → Assets → Pricing engine → Demand signals → Revenue → Profit (Marketplace lives in the roadmap, not the core flow)
- **The wedge**: today's product is Room Upgrade Intelligence — kicker under the hero headline, an interactive simulation (send offers, watch the model hold low-probability guests), and a GM-style scenario panel (≈ +$20,000/yr, clearly labeled illustrative)
- **Narrative arc**: numbered chapters — 01 The old lens → 02 The new lens → 03 Inside the engine → 04 Where it starts (the wedge) → 05 The infrastructure → 06 The horizon, with "Why independent hotels?" as an interlude
- **Conversion**: no email form — the CTA is "Book a discovery call" (mailto: hello@staylab.ai), framed as a founding cohort of 10 independent hotels
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
- The "Book a discovery call" buttons point to `mailto:hello@staylab.ai` — swap the href for a Calendly/Cal.com link when one exists
- The upgrade simulation guests live in `main.js` (`guests` array) — adjust names, offers, and probabilities freely
