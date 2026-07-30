# SEO Verification Report: Things to Do in Shanghai

> **Site:** https://www.things-to-do-in-shanghai-china.com
> **Framework:** Astro v5.7.0
> **Pages:** 13 (12 indexable + 1 404)
> **Audit Date:** 2026-07-29
> **Audit Method:** Source code + built output analysis

---

## Summary

| Check | Status | Issues |
|-------|--------|--------|
| Technical SEO | ⚠️ | 2 critical, 6 warnings |
| Schema Markup | ❌ | 2 critical, 3 warnings |
| Content Quality | ⚠️ | 1 critical, 4 warnings |
| Page-level | ⚠️ | 1 critical, 2 warnings |

**Score: 58/100**

---

## Must Fix (Launch Blockers)

### 1. ❌ robots.txt sitemap URL mismatch
- **File:** `public/robots.txt:L6`
- **Problem:** References `https://things-to-do-in-shanghai-china.com/sitemap-index.xml` (missing `www.`), but `astro.config.mjs` defines site as `https://www.things-to-do-in-shanghai-china.com`
- **Fix:** Change line 6 to: `Sitemap: https://www.things-to-do-in-shanghai-china.com/sitemap-index.xml`

### 2. ❌ FAQPage schema placed outside `<html>` element
- **File:** `src/pages/index.astro:L275-L287`
- **Problem:** The FAQPage JSON-LD script tag appears after `</BaseLayout>` closing tag, which places it outside the `<html>` document. Search engines may not parse it.
- **Fix:** Move the FAQPage schema inside `<BaseLayout>` as a slot, or add it via a frontmatter prop to BaseLayout.

### 3. ❌ All images missing width/height attributes (CLS risk)
- **Files:** All `.astro` pages containing `<img>` tags
- **Problem:** Every `<img>` tag lacks explicit `width` and `height` attributes. This causes Cumulative Layout Shift as images load. Per Core Web Vitals: CLS must be < 0.1.
- **Fix:** Add `width` and `height` attributes to every `<img>` tag matching the actual image dimensions (e.g., `width="1200" height="630"`).

### 4. ❌ No author attribution (E-E-A-T failure)
- **Files:** `src/layouts/BaseLayout.astro`, all page files
- **Problem:** No author names or credentials anywhere on the site. The footer shows © ShanghaiGuide but no person. E-E-A-T requires named authors with real credentials, especially for travel recommendation content.
- **Fix:** Add an author field to BaseLayout props (e.g., `"Jamie Chen, Shanghai-based Travel Writer"`) and display it on each page. Add author bio section to the About page.

### 5. ❌ Dead guide links — all point to `#`
- **File:** `src/pages/guides.astro:L5-L11`
- **Problem:** All 6 guide cards link to `slug: "#"`. Clicking any guide goes nowhere. This creates a dead-end user experience and wastes crawl budget.
- **Fix:** Either create the actual guide pages or change guides to non-clickable cards with "Coming Soon" labels until content is ready.

---

## Should Fix (Before Next Sprint)

### 6. ⚠️ Google Fonts CDN — self-host instead
- **File:** `src/layouts/BaseLayout.astro:L43-L45`
- **Problem:** Uses `fonts.googleapis.com` CDN for Outfit font. This is an external blocking request that impacts LCP and has privacy implications (GDPR).
- **Fix:** Install `@fontsource/outfit` and import in `global.css`:
  ```css
  @import "@fontsource/outfit/300.css";
  @import "@fontsource/outfit/400.css";
  /* ... all weights used ... */
  ```
  Then remove the three Google Fonts `<link>` tags.

