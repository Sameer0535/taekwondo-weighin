"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CategorySummary, Participant, Status } from "@/types";
import { ActiveAthleteCard } from "@/components/weigh-in/ActiveAthleteCard";
import { HistoryTimeline } from "@/components/weigh-in/HistoryTimeline";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { parseCategoryId } from "@/lib/category-engine";
import { Loader2, Search, X, User, ArrowRight } from "lucide-react";

function WeighInContent() {
  const searchParams = useSearchParams();
  const initialLot = searchParams.get("lot");

  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [categoryAthletes, setCategoryAthletes] = useState<Participant[]>([]);
  const [activeAthlete, setActiveAthlete] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Live Integrated Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Participant[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live Search Effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/participants?search=${encodeURIComponent(searchQuery.trim())}`);
        const json = await res.json();
        if (json.success) {
          setSearchResults(json.data || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 1. Fetch categories on mount
  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setCategories(json.data);
        return json.data as CategorySummary[];
      }
      return [];
    } catch (err) {
      console.error("Failed to load categories:", err);
      return [];
    }
  }, []);

  // 2. Fetch athletes in active category
  const loadCategoryAthletes = useCallback(async (catId: string, preferredLot?: string) => {
    if (!catId) return;
    const parsed = parseCategoryId(catId);

    const query = new URLSearchParams({
      gender: parsed.gender,
      division: parsed.division,
      category: parsed.category,
      weightCategory: parsed.weightCategory,
    });

    try {
      const res = await fetch(`/api/participants?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        const athletes = json.data as Participant[];
        setCategoryAthletes(athletes);

        // Only select athlete if specifically requested via search or URL
        if (preferredLot) {
          const match = athletes.find((a) => a.lotNumber === preferredLot);
          if (match) {
            setActiveAthlete(match);
            return;
          }
        }

        // Do not auto-show athlete name until searched and clicked on that player name
        setActiveAthlete(null);
      }
    } catch (err) {
      console.error("Failed to load category athletes:", err);
    }
  }, []);

  // Initial boot effect
  useEffect(() => {
    async function init() {
      setLoading(true);
      const cats = await loadCategories();

      if (initialLot) {
        try {
          const res = await fetch(`/api/participants?search=${encodeURIComponent(initialLot)}`);
          const json = await res.json();
          if (json.success && json.data.length > 0) {
            const found = json.data.find((a: Participant) => a.lotNumber === initialLot);
            if (found) {
              const matchingCat = cats.find(
                (c) =>
                  c.gender === found.gender &&
                  c.division === found.division &&
                  c.category === found.category &&
                  c.weightCategory === found.weightCategory
              );
              if (matchingCat) {
                setSelectedCategoryId(matchingCat.id);
                await loadCategoryAthletes(matchingCat.id, initialLot);
                setLoading(false);
                return;
              }
            }
          }
        } catch (e) {
          console.error("Failed to lookup initial lot:", e);
        }
      }

      if (cats.length > 0) {
        const firstCatId = cats[0].id;
        setSelectedCategoryId(firstCatId);
        await loadCategoryAthletes(firstCatId);
      }
      setLoading(false);
    }

    init();
  }, [loadCategories, loadCategoryAthletes, initialLot]);

  // Athlete selection from search results
  const handleSelectAthleteFromSearch = async (athlete: Participant) => {
    setShowDropdown(false);
    setSearchQuery("");

    // Find category for this athlete
    const matchingCat = categories.find(
      (c) =>
        c.gender === athlete.gender &&
        c.division === athlete.division &&
        c.category === athlete.category &&
        c.weightCategory === athlete.weightCategory
    );

    if (matchingCat) {
      setSelectedCategoryId(matchingCat.id);
      await loadCategoryAthletes(matchingCat.id, athlete.lotNumber);
    } else {
      // Reload categories in case category list wasn't populated
      const cats = await loadCategories();
      const match = cats.find(
        (c) =>
          c.gender === athlete.gender &&
          c.division === athlete.division &&
          c.category === athlete.category &&
          c.weightCategory === athlete.weightCategory
      );
      if (match) {
        setSelectedCategoryId(match.id);
        await loadCategoryAthletes(match.id, athlete.lotNumber);
      } else {
        setActiveAthlete(athlete);
      }
    }
  };

  const handleRecordDecision = async (
    targetStatus: Status,
    weight: number,
    notes?: string
  ) => {
    if (!activeAthlete) return;
    setActionLoading(true);

    try {
      const res = await fetch("/api/weigh-in/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: activeAthlete.id,
          weight,
          status: targetStatus,
          notes,
          operatorId: "OP-01",
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to record weigh-in");
      }

      const updatedParticipant: Participant = json.data.participant;
      setActiveAthlete(updatedParticipant);

      await Promise.all([
        loadCategoryAthletes(selectedCategoryId, updatedParticipant.lotNumber),
        loadCategories(),
      ]);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNextAthlete = async () => {
    if (!selectedCategoryId) return;

    try {
      const res = await fetch(
        `/api/weigh-in/next?categoryId=${encodeURIComponent(selectedCategoryId)}${
          activeAthlete ? `&currentParticipantId=${activeAthlete.id}` : ""
        }`
      );
      const json = await res.json();

      if (json.success) {
        if (json.completed || !json.data) {
          alert("All athletes in this category have completed weigh-in.");
        } else {
          setActiveAthlete(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch next athlete:", err);
    }
  };

  const hasUnresolved = categoryAthletes.some(
    (a) => a.currentStatus === "PENDING" || a.currentStatus === "HOLD"
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={36} className="animate-spin text-[#0052FF]" />
        <p className="text-sm font-semibold text-slate-500">Loading Official Weigh-In Console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Prominent Integrated Live Search Bar at Top of Weigh-In Console */}
      <div ref={searchContainerRef} className="relative z-30">
        <div className="relative flex items-center">
          <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
            placeholder="Search competitor by Name or Academy to jump directly to scale..."
            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-300 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all"
          />
          {searchLoading && (
            <Loader2 size={16} className="absolute right-4 animate-spin text-[#0052FF]" />
          )}
          {!searchLoading && searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowDropdown(false);
              }}
              className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-96 overflow-y-auto z-50 divide-y divide-slate-100">
            <div className="px-4 py-2 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Found {searchResults.length} Competitors (Click to jump to scale)
            </div>
            {searchResults.map((athlete) => (
              <button
                key={athlete.id}
                type="button"
                onClick={() => handleSelectAthleteFromSearch(athlete)}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0052FF] group-hover:bg-[#0052FF] group-hover:text-white transition-colors">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 group-hover:text-[#0052FF] transition-colors">
                      {athlete.athleteName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {athlete.academyName} • <span className="font-semibold text-slate-700">{athlete.division}</span> ({athlete.weightCategory})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={athlete.currentStatus} size="sm" />
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-[#0052FF] group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        )}

        {showDropdown && searchResults.length === 0 && searchQuery.trim().length > 1 && !searchLoading && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-5 text-center text-xs font-semibold text-slate-500 z-50">
            No competitor found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      {/* 2. Weigh-In Work Area: Scale & History */}
      <div className="max-w-4xl mx-auto space-y-6">
        <ActiveAthleteCard
          athlete={activeAthlete}
          onRecordDecision={handleRecordDecision}
          onNextAthlete={handleNextAthlete}
          hasUnresolvedAthletes={hasUnresolved}
          isLoading={actionLoading}
        />

        {activeAthlete && (
          <HistoryTimeline
            attempts={activeAthlete.attempts || []}
            athleteName={activeAthlete.athleteName}
          />
        )}
      </div>
    </div>
  );
}

export default function WeighInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 size={36} className="animate-spin text-[#0052FF]" />
          <p className="text-sm font-semibold text-slate-500">Loading Weigh-In...</p>
        </div>
      }
    >
      <WeighInContent />
    </Suspense>
  );
}

