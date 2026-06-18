import fs from "fs";
import path from "path";
import { SITE_URL, searchTags, slugifyTag, staticPages } from "./seo-data.js";

const distDir = path.join(process.cwd(), "dist");
const indexPath = path.join(distDir, "index.html");

if (!fs.existsSync(indexPath)) {
  console.error("dist/index.html not found - run `vite build` first");
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexPath, "utf8");

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const setTag = (html, pattern, replacement) =>
  pattern.test(html) ? html.replace(pattern, replacement) : html;

const withSeo = (html, { title, description, canonical }) => {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeCanonical = escapeHtml(canonical);

  let next = setTag(
    html,
    /<title>.*?<\/title>/,
    `<title>${safeTitle}</title>`,
  );
  next = setTag(
    next,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${safeDescription}" />`,
  );
  next = setTag(
    next,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${safeCanonical}" />`,
  );
  next = setTag(
    next,
    /<link\s+rel="alternate"\s+href="[^"]*"\s+hreflang="en"\s*\/?>/,
    `<link rel="alternate" href="${safeCanonical}" hreflang="en" />`,
  );
  next = setTag(
    next,
    /<link\s+rel="alternate"\s+href="[^"]*"\s+hreflang="x-default"\s*\/?>/,
    `<link rel="alternate" href="${safeCanonical}" hreflang="x-default" />`,
  );
  next = setTag(
    next,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${safeTitle}" />`,
  );
  next = setTag(
    next,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${safeDescription}" />`,
  );
  next = setTag(
    next,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${safeCanonical}" />`,
  );
  next = setTag(
    next,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${safeTitle}" />`,
  );
  next = setTag(
    next,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${safeDescription}" />`,
  );

  return next;
};

const writePage = (routePath, html) => {
  const outDir = path.join(distDir, routePath.replace(/^\//, ""));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);
  console.log(`Wrote ${path.join(routePath.replace(/^\//, ""), "index.html")}`);
};

for (const tag of searchTags) {
  const slug = slugifyTag(tag);
  const routePath = `/search/${slug}`;
  const html = withSeo(indexHtml, {
    title: `${tag} Jobs | StackHire`,
    description: `Find ${tag} jobs on StackHire. Browse fresh developer roles by tech stack, location, remote preference, and salary.`,
    canonical: `${SITE_URL}${routePath}`,
  });

  writePage(routePath, html);
}

for (const page of staticPages) {
  const html = withSeo(indexHtml, {
    title: page.title,
    description: page.description,
    canonical: `${SITE_URL}${page.path}`,
  });

  writePage(page.path, html);
}

console.log("Copied index.html to SEO landing paths.");
