"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Participant } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatWeight } from "@/lib/utils";
import { Search, Scale, ArrowRight, Loader2 } from "lucide-react";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Search size={22} className="text-[#0052FF]" />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Tournament-Wide Search
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Instant query lookup across Athlete Names, Academies, and Categories.
        </p>
      </div>

      {/* Large Search Input */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type athlete name, academy, or division..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition-all font-medium"
          />
          {loading && (
            <Loader2
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#0052FF]"
            />
          )}
        </div>
      </div>

      {/* Results Count */}
      {query.trim() && !loading && (
        <p className="text-xs font-semibold text-slate-500">
          Found <strong className="text-slate-900">{results.length}</strong> matching athletes
        </p>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((athlete) => (
          <div
            key={athlete.id}
            className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-end mb-2">
                <StatusBadge status={athlete.currentStatus} size="sm" />
              </div>

              <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0052FF] transition-colors">
                {athlete.athleteName}
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {athlete.academyName}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  {athlete.division} • {athlete.category}
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {athlete.weightCategory}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs font-mono">
                <span className="text-slate-500">Weight: </span>
                <strong className="text-slate-900">
                  {athlete.currentWeight ? `${formatWeight(athlete.currentWeight)} KG` : "None"}
                </strong>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push(`/weigh-in?lot=${encodeURIComponent(athlete.lotNumber)}`)}
                className="gap-1.5 text-xs py-1 px-3 bg-[#0052FF] hover:bg-[#0045D8]"
              >
                <span>Weigh-In Console</span>
                <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {!query.trim() && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
          <Search size={36} className="mx-auto text-slate-300 mb-2 opacity-60" />
          <p className="text-sm font-bold text-slate-700">Search Entire Tournament Roster</p>
          <p className="text-xs text-slate-400 mt-1">
            Search by athlete name, academy, or category weight class.
          </p>
        </div>
      )}
    </div>
  );
}
