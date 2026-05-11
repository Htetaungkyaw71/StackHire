import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { slugify } from "@/lib/utils";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, Application, ApplicationStatus, Job } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { APPLICATION_STATUS_COLORS } from "@/lib/constants";

const STATUS_COLUMNS: ApplicationStatus[] = [
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
];

const STATUS_META: Record<
  ApplicationStatus,
  { label: string; description: string; accent: string }
> = {
  APPLIED: {
    label: "Applied",
    description: "Fresh applications waiting for review",
    accent: "from-blue-500 to-cyan-500",
  },
  INTERVIEW: {
    label: "Interview",
    description: "Candidates moving through interviews",
    accent: "from-violet-500 to-fuchsia-500",
  },
  OFFER: {
    label: "Offer",
    description: "Candidates who reached the offer stage",
    accent: "from-emerald-500 to-teal-500",
  },
  REJECTED: {
    label: "Rejected",
    description: "Closed or declined applications",
    accent: "from-rose-500 to-red-500",
  },
};

const getApplicantName = (application: Application) => {
  if (application.name) return application.name;

  const email = application.email || application.user?.email || "";
  if (!email) return "Candidate";

  return email.split("@")[0].replace(/[._-]/g, " ");
};

const getApplicantEmail = (application: Application) =>
  application.email || application.user?.email || "No email";

const getFileNameFromUrl = (value?: string | null) => {
  if (!value) return "CV";

  try {
    const url = new URL(value);
    return url.pathname.split("/").pop() || "CV";
  } catch {
    return value.split("/").pop() || "CV";
  }
};

