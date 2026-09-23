# Andrii Lytvynenko - Personal Portfolio

> https://alytvynenko.net

Senior DevOps & Cloud Engineer portfolio built with Next.js 16, Tailwind CSS, and Framer Motion. Features an Apple/Telegram-inspired design with glassmorphism, bento grid layout, and dark mode.

The site is a **static export** (`output: "export"`) deployed to GitHub Pages. There is no Node server in production.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS **v3** (do not auto-upgrade to v4 — PostCSS plugin layout changed and breaks the build)
- **Animation:** Framer Motion
- **Language:** TypeScript
- **Node:** 22 (see `.nvmrc`)

## Prerequisites

- Node 22+ (match `.nvmrc`)
- npm
- For image conversion: Python 3 + Pillow (`pip install pillow`)
- For e2e: Chromium via Playwright (`npx playwright install chromium`)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`next.config.ts` sets `trailingSlash: true`, so routes look like `/resume/` rather than `/resume`.

## Scripts

| Script                 | What it does                                                        |
| ---------------------- | ------------------------------------------------------------------- |
| `npm run dev`          | Next.js dev server                                                  |
| `npm run build`        | Static export to `out/`                                             |
| `npm run start`        | `next start` (not used for GitHub Pages)                            |
| `npm run lint`         | ESLint                                                              |
| `npm run format`       | Prettier write                                                      |
| `npm run format:check` | Prettier check (CI)                                                 |
| `npm run typecheck`    | `tsc --noEmit`                                                      |
| `npm run spell`        | cspell on `src/**/*.{ts,tsx}` and root `*.md`                       |
| `npm test`             | Vitest unit tests (parsers, skill lookups)                          |
| `npm run knip`         | Unused export / dead-code check                                     |
| `npm run e2e`          | Playwright smoke + axe (expects `out/` unless you override the URL) |
| `npm run favicon`      | Rebuild favicon/PWA icons from `tools/favicon-source.svg`           |
| `npm run logos`        | Fetch official logos from Wikimedia and write WebP assets           |

## Local CI (match pull-request checks)

CI (`.github/workflows/ci.yml`) runs on pull requests to `main` and on pushes that are **not** `main` or `gh-pages`. Gitleaks (`.github/workflows/gitleaks.yml`) scans pull requests and pushes to `main` and **fails the check if secrets are detected**. OSV-Scanner (`.github/workflows/osv-scanner.yml`) scans `package-lock.json` on pull requests and pushes to `main` and **fails the check on HIGH and CRITICAL findings** (CVSS ≥ 7.0). Deploy (`.github/workflows/deploy.yml`) runs only on push to `main`.

```bash
npm ci
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
npm run spell
npm run knip
npx playwright install --with-deps chromium   # once per machine
npm run e2e
```

