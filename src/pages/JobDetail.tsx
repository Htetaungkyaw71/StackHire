import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, DollarSign, Briefcase, Globe, Building2, Clock, Bookmark, Share2 } from "lucide-react";
import { api, Job } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getTechColor } from "@/lib/constants";

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.jobs
      .get(id)
      .then(setJob)
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!id) return;
    setApplying(true);
    try {
      await api.applications.apply(id);
      toast({ title: "Application submitted!", description: "Good luck!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-10 max-w-4xl">
        <div className="h-6 w-24 bg-muted animate-pulse rounded mb-6" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-20 text-center">
        <p className="text-lg text-muted-foreground">Job not found</p>
        <Link to="/jobs">
          <Button variant="link" className="mt-4">Back to jobs</Button>
        </Link>
      </div>
    );
  }

  const salary =
    job.salaryMin && job.salaryMax
      ? `$${(job.salaryMin / 1000).toFixed(0)}k – $${(job.salaryMax / 1000).toFixed(0)}k`
      : null;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      {/* Top bar */}
      <div className="border-b bg-card">
        <div className="container max-w-4xl py-3">
          <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to offers
          </Link>
        </div>
      </div>

      <div className="container max-w-4xl py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Main content */}
          <div className="space-y-6">
            {/* Header card */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground font-bold text-lg">
                  {job.company?.name?.charAt(0)?.toUpperCase() || "C"}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-foreground">{job.title}</h1>
                  <p className="text-muted-foreground mt-0.5">{job.company?.name || "Company"}</p>
                </div>
                {salary && (
                  <p className="text-lg font-bold text-accent whitespace-nowrap">{salary}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-md">
                  <MapPin className="h-3.5 w-3.5" /> {job.location}
                </span>
                {job.isRemote && (
                  <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-md">
                    <Globe className="h-3.5 w-3.5" /> Remote
                  </span>
                )}
                <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-md">
                  <Briefcase className="h-3.5 w-3.5" /> {job.type}
                </span>
                <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-md">
                  <Clock className="h-3.5 w-3.5" /> {job.level}
                </span>
              </div>

              {/* Tech stack */}
              {job.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {job.techStack.map((tech) => (
                    <span
                      key={tech}
                      className={`px-2.5 py-1 rounded text-xs font-medium border ${getTechColor(tech)}`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="font-semibold text-lg text-foreground mb-4">Job description</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-[15px]">
                {job.description}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply card */}
            <div className="bg-card border rounded-lg p-5 space-y-3 sticky top-20">
              {isAuthenticated && user?.role === "CANDIDATE" ? (
                <>
                  <Button onClick={handleApply} disabled={applying} className="w-full" size="lg">
                    {applying ? "Applying..." : "Apply now"}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-1.5" size="sm">
                      <Bookmark className="h-3.5 w-3.5" /> Save
                    </Button>
                    <Button variant="outline" className="flex-1 gap-1.5" size="sm">
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </Button>
                  </div>
                </>
              ) : !isAuthenticated ? (
                <>
                  <p className="text-sm text-muted-foreground text-center">Sign in to apply</p>
                  <Link to="/login">
                    <Button className="w-full" size="lg">Sign in</Button>
                  </Link>
                </>
              ) : null}
            </div>

            {/* Company info */}
            {job.company && (
              <div className="bg-card border rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold">
                    {job.company.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{job.company.name}</h3>
                    <p className="text-xs text-muted-foreground">{job.company.location}</p>
                  </div>
                </div>
                {job.company.industry && (
                  <p className="text-xs text-muted-foreground">
                    <Building2 className="inline h-3 w-3 mr-1" />
                    {job.company.industry}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
