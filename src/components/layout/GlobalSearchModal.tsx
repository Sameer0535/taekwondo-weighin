"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowRight, ArrowLeft, User } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatWeight } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Search API effect with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success) {
          setResults(json.data || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (athlete: any) => {
    onClose();
    router.push(`/weigh-in?lot=${encodeURIComponent(athlete.lotNumber)}`);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50 gap-3">
          <Search size={20} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                onClose();
              }
            }}
            className="flex-1 bg-transparent text-slate-900 text-sm font-medium focus:outline-none"
          />
          {loading && <Loader2 size={18} className="animate-spin text-[#0052FF]" />}
          {query && !loading && (
            <button
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Close search (ESC)"
          >
            <ArrowLeft size={14} className="text-slate-600" />
            <span>Back</span>
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-slate-100">
          {results.length > 0 ? (
            results.map((athlete) => (
              <div
                key={athlete.id}
                onClick={() => handleSelect(athlete)}
                className="pt-2 first:pt-0 flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0052FF] flex-shrink-0 group-hover:bg-[#0052FF] group-hover:text-white transition-colors">
                    <User size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-[#0052FF] transition-colors truncate">
                      {athlete.athleteName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {athlete.academyName} • {athlete.division} {athlete.weightCategory}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-mono font-bold text-slate-800">
                      {athlete.currentWeight ? `${formatWeight(athlete.currentWeight)} KG` : "No Weight"}
                    </p>
                  </div>
                  <StatusBadge status={athlete.currentStatus} size="sm" />
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-[#0052FF] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          ) : query.trim() ? (
            !loading && (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm">No athletes matching &quot;{query}&quot;</p>
              </div>
            )
          ) : (
            <div className="py-10 text-center text-slate-400">
              <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Tournament Search</p>
              <p className="text-xs text-slate-400 mt-1">
                Type an athlete&apos;s name or Academy to search
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
