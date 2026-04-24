const TECH_STACK_OPTIONS = [
  { name: "JavaScript", image: "/techs/js.png" },
  { name: "Python", image: "/techs/python.png" },
  { name: "Java", image: "/techs/java.png" },
  { name: "PHP", image: "/techs/php.png" },
  { name: "Ruby", image: "/techs/ruby.png" },
  { name: "Go", image: "/techs/go.png" },
  { name: "AWS", image: "/techs/aws.png" },
  { name: "Docker", image: "/techs/docker.png" },
  { name: "MongoDB", image: "/techs/mongodb.png" },
  { name: "MySQL", image: "/techs/mysql.png" },
  { name: "PostgreSQL", image: "/techs/postgresql.png" },
  { name: "HTML", image: "/techs/html.png" },
  { name: "DevOps", image: "/techs/devops.png" },
  { name: "Mobile", image: "/techs/mobile.png" },
  { name: ".NET", image: "/techs/net.png" },
  { name: "UI/UX", image: "/techs/uiux.png" },
  { name: "Flutter", image: "/techs/flutter.png" },
  { name: "Linux", image: "/techs/linus.png" },
  { name: "Testing", image: "/techs/testing.png" },
  { name: "Others", image: "/techs/others.svg" },
] as const;

interface TechStackFilterProps {
  selected: string[];
  onToggle: (tech: string) => void;
}

const TechStackFilter = ({ selected, onToggle }: TechStackFilterProps) => {
  return (
    <div className="flex gap-0 overflow-x-auto pb-2 scrollbar-hide">
      {TECH_STACK_OPTIONS.map((tech) => {
        const isActive = selected.includes(tech.name);
        return (
          <button
            key={tech.name}
            type="button"
            onClick={() => onToggle(tech.name)}
            className={`flex  flex-col items-center gap-2 rounded-xl  px-3 py-3 text-xs font-medium transition-all shrink-0 
            
            `}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border bg-muted/40 ${
                isActive
                  ? "bg-primary/30 text-primary shadow-lg"
                  : "text-muted-foreground"
              }`}
            >
              <img
                src={tech.image}
                alt={tech.name}
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="text-center text-[13px] font-semibold leading-tight">
              {tech.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default TechStackFilter;
