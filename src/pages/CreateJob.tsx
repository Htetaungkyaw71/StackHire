import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { JOB_LEVELS, JOB_TYPES } from "@/lib/constants";
import { Briefcase, Plus, X } from "lucide-react";

const CreateJob = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [techInput, setTechInput] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    isRemote: false,
    salaryMin: "",
    salaryMax: "",
    techStack: [] as string[],
    level: "Mid",
    type: "Full-time",
  });

  const addTech = () => {
    const tech = techInput.trim();
    if (!tech || form.techStack.includes(tech)) return;
    setForm({ ...form, techStack: [...form.techStack, tech] });
    setTechInput("");
  };

  const removeTech = (t: string) => {
    setForm({ ...form, techStack: form.techStack.filter((x) => x !== t) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.jobs.create({
        ...form,
        salaryMin: form.salaryMin ? parseInt(form.salaryMin) : null,
        salaryMax: form.salaryMax ? parseInt(form.salaryMax) : null,
      });
      toast({ title: "Job posted!" });
      navigate("/recruiter/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Post a new job</h1>
          <p className="text-sm text-muted-foreground mt-1">Fill in the details for your job posting</p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Job title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="Senior Frontend Developer"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                  placeholder="Warsaw, Poland"
                />
              </div>
              <div className="flex items-end gap-3 pb-1">
                <Switch
                  checked={form.isRemote}
                  onCheckedChange={(checked) => setForm({ ...form, isRemote: checked })}
                />
                <Label>Remote</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {JOB_LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Salary min (USD/yr)</Label>
                <Input
                  type="number"
                  value={form.salaryMin}
                  onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                  placeholder="60000"
                />
              </div>
              <div className="space-y-2">
                <Label>Salary max (USD/yr)</Label>
                <Input
                  type="number"
                  value={form.salaryMax}
                  onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                  placeholder="100000"
                />
              </div>
            </div>

            {/* Tech stack */}
            <div className="space-y-2">
              <Label>Tech stack</Label>
              {form.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.techStack.map((t) => (
                    <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {t}
                      <button type="button" onClick={() => removeTech(t)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="e.g. React, Node.js..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTech();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTech} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Posting..." : "Post Job"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
