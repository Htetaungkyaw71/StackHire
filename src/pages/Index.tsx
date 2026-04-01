import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Briefcase, Users, Building2, ArrowRight, Star } from "lucide-react";
import { TECH_STACKS } from "@/lib/constants";
import { useState } from "react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-card border-b">
        <div className="container py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Find your dream job
              <br />
              <span className="text-primary">in tech</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-lg">
              Browse thousands of tech jobs. Filter by technology, location, and experience level.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Job title, company, keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8">
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Tech categories */}
      <section className="border-b">
        <div className="container py-8">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {TECH_STACKS.slice(0, 12).map((tech) => (
              <Link
                key={tech.name}
                to={`/jobs?tech=${encodeURIComponent(tech.name)}`}
                className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg border ${tech.color} border-current/10 hover:shadow-sm transition-all shrink-0`}
              >
                <span className="text-sm font-semibold">{tech.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Briefcase,
                title: "Browse offers",
                desc: "Thousands of tech job offers from top companies worldwide.",
              },
              {
                icon: Building2,
                title: "Top companies",
                desc: "Work with leading tech companies and innovative startups.",
              },
              {
                icon: Star,
                title: "Quick apply",
                desc: "Apply with one click. Track your applications in real time.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30">
        <div className="container py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Are you a recruiter?</h2>
            <p className="text-muted-foreground mt-1">Post jobs and find the best tech talent.</p>
          </div>
          <Link to="/register">
            <Button size="lg" className="gap-2">
              Post a job <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-2 font-semibold text-foreground">
            <Briefcase className="h-4 w-4 text-primary" /> JobFlow
          </span>
          <span>© {new Date().getFullYear()} JobFlow. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
