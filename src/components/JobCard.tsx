import { Link, useNavigate } from "react-router-dom";
import { MapPin, Bookmark, Globe } from "lucide-react";
import { Job } from "@/lib/api";
import { getTechColor } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useAuth } from "@/contexts/AuthContext";

const JobCard = ({ job }: { job: Job }) => {
  const { isSaved, toggleSaved } = useSavedJobs();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const formatSalary = (value: number) =>
    new Intl.NumberFormat("en-US").format(value);

  const salary =
    job.salaryMin && job.salaryMax
      ? `$${formatSalary(job.salaryMin)} – $${formatSalary(job.salaryMax)}`
      : job.salaryMin
        ? `From $${formatSalary(job.salaryMin)}`
        : null;

  return (
    <Link to={`/jobs/${job.id}`} className="block group">
      <div className="flex items-center mt-3 rounded-md shadow-md max-md:gap-0 gap-4 px-5 py-5 bg-card border border-border hover:shadow-lg transition-colors">
        {/* Company logo placeholder */}
        {job?.logo ? (
          <div className="h-26 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground font-bold text-sm">
            <img
              src={job?.logo}
              alt=""
              className="h-full w-[70px] max-md:hidden"
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-lg bg-muted max-md:hidden flex items-center justify-center shrink-0 text-muted-foreground font-bold text-lg">
            {job.company_name?.charAt(0)?.toUpperCase() ||
              job.company?.name?.charAt(0)?.toUpperCase() ||
              "C"}
          </div>
        )}

        {/* Main info */}

        <div className="flex-1 min-w-0 space-y-2 max-md:space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
            <h3 className="font-semibold max-md:hidden text-card-foreground truncate text-sm sm:text-[15px] leading-tight flex-1 min-w-0">
              {job.title}
            </h3>
            <div className="flex w-full md:hidden gap-2 items-center justify-between">
              {job?.logo ? (
                <div className="h-26 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground font-bold text-sm">
                  <img
                    src={job?.logo}
                    alt=""
                    className="h-full w-[40px] md:hidden"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg md:hidden bg-muted flex items-center justify-center shrink-0 text-muted-foreground font-bold text-lg">
                  {job.company_name?.charAt(0)?.toUpperCase() ||
                    job.company?.name?.charAt(0)?.toUpperCase() ||
                    "C"}
                </div>
              )}
              {/* <div> */}
              <h3 className="font-semibold text-card-foreground truncate text-sm sm:text-[15px] leading-tight flex-1 min-w-0">
                {job.title}
              </h3>

              {/* </div> */}

              <div className="flex md:hidden items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isAuthenticated) {
                      navigate("/login", { state: { from: "/" } });
                      return;
                    }
                    toggleSaved(job);
                  }}
                  aria-label={isSaved(job.id) ? "Remove saved job" : "Save job"}
                  className={`transition-colors ${isSaved(job.id) ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                >
                  <Bookmark
                    className={`h-4 w-4 ${isSaved(job.id) ? "fill-current" : ""}`}
                  />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="">
                {job?.salary ? (
                  <>
                    {
                      <span className="text-xs sm:text-md font-semibold text-emerald-600 dark:text-emerald-400">
                        {job.salary}
                      </span>
                    }
                  </>
                ) : (
                  <>
                    {salary ? (
                      <span className="text-xs sm:text-md font-semibold text-emerald-600 dark:text-emerald-400">
                        {salary}{" "}
                        <span className="text-muted-foreground text-xs sm:text-md">
                          USD/month
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs sm:text-md font-semibold text-emerald-600 dark:text-emerald-400">
                        Negotiable
                      </span>
                    )}
                  </>
                )}
              </div>

              <div className="flex max-md:hidden items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isAuthenticated) {
                      navigate("/login", { state: { from: "/" } });
                      return;
                    }
                    toggleSaved(job);
                  }}
                  aria-label={isSaved(job.id) ? "Remove saved job" : "Save job"}
                  className={`transition-colors ${isSaved(job.id) ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                >
                  <Bookmark
                    className={`h-4 w-4 ${isSaved(job.id) ? "fill-current" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center  gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="font-medium text-foreground">
                {job.company_name || job?.company?.name || "Company"}
              </span>
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
              {/* <Badge variant="outline" className="text-[10px]">
                {job.type}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {job.level}
              </Badge> */}
            </div>

            <div className="gap-1 max-md:hidden sm:gap-2 flex items-center flex-wrap sm:flex-nowrap">
              {job.techStack.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="px-1.5 py-0.5 bg-muted text-[9px] sm:text-[11px] font-medium border border-border text-foreground rounded whitespace-nowrap"
                >
                  {tech}
                </span>
              ))}
              {job.techStack.length > 3 && (
                <span className="text-[9px] sm:text-[11px] text-muted-foreground whitespace-nowrap">
                  +{job.techStack.length - 3}
                </span>
              )}
            </div>
          </div>
          <div className="gap-1 md:hidden sm:gap-2 flex items-center flex-wrap sm:flex-nowrap">
            {job.techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="px-1.5 py-0.5 bg-muted text-[9px] sm:text-[11px] font-medium border border-border text-foreground rounded whitespace-nowrap"
              >
                {tech}
              </span>
            ))}
            {job.techStack.length > 3 && (
              <span className="text-[9px] sm:text-[11px] text-muted-foreground whitespace-nowrap">
                +{job.techStack.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