const RecruiterApplications = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [draggedApplicationId, setDraggedApplicationId] = useState<
    string | null
  >(null);
  const [dragOverStatus, setDragOverStatus] =
    useState<ApplicationStatus | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const [jobRes, applicationsRes] = await Promise.all([
          api.jobs.get(id),
          api.applications.getForJob(id),
        ]);

        setJob(jobRes);
        setApplications(applicationsRes);
      } catch {
        setJob(null);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [id]);

  const groupedApplications = useMemo(() => {
    return STATUS_COLUMNS.reduce<Record<ApplicationStatus, Application[]>>(
      (accumulator, status) => {
        accumulator[status] = applications.filter(
          (application) => application.status === status,
        );
        return accumulator;
      },
      {
        APPLIED: [],
        INTERVIEW: [],
        OFFER: [],
        REJECTED: [],
      },
    );
  }, [applications]);

  const handleStatusChange = async (
    applicationId: string,
    status: ApplicationStatus,
  ) => {
    const previousApplication = applications.find(
      (application) => application.id === applicationId,
    );

    if (!previousApplication) return;

    setUpdatingId(applicationId);
    setApplications((current) =>
      current.map((application) =>
        application.id === applicationId
          ? { ...application, status }
          : application,
      ),
    );

    try {
      const updatedApplication = await api.applications.updateStatus(
        applicationId,
        status,
      );

      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId ? updatedApplication : application,
        ),
      );

      toast({
        title: "Application updated",
        description: `Status changed to ${STATUS_META[status].label}.`,
      });
    } catch (error: any) {
      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId ? previousApplication : application,
        ),
      );

      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLElement>,
    applicationId: string,
  ) => {
    setDraggedApplicationId(applicationId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", applicationId);
  };

  const handleDragEnd = () => {
    setDraggedApplicationId(null);
    setDragOverStatus(null);
  };

  const handleDropToStatus = (status: ApplicationStatus) => {
    if (!draggedApplicationId || !job || job.externalJob) return;

    const currentApplication = applications.find(
      (application) => application.id === draggedApplicationId,
    );

    if (!currentApplication || currentApplication.status === status) {
      setDraggedApplicationId(null);
      setDragOverStatus(null);
      return;
    }

    void handleStatusChange(draggedApplicationId, status);
    setDraggedApplicationId(null);
    setDragOverStatus(null);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,1),_rgba(255,255,255,1))] px-4 py-8">
        <div className="container max-w-7xl space-y-6">
          <div className="h-8 w-48 rounded-full bg-muted animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[30rem] rounded-3xl border bg-card animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-background px-4 py-8">
        <div className="container max-w-4xl">
          <div className="rounded-3xl border bg-card p-8 shadow-lg">
            <p className="text-sm text-muted-foreground">
              This job could not be loaded.
            </p>
            <Button
              className="mt-4"
              onClick={() => navigate("/recruiter/dashboard")}
            >
              Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalApplications = applications.length;
  const offerCount = groupedApplications.OFFER.length;
  const interviewCount = groupedApplications.INTERVIEW.length;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] ">
      <div className="container max-w-[1600px] px-4 py-6 md:py-8 space-y-6">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            navigate(`/jobs/${slugify(job.title)}-${job.id}`, { replace: true })
          }
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to job
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border bg-card/95 p-5 md:p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Applications board
              </p>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold text-foreground">
                {job.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {totalApplications} application
                  {totalApplications === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>

          {job.externalJob && (
            <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              This is an external job. Application status changes are only
              available for internal jobs.
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Applications", value: totalApplications },
              { label: "Interviews", value: interviewCount },
              { label: "Offers", value: offerCount },
            ].map((item) => (
              <div
                key={item.label}
                className="min-w-[7rem] rounded-2xl border bg-muted/30 px-4 py-3 text-center"
              >
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-xl font-bold text-foreground">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:items-start overflow-x-auto pb-2">
          {STATUS_COLUMNS.map((status) => {
            const statusApplications = groupedApplications[status];
            const meta = STATUS_META[status];

            return (
              <section
                key={status}
                onDragOver={(event) => {
                  if (job.externalJob) return;
                  event.preventDefault();
                  if (dragOverStatus !== status) {
                    setDragOverStatus(status);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  handleDropToStatus(status);
                }}
                onDragLeave={() => {
                  if (dragOverStatus === status) {
                    setDragOverStatus(null);
                  }
                }}
                className={`min-w-[19rem] rounded-3xl border bg-card overflow-hidden transition-colors ${dragOverStatus === status ? "ring-2 ring-indigo-300 bg-indigo-50/40" : ""}`}
              >
                <div className={`h-1 bg-gradient-to-r ${meta.accent}`} />
                <div className="border-b bg-muted/20 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">
                        {meta.label}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {meta.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">
                      {statusApplications.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  {statusApplications.length === 0 ? (
                    <div className="flex min-h-[12rem] items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        No {meta.label.toLowerCase()} applications yet.
                      </p>
                    </div>
                  ) : (
                    statusApplications.map((application) => {
                      const profile = application.user?.candidateProfile;
                      const cvUrl = application.cv_url || profile?.cvUrl;
                      const cvLabel =
                        profile?.cvFilename || getFileNameFromUrl(cvUrl);

                      return (
                        <article
                          key={application.id}
                          draggable={
                            !job.externalJob && updatingId !== application.id
                          }
                          onDragStart={(event) =>
                            handleDragStart(event, application.id)
                          }
                          onDragEnd={handleDragEnd}
                          className={`rounded-2xl border bg-background p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${draggedApplicationId === application.id ? "opacity-60" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold text-foreground">
                                {getApplicantName(application)}
                              </h3>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">
                                  {getApplicantEmail(application)}
                                </span>
                              </p>
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${APPLICATION_STATUS_COLORS[application.status] || "bg-muted text-muted-foreground"}`}
                            >
                              {STATUS_META[application.status].label}
                            </span>
                          </div>

                          <div className="mt-4 space-y-3">
                            {profile?.skills?.length ? (
                              <div className="flex flex-wrap gap-2">
                                {profile.skills
                                  .slice(0, 4)
                                  .map((skill, index) => (
                                    <span
                                      key={`${skill.name}-${index}`}
                                      className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground"
                                    >
                                      {skill.name}
                                    </span>
                                  ))}
                              </div>
                            ) : null}

                            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                              {cvUrl ? (
                                <Button
                                  type="button"
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="w-full sm:w-auto gap-2"
                                >
                                  <a
                                    href={cvUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    Open CV
                                  </a>
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="w-full sm:w-auto"
                                  disabled
                                >
                                  No CV
                                </Button>
                              )}

                              <select
                                value={application.status}
                                onChange={(event) =>
                                  void handleStatusChange(
                                    application.id,
                                    event.target.value as ApplicationStatus,
                                  )
                                }
                                disabled={
                                  updatingId === application.id ||
                                  !!job.externalJob
                                }
                                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                              >
                                {STATUS_COLUMNS.map((option) => (
                                  <option key={option} value={option}>
                                    {STATUS_META[option].label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {updatingId === application.id && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Updating status...
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecruiterApplications;
