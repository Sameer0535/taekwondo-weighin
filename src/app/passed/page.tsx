"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Participant, CategorySummary } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatWeight } from "@/lib/utils";
import { CheckCircle2, Printer, Search, Loader2 } from "lucide-react";

export default function PassedAthletesPage() {
  const router = useRouter();
  const [passedAthletes, setPassedAthletes] = useState<Participant[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");
  const [academyFilter, setAcademyFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch passed athletes
  const loadPassed = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategoryId !== "ALL") {
        params.set("categoryId", selectedCategoryId);
      }
      if (academyFilter) {
        params.set("academy", academyFilter);
      }

      const res = await fetch(`/api/passed?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPassedAthletes(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch passed athletes:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, academyFilter]);

  // Fetch categories for filter dropdown
  useEffect(() => {
    async function getCats() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (json.success) {
          setCategories(json.data);
        }
      } catch (e) {
        console.error("Failed to load categories:", e);
      }
    }
    getCats();
  }, []);

  useEffect(() => {
    loadPassed();
  }, [loadPassed]);

  const handlePrintAllPassed = () => {
    router.push("/print");
  };

  const handlePrintPassedCategory = () => {
    if (selectedCategoryId && selectedCategoryId !== "ALL") {
      router.push(`/print?categoryId=${encodeURIComponent(selectedCategoryId)}`);
    } else {
      router.push("/print");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={22} className="text-emerald-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Certified Passed Athletes
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Athletes who have successfully fulfilled official weight requirements for tournament eligibility.
          </p>
        </div>

        {/* Print Triggers */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrintPassedCategory}
            disabled={selectedCategoryId === "ALL"}
            className="gap-2 font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
            title="Print only passed athletes in currently selected category"
          >
            <Printer size={15} />
            <span>Print Category Passed</span>
          </Button>

          <Button
            variant="success"
            size="sm"
            onClick={handlePrintAllPassed}
            className="gap-2 font-bold shadow-sm"
            title="Generate clean A4 printout of all passed athletes"
          >
            <Printer size={15} />
            <span>Print All Passed ({passedAthletes.length})</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
          {/* Category Filter */}
          <div className="w-full sm:w-72">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            >
              <option value="ALL">All Categories ({categories.reduce((acc, c) => acc + c.passed, 0)} Passed)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({c.passed} Passed)
                </option>
              ))}
            </select>
          </div>

          {/* Academy Filter */}
          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={academyFilter}
              onChange={(e) => setAcademyFilter(e.target.value)}
              placeholder="Filter by academy name..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            />
          </div>
        </div>

        <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 self-end md:self-auto bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <CheckCircle2 size={14} />
          <span>{passedAthletes.length} Passed Athletes Certified</span>
        </div>
      </div>

      {/* Passed Athletes Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Athlete Name</th>
                <th className="py-3 px-4">Academy / Club</th>
                <th className="py-3 px-4">Division & Category</th>
                <th className="py-3 px-4">Official Weight</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Loader2 size={24} className="animate-spin mx-auto text-[#0052FF] mb-2" />
                    <span>Loading certified passed roster...</span>
                  </td>
                </tr>
              ) : passedAthletes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-bold text-slate-700">No passed athletes yet</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Athletes will appear here once approved through the Weigh-In Console.
                    </p>
                  </td>
                </tr>
              ) : (
                passedAthletes.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {p.athleteName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {p.academyName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{p.division}</span>{" "}
                      <span className="text-slate-500">• {p.category} ({p.weightCategory})</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {formatWeight(p.currentWeight)} KG
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status="PASSED" size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