### 7. ⚠️ Missing Organization schema
- **File:** `src/layouts/BaseLayout.astro`
- **Problem:** Only WebSite schema is present. Organization schema is required globally per standards.
- **Fix:** Add to BaseLayout head:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ShanghaiGuide",
    "url": "https://www.things-to-do-in-shanghai-china.com",
    "description": "Independent travel guide to Shanghai with honest, firsthand recommendations."
  }
  ```

### 8. ⚠️ Missing BreadcrumbList schema on all pages
- **File:** `src/layouts/BaseLayout.astro`
- **Problem:** No BreadcrumbList schema on any page. Required for all pages per standards.
- **Fix:** Add BreadcrumbList JSON-LD to BaseLayout, dynamically generated from the page path.

### 9. ⚠️ Missing security headers
- **File:** (create) `public/_headers`
- **Problem:** No security headers configured. Missing X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- **Fix:** Create `public/_headers`:
  ```
  /*
    X-Content-Type-Options: nosniff
    X-Frame-Options: DENY
    Referrer-Policy: strict-origin-when-cross-origin
    Permissions-Policy: camera=(), microphone=(), geolocation=()
  ```

### 10. ⚠️ Missing RSS feed
- **Files:** Missing `src/pages/rss.xml.js`
- **Problem:** No RSS endpoint exists. Required for content discovery and AI crawler indexing.
- **Fix:** Install `@astrojs/rss` and create `src/pages/rss.xml.js` with blog/content feed. Add `<link rel="alternate" type="application/rss+xml">` to BaseLayout head.

### 11. ⚠️ Missing Article/BlogPosting schema on content pages
- **Files:** `src/pages/blog.astro`, `src/pages/guides.astro`, all content pages
- **Problem:** Content pages have no Article or BlogPosting structured data. Required for rich results eligibility.
- **Fix:** Add Article schema to all content pages via a prop passed to BaseLayout or a dedicated SEO component.

### 12. ⚠️ Hero image missing fetchpriority="high"
- **File:** `src/pages/index.astro:L44-L50`
- **Problem:** The LCP hero image has `loading="eager"` but no `fetchpriority="high"`. This delays LCP.
- **Fix:** Add `fetchpriority="high"` to the hero image.

### 13. ⚠️ External Leaflet loaded from unpkg CDN
- **File:** `src/pages/index.astro:L221-L222`
- **Problem:** Leaflet CSS and JS are loaded from `unpkg.com` at page level. This adds render-blocking external requests. The JS is inline in the page, inflating HTML size.
- **Fix:** Install `leaflet` via npm, import in the page frontmatter, or at minimum add `<link rel="dns-prefetch" href="https://unpkg.com">` and `<link rel="preconnect">` for the CDN.

### 14. ⚠️ No `astro check` / lint script
- **File:** `package.json`
- **Problem:** Missing `"lint": "astro check"` script. Build quality gate is absent.
- **Fix:** Add `"lint": "astro check"` to scripts.

### 15. ⚠️ Blog posts have no detail pages
- **File:** `src/pages/blog.astro`
- **Problem:** The blog listing page shows 6 posts, but none have individual article pages. Blog cards are not clickable to any detail URL.
- **Fix:** Either create individual blog post pages in `src/pages/blog/` or use Astro content collections for blog articles.

---

## Nice to Have

### 16. 💡 Content collections for better content management
All content is hardcoded in `.astro` files. Migrating to Astro content collections (`.md`/`.mdx` files in `src/content/`) would enable:
- Easier content editing (Markdown frontmatter)
- Automatic schema validation
- RSS feed generation
- Better separation of content from presentation

### 17. 💡 Better internal linking
Pages only link via navigation and footer. Add contextual internal links within body content (e.g., the Food page linking to specific attractions nearby, or Day Trips linking to relevant guides).

### 18. 💡 Missing TouristAttraction schema for map POIs
The homepage's Leaflet map contains 28 locations with names and descriptions. Adding TouristAttraction or LocalBusiness schema for these entities would improve rich result opportunities.

### 19. 💡 Dedicated SEO component
SEO meta tags, schema, and social tags are all inline in `BaseLayout.astro`. Extract into a reusable `<SEO />` component for cleaner code and easier per-page overrides.

### 20. 💡 No dark mode support
The site uses `bg-white` hardcoded throughout. Adding dark mode via Tailwind's `dark:` variant and `prefers-color-scheme` would improve UX.

### 21. 💡 Sitemap lacks lastmod/priority
The generated sitemap only contains `<loc>` URLs with no `<lastmod>`, `<changefreq>`, or `<priority>` fields. This limits the sitemap's usefulness for search engines.

### 22. 💡 No `llms.txt` file
Missing `public/llms.txt` for AI crawler directives. Create one listing key content URLs for AI discovery.

---

## Page Inventory

| # | URL | Title | Status |
|---|-----|-------|--------|
| 1 | `/` | Things to Do in Shanghai, China — Ultimate Travel Guide | ✅ Published |
| 2 | `/about/` | About ShanghaiGuide | ✅ Published |
| 3 | `/attractions/` | Best Attractions in Shanghai | ✅ Published |
| 4 | `/blog/` | Shanghai Travel Blog | ⚠️ No detail pages |
| 5 | `/day-trips/` | Day Trips from Shanghai | ✅ Published |
| 6 | `/food/` | Shanghai Food Guide | ✅ Published |
| 7 | `/free/` | Free Things to Do in Shanghai | ✅ Published |
| 8 | `/guides/` | Shanghai Guides | ❌ All links dead |
| 9 | `/itinerary/` | Shanghai Itinerary: 3-5 Days | ✅ Published |
| 10 | `/nightlife/` | Shanghai Nightlife Guide | ✅ Published |
| 11 | `/shopping/` | Shanghai Shopping Guide | ✅ Published |
| 12 | `/with-kids/` | Shanghai with Kids | ✅ Published |
| 13 | `/404/` | Page Not Found | ✅ Published (noindex) |

---

## Content Word Count Estimate

| Page | Est. Words | Page Type | Min Target | Status |
|------|-----------|-----------|------------|--------|
| Homepage | ~350 | Homepage | 500 | ⚠️ Below target |
| About | ~300 | Informational | 500 | ⚠️ Below target |
| Attractions | ~400 | Listicle | 1,200 | ⚠️ Below target |
| Blog | ~350 | Journal | 1,200 | ⚠️ Below target |
| Day Trips | ~300 | Listicle | 1,200 | ⚠️ Below target |
| Food | ~500 | Listicle + Guide | 1,200 | ⚠️ Below target |
| Free | ~350 | Listicle | 1,200 | ⚠️ Below target |
| Guides | ~250 | Directory | 800 | ❌ Thin |
| Itinerary | ~800 | Pillar/Guide | 1,500 | ⚠️ Below target |
| Nightlife | ~400 | Listicle | 1,200 | ⚠️ Below target |
| Shopping | ~350 | Listicle | 1,200 | ⚠️ Below target |
| With Kids | ~400 | Listicle | 1,200 | ⚠️ Below target |

> **Note:** Most pages are card-based listicles with minimal body text. Word counts are estimated from visible text content only. All pages except the itinerary fall below their page type minimums.

---

## Design & UX Notes

| Aspect | Status | Notes |
|--------|--------|-------|
| Font choice | ✅ | Outfit — modern, clean, appropriate for travel |
| Color palette | ✅ | Green brand color (nature/travel), good contrast |
| Mobile responsiveness | ✅ | Tailwind responsive classes used throughout |
| Navigation | ✅ | 7 main links + footer nav, good IA |
| Dark mode | ❌ | Not implemented |
| Footer E-E-A-T | ⚠️ | No author, no about link in bio text |
| Page load performance | ⚠️ | Google Fonts CDN + Leaflet CDN = 4 external blocking requests |

---

## Build Verification

- `npx astro build`: ✅ Passes (verified via dist/ output)
- Sitemap URLs: 12 indexable pages
- No broken internal links in navigation
- 404 page: ✅ Present with noindex
- HTML output: Valid, but FAQPage schema placed outside `<html>`

---

## Action Priority Summary

| Priority | Count | Items |
|----------|-------|-------|
| 🔴 Critical (Must Fix) | 5 | #1 robots.txt URL, #2 FAQPage schema location, #3 image width/height, #4 author attribution, #5 dead guide links |
| 🟡 Should Fix | 10 | #6 Google Fonts, #7 Organization schema, #8 BreadcrumbList, #9 security headers, #10 RSS feed, #11 Article schema, #12 fetchpriority, #13 Leaflet CDN, #14 lint script, #15 blog detail pages |
| 🟢 Nice to Have | 7 | #16 content collections, #17 internal linking, #18 TouristAttraction schema, #19 SEO component, #20 dark mode, #21 sitemap enhancement, #22 llms.txt |
