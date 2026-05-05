"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface SearchFiltersProps {
  locale: string;
  genres: { id: string; fr: string; en: string }[];
  countries: { code: string; fr: string; en: string }[];
  sortOptions: { value: string; label: string }[];
  currentGenre: string;
  currentCountry: string;
  currentYear: string;
  currentSort: string;
  currentType: string;
  searchParams: Record<string, string>;
}

export function SearchFilters({
  locale, genres, countries, sortOptions,
  currentGenre, currentCountry, currentYear, currentSort, currentType, searchParams,
}: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const l = locale;

  const update = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value);
    else p.delete(key);
    router.push(`${pathname}?${p.toString()}`);
  };

  const selectClass = "w-full bg-card border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground appearance-none cursor-pointer hover:border-primary/50 transition-colors focus:outline-none focus:border-primary";

  return (
    <aside className="w-48 shrink-0 space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">{l === "fr" ? "Trier par" : "Sort by"}</label>
        <div className="relative">
          <select className={selectClass} value={currentSort} onChange={(e) => update("sort", e.target.value)}>
            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {currentType !== "anime" && (
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">{l === "fr" ? "Genre" : "Genre"}</label>
          <div className="relative">
            <select className={selectClass} value={currentGenre} onChange={(e) => update("genre", e.target.value)}>
              <option value="">{l === "fr" ? "Tous" : "All"}</option>
              {genres.map((g) => <option key={g.id} value={g.id}>{l === "fr" ? g.fr : g.en}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      )}

      {currentType !== "anime" && (
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">{l === "fr" ? "Pays" : "Country"}</label>
          <div className="relative">
            <select className={selectClass} value={currentCountry} onChange={(e) => update("country", e.target.value)}>
              <option value="">{l === "fr" ? "Tous" : "All"}</option>
              {countries.map((c) => <option key={c.code} value={c.code}>{l === "fr" ? c.fr : c.en}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      )}

      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">{l === "fr" ? "Année" : "Year"}</label>
        <input
          type="number"
          min="1900"
          max={new Date().getFullYear()}
          placeholder={l === "fr" ? "Ex : 2023" : "E.g. 2023"}
          value={currentYear}
          onChange={(e) => update("year", e.target.value)}
          className="w-full bg-card border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus:outline-none focus:border-primary"
        />
      </div>

      {(currentGenre || currentCountry || currentYear) && (
        <button
          onClick={() => { update("genre", ""); update("country", ""); update("year", ""); }}
          className="text-xs text-primary hover:underline"
        >
          {l === "fr" ? "Réinitialiser les filtres" : "Reset filters"}
        </button>
      )}
    </aside>
  );
}
