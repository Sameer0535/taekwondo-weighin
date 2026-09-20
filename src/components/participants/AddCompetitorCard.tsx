"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { DIVISIONS, getWeightCategories } from "@/lib/divisions";

interface AddCompetitorCardProps {
  onSuccess: () => void;
  onOpenBulkImport: () => void;
}

export const AddCompetitorCard: React.FC<AddCompetitorCardProps> = ({
  onSuccess,
  onOpenBulkImport,
}) => {
  const [fullName, setFullName] = useState("");
  const [clubAffiliation, setClubAffiliation] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [selectedDivisionId, setSelectedDivisionId] = useState("senior");
  const [weightDivision, setWeightDivision] = useState("");

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Compute available weight divisions based on Gender and Division
  const availableWeightDivisions = getWeightCategories(selectedDivisionId, gender);

  // Auto-select first weight division when gender or division changes
  useEffect(() => {
    if (availableWeightDivisions && availableWeightDivisions.length > 0) {
      setWeightDivision(availableWeightDivisions[0].label);
    }
  }, [selectedDivisionId, gender]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessToast(null);

    if (!fullName.trim()) {
      setErrorMessage("Please enter participant full name.");
      return;
    }
    if (!clubAffiliation.trim()) {
      setErrorMessage("Please enter club / academy affiliation.");
      return;
    }

    setLoading(true);
    try {
      const activeDiv = DIVISIONS.find((d) => d.id === selectedDivisionId) || DIVISIONS[3];

      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteName: fullName.trim(),
          academyName: clubAffiliation.trim(),
          country: "India (IND)",
          gender: gender,
          division: activeDiv.name,
          ageGroup: activeDiv.ageGroup,
          category: "Kyorugi",
          weightCategory: weightDivision,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to add competitor.");
      }

      setSuccessToast(`Competitor ${fullName} added successfully!`);
      setFullName("");
      setClubAffiliation("");
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save competitor.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSampleData = async () => {
    if (!confirm("Reset database with official sample competitor data? Current data will be replaced.")) {
      return;
    }
    setResetLoading(true);
    setErrorMessage(null);
    setSuccessToast(null);

    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_SAMPLE" }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessToast("Sample competitor roster restored!");
        onSuccess();
      }
    } catch (err) {
      setErrorMessage("Failed to reset sample data.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear ALL competitors? This action cannot be undone.")) {
      return;
    }
    setClearLoading(true);
    setErrorMessage(null);
    setSuccessToast(null);

    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CLEAR_ALL" }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessToast("All competitors cleared.");
        onSuccess();
      }
    } catch (err) {
      setErrorMessage("Failed to clear competitors.");
    } finally {
      setClearLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      {/* Title */}
      <div className="pb-4 border-b border-slate-100 mb-5">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Add Competitor</h2>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          {errorMessage}
        </div>
      )}

      {successToast && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          {successToast}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Participant Name"
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all"
          />
        </div>

        {/* Club / Affiliation */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Club / Affiliation
          </label>
          <input
            type="text"
            required
            value={clubAffiliation}
            onChange={(e) => setClubAffiliation(e.target.value)}
            placeholder="Academy Name"
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all"
          />
        </div>

        {/* Gender & Division */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as "MALE" | "FEMALE")}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all cursor-pointer"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Division
            </label>
            <select
              value={selectedDivisionId}
              onChange={(e) => setSelectedDivisionId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all cursor-pointer"
            >
              {DIVISIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Weight Category (Dynamic according to Division & Gender) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Weight Category
          </label>
          <select
            value={weightDivision}
            onChange={(e) => setWeightDivision(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all cursor-pointer"
          >
            {availableWeightDivisions.map((w) => (
              <option key={w.label} value={w.label}>
                {w.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons matching Image 1 */}
        <div className="pt-2 space-y-2.5">
          {/* Primary Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full font-black text-sm h-12 rounded-xl bg-[#0052FF] hover:bg-[#0045D8]"
          >
            Add Competitor
          </Button>

          {/* Bulk Import Button */}
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onOpenBulkImport}
            className="w-full font-bold text-xs h-10 rounded-xl text-slate-700 border-slate-200 hover:bg-slate-50"
          >
            Bulk Import (CSV/Paste)
          </Button>

          {/* Reset with Sample Data */}
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleResetSampleData}
            isLoading={resetLoading}
            className="w-full font-bold text-xs h-10 rounded-xl text-slate-700 border-slate-200 hover:bg-slate-50"
          >
            Reset with Sample Data
          </Button>

          {/* Clear All Competitors */}
          <Button
            type="button"
            variant="danger-outline"
            size="md"
            onClick={handleClearAll}
            isLoading={clearLoading}
            className="w-full font-bold text-xs h-10 rounded-xl"
          >
            Clear All Competitors
          </Button>
        </div>
      </form>
    </div>
  );
};
