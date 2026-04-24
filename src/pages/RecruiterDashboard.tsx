import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { api, Job, Company } from "@/lib/api";
import ThemeToggle from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Building2,
  Plus,
  MapPin,
  SquareArrowOutUpRight,
  Pencil,
  Trash2,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Users,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Bookmark,
  Menu,
  X,
} from "lucide-react";

type SidebarTab = "overview" | "jobs" | "company" | "saved";

const DashboardSkeleton = () => (
  <div className="flex h-screen bg-background overflow-hidden flex-col md:flex-row">
    <aside className="fixed md:relative md:block w-60 shrink-0 bg-card border-r border-border flex flex-col z-40 h-screen md:h-auto">
      <div className="px-3 md:px-4 py-3 md:py-4 mt-1.5 border-slate-100">
        <div className="flex items-center gap-2 md:gap-3">
          <Skeleton className="w-8 md:w-9 h-8 md:h-9 rounded-full shrink-0" />
          <div className="min-w-0 space-y-2 flex-1">
            <Skeleton className="h-3 w-28 rounded-full" />
            <Skeleton className="h-3 w-20 rounded-full" />
          </div>
        </div>
      </div>

      <div className="flex-1 px-2 md:px-3 py-3 md:py-4 space-y-2">
        <Skeleton className="h-3 w-10 rounded-full mb-3" />
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>

      <div className="px-2 md:px-3 py-3 md:py-4 border-t border-slate-100 space-y-2">
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
      <div className="px-2 md:px-3 py-3 md:py-4 border-t border-slate-100 space-y-2">
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </aside>

    <main className="flex-1 overflow-y-auto w-full md:w-auto">
      <header className="bg-card border-b shadow-lg border-border px-4 md:px-8 py-3 md:py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg md:hidden" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-3 w-40 rounded-full hidden sm:block" />
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </header>

      <div className="px-4 md:px-8 py-4 md:py-7 space-y-7">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-card rounded-2xl border shadow-lg border-border p-4 md:p-5 flex items-center gap-3 md:gap-4"
            >
              <Skeleton className="w-10 md:w-11 h-10 md:h-11 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl border shadow-lg border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-border/80">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <div className="divide-y divide-border/80">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-4 md:p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3 rounded-full" />
                    <Skeleton className="h-3 w-1/2 rounded-full" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border shadow-lg border-border p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <Skeleton className="w-10 md:w-12 h-10 md:h-12 rounded-xl shrink-0" />
            <div className="min-w-0 space-y-2 flex-1">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-3 w-48 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

const RecruiterDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { savedJobs, removeJob } = useSavedJobs();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SidebarTab>("overview");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profilesRes, companiesRes, jobsRes] = await Promise.all([
        api.recruiter.get().catch(() => []),
        api.company.get().catch(() => []),
        api.jobs.list().catch(() => []),
      ]);

      if (profilesRes.length === 0) {
        navigate("/recruiter/profile");
        return;
      }

      if (companiesRes.length > 0) {
        setCompany(companiesRes[0]);
      } else {
        navigate("/recruiter/create-company");
        return;
      }
      setJobs(jobsRes.filter((j) => j.postedById === user?.id));
    } catch {}
    setLoading(false);
  };

  const handleDeleteRequest = (jobId: string) => {
    setJobToDelete(jobId);
    setDeleteModalOpen(true);
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      await api.jobs.delete(jobToDelete);
      setJobs(jobs.filter((j) => j.id !== jobToDelete));
      toast({ title: "Job deleted successfully" });
      setDeleteModalOpen(false);
      setJobToDelete(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const navItems = [
    { id: "overview" as SidebarTab, label: "Overview", icon: LayoutDashboard },
    { id: "jobs" as SidebarTab, label: "My Jobs", icon: Briefcase },
    { id: "company" as SidebarTab, label: "Company", icon: Building2 },
    { id: "saved" as SidebarTab, label: "Saved", icon: Bookmark },
  ];

  const activeJobsCount = jobs.length;
  const recentJobs = jobs.slice(0, 3);

  return (
    <div className="flex h-screen bg-background overflow-hidden flex-col md:flex-row">
      {/* ── Sidebar ── */}
      <aside
        className={`fixed md:relative md:block w-60 shrink-0 bg-card border-r border-border flex flex-col z-40 h-screen md:h-auto transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo / brand */}
        {/* <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-content-center items-center justify-center">
              <ArrowLeft />
            </div>
            <span className="font-bold text-slate-800 text-sm tracking-tight">
              Back to Home
            </span>
          </div>
        </div> */}

        {/* User info */}
        <div className="px-3 md:px-4 py-3 md:py-4 mt-1.5 border-slate-100">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 md:w-9 h-8 md:h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs md:text-sm font-bold shrink-0">
              {user?.email?.charAt(0).toUpperCase() ?? "R"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {company?.name ?? "My Company"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 md:px-3 py-3 md:py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">
            Menu
          </p>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                ${
                  activeTab === id
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${activeTab === id ? "text-indigo-500" : "text-muted-foreground group-hover:text-foreground"}`}
              />
              {label}
              {id === "jobs" && jobs.length > 0 && (
                <span className="ml-auto text-[11px] font-semibold bg-indigo-100 text-indigo-600 rounded-full px-1.5 py-0.5 leading-none">
                  {jobs.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-2 md:px-3 py-3 md:py-4 border-slate-100 space-y-0.5">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium text-muted-foreground hover:bg-gradient-to-br hover:from-indigo-500 hover:to-violet-500 hover:text-white transition-all duration-300 group"
            onClick={() => setSidebarOpen(false)}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>

        <div className="px-2 md:px-3 py-3 md:py-4 border-t border-slate-100 space-y-0.5">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/");
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150 group"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto w-full md:w-auto">
        {/* Top bar */}
        <header className="bg-card border-b shadow-lg border-border px-4 md:px-8 py-3 md:py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-muted rounded-lg"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5 text-foreground/80" />
                ) : (
                  <Menu className="w-5 h-5 text-foreground/80" />
                )}
              </button>
              <div>
                <h1 className="text-sm md:text-base font-bold text-foreground">
                  {activeTab === "overview" && "Overview"}
                  {activeTab === "jobs" && "My Job Postings"}
                  {activeTab === "company" && "Company Profile"}
                  {activeTab === "saved" && "Saved Jobs"}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            <Link to="/recruiter/create-job">
              <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-xs md:text-sm font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/40 active:scale-95 transition-all duration-150 whitespace-nowrap">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Post a Job</span>
                <span className="sm:hidden">Post</span>
              </button>
            </Link>
          </div>
        </header>

        <div className="px-4 md:px-8 py-4 md:py-7">
          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <div className="space-y-7">
              {/* Stat cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {[
                  {
                    label: "Active Postings",
                    value: activeJobsCount,
                    icon: Briefcase,
                    color: "from-indigo-500 to-violet-500",
                    bg: "bg-indigo-50",
                    text: "text-indigo-600",
                  },
                  {
                    label: "Total Applicants",
                    value: "—",
                    icon: Users,
                    color: "from-emerald-400 to-teal-500",
                    bg: "bg-emerald-50",
                    text: "text-emerald-600",
                  },
                  {
                    label: "Avg. Time to Fill",
                    value: "—",
                    icon: Clock,
                    color: "from-amber-400 to-orange-400",
                    bg: "bg-amber-50",
                    text: "text-amber-600",
                  },
                ].map(({ label, value, icon: Icon, bg, text }) => (
                  <div
                    key={label}
                    className="bg-card rounded-2xl border shadow-lg border-border p-4 md:p-5 flex items-center gap-3 md:gap-4"
                  >
                    <div
                      className={`w-10 md:w-11 h-10 md:h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-4 md:w-5 h-4 md:h-5 ${text}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        {label}
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent jobs */}
              <div className="bg-card rounded-2xl border shadow-lg border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-border/80">
                  <h2 className="text-xs md:text-sm font-bold text-foreground">
                    Recent Job Postings
                  </h2>
                  <button
                    onClick={() => setActiveTab("jobs")}
                    className="text-xs text-indigo-500 font-semibold flex items-center gap-1 hover:text-indigo-700 transition-colors whitespace-nowrap"
                  >
                    View all{" "}
                    <ChevronRight className="w-3 md:w-3.5 h-3 md:h-3.5" />
                  </button>
                </div>
                {recentJobs.length === 0 ? (
                  <div className="py-12 text-center">
                    <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No jobs posted yet</p>
                    <Link to="/recruiter/create-job">
                      <button className="mt-3 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
                        Post your first job
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border/80">
                    {recentJobs.map((job) => (
                      <JobRow
                        key={job.id}
                        job={job}
                        navigate={navigate}
                        onDelete={handleDeleteRequest}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Company card */}
              {company && (
                <div className="bg-card rounded-2xl border shadow-lg border-border p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs md:text-sm font-bold text-foreground">
                      Company
                    </h2>
                    <Link to="/recruiter/create-company">
                      <button className="text-xs text-indigo-600 dark:text-indigo-300 font-semibold flex items-center gap-1 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors">
                        Edit <Pencil className="w-3 h-3" />
                      </button>
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 md:w-12 h-10 md:h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-base md:text-lg shrink-0">
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-semibold text-foreground truncate">
                        {company.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {company.industry} · {company.location}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── JOBS TAB ── */}
          {activeTab === "jobs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs md:text-sm text-muted-foreground font-medium">
                  {jobs.length} posting{jobs.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
                {jobs.length === 0 ? (
                  <div className="py-16 text-center">
                    <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      No jobs posted yet
                    </p>
                    <Link to="/recruiter/create-job">
                      <button className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/40 active:scale-95 transition-all duration-150">
                        Post your first job
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {jobs.map((job) => (
                      <JobRow
                        key={job.id}
                        job={job}
                        navigate={navigate}
                        onDelete={handleDeleteRequest}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── COMPANY TAB ── */}
          {activeTab === "company" && company && (
            <div className="max-w-lg space-y-4">
              <div className="bg-card rounded-2xl shadow-lg border border-border p-4 md:p-6">
                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                  <div className="w-12 md:w-14 h-12 md:h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg md:text-2xl flex-shrink-0">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base md:text-lg font-bold text-foreground truncate">
                      {company.name}
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">
                      {company.industry}
                    </p>
                  </div>
                </div>

                {company.description && (
                  <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-5 leading-relaxed">
                    {company.description}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 pt-4 border-t border-border">
                  {[
                    { label: "Location", value: company.location },
                    { label: "Size", value: company.size },
                    { label: "Founded", value: company.foundedYear },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-muted rounded-xl p-3 md:p-4">
                      <p className="text-[11px] text-muted-foreground font-medium mb-0.5">
                        {label}
                      </p>
                      <p className="text-xs md:text-sm font-semibold text-foreground">
                        {value}
                      </p>
                    </div>
                  ))}
                  <div className="bg-muted rounded-xl p-3 md:p-4">
                    <p className="text-[11px] text-muted-foreground font-medium mb-0.5">
                      Website
                    </p>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs md:text-sm font-semibold text-indigo-600 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-indigo-200 truncate block transition-colors"
                    >
                      {company.website}
                    </a>
                  </div>
                </div>

                <div className="mt-4 md:mt-5 pt-4 border-t border-border">
                  <Link to="/recruiter/create-company">
                    <button className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/15 hover:border-indigo-400 dark:hover:border-indigo-400/60 hover:-translate-y-0.5 active:scale-95 transition-all duration-150">
                      <Pencil className="w-3 md:w-3.5 h-3 md:h-3.5" />
                      Edit Company
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === "saved" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs md:text-sm text-muted-foreground font-medium">
                  {savedJobs.length} saved post
                  {savedJobs.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
                {savedJobs.length === 0 ? (
                  <div className="py-16 text-center">
                    <Bookmark className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      No saved jobs yet
                    </p>
                    <Link to="/">
                      <button className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/40 active:scale-95 transition-all duration-150">
                        Browse jobs
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {savedJobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between px-3 md:px-6 py-3 md:py-4 hover:bg-muted transition-colors gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="text-xs md:text-sm font-semibold text-foreground hover:text-indigo-600 dark:hover:text-indigo-300 truncate block"
                          >
                            {job.title}
                          </Link>
                          <p className="text-xs text-muted-foreground truncate">
                            {job.company?.name || "Company"} • {job.location}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeJob(job.id)}
                          className="text-xs md:text-sm"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl border border-border bg-card p-7 shadow-2xl">
          <DialogHeader className="space-y-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-foreground">
                  Delete this job?
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <strong className="text-foreground">
              {jobs.find((job) => job.id === jobToDelete)?.title || "This job"}
            </strong>{" "}
            and all its applications will be permanently removed.
          </div>

          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 rounded-xl w-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1 rounded-xl w-full bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              onClick={handleDeleteJob}
            >
              Yes, delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

/* ── Shared job row component ── */
const JobRow = ({
  job,
  navigate,
  onDelete,
}: {
  job: Job;
  navigate: (path: string) => void;
  onDelete: (id: string) => void;
}) => (
  <div
    className="flex items-center justify-between px-3 md:px-6 py-3 md:py-4 cursor-pointer hover:bg-muted transition-colors group gap-2"
    onClick={() => navigate(`/jobs/${job.id}`)}
  >
    <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
      <div className="w-8 md:w-9 h-8 md:h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center shrink-0">
        <Briefcase className="w-3.5 md:w-4 h-3.5 md:h-4 text-indigo-400 dark:text-indigo-300" />
      </div>
      <div className="min-w-0">
        <p className="text-xs md:text-sm font-semibold text-foreground truncate">
          {job.title}
        </p>
        <div className="flex items-center gap-1 md:gap-2 mt-0.5 text-[10px] md:text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-0.5">
            <MapPin className="w-2.5 md:w-3 h-2.5 md:h-3" /> {job.location}
          </span>
          <span>·</span>
          <span>{job.type}</span>
          <span>·</span>
          <span>{job.level}</span>
        </div>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {job.techStack.slice(0, 2).map((t) => (
            <span
              key={t}
              className="px-1.5 py-0.5 rounded-md text-[9px] md:text-[10px] font-semibold bg-muted text-muted-foreground"
            >
              {t}
            </span>
          ))}
          {job.techStack.length > 2 && (
            <span className="text-[9px] md:text-[10px] text-slate-400 leading-none pt-1">
              +{job.techStack.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>

    <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
      <Link to={`/jobs/${job.id}`} onClick={(e) => e.stopPropagation()}>
        <button
          title="View"
          className="p-1.5 md:p-2 rounded-lg text-muted-foreground hover:bg-indigo-50 dark:hover:bg-indigo-500/15 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
        >
          <SquareArrowOutUpRight className="w-3.5 md:w-4 h-3.5 md:h-4" />
        </button>
      </Link>
      <Link
        to={`/recruiter/create-job?edit=${job.id}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          title="Edit"
          className="p-1.5 md:p-2 rounded-lg text-muted-foreground hover:bg-green-50 dark:hover:bg-green-500/15 hover:text-green-600 dark:hover:text-green-300 transition-colors"
        >
          <Pencil className="w-3.5 md:w-4 h-3.5 md:h-4" />
        </button>
      </Link>
      <button
        title="Delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(job.id);
        }}
        className="p-1.5 md:p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
      >
        <Trash2 className="w-3.5 md:w-4 h-3.5 md:h-4" />
      </button>
    </div>
  </div>
);

export default RecruiterDashboard;
