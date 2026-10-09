# BreakChime

Static companion website for the BreakChime Chrome extension. `index.html`, `script.js`, and `styles.css` are the source files; `dist/` contains the synchronized deployment copy.

The canonical production site is `https://breakchime.vercel.app/`. The old `blinkandbreak.vercel.app` host currently redirects there. Keep the existing Chrome Web Store URL and extension ID; the store listing still displays Blink & Break as of the fresh October 9, 2026 audit. The FAQ explains the name change.

`vercel.json` publishes the existing `dist/` directory. It permanently redirects `/index.html`, the duplicate homepage paths `/dist`, `/dist/`, `/dist/index.html`, and the unused `/testimonials.html` fragment to `/`. The fragment remains outside the public output; its claims have not been verified. Keep unknown URLs as real 404s. No wildcard rewrite or security header override is used. The Google verification file remains in the public output.

After editing the homepage, styles, scripts, robots, sitemap, or social image, synchronize the corresponding root files into `dist/` before deploying. The source and deployment copies must match. The `.openai/hosting.json` metadata is preserved; no hosting registration or deployment is required for local editing.

The 1200×630 social preview is rendered from `assets/social-card.html`, using the existing icon and site colors. The HTML source stays outside the public output. To regenerate it with Playwright installed in your development environment:

```js
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.resolve('assets/social-card.html')).href);
  await page.screenshot({ path: 'og.png' });
  fs.copyFileSync('og.png', 'dist/og.png');
  await browser.close();
})();
```

No runtime dependencies are needed by the website.

Before a future approved deployment, check that Vercel's Root Directory is this repository root, so it reads `vercel.json` and its `dist` output. Change the **old domain's** redirect in Vercel from temporary 307 to permanent 308 (or 301), preserving paths and query strings. This domain-level setting cannot be verified or changed from the local project alone. Do not remove the old domain or Google verification file.

After deployment, verify the new canonical, sitemap, redirects, image and 404s on production. In Search Console verify both URL-prefix properties, submit the new sitemap at `https://breakchime.vercel.app/sitemap.xml`, inspect `https://breakchime.vercel.app/`, and use Change of Address from the old property if not already completed. Retain the old-domain permanent redirect for at least one year. Update the store name and developer website URL through a separately approved store update. No publishing or Search Console submission is performed by this project.
