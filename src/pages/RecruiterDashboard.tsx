import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api, Job, Application, Company } from "@/lib/api";
import { APPLICATION_STATUS_COLORS } from "@/lib/constants";
import {
  Briefcase, Users, Building2, Plus, MapPin, Clock, ChevronRight, Trash2,
} from "lucide-react";

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [companiesRes, jobsRes] = await Promise.all([
        api.company.get().catch(() => []),
        api.jobs.list().catch(() => []),
      ]);
      if (companiesRes.length > 0) {
        setCompany(companiesRes[0]);
      } else {
        navigate("/recruiter/create-company");
        return;
      }
      // Filter jobs posted by current user
      setJobs(jobsRes.filter((j) => j.postedById === user?.id));
    } catch {}
    setLoading(false);
  };

  const loadApplications = async (jobId: string) => {
    setSelectedJobId(jobId);
    setLoadingApps(true);
    try {
      const apps = await api.applications.getForJob(jobId);
      setApplications(apps);
    } catch {
      setApplications([]);
    }
    setLoadingApps(false);
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await api.jobs.delete(jobId);
      setJobs(jobs.filter((j) => j.id !== jobId));
      if (selectedJobId === jobId) {
        setSelectedJobId(null);
        setApplications([]);
      }
      toast({ title: "Job deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="container max-w-5xl py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="container max-w-5xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recruiter Dashboard</h1>
            <p className="text-sm text-muted-foreground">{company?.name} • {user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/recruiter/create-job">
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" /> Post a job
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="jobs" className="gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> My Jobs
            </TabsTrigger>
            <TabsTrigger value="company" className="gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Company
            </TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              {/* Job list */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-foreground">{jobs.length} job postings</h2>
                </div>
                <div className="bg-card border rounded-lg overflow-hidden">
                  {jobs.length === 0 ? (
                    <div className="p-8 text-center">
                      <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No jobs posted yet</p>
                      <Link to="/recruiter/create-job">
                        <Button className="mt-3" size="sm">Post your first job</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {jobs.map((job) => (
                        <div
                          key={job.id}
                          className={`p-4 cursor-pointer transition-colors ${
                            selectedJobId === job.id ? "bg-primary/5" : "hover:bg-muted/50"
                          }`}
                          onClick={() => loadApplications(job.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-foreground truncate">{job.title}</h3>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="h-3 w-3" /> {job.location}
                                </span>
                                <span>•</span>
                                <span>{job.type}</span>
                                <span>•</span>
                                <span>{job.level}</span>
                              </div>
                              <div className="flex gap-1 mt-2">
                                {job.techStack.slice(0, 3).map((t) => (
                                  <span key={t} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.id); }}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Applications panel */}
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-3">
                  {selectedJobId ? `Applications` : "Select a job to view applications"}
                </h2>
                <div className="bg-card border rounded-lg overflow-hidden">
                  {!selectedJobId ? (
                    <div className="p-8 text-center">
                      <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click a job to see its applications</p>
                    </div>
                  ) : loadingApps ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-14 bg-muted animate-pulse rounded" />
                      ))}
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No applications yet</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {applications.map((app) => (
                        <div key={app.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {app.user?.email || "Applicant"}
                              </p>
                              {app.candidateProfile?.headline && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {app.candidateProfile.headline}
                                </p>
                              )}
                              {app.candidateProfile?.skills && app.candidateProfile.skills.length > 0 && (
                                <div className="flex gap-1 mt-1.5">
                                  {app.candidateProfile.skills.slice(0, 4).map((s, i) => (
                                    <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-secondary text-secondary-foreground">
                                      {s.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded text-xs font-medium ${APPLICATION_STATUS_COLORS[app.status] || "bg-muted text-muted-foreground"}`}>
                                {app.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company">
            {company && (
              <div className="bg-card border rounded-lg p-6 max-w-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{company.name}</h2>
                    <p className="text-sm text-muted-foreground">{company.industry}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {company.description && (
                    <p className="text-muted-foreground">{company.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    <div>
                      <p className="text-muted-foreground text-xs">Location</p>
                      <p className="font-medium text-foreground">{company.location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Size</p>
                      <p className="font-medium text-foreground">{company.size}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Founded</p>
                      <p className="font-medium text-foreground">{company.foundedYear}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Website</p>
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline truncate block">
                        {company.website}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Link to="/recruiter/create-company">
                    <Button variant="outline" size="sm">Edit Company</Button>
                  </Link>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
