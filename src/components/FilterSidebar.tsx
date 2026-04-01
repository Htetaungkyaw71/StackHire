import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { WORKING_MODES, JOB_TYPES, JOB_LEVELS } from "@/lib/constants";

interface Filters {
  workingMode: string[];
  jobType: string[];
  level: string[];
  salaryMin: string;
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const FilterSidebar = ({ filters, onChange }: FilterSidebarProps) => {
  const toggleArrayItem = (key: "workingMode" | "jobType" | "level", value: string) => {
    const arr = filters[key];
    const updated = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    onChange({ ...filters, [key]: updated });
  };

  return (
    <aside className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Working mode</h3>
        <div className="space-y-2">
          {WORKING_MODES.map((mode) => (
            <div key={mode} className="flex items-center gap-2">
              <Checkbox
                id={`mode-${mode}`}
                checked={filters.workingMode.includes(mode)}
                onCheckedChange={() => toggleArrayItem("workingMode", mode)}
              />
              <Label htmlFor={`mode-${mode}`} className="text-sm text-muted-foreground cursor-pointer">
                {mode}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Contract type</h3>
        <div className="space-y-2">
          {JOB_TYPES.map((type) => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox
                id={`type-${type}`}
                checked={filters.jobType.includes(type)}
                onCheckedChange={() => toggleArrayItem("jobType", type)}
              />
              <Label htmlFor={`type-${type}`} className="text-sm text-muted-foreground cursor-pointer">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Experience level</h3>
        <div className="space-y-2">
          {JOB_LEVELS.map((level) => (
            <div key={level} className="flex items-center gap-2">
              <Checkbox
                id={`level-${level}`}
                checked={filters.level.includes(level)}
                onCheckedChange={() => toggleArrayItem("level", level)}
              />
              <Label htmlFor={`level-${level}`} className="text-sm text-muted-foreground cursor-pointer">
                {level}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Minimum salary</h3>
        <Input
          type="number"
          placeholder="e.g. 5000"
          value={filters.salaryMin}
          onChange={(e) => onChange({ ...filters, salaryMin: e.target.value })}
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">USD / month</p>
      </div>
    </aside>
  );
};

export default FilterSidebar;
