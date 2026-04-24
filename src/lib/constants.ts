export const TECH_STACKS = [
  {
    name: "JavaScript",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  { name: "TypeScript", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { name: "Python", color: "bg-green-100 text-green-800 border-green-200" },
  { name: "Java", color: "bg-red-100 text-red-800 border-red-200" },
  { name: "React", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  {
    name: "Node.js",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  { name: "PHP", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { name: "Ruby", color: "bg-rose-100 text-rose-800 border-rose-200" },
  { name: "Go", color: "bg-sky-100 text-sky-800 border-sky-200" },
  { name: "Rust", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { name: "C#", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { name: "Swift", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { name: "Kotlin", color: "bg-violet-100 text-violet-800 border-violet-200" },
  { name: "DevOps", color: "bg-teal-100 text-teal-800 border-teal-200" },
  { name: "AWS", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { name: "Docker", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { name: "Angular", color: "bg-red-100 text-red-800 border-red-200" },
  { name: "Vue.js", color: "bg-green-100 text-green-800 border-green-200" },
  { name: "SQL", color: "bg-slate-100 text-slate-800 border-slate-200" },
  { name: "Data", color: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200" },
] as const;

export function getTechColor(tech: string): string {
  const found = TECH_STACKS.find(
    (t) => t.name.toLowerCase() === tech.toLowerCase(),
  );
  return found?.color || "bg-secondary text-secondary-foreground border-border";
}

export const JOB_LEVELS = ["JUNIOR", "MID", "SENIOR", "LEAD"] as const;
export const JOB_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "FREELANCE",
] as const;
export const WORKING_MODES = ["Remote", "On-site", "Hybrid"] as const;
export const COMPANY_SIZES = [
  "STARTUP",
  "SMALL",
  "MEDIUM",
  "LARGE",
  "ENTERPRISE",
] as const;
export const HIRING_STATUSES = ["ACTIVELY_HIRING", "OPEN", "CLOSED"] as const;

export const APPLICATION_STATUS_COLORS: Record<string, string> = {
  APPLIED: "bg-blue-100 text-blue-800",
  SHORTLISTED: "bg-amber-100 text-amber-800",
  INTERVIEW: "bg-purple-100 text-purple-800",
  OFFER: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};
