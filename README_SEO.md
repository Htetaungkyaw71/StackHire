SEO improvements implemented

What I added:

- JobPosting JSON-LD in `src/pages/JobDetail.tsx` for rich results.
- Per-search meta title/description and clean canonicals like `/search/react-developer` in `src/pages/Jobs.tsx`.
- Static metadata for public pages (`/about`, `/contact`, `/privacy`, `/terms`).
- `scripts/copy-index-to-search.js` that writes static SEO landing HTML into `dist` for popular search paths and public pages.
- `scripts/generate-job-pages.js` that can prerender recent job detail pages during build when `SEO_API_URL` or `VITE_API_URL` points to the deployed API.
- `scripts/generate-sitemap.js` that writes current clean URLs to both `public/sitemap.xml` and `dist/sitemap.xml` after a build.
- Central SEO data in `scripts/seo-data.js`.

How to use:

1. Generate sitemap:

```bash
npm run generate-sitemap
```

2. Build and deploy:

```bash
npm run build
```

The build creates the `dist/search/...` landing pages and writes the deployable sitemap to `dist/sitemap.xml`.

To include static job detail pages in the build, set one of these environment variables in your deploy environment:

```bash
SEO_API_URL=https://your-api-domain.com
# or
VITE_API_URL=https://your-api-domain.com
```

Optional:

```bash
SEO_JOB_PAGE_LIMIT=50
```

Recommended next steps for stronger SEO (I can implement):

- Prerender/tag pages with `vite-plugin-ssg` so Google crawlers receive full HTML for tag and job pages.
- Prerender top N job detail pages into static HTML during build.
- Add structured `JobPosting` JSON-LD enhancements and `structured data` testing.
- Deploy the latest build, then submit `https://www.stackhire.online/sitemap.xml` in Google Search Console.
- Use URL Inspection in Google Search Console for `https://www.stackhire.online/` and request indexing.
- Monitor the Coverage/Pages report for crawl or indexing errors.

If you want, I can integrate `vite-plugin-ssg` and prerender the popular tag pages next.
