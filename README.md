# techdomina

A static directory of AI tools for small business owners.
**Tagline:** AI tools that actually grow your small business.

Pure HTML/CSS/JS — no build step, no dependencies.

## Run locally

The site loads tools from `data/tools.json` via `fetch()`, which browsers block over
`file://`. So run a tiny local server instead of double-clicking `index.html`:

```bash
cd techdomina
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Add or edit a tool

Everything lives in [`data/tools.json`](data/tools.json). Each entry:

```json
{
  "name": "Tool Name",
  "initial": "T",                 // letter shown in the colored logo tile
  "color": "#7c3aed",             // logo tile background
  "category": "Marketing & Content",
  "price": "Freemium",            // Free | Freemium | Paid
  "featured": false,              // true = shows in the Featured section + ribbon
  "description": "One-line pitch, ~100 chars.",
  "url": "https://tool.com/?ref=techdomina"   // <-- put your AFFILIATE link here
}
```

Categories must match one of: `Marketing & Content`, `Customer Support`,
`Sales & CRM`, `Finance & Admin`, `Automation & AI Agents`.
(To add a new category, also add a matching filter button in `index.html`.)

## Monetization — where the money comes from

1. **Affiliate links** — replace each `url` with your affiliate link. Links use
   `rel="sponsored noopener"` and open in a new tab.
2. **Featured placements** — set `"featured": true` to put a tool in the Featured
   section (sell these slots to vendors monthly).
3. **"Get listed"** — the CTA emails `hello@techdomina.com`. Change that address in
   `index.html` (and the `mailto:` link) to yours.

## Before going live — checklist

- [ ] Replace every `url` with your real affiliate link.
- [ ] Change `hello@techdomina.com` to your real email.
- [ ] Add a real `assets/img/og-image.png` (1200×630) for social sharing.
- [ ] Confirm the affiliate disclosure in the footer fits your region's rules.

## Deploy (static hosting)

- **Netlify / Vercel:** drag the `techdomina` folder onto the dashboard — live in seconds.
- **GitHub Pages:** push the folder to a repo and enable Pages in settings.
- Point `techdomina.com` at the host afterwards.
