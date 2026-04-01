import { TECH_STACKS } from "@/lib/constants";

interface TechStackFilterProps {
  selected: string[];
  onToggle: (tech: string) => void;
}

const TechStackFilter = ({ selected, onToggle }: TechStackFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {TECH_STACKS.map((tech) => {
        const isActive = selected.includes(tech.name);
        return (
          <button
            key={tech.name}
            onClick={() => onToggle(tech.name)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all shrink-0 ${
              isActive
                ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
          >
            <span className="text-[13px] font-semibold">{tech.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TechStackFilter;
