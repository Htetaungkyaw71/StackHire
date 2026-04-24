import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Globe,
  Building2,
  Clock,
  Bookmark,
  Share2,
  Pencil,
  Trash2,
  Users,
  User,
  Loader2,
  Upload,
  LogIn,
  UserPlus,
  FileUp,
  AlertTriangle,
  GraduationCap,
  ArrowRightFromLine,
  ArrowRightIcon,
  ArrowRightToLine,
} from "lucide-react";
import { api, Application, Job } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { APPLICATION_STATUS_COLORS, getTechColor } from "@/lib/constants";

const TECH_STACK_OPTIONS = [
  { name: "JavaScript", image: "/techs/js.png" },
  { name: "Python", image: "/techs/python.png" },
  { name: "Java", image: "/techs/java.png" },
  { name: "PHP", image: "/techs/php.png" },
  { name: "Ruby", image: "/techs/ruby.png" },
  { name: "Go", image: "/techs/go.png" },
  { name: "AWS", image: "/techs/aws.png" },
  { name: "Docker", image: "/techs/docker.png" },
  { name: "MongoDB", image: "/techs/mongodb.png" },
  { name: "MySQL", image: "/techs/mysql.png" },
  { name: "PostgreSQL", image: "/techs/postgresql.png" },
  { name: "HTML", image: "/techs/html.png" },
  { name: "DevOps", image: "/techs/devops.png" },
  { name: "Mobile", image: "/techs/mobile.png" },
  { name: ".NET", image: "/techs/net.png" },
  { name: "UI/UX", image: "/techs/uiux.png" },
  { name: "Flutter", image: "/techs/flutter.png" },
  { name: "Linux", image: "/techs/linus.png" },
  { name: "Testing", image: "/techs/testing.png" },
  { name: "Others", image: "/techs/others.svg" },
] as const;

