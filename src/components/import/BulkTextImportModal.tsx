"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DIVISIONS, getWeightCategories } from "@/lib/divisions";

interface BulkTextImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkTextImportModal: React.FC<BulkTextImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [divisionId, setDivisionId] = useState("senior");
  const [weightDivision, setWeightDivision] = useState("");
  const [competitorText, setCompetitorText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableWeights = getWeightCategories(divisionId, gender);

  useEffect(() => {
    if (availableWeights && availableWeights.length > 0) {
      setWeightDivision(availableWeights[0].label);
    }
  }, [divisionId, gender]);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const lines = competitorText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setErrorMsg("Please enter at least one competitor in the list.");
      return;
    }

    const activeDiv = DIVISIONS.find((d) => d.id === divisionId) || DIVISIONS[3];

    // Parse each line
    const rows = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(",").map((p) => p.trim());
      const athleteName = parts[0] || "";
      const academyName = parts[1] || "Independent";

      if (athleteName.length < 2) {
        setErrorMsg(`Line ${i + 1}: Name '${athleteName}' is too short.`);
        return;
      }

      rows.push({
        athleteName,
        academyName,
        gender,
        division: activeDiv.name,
        ageGroup: activeDiv.ageGroup,
        category: "Kyorugi",
        weightCategory: weightDivision,
      });
    }

    setLoading(true);
    try {
      const res = await fetch("/api/participants/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows,
          confirm: true,
          allowPartial: true,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to import competitor list.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process bulk import.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Competitor Import"
      description="Select division and paste competitor list (Name, Academy - one per line)."
      maxWidth="2xl"
    >
      <form onSubmit={handleImport} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Top Selectors matching Image 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as "MALE" | "FEMALE")}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF] cursor-pointer"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          {/* Division */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Division
            </label>
            <select
              value={divisionId}
              onChange={(e) => setDivisionId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF] cursor-pointer"
            >
              {DIVISIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Weight Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Weight Category
            </label>
            <select
              value={weightDivision}
              onChange={(e) => setWeightDivision(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF] cursor-pointer"
            >
              {availableWeights.map((w) => (
                <option key={w.label} value={w.label}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Textarea matching Image 2 */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Competitor List (Format: Name, Academy - one per line)
          </label>
          <textarea
            rows={6}
            required
            value={competitorText}
            onChange={(e) => setCompetitorText(e.target.value)}
            placeholder="Rahul Kumar, ABC Academy&#10;Lee Dae-hoon, Seoul TKD"
            className="w-full font-mono bg-white border border-slate-300 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition-all leading-relaxed"
          />
        </div>

        {/* Action Buttons matching Image 2 */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            className="px-6 h-10 font-bold bg-[#0052FF] hover:bg-[#0045D8]"
          >
            Import List
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={loading}
            className="px-5 h-10 font-bold text-slate-700 border-slate-200"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
