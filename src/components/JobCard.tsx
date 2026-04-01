import { Link } from "react-router-dom";
import { MapPin, Bookmark, Globe } from "lucide-react";
import { Job } from "@/lib/api";
import { getTechColor } from "@/lib/constants";

const JobCard = ({ job }: { job: Job }) => {
  const salary =
    job.salaryMin && job.salaryMax
      ? `${(job.salaryMin / 1000).toFixed(0)}k – ${(job.salaryMax / 1000).toFixed(0)}k`
      : job.salaryMin
      ? `From ${(job.salaryMin / 1000).toFixed(0)}k`
      : null;

  return (
    <Link to={`/jobs/${job.id}`} className="block group">
      <div className="flex items-center gap-4 px-5 py-4 border-b bg-card hover:bg-muted/50 transition-colors">
        {/* Company logo placeholder */}
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground font-bold text-sm">
          {job.company?.name?.charAt(0)?.toUpperCase() || "C"}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-card-foreground truncate text-[15px]">
              {job.title}
            </h3>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="font-medium">{job.company?.name || "Company"}</span>
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
            {job.isRemote && (
              <span className="flex items-center gap-0.5">
                <Globe className="h-3 w-3" />
                Remote
              </span>
            )}
          </div>
        </div>

        {/* Tech tags */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          {job.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getTechColor(tech)}`}
            >
              {tech}
            </span>
          ))}
          {job.techStack.length > 3 && (
            <span className="text-[11px] text-muted-foreground">
              +{job.techStack.length - 3}
            </span>
          )}
        </div>

        {/* Salary */}
        <div className="flex items-center gap-3 shrink-0">
          {salary && (
            <span className="text-sm font-semibold text-accent whitespace-nowrap">
              {salary} USD
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              // TODO: save job
            }}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
