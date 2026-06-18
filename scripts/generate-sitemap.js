import fs from "fs";
import path from "path";
import { SITE_URL, searchTags, slugifyTag, staticPages } from "./seo-data.js";

const urls = [];

const today = new Date().toISOString().split("T")[0];

// root
urls.push({
  loc: `${SITE_URL}/`,
  lastmod: today,
  changefreq: "daily",
  priority: "1.0",
});

// static pages
for (const page of staticPages) {
  urls.push({
    loc: `${SITE_URL}${page.path}`,
    lastmod: today,
    changefreq: page.changefreq,
    priority: page.priority,
  });
}

// clean search landing pages
for (const tag of searchTags) {
  urls.push({
    loc: `${SITE_URL}/search/${slugifyTag(tag)}`,
    lastmod: today,
    changefreq: "weekly",
    priority: "0.7",
  });
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
  )
  .join("\n")}\n</urlset>`;

const outDir = path.join(process.cwd(), "public");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);

const distDir = path.join(process.cwd(), "dist");
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);
}

console.log("Sitemap written to public/sitemap.xml");
if (fs.existsSync(distDir)) console.log("Sitemap written to dist/sitemap.xml");
