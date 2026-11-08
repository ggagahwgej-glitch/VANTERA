# VANTERA — Premium Digital Studio

The official single-page website for **VANTERA**: personal branding, portfolio and client enquiries.

It's a plain static site: HTML, CSS and vanilla JavaScript. There's **no framework, no build step and no runtime dependencies**. To change anything, edit a file and redeploy.

```
Beyond Design. Beyond Development.
```

---

## Preview locally

```bash
python3 -m http.server 8080      # or: npx serve .
# open http://localhost:8080
```

You can also open `index.html` straight from disk, but some browsers block local fonts that way, so use a local server.

## What's where

```
index.html                  Page structure and all copy
assets/
  js/site-config.js         ← THE file to edit: contact details + portfolio projects
  js/main.js                Behaviour (navigation, portfolio, form → WhatsApp, FAQ, motion)
  css/main.css              Design system and all styling
  fonts/                    Self-hosted fonts (SIL Open Font License, see OFL.txt)
  brand/                    Official logo + icons + share image
  portfolio/                Optimised project screenshots (generated)
favicon.ico, site.webmanifest, robots.txt
vercel.json, .vercelignore  Hosting config (caching + security headers)
tools/
  capture/                  Automatic screenshot capture of live demos (GitHub Action)
  brand/build.mjs           Regenerates logo sizes and icons from the master logo
  og/                       Source + renderer for the social share image
```

---

## Everyday edits: `assets/js/site-config.js`

Everything you'll normally change lives in this one file, with instructions at the top.

### Contact details

```js
contact: {
  phoneDisplay: "+91 93872 32918",   // how the number appears on the page
  phoneTel: "+919387232918",         // used by "Call" buttons
  whatsappNumber: "919387232918",    // country code + number, digits only
  whatsappGreeting: "Hello VANTERA, I'd like to discuss a project.",
},
```

Every WhatsApp button, call button and the enquiry form read from here.

### Portfolio projects

Each project is one block in `projects: [ … ]`. They appear in the order listed.

| Field | What it does |
|---|---|
| `visible` | `false` hides the project without deleting it |
| `title`, `subtitle` | Project name and type, e.g. "Imperial Royal" / "Premium Real Estate Website" |
| `category` | Shown on the card and used by the portfolio filters |
| `label` | Small tag, e.g. "Concept project" |
| `description` | One or two sentences |
| `highlights` | Optional list of up to ~3 short bullet points |
| `demoUrl` | Public live link (`https://…`). **Leave it `""` and the "View Live Demo" button is hidden automatically** |
| `tint` | Optional soft glow colour behind the preview |
| `images` | `desktop` (16:10 first screen, main image), `desktopSmall`, optional `fullPage` / `fullPageSmall` (scrolls through the page on hover), optional `mobile` / `mobileFull` (phone mock-up) |
| `alt` | Description of the screenshot for screen readers |

Automatic behaviour:

- **Demo button.** It only appears for a valid public `https://` link.
- **Placeholder.** A project without a `desktop` image shows an elegant monogram placeholder.
- **Filters.** These appear on their own once at least 3 projects are visible across 2 or more categories.
- **"Start a similar project".** This button scrolls to the request form and preselects the service: *Landing Page* for landing-page categories, *Business Website* for website categories, otherwise *Other*.

Three ready-made slots are already in the file with `visible: false`:

- **Contemporary Real Estate Platform.** Its link is protected by Vercel's login wall. Paste a public URL and add screenshots.
- **Business Service Landing Page**
- **Creative Digital Business Website**

### Adding a new project, step by step

1. **Check that the demo is public.** Open the link in a private/incognito window. Vercel *preview* URLs often have Deployment Protection, which shows visitors a Vercel login page. Use the production domain, or turn protection off under the Vercel project's **Settings → Deployment Protection**.
2. **Add it to `tools/capture/targets.json`:**
   ```json
   { "slug": "my-project", "url": "https://my-project.vercel.app/" }
   ```
3. **Commit and push.** The **Capture portfolio screenshots** GitHub Action opens the live site in a real browser, generates the six optimised images in `assets/portfolio/`, and commits them back automatically. It takes about 3–5 minutes; you can follow it in the repository's **Actions** tab or start it manually with **Run workflow**. Run `git pull` afterwards.
4. **Copy an existing project block in `site-config.js`.** Edit the text, point the images at the new slug, and set `visible: true`:
   ```js
   images: {
     desktop: "assets/portfolio/my-project-desktop-1600.webp",
     desktopSmall: "assets/portfolio/my-project-desktop-800.webp",
     fullPage: "assets/portfolio/my-project-full-1200.webp",
     fullPageSmall: "assets/portfolio/my-project-full-700.webp",
     mobile: "assets/portfolio/my-project-mobile.webp",
     mobileFull: "assets/portfolio/my-project-mobile-full.webp",
   },
   ```
5. Commit and deploy.

Prefer your own screenshots? Save WebP files with these sizes:

