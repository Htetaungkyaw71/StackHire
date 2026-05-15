SEO improvements implemented

What I added:

- JobPosting JSON-LD in `src/pages/JobDetail.tsx` for rich results.
- Per-search meta title/description and canonical that includes `?search=` in `src/pages/Jobs.tsx`.
- `scripts/generate-sitemap.js` that writes `public/sitemap.xml` including popular tag search URLs.
- `npm run generate-sitemap` script added to `package.json`.

How to use:

1. Generate sitemap:

```bash
npm run generate-sitemap
```

2. Serve the site or deploy the `dist` from `vite build` and ensure `public/sitemap.xml` is served at `https://your-site.com/sitemap.xml`.

Recommended next steps for stronger SEO (I can implement):

- Prerender/tag pages with `vite-plugin-ssg` so Google crawlers receive full HTML for tag and job pages.
- Prerender top N job detail pages into static HTML during build.
- Add structured `JobPosting` JSON-LD enhancements and `structured data` testing.
- Submit sitemap to Google Search Console and monitor indexing.

If you want, I can integrate `vite-plugin-ssg` and prerender the popular tag pages next.
