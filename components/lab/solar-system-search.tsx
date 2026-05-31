"use client";

import { useState, useEffect, useRef } from "react";

export type SearchResult = {
  id: string;
  name: string;
  isNEO: boolean;
  isPHA: boolean;
  sbdbClass: string;
};

type Props = {
  locale: "it" | "en";
  placeholder: string;
  onSelect: (result: SearchResult) => void;
};

export function SolarSystemSearch({ locale: _locale, placeholder, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/solar/catalog/search?q=${encodeURIComponent(query)}&limit=8`);
        if (res.ok) {
          const data = await res.json() as { results: SearchResult[] };
          setResults(data.results ?? []);
          setOpen(true);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [query]);

  return (
    <div className="solar-search">
      <input
        type="search"
        className="solar-control solar-search__input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => results.length > 0 && setOpen(true)}
        aria-label={placeholder}
      />
      {loading && <span className="solar-search__spinner" aria-hidden="true">…</span>}
      {open && results.length > 0 && (
        <ul className="solar-search__dropdown" role="listbox">
          {results.map((r) => (
            <li
              key={r.id}
              role="option"
              aria-selected={false}
              className="solar-search__option"
              onMouseDown={() => { onSelect(r); setQuery(""); setOpen(false); }}
            >
              <span className="solar-search__name">{r.name}</span>
              {r.isPHA && <span className="solar-search__tag solar-search__tag--pha">PHA</span>}
              {r.isNEO && !r.isPHA && <span className="solar-search__tag solar-search__tag--neo">NEO</span>}
              <span className="solar-search__class">{r.sbdbClass}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
