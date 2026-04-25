import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { JOB_TYPES, JOB_LEVELS } from "@/lib/constants";

interface Filters {
  remoteOnly: boolean;
  jobType: string[];
  level: string[];
  salaryMin: string;
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const FilterSidebar = ({ filters, onChange }: FilterSidebarProps) => {
  const setSingleSelect = (key: "jobType" | "level", value: string) => {
    const current = filters[key][0];
    onChange({
      ...filters,
      [key]: current === value ? [] : [value],
    });
  };

  return (
    <aside className="space-y-6 py-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() =>
            onChange({
              remoteOnly: false,
              jobType: [],
              level: [],
              salaryMin: "",
            })
          }
        >
          Clear all
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Working mode</h3>
        <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2">
          <Label
            htmlFor="remote-only"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Remote only
          </Label>
          <Switch
            id="remote-only"
            checked={filters.remoteOnly}
            onCheckedChange={(checked) =>
              onChange({ ...filters, remoteOnly: checked })
            }
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Contract type
        </h3>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSingleSelect("jobType", type)}
              className={`rounded-full border px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                filters.jobType[0] === type
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Experience level
        </h3>
        <div className="flex flex-wrap gap-2">
          {JOB_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSingleSelect("level", level)}
              className={`rounded-full border px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                filters.level[0] === level
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Minimum salary
        </h3>
        <Input
          type="number"
          placeholder="e.g. 60000"
          value={filters.salaryMin}
          onChange={(e) => onChange({ ...filters, salaryMin: e.target.value })}
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">USD / month</p>
      </div> */}
    </aside>
  );
};

export default FilterSidebar;
