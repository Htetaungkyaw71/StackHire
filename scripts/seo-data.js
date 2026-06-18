export const SITE_URL = process.env.SITE_URL || "https://www.stackhire.online";

export const searchTags = [
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

export const staticPages = [
  {
    path: "/about",
    title: "About StackHire | Tech jobs for developers",
    description:
      "Learn how StackHire helps developers discover relevant software jobs by role, tech stack, location, and remote preference.",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/contact",
    title: "Contact StackHire",
    description:
      "Contact StackHire for help with developer jobs, hiring, or questions about the StackHire job platform.",
    changefreq: "monthly",
    priority: "0.5",
  },
  {
    path: "/privacy",
    title: "Privacy Policy | StackHire",
    description:
      "Read the StackHire privacy policy for details about data used to operate the developer job platform.",
    changefreq: "yearly",
    priority: "0.3",
  },
  {
    path: "/terms",
    title: "Terms of Use | StackHire",
    description:
      "Read the StackHire terms of use for candidates and recruiters using the job platform.",
    changefreq: "yearly",
    priority: "0.3",
  },
];

export const slugifyTag = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
