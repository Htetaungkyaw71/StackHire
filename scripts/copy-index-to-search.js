import fs from 'fs';
import path from 'path';

// Keep a short, curated tag list in sync with sitemap generator
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

const distDir = path.join(process.cwd(), "dist");
const indexPath = path.join(distDir, "index.html");

if (!fs.existsSync(indexPath)) {
  console.error("dist/index.html not found — run `vite build` first");
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexPath, "utf8");

for (const tag of tags) {
  const slug = tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const outDir = path.join(distDir, "search", slug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), indexHtml);
  console.log(`Wrote ${path.join("search", slug, "index.html")}`);
}

console.log("Copied index.html to tag search paths.");
