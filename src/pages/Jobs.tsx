import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Search, ChevronDown, Filter } from "lucide-react";
import JobCard from "@/components/JobCard";
import TechStackFilter from "@/components/TechStackFilter";
import FilterSidebar from "@/components/FilterSidebar";
import { api, Job } from "@/lib/api";
import type { JobsListParams } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const CustomSelect = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative w-24" ref={ref}>
      <button
        type="button"
        className="flex h-10 w-full items-center justify-between bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none"
        onClick={() => setOpen(!open)}
      >
        <span>{selectedOption.label}</span>
        <ChevronDown
          className={`h-4 w-4 opacity-50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md bg-popover shadow-md py-1 border border-border">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="flex w-full outline-none px-3 py-2 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const JobCardSkeleton = () => (
  <div className="block group">
    <div className="mt-3 flex items-center gap-4 rounded-md border border-border bg-card px-4 py-4 shadow-md animate-pulse max-md:gap-0">
      <div className="h-16 w-16 shrink-0 rounded-xl bg-muted max-md:hidden" />

      <div className="flex-1 min-w-0 space-y-3 max-md:space-y-4">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="h-4 w-2/3 rounded bg-muted max-md:hidden" />
          <div className="flex w-full items-center justify-between gap-2 md:hidden">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-muted" />
            <div className="h-4 flex-1 rounded bg-muted" />
            <div className="h-8 w-8 shrink-0 rounded-full bg-muted" />
          </div>
          <div className="h-4 w-28 rounded bg-muted max-md:hidden" />
          <div className="hidden items-center gap-2 md:flex">
            <div className="h-4 w-4 rounded-full bg-muted" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-3.5 w-28 rounded bg-muted" />
            <div className="h-3.5 w-20 rounded bg-muted" />
            <div className="h-3.5 w-16 rounded bg-muted" />
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-5 w-12 rounded bg-muted" />
            <div className="h-5 w-12 rounded bg-muted" />
            <div className="h-5 w-12 rounded bg-muted" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:hidden">
          <div className="h-5 w-12 rounded bg-muted" />
          <div className="h-5 w-12 rounded bg-muted" />
          <div className="h-5 w-12 rounded bg-muted" />
        </div>
      </div>
    </div>
  </div>
);

const Jobs = () => {
  const PAGE_SIZE = 12;
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialTech = (searchParams.get("tech") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const initialSort =
    searchParams.get("sort") === "salary" ? "salary" : "newest";
  const initialRemote = searchParams.get("remote") === "true";
  const initialJobType = searchParams.get("type")
    ? [searchParams.get("type") as string]
    : [];
  const initialLevel = searchParams.get("level")
    ? [searchParams.get("level") as string]
    : [];
  const initialSalaryMin = searchParams.get("minSalary") || "";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [selectedTechs, setSelectedTechs] = useState<string[]>(initialTech);
  const [sortBy, setSortBy] = useState<"newest" | "salary">(initialSort);
  const [filters, setFilters] = useState({
    remoteOnly: initialRemote,
    jobType: initialJobType,
    level: initialLevel,
    salaryMin: initialSalaryMin,
  });
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const requestKeyRef = useRef(0);

  const searchParam = searchParams.get("search") || "";

  const getRequestParams = (nextPage: number): JobsListParams => ({
    page: nextPage,
    limit: PAGE_SIZE,
    type: filters.jobType[0],
    level: filters.level[0],
    isRemote: filters.remoteOnly ? true : undefined,
    minSalary: filters.salaryMin ? parseInt(filters.salaryMin, 10) : undefined,
    search: searchParam.trim() || undefined,
    tech: selectedTechs.length ? selectedTechs : undefined,
    sort: sortBy,
  });

  const activeFilterKey = JSON.stringify({
    searchParam,
    selectedTechs,
    sortBy,
    filters,
  });

  useEffect(() => {
    const next = new URLSearchParams();

    if (searchParam.trim()) next.set("search", searchParam.trim());
    if (selectedTechs.length > 0) next.set("tech", selectedTechs.join(","));
    if (sortBy !== "newest") next.set("sort", sortBy);
    if (filters.remoteOnly) next.set("remote", "true");
    if (filters.jobType[0]) next.set("type", filters.jobType[0]);
    if (filters.level[0]) next.set("level", filters.level[0]);
    if (filters.salaryMin) next.set("minSalary", filters.salaryMin);

    setSearchParams(next, { replace: true });
  }, [searchParam, selectedTechs, sortBy, filters, setSearchParams]);

  useEffect(() => {
    const loadInitialJobs = async () => {
      const requestKey = Date.now();
      requestKeyRef.current = requestKey;

      if (jobs.length === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const response = await api.jobs.listPaginated(getRequestParams(1));
        if (requestKeyRef.current !== requestKey) return;

        setJobs(response.data);
        setPage(1);
        setTotalJobs(response.pagination.total);
        setHasNextPage(response.pagination.hasNextPage);
      } catch {
        if (requestKeyRef.current !== requestKey) return;
        setJobs([]);
        setHasNextPage(false);
      } finally {
        if (requestKeyRef.current !== requestKey) return;
        setLoading(false);
        setRefreshing(false);
      }
    };

    void loadInitialJobs();
  }, [activeFilterKey]);

  useEffect(() => {
    if (page === 1) return;

    const loadMore = async () => {
      setLoadingMore(true);
      try {
        const response = await api.jobs.listPaginated(getRequestParams(page));
        setJobs((prev) => [...prev, ...response.data]);
        setTotalJobs(response.pagination.total);
        setHasNextPage(response.pagination.hasNextPage);
      } catch {
        setHasNextPage(false);
      } finally {
        setLoadingMore(false);
      }
    };

    void loadMore();
  }, [page, activeFilterKey]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first.isIntersecting) return;
        if (loading || loadingMore || !hasNextPage) return;

        setPage((prev) => prev + 1);
      },
      { rootMargin: "300px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loading, loadingMore, hasNextPage]);

  const toggleTech = (tech: string) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech],
    );
  };
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (location.pathname === "/") {
      setSearchQuery(searchParams.get("search") || "");
    } else {
      setSearchQuery("");
    }
  }, [location.pathname, searchParams]);

  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Tech stack bar */}
      <div className="flex-1 px-5 py-2 sticky my-3 bg-background/95 w-full top-14 z-50 md:hidden">
        <form
          onSubmit={handleSearch}
          className="relative flex items-center w-full border border-border rounded-full shadow-md bg-card focus-within:border-primary/50 transition-colors overflow-hidden"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search job title, company, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-transparent pl-9 pr-10 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground "
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center p-1.5 text-white bg-gradient-to-br from-indigo-500 to-violet-500 focus:outline-none  rounded-full transition-colors"
            title="Search jobs"
          >
            <Search className="h-5 w-5" />
          </button>
        </form>
      </div>

      <div className="sticky top-14 max-md:hidden z-50 backdrop-blur-md">
        <div className="container py-4">
          <TechStackFilter selected={selectedTechs} onToggle={toggleTech} />
        </div>
      </div>

      <div className="container max-w-6xl py-0">
        <div className="flex gap-8">
          {/* Sidebar filters */}
          <div className="hidden md:block w-64 shrink-0 sticky top-52 self-start">
            <FilterSidebar filters={filters} onChange={setFilters} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search bar & sort */}

            {/* Results header */}
            <div className="flex items-center justify-between px-1 min-h-6">
              <p className="text-sm text-foreground">
                {loading ? (
                  <div className="h-5 w-20 rounded bg-muted" />
                ) : (
                  `${totalJobs} offers found`
                )}
              </p>
              <div className="flex items-center  justify-end gap-3 rounded-md border-transparent bg-transparent">
                <CustomSelect
                  value={sortBy}
                  onChange={(value) => setSortBy(value as "newest" | "salary")}
                  options={[
                    { label: "Newest", value: "newest" },
                    { label: "Salary ↓", value: "salary" },
                  ]}
                />
              </div>
              {selectedTechs.length > 0 && (
                <button
                  onClick={() => setSelectedTechs([])}
                  className="text-xs text-foreground hover:text-muted-foreground"
                >
                  Clear tech filters
                </button>
              )}
            </div>

            {/* Job list */}
            <div className="rounded-xl  overflow-hidden ">
              {loading || refreshing ? (
                <div>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <JobCardSkeleton key={i} />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="text-lg">No offers found</p>
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                jobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>

            {!loading && (
              <div ref={loadMoreRef} className="py-4 text-center">
                {loadingMore ? (
                  <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading more
                    jobs...
                  </p>
                ) : hasNextPage ? (
                  <p className="text-xs text-muted-foreground">
                    Scroll to load more
                  </p>
                ) : (
                  jobs.length !== 0 && (
                    <p className="text-xs text-muted-foreground">
                      You reached the end
                    </p>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50  bg-transparent px-4 py-3 md:hidden">
        <div className="mx-auto flex max-w-6xl justify-center">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-full border border-slate-100 px-5 text-sm font-medium bg-white text-foreground shadow-lg"
              >
                <Filter className="h-4 w-4" />
                Filters
                {(selectedTechs.length > 0 ||
                  filters.remoteOnly ||
                  filters.jobType.length > 0 ||
                  filters.level.length > 0 ||
                  filters.salaryMin) && (
                  <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                    Active
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="h-[85vh] rounded-t-3xl px-4 pb-6 pt-4 md:hidden"
            >
              <SheetHeader className="px-1 pb-4 text-left">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="max-h-[calc(85vh-5rem)] overflow-y-auto pb-8">
                <div className="mb-6 space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-lg">
                  <h3 className="text-sm font-semibold text-foreground">
                    Tech stacks
                  </h3>
                  <TechStackFilter
                    selected={selectedTechs}
                    onToggle={toggleTech}
                  />
                </div>
                <FilterSidebar filters={filters} onChange={setFilters} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
