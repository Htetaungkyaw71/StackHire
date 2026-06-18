import fs from "fs";
import path from "path";
import { SITE_URL, slugifyTag } from "./seo-data.js";

const API_URL = process.env.SEO_API_URL || process.env.VITE_API_URL || "";
const JOB_PAGE_LIMIT = Number(process.env.SEO_JOB_PAGE_LIMIT || 50);
const distDir = path.join(process.cwd(), "dist");
const indexPath = path.join(distDir, "index.html");
const manifestPath = path.join(distDir, ".seo-job-pages.json");

if (!fs.existsSync(indexPath)) {
  console.error("dist/index.html not found - run `vite build` first");
  process.exit(1);
}

if (!API_URL) {
  fs.writeFileSync(manifestPath, "[]");
  console.log("Skipped job page prerender: SEO_API_URL or VITE_API_URL is not set.");
  process.exit(0);
}

const indexHtml = fs.readFileSync(indexPath, "utf8");

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const stripHtml = (value) =>
  String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const truncate = (value, maxLength) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}...`;
};

const setTag = (html, pattern, replacement) =>
  pattern.test(html) ? html.replace(pattern, replacement) : html;

const addJsonLd = (html, data) =>
  html.replace(
    "</head>",
    `    <script type="application/ld+json">${JSON.stringify(data)}</script>\n  </head>`,
  );

const withSeo = (html, { title, description, canonical, jsonLd }) => {
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

  return addJsonLd(next, jsonLd);
};

const apiUrl = (pathname) => new URL(pathname, API_URL).toString();

const validThrough = (job) => {
  if (job.expiresAt) return job.expiresAt;
  const createdAt = job.createdAt ? new Date(job.createdAt) : new Date();
  if (Number.isNaN(createdAt.getTime())) return undefined;
  createdAt.setDate(createdAt.getDate() + 90);
  return createdAt.toISOString();
};

const jobJsonLd = (job, canonical) => ({
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: job.title,
  description: stripHtml(job.description),
  datePosted: job.createdAt,
  validThrough: validThrough(job),
  employmentType: job.type,
  hiringOrganization: {
    "@type": "Organization",
    name: job.company_name || job.company?.name || "StackHire employer",
    ...(job.company?.website ? { sameAs: job.company.website } : {}),
  },
  ...(job.isRemote
    ? {
        jobLocationType: "TELECOMMUTE",
        applicantLocationRequirements: {
          "@type": "Country",
          name: "Worldwide",
        },
      }
    : {}),
  jobLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: job.location || "Remote",
    },
  },
  url: canonical,
  ...(job.salaryMin || job.salaryMax
    ? {
        baseSalary: {
          "@type": "MonetaryAmount",
          currency: "USD",
          value: {
            "@type": "QuantitativeValue",
            ...(job.salaryMin ? { minValue: job.salaryMin } : {}),
            ...(job.salaryMax ? { maxValue: job.salaryMax } : {}),
            unitText: "MONTH",
          },
        },
      }
    : {}),
});

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
};

try {
  const jobsResponse = await fetchJson(
    apiUrl(`/jobs?page=1&limit=${JOB_PAGE_LIMIT}&sort=newest`),
  );
  const jobs = Array.isArray(jobsResponse) ? jobsResponse : jobsResponse.data || [];
  const pages = [];

  for (const item of jobs) {
    const job = await fetchJson(apiUrl(`/jobs/${item.id}`));
    const slug = `${slugifyTag(job.title || "job")}-${job.id}`;
    const routePath = `/jobs/${slug}`;
    const canonical = `${SITE_URL}${routePath}`;
    const companyName = job.company_name || job.company?.name || "StackHire";
    const title = `${job.title} at ${companyName} | StackHire`;
    const description = truncate(
      `${job.title} in ${job.location || "Remote"}${job.isRemote ? " (Remote)" : ""}. ${stripHtml(job.description)}`,
      155,
    );
    const html = withSeo(indexHtml, {
      title,
      description,
      canonical,
      jsonLd: jobJsonLd(job, canonical),
    });
    const outDir = path.join(distDir, routePath.replace(/^\//, ""));

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), html);
    pages.push({
      loc: canonical,
      lastmod: (job.createdAt || new Date().toISOString()).slice(0, 10),
      changefreq: "weekly",
      priority: "0.8",
    });
  }

  fs.writeFileSync(manifestPath, JSON.stringify(pages, null, 2));
  console.log(`Prerendered ${pages.length} job detail pages.`);
} catch (error) {
  fs.writeFileSync(manifestPath, "[]");
  console.warn(`Skipped job page prerender: ${error.message}`);
}
