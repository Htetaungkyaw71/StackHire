import fs from "fs";
import path from "path";

// Popular tags should match the ones in FilterSidebar
const tags = [
  "Frontend Developer",
  "Backend Developer",
  "Software Engineer",
  "Full Stack Developer",
  "JavaScript Developer",
  "React Developer",
  "DevOps Engineer",
  "Data Engineer",
  "Mobile Developer",
  "UI/UX Designer",
  "QA Engineer",
  "AI Engineer",
  "Machine Learning Engineer",
  "Next.js Developer",
  "TypeScript Developer",
  "Golang Developer",
  "Rust Developer",
  "Cloud Architect",
  "Site Reliability Engineer",
  "DevSecOps Engineer",
  "Product Manager",
  "Data Scientist",
  "Prompt Engineer",
  "Cybersecurity Engineer",
  "Automation Engineer",
  "Platform Engineer",
  "Solutions Architect",
  "Blockchain Developer",
  "Embedded Systems Engineer",
  "Product Designer",
];

const SITE_URL = process.env.SITE_URL || "https://www.stackhire.online";

const urls = [];

const today = new Date().toISOString().split("T")[0];

// root
urls.push({ loc: `${SITE_URL}/`, lastmod: today, changefreq: "daily", priority: "1.0" });

// tags
for (const tag of tags) {
  const q = encodeURIComponent(tag);
  urls.push({
    loc: `${SITE_URL}/?search=${q}`,
    lastmod: today,
    changefreq: "weekly",
    priority: "0.7",
  });
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
  .join('\n')}\n</urlset>`;

const outDir = path.join(process.cwd(), "public");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);
console.log("Sitemap written to public/sitemap.xml");