Link check in CI uses [lychee](https://github.com/lycheeverse/lychee) with `lychee.toml`. It treats 403/429/999 as success (bot-blocked sites) and excludes LinkedIn, Telegram, WhatsApp, localhost, and `uodo.gov.pl`.

Secret scanning uses [gitleaks](https://github.com/gitleaks/gitleaks) via the [official GitHub Action](https://github.com/gitleaks/gitleaks-action). `.gitleaks.toml` extends the default rules. The only allowlist is a documented false positive: a Git blob SHA in a Wikimedia bash-logo URL that used to live in committed `_next/` chunks (gone from `HEAD`).

Lockfile scanning uses [OSV-Scanner](https://github.com/google/osv-scanner) via the [official GitHub Action](https://github.com/google/osv-scanner-action) pinned to **v2.5.1**. The workflow scans committed `package-lock.json` (including `devDependencies`). The job fails only on HIGH and CRITICAL (NVD bands: HIGH CVSS ≥ 7.0, CRITICAL ≥ 9.0); medium and low are printed in the log. There are **no** `IgnoredVulns` suppressions. The first scan's HIGH/CRITICAL hits all came from unmaintained [`to-ico`](https://www.npmjs.com/package/to-ico) (`jimp@0.2` → `request`, `form-data`, `image-size`, `url-regex`, `uuid`, nested `minimist`); favicon ICO packing is now a local PNG-in-ICO writer in `tools/generate-favicon.mjs`.

Dependabot opens weekly grouped PRs for npm and GitHub Actions. **Major** version bumps are ignored on purpose (Tailwind 4 and cspell 10+ need a manual migration).

## End-to-end tests

`playwright.config.ts` serves the **static export** on port 4173 (`npx serve out`). Build first:

```bash
npm run build
npm run e2e
```

To hit a running `next dev` instead:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run e2e
```

Tests cover home visibility (hero, navbar, every bento `h2`), resume iframe + download, policy pages, diploma viewer pages, 404 chrome, axe WCAG 2 A/AA (serious/critical only), consent-first GA gating, Lite Mode persistence, and experience chip expansion. Home tests that measure layout set `localStorage.cookie-consent = "rejected"` so the banner does not overlay measurements.

Common failure: cards or hero stuck at `opacity: 0` after a Framer Motion change. The smoke test asserts computed opacity > 0.5.

## Client-side preferences and consent

No analytics load until the visitor accepts cookies. Implementation: `ConsentProvider` → `CookieConsentBanner` → GA scripts only when consent is `"accepted"`. Footer **Cookie settings** reopens the same banner (clears `cookie-consent`, unloads GA) so the visitor can choose again.

| `localStorage` key | Values                        | Owner                                                            |
| ------------------ | ----------------------------- | ---------------------------------------------------------------- |
| `cookie-consent`   | `accepted` \| `rejected`      | `src/lib/consent.ts` (`ConsentProvider` / `CookieConsentBanner`) |
| `theme`            | `light` \| `dark` \| `system` | `ThemeProvider` (`next-themes`)                                  |
| `reduce-effects`   | `true` \| `false`             | `ReduceEffectsProvider` (Lite Mode)                              |

**Consent-first analytics**

- Measurement ID lives in `src/lib/analytics.ts` (`GA_MEASUREMENT_ID`).
- GTM/GA scripts inject only after accept (client-side, after the visitor opts in).
- Reject (or no choice) → banner on first visit, no `gtag` script.
- Footer **Cookie settings** reopens that gate without itself writing a choice. Accept loads GA; Reject unloads/stops it.
- To re-test the banner: use Cookie settings, or `localStorage.removeItem("cookie-consent")` and reload.

**Lite Mode** (`ReduceEffectsProvider`)

- Navbar lightning toggle writes `reduce-effects`.
- If that key is unset, the app **auto-enables** Lite Mode when any of these is true: `prefers-reduced-motion: reduce`, `navigator.deviceMemory <= 4`, `hardwareConcurrency <= 4`, or `navigator.connection.saveData`.
- Components must gate motion with `useReduceEffects()` **and** `useReducedMotion()` (see `.cursor/rules/component-patterns.mdc`). Tailwind-only animations ignore the React toggle.

Public copy: `/privacy-policy/` and `/cookie-policy/`. If you change storage keys or when GA loads, update those pages in the same PR.

## Content and assets

**Resume PDF**

1. Edit in Google Docs → Download as PDF
2. Replace `public/pdf/resume.pdf`
3. Commit and push (served at `/resume/` and `/viewer/resume/`)

**Certifications / logos**

1. Drop PNGs in `images-before-optimization/certification/` (or `companies/`, `education/`)
2. Convert with `tools/png_to_webp.py` (copy into the folder, needs Pillow)
3. Move WebP to `public/images/...`
4. Add the filename in `src/data/certificates.ts`, `experiences.ts`, or `education.ts`

Or run `npm run logos` for Wikimedia-sourced company/university marks. See `public/images/companies/README.md` and `public/images/education/README.md`.

**Favicon / PWA icons:** edit `tools/favicon-source.svg`, then `npm run favicon`. Writes `public/images/favicon.ico`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`.

**Skill chips:** add the icon to `skillIconMap` in `src/data/skillIcons.ts`, map it in the private `skillCategoryMap`, and add a `disciplineAliases` entry if experience/education text uses a variant name. `parseDisciplineListItems` in `src/lib/discipline-segments.ts` expands `AWS (EKS, S3)` into separate chips.

**Writing notes**

1. Add `content/writing/<slug>.mdx` with required frontmatter (`title`, `summary`, `date`, `last_verified`, `type`, `aiSummary`, `aiInstruction`).
2. Keep `aiInstruction` identical to the lawyer-locked string in `src/data/writing.ts`.
3. Point `relatedExperience` only at Experience `id`s or position titles that already exist.
4. Update `public/writing/llms.txt` and `public/sitemap.xml` (unit tests check they stay in sync).
5. Hub, article pages, and the home Writing block (after Education, only if a note is published) read MDX at build time. Static export; no database.

## Routes

| Path                                             | Source                                                                |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| `/`                                              | `src/app/page.tsx` — hero + bento grid (detailed resume)              |
| `/hire/`                                         | Conversion page with AWS-first packages; deep-links to `/#experience` |
| `/resume/`                                       | Resume iframe + download                                              |
| `/viewer/{resume\|diploma\|diploma-supplement}/` | Shared PDF viewer (`generateStaticParams`)                            |
| `/privacy-policy/`, `/cookie-policy/`            | Legal pages (`robots: noindex`)                                       |
| `/writing/`                                      | Academic/lab notes hub (MDX in `content/writing/`)                    |
| `/writing/[slug]/`                               | Static note pages (`generateStaticParams`)                            |
| `/writing/llms.txt`                              | Plain-text index of notes for assistants                              |
| unknown                                          | `src/app/not-found.tsx` (navbar + footer; required for static 404)    |

## Deployment

Push to `main` runs lint → typecheck → build → `peaceiris/actions-gh-pages` publishing `./out` to the `gh-pages` branch.

**GitHub Pages setup (once):**

1. Repo **Settings** → **Pages**
2. Source: "Deploy from a branch"
3. Branch `gh-pages`, folder `/` (root)
4. Custom domain: `public/CNAME` (`alytvynenko.net`) plus empty `public/.nojekyll`

## Project structure

```
src/
├── app/           # App Router pages, layout, globals.css
├── components/    # layout, bento, hero, ui, writing, providers
├── data/          # profile, hire, experiences, certificates, education, skillIcons, writing
├── lib/           # animations, analytics, discipline parsing, writing MDX loader, hooks
└── types/
content/writing/   # Git-backed MDX notes (frontmatter + body)
public/            # images, pdf, CNAME, manifest, sitemap, writing/llms.txt
tests/e2e/         # Playwright smoke + axe
tools/             # favicon, logos, PNG→WebP
.github/workflows/ # ci.yml (PR), gitleaks.yml (PR + main), osv-scanner.yml (PR + main), deploy.yml (main)
```

## Troubleshooting

| Symptom                                              | Likely cause                                                | Fix                                                                                                  |
| ---------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm run e2e` fails immediately / connection refused | No `out/` directory                                         | Run `npm run build` first                                                                            |
| Hero or cards invisible but lint/types pass          | Framer Motion left `opacity: 0`                             | Check `initial`/`animate`/`whileInView` and Lite Mode / reduced-motion branches                      |
| Hydration mismatch on SVG/img                        | Dark Reader (or similar) injects attributes                 | Layout already strips those attributes for ~500ms; avoid extra `style` on those nodes                |
| Tailwind / PostCSS build error after a Dependabot PR | Accidental Tailwind 4 bump                                  | Stay on `tailwindcss@^3.4`; majors are ignored, but do not force a major                             |
| `cspell` fails on a new name or Polish word          | Word not in `cspell.json`                                   | Add it to `words`, or ignore generated SVG paths (already ignored)                                   |
| Lychee fails on a new external URL                   | Bot-blocked host or bad cert                                | Confirm the URL in a browser; add a narrow `exclude` in `lychee.toml` only if the site is known-good |
| Gitleaks fails on a public SHA or sample string      | Default rule false positive                                 | Prefer rotating/removing the string; a narrow `.gitleaks.toml` allowlist only with a written why     |
| OSV-Scanner fails on HIGH/CRITICAL                   | Vulnerable package in `package-lock.json`                   | Bump or replace the parent package; `osv-scanner.toml` `IgnoredVulns` only with a written why        |
| Knip reports unused files                            | New page/tool not in `knip.json` `entry`                    | Add `src/app/**/page.tsx`-style entries or `tools/**/*.mjs`                                          |
| Cookie banner never appears                          | Consent already stored                                      | Footer **Cookie settings**, or `localStorage.removeItem("cookie-consent")`                           |
| GA fires before accept                               | Script added outside `ConsentProvider`                      | Load gtag only when `consent === "accepted"`                                                         |
| Lite Mode on by default on your laptop               | Auto-detect (≤4 GB / ≤4 cores / Save-Data / reduced motion) | Toggle the navbar bolt, or set `localStorage.reduce-effects = "false"`                               |
| Horizontal scroll at 320px                           | Flex child overflow                                         | Add `min-w-0` on flex/grid children                                                                  |
| 404 page missing nav/footer                          | `not-found.tsx` omitted chrome                              | Keep Navbar + Footer; e2e asserts this                                                               |

Agent-oriented patterns (bento layout, data schemas, rebuild steps) live in `.cursor/rules/`.

## License

Copyright © 2022-2026 Andrii Lytvynenko
