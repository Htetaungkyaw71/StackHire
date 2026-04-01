import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api, CandidateProfile as CandidateProfileType, Application } from "@/lib/api";
import { APPLICATION_STATUS_COLORS } from "@/lib/constants";
import {
  User, FileText, Bookmark, Briefcase, MapPin, Globe, DollarSign,
  Plus, X, Edit3, Clock,
} from "lucide-react";
import { Link } from "react-router-dom";

const CandidateProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<CandidateProfileType | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CandidateProfileType>({
    headline: "",
    description: "",
    location: "",
    openToRemote: true,
    expectedSalary: 0,
    availability: "IMMEDIATELY",
    jobStatus: "ACTIVELY_LOOKING",
    visibility: "PUBLIC",
    skills: [],
    languages: [],
    experiences: [],
  });

  const [newSkill, setNewSkill] = useState({ name: "", level: "MID" });
  const [newLang, setNewLang] = useState({ name: "", level: "INTERMEDIATE" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profiles = await api.candidate.get();
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        setForm(profiles[0]);
      }
    } catch {}
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profile) {
        const updated = await api.candidate.update(form);
        setProfile(updated);
      } else {
        const created = await api.candidate.create(form);
        setProfile(created);
      }
      setEditing(false);
      toast({ title: "Profile saved!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    setForm({ ...form, skills: [...form.skills, { ...newSkill }] });
    setNewSkill({ name: "", level: "MID" });
  };

  const removeSkill = (index: number) => {
    setForm({ ...form, skills: form.skills.filter((_, i) => i !== index) });
  };

  const addLanguage = () => {
    if (!newLang.name.trim()) return;
    setForm({ ...form, languages: [...form.languages, { ...newLang }] });
    setNewLang({ name: "", level: "INTERMEDIATE" });
  };

  const removeLanguage = (index: number) => {
    setForm({ ...form, languages: form.languages.filter((_, i) => i !== index) });
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          {profile && !editing && (
            <Button variant="outline" onClick={() => setEditing(true)} className="gap-1.5">
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
              <div className="bg-card border rounded-lg p-8 text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-foreground">Set up your profile</h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Complete your profile to start applying for jobs
                </p>
                <Button onClick={() => setEditing(true)}>Create Profile</Button>
              </div>
            ) : editing ? (
              <div className="space-y-6">
                {/* Basic info */}
                <div className="bg-card border rounded-lg p-6 space-y-4">
                  <h2 className="font-semibold text-foreground">Basic Information</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Headline</Label>
                      <Input
                        value={form.headline}
                        onChange={(e) => setForm({ ...form, headline: e.target.value })}
                        placeholder="Senior Frontend Developer"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>About</Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="Warsaw, Poland"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Salary (USD/year)</Label>
                      <Input
                        type="number"
                        value={form.expectedSalary || ""}
                        onChange={(e) => setForm({ ...form, expectedSalary: parseInt(e.target.value) || 0 })}
                        placeholder="80000"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={form.openToRemote}
                        onCheckedChange={(checked) => setForm({ ...form, openToRemote: checked })}
                      />
                      <Label>Open to remote work</Label>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-card border rounded-lg p-6 space-y-4">
                  <h2 className="font-semibold text-foreground">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map((skill, i) => (
                      <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {skill.name}
                        <span className="text-xs text-primary/60">• {skill.level}</span>
                        <button onClick={() => removeSkill(i)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      placeholder="Skill name"
                      className="flex-1"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" variant="outline" onClick={addSkill} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Languages */}
                <div className="bg-card border rounded-lg p-6 space-y-4">
                  <h2 className="font-semibold text-foreground">Languages</h2>
                  <div className="flex flex-wrap gap-2">
                    {form.languages.map((lang, i) => (
                      <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                        {lang.name}
                        <span className="text-xs opacity-60">• {lang.level}</span>
                        <button onClick={() => removeLanguage(i)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newLang.name}
                      onChange={(e) => setNewLang({ ...newLang, name: e.target.value })}
                      placeholder="Language"
                      className="flex-1"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
                    />
                    <Button type="button" variant="outline" onClick={addLanguage} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save profile"}
                  </Button>
                  <Button variant="outline" onClick={() => { setEditing(false); if (profile) setForm(profile); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : profile ? (
              <div className="space-y-6">
                <div className="bg-card border rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-foreground">{profile.headline || "No headline"}</h2>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                        {profile.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {profile.location}
                          </span>
                        )}
                        {profile.openToRemote && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5" /> Remote
                          </span>
                        )}
                        {profile.expectedSalary > 0 && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" /> ${(profile.expectedSalary / 1000).toFixed(0)}k/yr
                          </span>
                        )}
                      </div>
                      {profile.description && (
                        <p className="text-sm text-muted-foreground mt-3">{profile.description}</p>
                      )}
                    </div>
                  </div>

                  {profile.skills.length > 0 && (
                    <div className="mt-5 pt-5 border-t">
                      <h3 className="text-sm font-semibold text-foreground mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {skill.name} • {skill.level}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.languages.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="text-sm font-semibold text-foreground mb-2">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.languages.map((lang, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                            {lang.name} • {lang.level}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.experiences.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Experience</h3>
                      <div className="space-y-3">
                        {profile.experiences.map((exp, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{exp.title}</p>
                              <p className="text-xs text-muted-foreground">{exp.company}</p>
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
            <div className="bg-card border rounded-lg">
              {applications.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h2 className="text-lg font-semibold text-foreground">No applications yet</h2>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Start browsing jobs and apply to your favorites
                  </p>
                  <Link to="/jobs">
                    <Button>Browse Jobs</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {applications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold text-sm">
                          {app.job?.company?.name?.charAt(0) || "J"}
                        </div>
                        <div>
                          <Link to={`/jobs/${app.jobId}`} className="text-sm font-medium text-foreground hover:text-primary">
                            {app.job?.title || "Job"}
                          </Link>
                          <p className="text-xs text-muted-foreground">{app.job?.company?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded text-xs font-medium ${APPLICATION_STATUS_COLORS[app.status] || "bg-muted text-muted-foreground"}`}>
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
            <div className="bg-card border rounded-lg p-8 text-center">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-foreground">No saved jobs</h2>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Bookmark jobs you're interested in to find them later
              </p>
              <Link to="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CandidateProfile;