const formatRelativeDate = (value: string) => {
  const createdAt = new Date(value).getTime();

  if (Number.isNaN(createdAt)) return value;

  const diffInSeconds = Math.max(
    0,
    Math.floor((Date.now() - createdAt) / 1000),
  );

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  return `${Math.floor(diffInHours / 24)}d ago`;
};

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user, login } = useAuth();
  const { toast } = useToast();
  const { isSaved, toggleSaved } = useSavedJobs();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [applicationName, setApplicationName] = useState("");
  const [applicationEmail, setApplicationEmail] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [cvFileName, setCvFileName] = useState("");
  const [uploadingCv, setUploadingCv] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [cvPreviewOpen, setCvPreviewOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const cvInputRef = useRef<HTMLInputElement | null>(null);

  const getDefaultApplicantName = (email: string) =>
    email.split("@")[0].replace(/[._-]/g, " ").trim() || "Candidate";

  const prepareApplicationForm = (email: string) => {
    setApplicationEmail(email);
    setApplicationName(getDefaultApplicantName(email));
    setCvUrl("");
    setCvFileName("");
  };

  useEffect(() => {
    if (!id) return;
    api.jobs
      .get(id)
      .then(setJob)
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const loadApplicationsForRecruiter = async () => {
      if (!id || !job || !user) return;

      const canSeeApplications =
        user.role === "ADMIN" ||
        (user.role === "RECRUITER" && job.postedById === user.id);

      if (!canSeeApplications) return;

      setLoadingApplications(true);
      try {
        const apps = await api.applications.getForJob(id);
        setApplications(apps);
      } catch {
        setApplications([]);
      } finally {
        setLoadingApplications(false);
      }
    };

    void loadApplicationsForRecruiter();
  }, [id, job, user]);

  useEffect(() => {
    const checkIfApplied = async () => {
      if (!id || !isAuthenticated || user?.role !== "CANDIDATE") {
        setHasApplied(false);
        return;
      }

      try {
        const mine = await api.applications.getMine();
        setHasApplied(mine.some((app) => app.jobId === id));
      } catch {
        setHasApplied(false);
      }
    };

    void checkIfApplied();
  }, [id, isAuthenticated, user]);

  const openApplicationFlow = () => {
    if (!id || !job) return;

    // Check if it's an external job with apply link
    if (job.externalJob && job.applyLink) {
      window.open(job.applyLink, "_blank");
      return;
    }

    if (!isAuthenticated || !user) {
      setAuthTab("login");
      setAuthModalOpen(true);
      return;
    }

    if (user.role !== "CANDIDATE") {
      toast({
        title: "Candidates only",
        description: "Only candidate accounts can apply for jobs.",
        variant: "destructive",
      });
      return;
    }

    prepareApplicationForm(user.email);
    setApplicationModalOpen(true);
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthLoading(true);

    try {
      const response = await api.auth.login(loginEmail, loginPassword);
      login(response.user);

      if (response.user.role !== "CANDIDATE") {
        toast({
          title: "Signed in",
          description: "Candidate accounts are required to apply.",
        });
        setAuthModalOpen(false);
        return;
      }

      prepareApplicationForm(response.user.email);
      setAuthModalOpen(false);
      setApplicationModalOpen(true);
      toast({
        title: "Signed in",
        description: "Complete the application form.",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthLoading(true);

    try {
      const response = await api.auth.register(
        registerEmail,
        registerPassword,
        "CANDIDATE",
      );
      login(response.user);
      prepareApplicationForm(response.user.email);
      setAuthModalOpen(false);
      setApplicationModalOpen(true);
      toast({
        title: "Account created",
        description: "Now complete the application form.",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setCvFileName(file.name);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;

    if (!cloudName || !apiKey) {
      toast({
        title: "Upload not configured",
        description:
          "Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_API_KEY.",
        variant: "destructive",
      });
      return;
    }

    setUploadingCv(true);
    try {
      const { signature, timestamp, folder } = await api.uploads.getSignature();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error?.message || "CV upload failed");
      }

      console.log(payload, "payload");

      setCvUrl(payload.secure_url || "");
      setCvFileName(file.name);
      toast({ title: "CV uploaded", description: "Your CV URL is ready." });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingCv(false);
    }
  };

  const handleApplicationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!id) return;

    if (!cvUrl) {
      toast({
        title: "Upload your CV",
        description: "Please upload your CV before submitting.",
        variant: "destructive",
      });
      return;
    }

    setApplying(true);
    try {
      await api.applications.apply({
        jobId: id,
        name: applicationName,
        email: applicationEmail,
        cv_url: cvUrl,
      });
      toast({ title: "Application submitted!", description: "Good luck!" });
      setHasApplied(true);
      setApplicationModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  const canManageJob =
    !!job && !!user && (user.role === "ADMIN" || job.postedById === user.id);

  const getApplicantName = (app: Application) => {
    if (app.name) return app.name;
    const email = app.email || app.user?.email || "";
    if (!email) return "Candidate";
    return email.split("@")[0].replace(/[._-]/g, " ");
  };

  const getApplicantEmail = (app: Application) =>
    app.email || app.user?.email || "No email";

  const handleDeleteJob = async () => {
    if (!job || !canManageJob) return;

    setDeleting(true);
    try {
      await api.jobs.delete(job.id);
      toast({ title: "Job deleted" });
      navigate("/recruiter/dashboard");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleShareJob = async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);

      toast({ title: "Link copied" });
    } catch {
      toast({ title: "Link copied" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-background">
        <div className="mt-5">
          <div className="container flex items-center gap-3 max-w-6xl py-3">
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-28 rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-40 rounded-full bg-muted animate-pulse" />
          </div>
        </div>

        <div className="container max-w-6xl py-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="space-y-6">
              <div className="rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-xl bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="h-8 w-3/4 rounded-lg bg-muted animate-pulse" />
                    <div className="h-4 w-1/2 rounded-lg bg-muted animate-pulse" />
                  </div>
                  <div className="hidden sm:block space-y-2 text-right">
                    <div className="h-4 w-20 rounded-full bg-muted animate-pulse ml-auto" />
                    <div className="h-4 w-16 rounded-full bg-muted animate-pulse ml-auto" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-5">
                  <div className="h-12 w-28 rounded-lg bg-muted animate-pulse" />
                  <div className="h-12 w-24 rounded-lg bg-muted animate-pulse" />
                  <div className="h-12 w-24 rounded-lg bg-muted animate-pulse" />
                </div>
              </div>

              <div className="bg-card shadow-lg border border-border rounded-lg p-6 space-y-5">
                <div className="h-6 w-32 rounded-lg bg-muted animate-pulse" />
                <div className="flex flex-wrap gap-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-9 w-24 rounded-full bg-muted animate-pulse"
                    />
                  ))}
                </div>
                <div className="my-8 border-[1px] border-dashed border-border" />
                <div className="h-6 w-40 rounded-lg bg-muted animate-pulse" />
                <div className="space-y-3">
                  <div className="h-4 w-full rounded bg-muted animate-pulse" />
                  <div className="h-4 w-11/12 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-10/12 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-9/12 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-8/12 rounded bg-muted animate-pulse" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-card shadow-lg border border-border rounded-lg p-5 space-y-4">
                <div className="space-y-2">
                  <div className="h-4 w-16 rounded-full bg-muted animate-pulse" />
                  <div className="h-6 w-28 rounded-lg bg-muted animate-pulse" />
                </div>
                <div className="h-11 w-full rounded-xl bg-muted animate-pulse" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 rounded-lg bg-muted animate-pulse" />
                  <div className="h-10 rounded-lg bg-muted animate-pulse" />
                </div>
              </div>

              <div className="bg-card shadow-lg border border-border rounded-lg p-5 space-y-3">
                <div className="h-4 w-24 rounded-full bg-muted animate-pulse" />
                <div className="h-5 w-40 rounded-lg bg-muted animate-pulse" />
                <div className="h-4 w-32 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-full rounded bg-muted animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-20 text-center">
        <p className="text-lg text-muted-foreground">Job not found</p>
        <Link to="/">
          <Button variant="link" className="mt-4">
            Back to jobs
          </Button>
        </Link>
      </div>
    );
  }

  const salary =
    job.salaryMin && job.salaryMax
      ? `$${(job.salaryMin / 1000).toFixed(0)} – $${(job.salaryMax / 1000).toFixed(0)}`
      : null;
  const postedAgo = job.createdAt ? formatRelativeDate(job.createdAt) : null;
  const jobSaved = isSaved(job.id);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      {/* Top bar */}
      <div className="mt-5">
        <div className="container flex items-center gap-3 max-w-6xl py-3 max-md:py-0">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <span className="text-muted-foreground text-sm max-md:hidden">
            {" "}
            {job?.company_name || job?.company?.name}
          </span>

          <svg
            className="w-5 text-muted-foreground max-md:hidden"
            focusable="false"
            aria-hidden="true"
            viewBox="0 0 24 24"
            data-testid="ChevronRightRoundedIcon"
          >
            <path
              fill="currentColor"
              d="M9.29 6.71c-.39.39-.39 1.02 0 1.41L13.17 12l-3.88 3.88c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0l4.59-4.59c.39-.39.39-1.02 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01"
            />
          </svg>
          <span className="text-muted-foreground text-sm max-md:hidden">
            {job?.title}
          </span>
          {/* {canManageJob ? (
            <Link
              to="/recruiter/dashboard"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to dashboard
            </Link>
          ) : (
            
          )} */}
        </div>
      </div>

      <div className="container max-w-6xl py-8 max-md:py-4">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Main content */}
          <div className="space-y-6">
            {/* Header card */}
            <div className="rounded-lg ">
              <div className="flex items-center justify-center gap-4">
                {job?.logo ? (
                  <div className="bg-white border px-2 max-md:h-[60px] max-md:w-[60px] h-[80px] w-[80px] rounded-lg flex justify-center items-center">
                    <div className="  rounded-xl flex items-center justify-center  text-muted-foreground font-bold text-sm">
                      <img
                        src={job?.logo}
                        alt=""
                        className="h-full w-[70px] max-md:w-[50px]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground font-bold text-lg">
                    <Building2 className="inline h-4 w-4  text-muted-foreground" />

                    {/* {job.company_name?.charAt(0)?.toUpperCase() ||
                      job.company?.name?.charAt(0)?.toUpperCase() ||
                      "C"} */}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl max-md:text-lg font-bold text-foreground">
                    {job.title}
                  </h1>
                  <p className="text-foreground/90 flex items-center mt-3">
                    <Building2 className="inline h-4 w-4 mr-1 text-muted-foreground" />
                    <span>
                      {" "}
                      {job.company_name || job.company?.name || "Company"}
                    </span>
                    <div className="ml-4">
                      {postedAgo && (
                        <div className="text-right whitespace-nowrap">
                          {postedAgo && (
                            <p className="text-sm font-medium text-muted-foreground">
                              Posted {postedAgo}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-5 font-medium capitalize text-md text-foreground">
                <span className="flex items-center gap-3 bg-card border border-border shadow-lg px-6 py-3 rounded-lg">
                  <MapPin className="h-5 w-5 text-purple-500" /> {job.location}
                </span>
                {job.isRemote && (
                  <span className="flex items-center gap-3 bg-card border border-border shadow-lg px-6 py-3 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-500" /> Remote
                  </span>
                )}
                <span className="flex items-center gap-3 bg-card border border-border shadow-lg px-6 py-3 rounded-lg">
                  <Briefcase className="h-5 w-5 text-orange-500" /> {job.type}
                </span>
                <span className="flex items-center gap-3 bg-card border border-border capitalize shadow-lg px-6 py-3 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-green-500" />{" "}
                  {job.level}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white shadow-lg border border-gray-100 rounded-lg p-6">
              <h2 className="font-semibold text-lg text-foreground mb-4">
                Tech Stack
              </h2>
              {/* Tech stack */}
              <div className="mb-4">
                {job.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-8 mt-5">
                    {job.techStack.map((tech) => {
                      const matchedTech = TECH_STACK_OPTIONS.find(
                        (option) =>
                          option.name.toLowerCase() === tech.toLowerCase(),
                      );

                      return (
                        <span
                          key={tech}
                          className={`flex items-center capitalize bg-white border border-slate-100 shadow-lg px-4 gap-2 rounded-xl   py-2 text-md font-medium`}
                        >
                          {matchedTech && (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/70">
                              <img
                                src={matchedTech.image}
                                alt={matchedTech.name}
                                className="h-5 w-5 object-contain"
                              />
                            </span>
                          )}
                          <span>{tech}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="my-8  border-[1px] border-dashed">
                {/* <hr /> */}
              </div>

              <h2 className="font-semibold text-lg text-foreground mb-4 ">
                Job description
              </h2>
              <div
                className="text-foreground leading-relaxed text-[15px] [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: job.description }}
              ></div>
            </div>

            {canManageJob && (
              <div className="bg-white shadow-lg border border-gray-100 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg text-foreground">
                    Applications
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {applications.length} total
                  </span>
                </div>

                {loadingApplications ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-14 bg-muted animate-pulse rounded"
                      />
                    ))}
                  </div>
                ) : applications.length === 0 ? (
                  <div className="p-8 text-center  rounded-lg bg-muted/20">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No applications for this job yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y  rounded-lg overflow-hidden">
                    {applications.map((app) => (
                      <div key={app.id} className="py-2">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate capitalize">
                              {getApplicantName(app)}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {app.user?.candidateProfile?.headline ||
                                "No headline"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded text-xs font-medium ${APPLICATION_STATUS_COLORS[app.status] || "bg-muted text-muted-foreground"}`}
                            >
                              {app.status}
                            </span>
                            <Button
                              className="duration-300"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedApplication(app);
                                setSelectedApplicationId(app.id);
                              }}
                            >
                              Show details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply card */}
            <div className="bg-white shadow-lg border border-gray-100 rounded-lg p-5 space-y-3">
              <div className=" mb-4">
                <div className="flex flex-col items-start justify-between gap-3">
                  <h2 className="text-lg  text-muted-foreground">Salary</h2>
                  <div className="text-xl font-bold text-foreground">
                    {job?.salary ? (
                      <>{job?.salary}</>
                    ) : (
                      <> {salary || "Not disclosed"}</>
                    )}
                  </div>
                </div>
              </div>

              {isAuthenticated && user?.role === "CANDIDATE" ? (
                <>
                  <Button
                    onClick={openApplicationFlow}
                    disabled={applying || hasApplied}
                    className="flex w-full items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/40 active:scale-95 transition-all duration-150 cursor-pointer"
                    size="lg"
                  >
                    {hasApplied
                      ? "Applied"
                      : applying
                        ? "Applying..."
                        : "Apply now"}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const saved = toggleSaved(job);
                        toast({
                          title: saved ? "Job saved" : "Removed from saved",
                        });
                      }}
                      className={`flex justify-center items-center px-4 py-2 gap-1.5 rounded-lg border transition-colors ${jobSaved ? "bg-indigo-100/70 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300" : "bg-transparent border-border hover:bg-muted text-foreground"}`}
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      {jobSaved ? "Saved" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleShareJob}
                      className="flex justify-center items-center gap-1.5 px-4 py-2 bg-transparent border border-border hover:bg-muted text-foreground rounded-lg transition-colors"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </button>
                  </div>
                </>
              ) : canManageJob ? (
                <div className="flex gap-2 items-center">
                  <Link to={`/recruiter/create-job?edit=${job.id}`}>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-semibold rounded-xl shadow-sm hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:-translate-y-0.5 active:scale-95 transition-all duration-150 cursor-pointer">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                  </Link>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => setDeleteModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 text-sm font-semibold rounded-xl shadow-sm hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:-translate-y-0.5 active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ) : !isAuthenticated ? (
                <>
                  {job.externalJob && job.applyLink ? (
                    <>
                      <Button
                        onClick={openApplicationFlow}
                        disabled={applying || hasApplied}
                        className="flex w-full items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/40 active:scale-95 transition-all duration-150 cursor-pointer"
                        size="lg"
                      >
                        {hasApplied
                          ? "Applied"
                          : applying
                            ? "Applying..."
                            : "Apply now"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Sign in to apply
                      </p>
                      <button
                        className="w-full text-center items-center gap-2 px-6 py-2.5 bg-transparent text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 text-sm font-semibold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/15 hover:border-indigo-400 dark:hover:border-indigo-400/60 hover:-translate-y-0.5 active:scale-95 transition-all duration-150 cursor-pointer"
                        onClick={openApplicationFlow}
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </>
              ) : null}
            </div>

            {/* Company info */}
            {job.company && (
              <div className="bg-white shadow-lg border border-gray-100 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  {/* <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold">
                    {job.company.name.charAt(0).toUpperCase()}
                  </div> */}
                  {job?.logo ? (
                    <div className="h-26 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground font-bold text-sm">
                      <img
                        src={job?.logo}
                        alt=""
                        width={70}
                        className="h-full"
                      />
                    </div>
                  ) : (
                    <></>
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">
                      {job.company_name || job.company?.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {job.location || job?.company.location}
                    </p>
                  </div>
                </div>
                {job.company.industry && (
                  <p className="text-xs text-muted-foreground">
                    <Building2 className="inline h-3 w-3 mr-1 text-muted-foreground" />
                    {job.company.industry}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to apply</DialogTitle>
            <DialogDescription>
              Log in or create a candidate account to continue your application.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={authTab}
            onValueChange={(value) => setAuthTab(value as "login" | "register")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form className="space-y-4" onSubmit={handleLoginSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="flex w-full items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 active:scale-95 transition-all duration-150 cursor-pointer"
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <LogIn className="h-4 w-4" /> Sign in
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerEmail}
                    onChange={(event) => setRegisterEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerPassword}
                    onChange={(event) =>
                      setRegisterPassword(event.target.value)
                    }
                    placeholder="Create a password"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  New accounts created here are candidate accounts so they can
                  apply right away.
                </p>
                <Button
                  type="submit"
                  className="flex w-full items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 active:scale-95 transition-all duration-150 cursor-pointer"
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Creating
                      account...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <UserPlus className="h-4 w-4" /> Create account
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog
        open={applicationModalOpen}
        onOpenChange={setApplicationModalOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit your application</DialogTitle>
            <DialogDescription>
              Confirm your details, upload your CV, and send the application.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleApplicationSubmit}>
            <div className="space-y-2">
              <Label htmlFor="application-name">Name</Label>
              <Input
                id="application-name"
                value={applicationName}
                onChange={(event) => setApplicationName(event.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="application-email">Email</Label>
              <Input
                id="application-email"
                type="email"
                value={applicationEmail}
                onChange={(event) => setApplicationEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    CV Upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    It will automatically submit the generated URL.
                  </p>
                </div>
                <Button
                  type="button"
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/40 active:scale-95 transition-all duration-150 cursor-pointer"
                  onClick={() => cvInputRef.current?.click()}
                  disabled={uploadingCv}
                >
                  {uploadingCv ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Upload className="h-4 w-4" /> Upload CV
                    </span>
                  )}
                </Button>
              </div>
              <input
                ref={cvInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={handleCvUpload}
              />
              <div className="space-y-2">
                {/* <Label htmlFor="cv-url">Uploaded CV</Label> */}
                {cvFileName ? (
                  <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 break-all">
                    <FileUp className="h-4 w-4 shrink-0" />
                    {cvFileName}
                  </p>
                ) : (
                  <></>
                  // <p className="text-sm text-muted-foreground">
                  //   The uploaded CV filename will appear here.
                  // </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="flex w-full items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 active:scale-95 transition-all duration-150 cursor-pointer"
                disabled={applying || !cvUrl}
              >
                {applying ? "Submitting..." : "Submit application"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
            <strong className="text-foreground">{job.title}</strong> and all its
            applications will be permanently removed.
          </div>

          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1 rounded-xl bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              onClick={async () => {
                await handleDeleteJob();
                setDeleteModalOpen(false);
              }}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Yes, delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedApplicationId && !!selectedApplication}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedApplicationId(null);
            setSelectedApplication(null);
            setCvPreviewOpen(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application details</DialogTitle>
            <DialogDescription>
              Review candidate details and open the submitted CV.
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">
                    Candidate name
                  </p>
                  <p className="font-medium text-foreground">
                    {getApplicantName(selectedApplication)}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground break-all">
                    {getApplicantEmail(selectedApplication)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-4 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Candidate profile
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Details from the candidate account.
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-medium ${APPLICATION_STATUS_COLORS[selectedApplication.status] || "bg-muted text-muted-foreground"}`}
                  >
                    {selectedApplication.status}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Headline</p>
                    <p className="text-foreground">
                      {selectedApplication.user?.candidateProfile?.headline ||
                        "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-foreground">
                      {selectedApplication.user?.candidateProfile?.location ||
                        "-"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">About</p>
                    <p className="text-foreground whitespace-pre-wrap">
                      {selectedApplication.user?.candidateProfile
                        ?.description || "-"}
                    </p>
                  </div>
                </div>

                {selectedApplication.user?.candidateProfile?.skills?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.user.candidateProfile.skills.map(
                      (skill, index) => (
                        <span
                          key={`${skill.name}-${index}`}
                          className="px-2.5 py-1 rounded text-xs bg-secondary text-secondary-foreground"
                        >
                          {skill.name}
                        </span>
                      ),
                    )}
                  </div>
                ) : null}
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-medium text-foreground">CV</p>
                    <p className="text-xs text-muted-foreground">
                      Open the submitted PDF in a preview panel.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedApplication.cv_url && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCvPreviewOpen((prev) => !prev)}
                      >
                        {cvPreviewOpen ? "Hide CV" : "Show CV"}
                      </Button>
                    )}
                    {selectedApplication.cv_url && (
                      <Button type="button" asChild>
                        <a
                          href={selectedApplication.cv_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open in new tab
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {selectedApplication.cv_url ? (
                  cvPreviewOpen ? (
                    <div className="overflow-hidden rounded-lg border bg-muted/10">
                      <iframe
                        title="Candidate CV"
                        src={selectedApplication.cv_url}
                        className="h-[70vh] w-full"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click Show CV to preview the PDF.
                    </p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No CV URL was provided.
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobDetail;
