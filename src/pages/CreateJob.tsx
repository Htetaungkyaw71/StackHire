import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { JOB_LEVELS, JOB_TYPES } from "@/lib/constants";
import { Briefcase, Check, X } from "lucide-react";

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

const TECH_STACK_NAMES: string[] = TECH_STACK_OPTIONS.map((tech) => tech.name);

const CreateJob = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editJobId = searchParams.get("edit");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(Boolean(editJobId));

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    isRemote: false,
    salaryMin: "",
    salaryMax: "",
    techStack: [] as string[],
    level: "MID",
    type: "FULL_TIME",
  });

  const toggleTech = (tech: string) => {
    setForm((current) => ({
      ...current,
      techStack: current.techStack.includes(tech)
        ? current.techStack.filter((value) => value !== tech)
        : [...current.techStack, tech],
    }));
  };

  const removeTech = (t: string) => {
    setForm((current) => ({
      ...current,
      techStack: current.techStack.filter((x) => x !== t),
    }));
  };

  useEffect(() => {
    const loadJobForEdit = async () => {
      if (!editJobId) {
        setLoadingJob(false);
        return;
      }

      setLoadingJob(true);
      try {
        const job = await api.jobs.get(editJobId);
        setForm({
          title: job.title,
          description: job.description,
          location: job.location,
          isRemote: job.isRemote,
          salaryMin: job.salaryMin ? String(job.salaryMin) : "",
          salaryMax: job.salaryMax ? String(job.salaryMax) : "",
          techStack: (job.techStack || []).filter((tech) =>
            TECH_STACK_NAMES.includes(tech),
          ),
          level: job.level,
          type: job.type,
        });
      } catch (err: any) {
        toast({
          title: "Cannot load job",
          description: err.message || "Job not found",
          variant: "destructive",
        });
        navigate("/recruiter/dashboard");
      } finally {
        setLoadingJob(false);
      }
    };

    void loadJobForEdit();
  }, [editJobId, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { salaryMin, salaryMax, ...basePayload } = form;
      const payload = {
        ...basePayload,
        ...(salaryMin ? { salaryMin: Number(salaryMin) } : {}),
        ...(salaryMax ? { salaryMax: Number(salaryMax) } : {}),
      };

      if (editJobId) {
        await api.jobs.update(editJobId, payload);
        toast({ title: "Job updated!" });
      } else {
        await api.jobs.create(payload);
        toast({ title: "Job posted!" });
      }

      navigate("/recruiter/dashboard");
    } catch (err: any) {
      console.log(err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-6xl">
        <div className="text-left mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            {editJobId ? "Edit job posting" : "Post a new job"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {editJobId
              ? "Update your job details"
              : "Fill in the details for your job posting"}
          </p>
        </div>

        <div className="border shadow-lg bg-white border-slate-100 rounded-lg p-6">
          {loadingJob ? (
            <div className="space-y-3">
              <div className="h-10 rounded bg-muted animate-pulse" />
              <div className="h-24 rounded bg-muted animate-pulse" />
              <div className="h-10 rounded bg-muted animate-pulse" />
              <div className="h-10 rounded bg-muted animate-pulse" />
              <div className="h-24 rounded bg-muted animate-pulse" />
              <div className="h-10 rounded bg-muted animate-pulse" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Job title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    required
                    placeholder="Senior Frontend Developer"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    required
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows={10}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      required
                      placeholder="Warsaw, Poland"
                    />
                  </div>
                  <div className="flex items-end gap-3 pb-1">
                    <Switch
                      checked={form.isRemote}
                      onCheckedChange={(checked) =>
                        setForm({ ...form, isRemote: checked })
                      }
                    />
                    <Label>Remote</Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select
                      value={form.level}
                      onValueChange={(v) => setForm({ ...form, level: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_LEVELS.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={form.type}
                      onValueChange={(v) => setForm({ ...form, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Salary min (USD/month)</Label>
                    <Input
                      type="number"
                      value={form.salaryMin}
                      onChange={(e) =>
                        setForm({ ...form, salaryMin: e.target.value })
                      }
                      placeholder="60000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Salary max (USD/month)</Label>
                    <Input
                      type="number"
                      value={form.salaryMax}
                      onChange={(e) =>
                        setForm({ ...form, salaryMax: e.target.value })
                      }
                      placeholder="100000"
                    />
                  </div>
                </div>
                <div className="rounded-md border border-dashed border-muted-foreground/20 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  Leave salary fields empty to mark this job as negotiable.
                </div>

                <Button
                  type="submit"
                  className="w-full max-lg:hidden"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editJobId
                      ? "Update Job"
                      : "Post Job"}
                </Button>
              </div>

              <div className="space-y-10">
                <div className="space-y-5">
                  <Label>Tech stack</Label>
                  {form.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {form.techStack.map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                        >
                          {t}
                          <button type="button" onClick={() => removeTech(t)}>
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3">
                    {TECH_STACK_OPTIONS.map((tech) => {
                      const isSelected = form.techStack.includes(tech.name);

                      return (
                        <button
                          key={tech.name}
                          type="button"
                          onClick={() => toggleTech(tech.name)}
                          aria-pressed={isSelected}
                          className={`group flex flex-col items-center gap-2 rounded-xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-background hover:border-primary/40"
                          }`}
                        >
                          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border bg-muted/40">
                            <img
                              src={tech.image}
                              alt={tech.name}
                              className="h-9 w-9 object-contain"
                            />
                            {isSelected && (
                              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                                <Check className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                          <span className="w-full text-center text-sm font-medium text-foreground">
                            {tech.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full lg:hidden"
                disabled={loading}
              >
                {loading ? "Saving..." : editJobId ? "Update Job" : "Post Job"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
