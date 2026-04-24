import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, RecruiterProfile as RecruiterProfileType } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { UserRound } from "lucide-react";

const RecruiterProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [existing, setExisting] = useState<RecruiterProfileType | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    title: "",
    email: "",
    phone: "",
    linkedinUrl: "",
  });

  useEffect(() => {
    api.recruiter
      .get()
      .then((profiles) => {
        if (profiles.length > 0) {
          const profile = profiles[0];
          setExisting(profile);
          setForm({
            fullName: profile.fullName || "",
            title: profile.title || "",
            email: profile.email || "",
            phone: profile.phone || "",
            linkedinUrl: profile.linkedinUrl || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (existing) {
        await api.recruiter.update(form);
      } else {
        await api.recruiter.create(form);
      }

      toast({ title: existing ? "Profile updated!" : "Profile created!" });
      navigate("/recruiter/create-company");
    } catch (err: any) {
      const message = err?.message || "Something went wrong";

      if (message.toLowerCase().includes("company profile")) {
        toast({
          title: "Create company first",
          description:
            "You need to create your company profile before recruiter profile.",
          variant: "destructive",
        });
        navigate("/recruiter/create-company");
        return;
      }

      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="container max-w-lg py-10">
        <div className="h-24 rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UserRound className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {existing ? "Edit recruiter profile" : "Create recruiter profile"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete your recruiter details before managing hiring
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
                minLength={2}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                minLength={5}
                placeholder="Technical Recruiter"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="recruiter@company.com"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Saving..."
                : existing
                  ? "Update profile"
                  : "Create profile"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfile;
