import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import JobCard from "@/components/JobCard";
import TechStackFilter from "@/components/TechStackFilter";
import FilterSidebar from "@/components/FilterSidebar";
import { api, Job } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Jobs = () => {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [loading, setLoading] = useState(true);
  const [selectedTechs, setSelectedTechs] = useState<string[]>(() => {
    const tech = searchParams.get("tech");
    return tech ? [tech] : [];
  });
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState({
    workingMode: [] as string[],
    jobType: [] as string[],
    level: [] as string[],
    salaryMin: "",
  });

  useEffect(() => {
    api.jobs
      .list()
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleTech = (tech: string) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const filtered = useMemo(() => {
    let result = jobs;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.company?.name?.toLowerCase().includes(q) ||
          j.techStack.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedTechs.length > 0) {
      result = result.filter((j) =>
        selectedTechs.some((tech) =>
          j.techStack.some((t) => t.toLowerCase() === tech.toLowerCase())
        )
      );
    }

    if (filters.workingMode.length > 0) {
      result = result.filter((j) => {
        if (filters.workingMode.includes("Remote") && j.isRemote) return true;
        if (filters.workingMode.includes("On-site") && !j.isRemote) return true;
        return false;
      });
    }

    if (filters.jobType.length > 0) {
      result = result.filter((j) =>
        filters.jobType.some((t) => j.type.toLowerCase() === t.toLowerCase())
      );
    }

    if (filters.level.length > 0) {
      result = result.filter((j) =>
        filters.level.some((l) => j.level.toLowerCase() === l.toLowerCase())
      );
    }

    if (filters.salaryMin) {
      const min = parseInt(filters.salaryMin) * 12;
      result = result.filter((j) => j.salaryMin && j.salaryMin >= min);
    }

    if (sortBy === "salary") {
      result = [...result].sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
    }

    return result;
  }, [jobs, search, selectedTechs, filters, sortBy]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Tech stack bar */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <TechStackFilter selected={selectedTechs} onToggle={toggleTech} />
        </div>
      </div>

      <div className="container py-6">
        <div className="flex gap-8">
          {/* Sidebar filters */}
          <div className="hidden lg:block w-56 shrink-0">
            <FilterSidebar filters={filters} onChange={setFilters} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search bar & sort */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search job title, company, keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="salary">Salary ↓</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading..." : `${filtered.length} offers found`}
              </p>
              {selectedTechs.length > 0 && (
                <button
                  onClick={() => setSelectedTechs([])}
                  className="text-xs text-primary hover:underline"
                >
                  Clear tech filters
                </button>
              )}
            </div>

            {/* Job list */}
            <div className="border rounded-lg overflow-hidden bg-card">
              {loading ? (
                <div className="divide-y">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-[72px] animate-pulse bg-muted/30" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="text-lg">No offers found</p>
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                filtered.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
