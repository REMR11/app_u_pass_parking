"use client";

export type FilterType = "recommended" | "nearest" | "cheapest";

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { value: FilterType; label: string }[] = [
  { value: "recommended", label: "Recomendados" },
  { value: "nearest", label: "Cercanos" },
  { value: "cheapest", label: "Economicos" },
];

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {filters.map((filter) => {
        const isActive = filter.value === activeFilter;
        
        return (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${isActive 
                ? "bg-primary text-primary-foreground" 
                : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
              }
            `}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