- `desktop`: 1600 × 1000
- `desktopSmall`: 800 × 500
- `mobile`: 480 × 1039
- full-page images: 1200 / 700 / 400 px wide

---

## Logo and brand assets

The official VANTERA emblem is used **exactly as supplied**: same artwork, same proportions. The only change was removing its white background so it sits cleanly on the dark design.

| File | Used for |
|---|---|
| `assets/brand/vantera-logo-transparent.png` | **Master** (1125 × 1322, transparent). Every other size is made from this file |
| `assets/brand/logo.webp` | Navigation, footer and contact section |
| `assets/brand/logo.png` | Structured data (search engines) and general use |
| `favicon.ico`, `assets/brand/favicon-32.png` | Browser tab icons |
| `assets/brand/apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | Home-screen and app icons |
| `assets/brand/og-image.jpg` | Link preview on WhatsApp, LinkedIn, X, etc. (1200 × 630) |

To update the logo, replace the master file, then regenerate every size:

```bash
cd tools/brand && npm install sharp@0.33.5 && node build.mjs
```

To change the share image, edit the text in `tools/og/og.html`, then render it:

```bash
cd tools/og && npm install puppeteer && node render.mjs
```

Messaging apps cache link previews, so a new share image can take a while to show up in chats that already shared the link.

---

## How the project request form works

The form needs **no backend or paid service**:

1. **Validation.** The visitor fills in the form, and everything is checked in the browser:
   - required fields
   - WhatsApp number: Indian 10-digit with or without +91/0, or international with a `+` country code
   - optional email and reference link
   - a project description of at least 10 characters

   Errors are shown next to each field.
2. **WhatsApp opens.** On submit, a neatly formatted message is built from the answers and WhatsApp opens with it ready to send.
3. **The visitor presses Send.** The page never pretends the request was delivered. It explains that the visitor must press **Send** in WhatsApp, and offers **Open WhatsApp again** and **Copy message** in case the app didn't open.

The pricing buttons and the portfolio's "Start a similar project" buttons fill in the matching service, budget or note automatically.

---

## Deploying

This is a static site, so any static host works. Point it at the repository root with **no build command** and the **root as the output directory**.

**Vercel (recommended).** Import the repository → Framework preset **Other** → Deploy.

- `vercel.json` adds long-term caching for fonts and images plus basic security headers.
- `.vercelignore` keeps `tools/` and `.github/` out of the deployment.

Netlify, Cloudflare Pages and GitHub Pages work the same way.

**Once the final domain is live**, replace `https://your-domain.com` below with it:

1. In `index.html`, make the share-image URLs absolute. Some apps ignore relative ones:
   ```html
   <meta property="og:image" content="https://your-domain.com/assets/brand/og-image.jpg">
   <meta name="twitter:image" content="https://your-domain.com/assets/brand/og-image.jpg">
   <meta property="og:url" content="https://your-domain.com/">
   <link rel="canonical" href="https://your-domain.com/">
   ```
2. In the JSON-LD block in `index.html`, make `logo` and `image` absolute and add `"url": "https://your-domain.com/"`.
3. Optional: add `Sitemap: https://your-domain.com/sitemap.xml` to `robots.txt` along with a one-line sitemap.

---

## Performance and accessibility

**Loading**
- The page renders immediately, with no loading screen.
- Fonts are self-hosted and subset, with the critical ones preloaded.
- The hero image is preloaded; everything else is lazy-loaded at a size suited to the screen.
- One stylesheet and one deferred script; no third-party libraries, trackers or external requests.

**Motion**
- Decorative motion pauses when off-screen.
- Phones and tablets skip the heaviest decorative layers.
- `prefers-reduced-motion` turns off smooth scrolling and entrance animations.

**Accessibility**
- Semantic landmarks, a skip link, visible focus states and labelled controls.
- While the mobile menu is open, the rest of the page is inert so keyboard focus stays in the menu; Esc closes it and returns focus to the menu button.
- All content is readable without JavaScript, and the portfolio falls back to a plain list of demo links.

## Quality checks performed

**Coverage**
- Tested at 360, 390, 430, 768, 1024, 1280, 1440, 1920 and 2560 px wide.
- No horizontal overflow, no overlapping text, no console errors, no failed requests or broken images.

**Links and buttons**
- Every in-page link and CTA lands on the right section.
- External links open safely in a new tab.
- All WhatsApp and call links point to the configured number.

**Form**
- Every validation rule was exercised.
- The WhatsApp message was verified word for word.
- "Copy message" and "Copy number" put the right text on the clipboard.

**Interface behaviour**
- Portfolio filters, FAQ accordion (one answer open at a time), mobile menu, reduced motion and no-JavaScript mode were all checked.

## Credits

The fonts are licensed under the SIL Open Font License 1.1 (`assets/fonts/OFL.txt`):

- [Instrument Serif](https://github.com/Instrument/instrument-serif)
- [Manrope](https://github.com/sharanda/manrope)
- [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono)
