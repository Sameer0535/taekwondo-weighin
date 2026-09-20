"use client";

import React, { useState, useMemo } from "react";
import { CategorySummary } from "@/types";
import { ChevronDown, Trophy, Filter } from "lucide-react";

interface CategoryHeaderProps {
  category: CategorySummary | null;
  categories: CategorySummary[];
  onSelectCategory: (categoryId: string) => void;
}

const DIVISION_TABS = [
  { id: "ALL", label: "All Divisions" },
  { id: "Sub-Junior", label: "Sub-Junior" },
  { id: "Cadet", label: "Cadet" },
  { id: "Junior", label: "Junior" },
  { id: "Senior", label: "Senior" },
];

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  category,
  categories,
  onSelectCategory,
}) => {
  const [selectedDivisionTab, setSelectedDivisionTab] = useState<string>("ALL");
  const [genderFilter, setGenderFilter] = useState<string>("ALL");

  // Filter categories based on selected division tab and gender
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchDivision =
        selectedDivisionTab === "ALL" ||
        c.division.toLowerCase() === selectedDivisionTab.toLowerCase();
      const matchGender =
        genderFilter === "ALL" || c.gender.toUpperCase() === genderFilter.toUpperCase();
      return matchDivision && matchGender;
    });
  }, [categories, selectedDivisionTab, genderFilter]);

  if (!category) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-500">
          No categories found. Please add competitors to create tournament categories.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Division Tabs & Quick Gender Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        {/* Division Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {DIVISION_TABS.map((tab) => {
            const isActive = selectedDivisionTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedDivisionTab(tab.id);
                  // If current active category doesn't match new division, auto-select first matching category
                  if (tab.id !== "ALL") {
                    const firstMatch = categories.find(
                      (c) =>
                        c.division.toLowerCase() === tab.id.toLowerCase() &&
                        (genderFilter === "ALL" || c.gender.toUpperCase() === genderFilter)
                    );
                    if (firstMatch) {
                      onSelectCategory(firstMatch.id);
                    }
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#0052FF] text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Gender Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {(["ALL", "MALE", "FEMALE"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => {
                setGenderFilter(g);
                if (g !== "ALL") {
                  const match = categories.find(
                    (c) =>
                      c.gender.toUpperCase() === g &&
                      (selectedDivisionTab === "ALL" ||
                        c.division.toLowerCase() === selectedDivisionTab.toLowerCase())
                  );
                  if (match) {
                    onSelectCategory(match.id);
                  }
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                genderFilter === g
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Category Title & Dynamic Weight Category Selector */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-blue-50 text-[#0052FF] border border-blue-200">
              {category.division} Division • {category.gender}
            </span>
          </div>

          <div className="relative inline-block w-full max-w-lg">
            <select
              value={category.id}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-300 hover:border-[#0052FF] rounded-xl px-4 py-2.5 pr-10 text-slate-900 font-black text-base sm:text-lg tracking-tight focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition-colors cursor-pointer truncate"
            >
              {(filteredCategories.length > 0 ? filteredCategories : categories).map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-slate-900 font-medium">
                  {c.label} ({c.passed}/{c.total} Passed)
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Real Status Tally Counters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-center min-w-[65px]">
            <p className="text-[10px] uppercase font-bold text-slate-500">Total</p>
            <p className="text-lg font-black font-mono text-slate-800">{category.total}</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-center min-w-[65px]">
            <p className="text-[10px] uppercase font-bold text-emerald-700">Passed</p>
            <p className="text-lg font-black font-mono text-emerald-700">{category.passed}</p>
          </div>

          <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-center min-w-[65px]">
            <p className="text-[10px] uppercase font-bold text-slate-600">Pending</p>
            <p className="text-lg font-black font-mono text-slate-700">{category.pending}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 text-center min-w-[65px]">
            <p className="text-[10px] uppercase font-bold text-amber-700">Hold</p>
            <p className="text-lg font-black font-mono text-amber-700">{category.hold}</p>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-1.5 text-center min-w-[65px]">
            <p className="text-[10px] uppercase font-bold text-rose-700">Rejected</p>
            <p className="text-lg font-black font-mono text-rose-700">{category.rejected}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs font-semibold mb-1">
          <span className="text-slate-600 flex items-center gap-1.5">
            <Trophy size={13} className="text-amber-500" />
            Division Completion
          </span>
          <span className="text-slate-900 font-mono font-bold">{category.completionRate}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, category.completionRate))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

