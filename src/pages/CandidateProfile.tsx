import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import {
  api,
  CandidateProfile as CandidateProfileType,
  Application,
} from "@/lib/api";
import { APPLICATION_STATUS_COLORS } from "@/lib/constants";
import {
  User,
  FileText,
  Bookmark,
  Briefcase,
  MapPin,
  Globe,
  DollarSign,
  Plus,
  X,
  Edit3,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";

const AVAILABILITY_OPTIONS = [
  "IMMEDIATE",
  "TWO_WEEKS",
  "ONE_MONTH",
  "NEGOTIABLE",
] as const;

const JOB_STATUS_OPTIONS = [
  "ACTIVELY_LOOKING",
  "OPEN_TO_OFFERS",
  "NOT_LOOKING",
] as const;

const SKILL_LEVEL_OPTIONS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
] as const;

const LANGUAGE_LEVEL_OPTIONS = [
  "BASIC",
  "CONVERSATIONAL",
  "FLUENT",
  "NATIVE",
] as const;

const normalizeAvailability = (value: string) => {
  if (value === "IMMEDIATELY") return "IMMEDIATE";
  return AVAILABILITY_OPTIONS.includes(
    value as (typeof AVAILABILITY_OPTIONS)[number],
  )
    ? value
    : "IMMEDIATE";
};

const normalizeSkillLevel = (value: string) => {
  if (value === "MID") return "INTERMEDIATE";
  return SKILL_LEVEL_OPTIONS.includes(
    value as (typeof SKILL_LEVEL_OPTIONS)[number],
  )
    ? value
    : "INTERMEDIATE";
};

const normalizeLanguageLevel = (value: string) => {
  if (value === "INTERMEDIATE") return "CONVERSATIONAL";
  return LANGUAGE_LEVEL_OPTIONS.includes(
    value as (typeof LANGUAGE_LEVEL_OPTIONS)[number],
  )
    ? value
    : "CONVERSATIONAL";
};

const toDateInputValue = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const isValidExperienceDateRange = (startDate: string, endDate?: string) => {
  if (!startDate || !endDate) return true;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return false;
  }

  return start.getTime() <= end.getTime();
};

const normalizeExperienceRecord = (experience: any) => ({
  title: experience?.title || experience?.role || "",
  company: experience?.company || experience?.companyName || "",
  startDate: toDateInputValue(experience?.startDate),
  endDate: toDateInputValue(experience?.endDate),
  description: experience?.description || "",
});

const normalizeJobStatus = (value: string) => {
  return JOB_STATUS_OPTIONS.includes(
    value as (typeof JOB_STATUS_OPTIONS)[number],
  )
    ? value
    : "ACTIVELY_LOOKING";
};

const getCandidateDefaults = (): CandidateProfileType => ({
  fullName: "",
  headline: "",
  description: "",
  location: "",
  openToRemote: true,
  expectedSalary: 0,
  availability: "IMMEDIATE",
  jobStatus: "ACTIVELY_LOOKING",
  visibility: "PUBLIC",
  skills: [],
  languages: [],
  experiences: [],
});

const normalizeCandidateProfile = (
  profile: Partial<CandidateProfileType> & { experiences?: any[] },
): CandidateProfileType => {
  const defaults = getCandidateDefaults();

  return {
    ...defaults,
    ...profile,
    availability: normalizeAvailability(
      profile.availability || defaults.availability,
    ),
    jobStatus: normalizeJobStatus(profile.jobStatus || defaults.jobStatus),
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    languages: Array.isArray(profile.languages) ? profile.languages : [],
    experiences: Array.isArray(profile.experiences)
      ? profile.experiences.map(normalizeExperienceRecord)
      : [],
  };
};

const CandidateProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { savedJobs, removeJob } = useSavedJobs();
  const [profile, setProfile] = useState<CandidateProfileType | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CandidateProfileType>(
    getCandidateDefaults(),
  );

  const [newSkill, setNewSkill] = useState({
    name: "",
    level: "INTERMEDIATE",
  });
  const [newLang, setNewLang] = useState({
    name: "",
    level: "CONVERSATIONAL",
  });
  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profiles, apps] = await Promise.all([
        api.candidate.get(),
        api.applications.getMine().catch(() => []),
      ]);

      if (profiles.length > 0) {
        const normalizedProfile = normalizeCandidateProfile(profiles[0]);
        setProfile(normalizedProfile);
        setForm(normalizedProfile);
      }

      setApplications(apps);
    } catch {}
    setLoading(false);
  };

  const handleSave = async () => {
    const description = form.description?.trim();
    if (description && description.length < 10) {
      toast({
        title: "Description too short",
        description: "Description must be at least 10 characters.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...form,
      fullName: form.fullName?.trim() || undefined,
      headline: form.headline?.trim() || undefined,
      description: description || undefined,
      location: form.location?.trim() || undefined,
      expectedSalary: form.expectedSalary > 0 ? form.expectedSalary : undefined,
      availability: normalizeAvailability(form.availability),
      jobStatus: normalizeJobStatus(form.jobStatus),
      skills: form.skills.map((skill) => ({
        ...skill,
        name: skill.name?.trim() || "",
        level: normalizeSkillLevel(skill.level),
      })),
      languages: form.languages.map((lang) => ({
        ...lang,
        name: lang.name?.trim() || "",
        level: normalizeLanguageLevel(lang.level),
      })),
      experiences: form.experiences.map((experience) => ({
        companyName: experience.company.trim(),
        role: experience.title.trim(),
        description: experience.description?.trim() || undefined,
        startDate: new Date(experience.startDate).toISOString(),
        endDate: experience.endDate
          ? new Date(experience.endDate).toISOString()
          : undefined,
        isCurrent: !experience.endDate,
      })),
    };

    if (payload.skills.length === 0 || payload.languages.length === 0) {
      toast({
        title: "Missing required fields",
        description: "Please add at least one skill and one language.",
        variant: "destructive",
      });
      return;
    }

    const invalidExperience = form.experiences.find(
      (experience) =>
        !isValidExperienceDateRange(experience.startDate, experience.endDate),
    );

    if (invalidExperience) {
      toast({
        title: "Invalid date range",
        description: "Experience start date must be earlier than end date.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (profile) {
        const updated = await api.candidate.update(payload);
        const normalized = normalizeCandidateProfile(updated);
        setProfile(normalized);
        setForm(normalized);
      } else {
        const created = await api.candidate.create(
          payload as CandidateProfileType,
        );
        const normalized = normalizeCandidateProfile(created);
        setProfile(normalized);
        setForm(normalized);
      }
      setEditing(false);
      toast({ title: "Profile saved!" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    setForm({
      ...form,
      skills: [
        ...form.skills,
        { ...newSkill, level: normalizeSkillLevel(newSkill.level) },
      ],
    });
    setNewSkill({ name: "", level: "INTERMEDIATE" });
  };

  const removeSkill = (index: number) => {
    setForm({ ...form, skills: form.skills.filter((_, i) => i !== index) });
  };

  const addLanguage = () => {
    if (!newLang.name.trim()) return;
    setForm({
      ...form,
      languages: [
        ...form.languages,
        { ...newLang, level: normalizeLanguageLevel(newLang.level) },
      ],
    });
    setNewLang({ name: "", level: "CONVERSATIONAL" });
  };

  const removeLanguage = (index: number) => {
    setForm({
      ...form,
      languages: form.languages.filter((_, i) => i !== index),
    });
  };

  const addExperience = () => {
    if (!newExperience.title.trim() || !newExperience.company.trim()) {
      toast({
        title: "Missing required fields",
        description: "Title and company should not be empty.",
        variant: "destructive",
      });
      return;
    }

    if (!newExperience.startDate) {
      toast({
        title: "Start date required",
        description: "Please choose when the experience started.",
        variant: "destructive",
      });
      return;
    }

    if (
      !isValidExperienceDateRange(
        newExperience.startDate,
        newExperience.endDate,
      )
    ) {
      toast({
        title: "Invalid date range",
        description: "Start date must be earlier than end date.",
        variant: "destructive",
      });
      return;
    }

    setForm({
      ...form,
      experiences: [
        ...form.experiences,
        {
          title: newExperience.title.trim(),
          company: newExperience.company.trim(),
          startDate: newExperience.startDate,
          endDate: newExperience.endDate,
          description: newExperience.description.trim(),
        },
      ],
    });
    setNewExperience({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  const removeExperience = (index: number) => {
    setForm({
      ...form,
      experiences: form.experiences.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }
  console.log(profile);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="container max-w-6xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          {profile && !editing && (
            <Button
              variant="outline"
              onClick={() => setEditing(true)}
              className="gap-1.5"
            >
              <Edit3 className="h-4 w-4" /> Edit profile
            </Button>
          )}
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="profile" className="gap-1.5">
              <User className="h-3.5 w-3.5" /> Profile
            </TabsTrigger>
            <TabsTrigger value="applications" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Applications
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-1.5">
              <Bookmark className="h-3.5 w-3.5" /> Saved Jobs
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {!profile && !editing ? (
              <div className="shadow-lg bg-white border-slate-100  rounded-lg p-8 text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-foreground">
                  Set up your profile
                </h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Complete your profile to start applying for jobs
                </p>
                <Button onClick={() => setEditing(true)}>Create Profile</Button>
              </div>
            ) : editing ? (
              <div className="space-y-6">
                {/* Basic info */}
                <div className="shadow-lg bg-white border-slate-100 rounded-lg p-6 space-y-4">
                  <h2 className="font-semibold text-foreground">
                    Basic Information
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Fullname</Label>
                      <Input
                        value={form.fullName}
                        onChange={(e) =>
                          setForm({ ...form, fullName: e.target.value })
                        }
                        placeholder="David Scott"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Headline</Label>
                      <Input
                        value={form.headline}
                        onChange={(e) =>
                          setForm({ ...form, headline: e.target.value })
                        }
                        placeholder="Senior Frontend Developer"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>About</Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={form.location}
                        onChange={(e) =>
                          setForm({ ...form, location: e.target.value })
                        }
                        placeholder="Warsaw, Poland"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Salary (USD/month)</Label>
                      <Input
                        type="number"
                        value={form.expectedSalary || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            expectedSalary: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="80000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Availability</Label>
                      <Select
                        value={normalizeAvailability(form.availability)}
                        onValueChange={(value) =>
                          setForm({ ...form, availability: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABILITY_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Job status</Label>
                      <Select
                        value={normalizeJobStatus(form.jobStatus)}
                        onValueChange={(value) =>
                          setForm({ ...form, jobStatus: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {JOB_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={form.openToRemote}
                        onCheckedChange={(checked) =>
                          setForm({ ...form, openToRemote: checked })
                        }
                      />
                      <Label>Open to remote work</Label>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="shadow-lg bg-white border-slate-100  rounded-lg p-6 space-y-4">
                  <h2 className="font-semibold text-foreground">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {form?.skills?.map((skill, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                      >
                        {skill.name}
                        <span className="text-xs text-primary/60">
                          • {skill.level}
                        </span>
                        <button onClick={() => removeSkill(i)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newSkill.name}
                      onChange={(e) =>
                        setNewSkill({ ...newSkill, name: e.target.value })
                      }
                      placeholder="Skill name"
                      className="flex-1"
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addSkill())
                      }
                    />
                    <Select
                      value={normalizeSkillLevel(newSkill.level)}
                      onValueChange={(value) =>
                        setNewSkill({ ...newSkill, level: value })
                      }
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SKILL_LEVEL_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSkill}
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Languages */}
                <div className="shadow-lg bg-white border-slate-100  rounded-lg p-6 space-y-4">
                  <h2 className="font-semibold text-foreground">Languages</h2>
                  <div className="flex flex-wrap gap-2">
                    {form.languages.map((lang, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium"
                      >
                        {lang.name}
                        <span className="text-xs opacity-60">
                          • {lang.level}
                        </span>
                        <button onClick={() => removeLanguage(i)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newLang.name}
                      onChange={(e) =>
                        setNewLang({ ...newLang, name: e.target.value })
                      }
                      placeholder="Language"
                      className="flex-1"
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addLanguage())
                      }
                    />
                    <Select
                      value={normalizeLanguageLevel(newLang.level)}
                      onValueChange={(value) =>
                        setNewLang({ ...newLang, level: value })
                      }
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_LEVEL_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addLanguage}
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Experiences */}
                <div className="shadow-lg bg-white border-slate-100  rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-semibold text-foreground">
                      Experiences
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      Optional
                    </span>
                  </div>

                  <div className="space-y-3">
                    {form.experiences.length > 0 ? (
                      form.experiences.map((experience, index) => (
                        <div
                          key={`${experience.company}-${index}`}
                          className="shadow-lg bg-white border-slate-100 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {experience.title || "Untitled role"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {experience.company || "Unknown company"}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {experience.startDate || "Start date missing"}
                                {experience.endDate
                                  ? ` – ${experience.endDate}`
                                  : " – Present"}
                              </p>
                              {experience.description && (
                                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                                  {experience.description}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeExperience(index)}
                              className="rounded-full p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Add your previous roles, internships, or freelance work.
                      </p>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Role / Title</Label>
                      <Input
                        value={newExperience.title}
                        onChange={(e) =>
                          setNewExperience({
                            ...newExperience,
                            title: e.target.value,
                          })
                        }
                        placeholder="Frontend Developer"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Company</Label>
                      <Input
                        value={newExperience.company}
                        onChange={(e) =>
                          setNewExperience({
                            ...newExperience,
                            company: e.target.value,
                          })
                        }
                        placeholder="Acme Inc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start date</Label>
                      <Input
                        type="date"
                        value={newExperience.startDate}
                        max={newExperience.endDate || undefined}
                        onChange={(e) =>
                          setNewExperience({
                            ...newExperience,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End date</Label>
                      <Input
                        type="date"
                        value={newExperience.endDate}
                        min={newExperience.startDate || undefined}
                        onChange={(e) =>
                          setNewExperience({
                            ...newExperience,
                            endDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newExperience.description}
                        onChange={(e) =>
                          setNewExperience({
                            ...newExperience,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe your responsibilities and achievements..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addExperience}
                    >
                      <Plus className="h-4 w-4" /> Add experience
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save profile"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      if (profile) setForm(normalizeCandidateProfile(profile));
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : profile ? (
              <div className="space-y-6">
                <div className="shadow-lg bg-white border-slate-100  rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-foreground">
                        {profile.fullName || "No headline"}
                      </h2>
                      <p className="text-md text-muted-foreground">
                        {profile.headline || "No headline"}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                        {profile.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />{" "}
                            {profile.location}
                          </span>
                        )}
                        {profile.openToRemote && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5" /> Remote
                          </span>
                        )}
                        {profile.expectedSalary > 0 && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            {profile.expectedSalary.toFixed(0)}/month
                          </span>
                        )}
                      </div>
                      {profile.description && (
                        <p className="text-sm text-muted-foreground mt-3">
                          {profile.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {profile?.skills?.length > 0 && (
                    <div className="mt-5 pt-5 border-t">
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile?.skills?.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                          >
                            {skill.name} • {skill.level}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile?.languages?.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        Languages
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile?.languages?.map((lang, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
                          >
                            {lang.name} • {lang.level}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile?.experiences?.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="text-sm font-semibold text-foreground mb-3">
                        Experience
                      </h3>
                      <div className="space-y-3">
                        {profile?.experiences?.map((exp, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {exp.title || exp.role || "Untitled role"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {exp.company ||
                                  exp.companyName ||
                                  "Unknown company"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {exp.startDate} – {exp.endDate || "Present"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <div className="shadow-lg bg-white border-slate-100  rounded-lg">
              {applications.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h2 className="text-lg font-semibold text-foreground">
                    No applications yet
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Start browsing jobs and apply to your favorites
                  </p>
                  <Link to="/">
                    <Button>Browse Jobs</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {applications?.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="flex items-center gap-3">
                        {/* <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold text-sm">
                          {app.job?.company?.name?.charAt(0) || "J"}
                        </div> */}
                        <div>
                          <Link
                            to={`/jobs/${app.jobId}`}
                            className="text-sm font-medium text-foreground hover:text-primary"
                          >
                            {app.job?.title || "Job"}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {app.job?.company?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-medium ${APPLICATION_STATUS_COLORS[app.status] || "bg-muted text-muted-foreground"}`}
                        >
                          {app.status}
                        </span>
                        {app.createdAt && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Saved Jobs Tab */}
          <TabsContent value="saved">
            <div className="shadow-lg bg-white border-slate-100  rounded-lg">
              {savedJobs.length === 0 ? (
                <div className="p-8 text-center">
                  <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h2 className="text-lg font-semibold text-foreground">
                    No saved jobs
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Bookmark jobs you're interested in to find them later
                  </p>
                  <Link to="/">
                    <Button>Browse Jobs</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {savedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 gap-4"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="text-sm font-medium text-foreground hover:text-primary"
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
                        className="shrink-0"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CandidateProfile;
