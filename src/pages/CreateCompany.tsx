import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, Company } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { COMPANY_SIZES, HIRING_STATUSES } from "@/lib/constants";
import { Building2 } from "lucide-react";

const CreateCompany = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<Company | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    website: "",
    industry: "",
    size: "SMALL",
    foundedYear: new Date().getFullYear(),
    location: "",
    hiringStatus: "ACTIVELY_HIRING",
  });

  useEffect(() => {
    api.company
      .get()
      .then((companies) => {
        if (companies.length > 0) {
          const c = companies[0];
          setExisting(c);
          setForm({
            name: c.name,
            description: c.description,
            website: c.website,
            industry: c.industry,
            size: c.size,
            foundedYear: c.foundedYear,
            location: c.location,
            hiringStatus: c.hiringStatus,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (existing) {
        await api.company.update(form);
        toast({ title: "Company updated!" });
      } else {
        await api.company.create(form);
        toast({ title: "Company created!" });
      }

      const recruiterProfiles = await api.recruiter.get().catch(() => []);
      if (recruiterProfiles.length === 0) {
        navigate("/recruiter/profile");
      } else {
        navigate("/recruiter/dashboard");
      }
    } catch (err: any) {
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
          {/* <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-7 w-7 text-primary" />
          </div> */}
          <h1 className="text-2xl font-bold text-foreground">
            {existing ? "Edit Company" : "Create your company"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {existing
              ? "Update your company details"
              : "You need a company profile to post jobs"}
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Company name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Acme Inc."
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="What does your company do?"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input
                  value={form.industry}
                  onChange={(e) =>
                    setForm({ ...form, industry: e.target.value })
                  }
                  placeholder="Technology"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  required
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  type="url"
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Founded year</Label>
                <Input
                  type="number"
                  value={form.foundedYear}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      foundedYear: parseInt(e.target.value) || 2024,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company size</Label>
                <Select
                  value={form.size}
                  onValueChange={(v) => setForm({ ...form, size: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hiring status</Label>
                <Select
                  value={form.hiringStatus}
                  onValueChange={(v) => setForm({ ...form, hiringStatus: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HIRING_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="mt-3" disabled={loading}>
              {loading
                ? "Saving..."
                : existing
                  ? "Update Company"
                  : "Create Company"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCompany;
