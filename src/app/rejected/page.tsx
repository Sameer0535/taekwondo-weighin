"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Participant } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatWeight } from "@/lib/utils";
import { XCircle, RotateCcw, CheckCircle2, Clock, Loader2, AlertTriangle } from "lucide-react";

export default function RejectedAthletesPage() {
  const [rejectedAthletes, setRejectedAthletes] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Participant | null>(null);
  const [recoveryWeight, setRecoveryWeight] = useState("");
  const [recoveryNotes, setRecoveryNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadRejected = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/participants?status=REJECTED");
      const json = await res.json();
      if (json.success) {
        setRejectedAthletes(json.data);
      }
    } catch (err) {
      console.error("Failed to load rejected athletes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRejected();
  }, [loadRejected]);

  const handleOpenRecovery = (athlete: Participant) => {
    setSelectedAthlete(athlete);
    setRecoveryWeight(athlete.currentWeight ? athlete.currentWeight.toFixed(2) : "");
    setRecoveryNotes("");
    setErrorMsg(null);
    setRecoveryModalOpen(true);
  };

  const handleExecuteRecovery = async (targetStatus: "PASSED" | "HOLD") => {
    if (!selectedAthlete) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    const weightNum = parseFloat(recoveryWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setErrorMsg("Valid official weight is mandatory for recovery.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/weigh-in/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: selectedAthlete.id,
          weight: weightNum,
          status: targetStatus,
          notes: `SUPERVISOR RECOVERY: ${recoveryNotes || "Administrative reinstatement"}`,
          operatorId: "SUPERVISOR",
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to execute recovery.");
      }

      setRecoveryModalOpen(false);
      await loadRejected();
    } catch (err: any) {
      setErrorMsg(err.message || "Recovery submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <XCircle size={22} className="text-rose-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Rejected / Disqualified Athletes
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Athletes who failed to meet category weight specifications or forfeited weigh-in.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
          {rejectedAthletes.length} Disqualified
        </span>
      </div>

      {/* Notice Card on RULE-011 */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-3 shadow-sm">
        <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900">Rule Enforcement (RULE-011): </span>
          Athletes in REJECTED status can strictly transition only to <strong>PASS</strong> or <strong>HOLD</strong> upon successful supervisor appeal or official weigh-in review. <em>The REJECT button is intentionally suppressed to prevent redundant disqualifications.</em>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Athlete Name</th>
                <th className="py-3 px-4">Academy / Club</th>
                <th className="py-3 px-4">Division & Category</th>
                <th className="py-3 px-4">Disqualification Weight</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Recovery Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Loader2 size={24} className="animate-spin mx-auto text-rose-500 mb-2" />
                    <span>Loading rejected athletes...</span>
                  </td>
                </tr>
              ) : rejectedAthletes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-bold text-slate-700">No rejected athletes</p>
                    <p className="text-xs text-slate-400 mt-1">
                      No athletes are currently disqualified in this tournament.
                    </p>
                  </td>
                </tr>
              ) : (
                rejectedAthletes.map((p) => (
                  <tr key={p.id} className="bg-rose-50/20 hover:bg-rose-50/50 transition-colors">
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
                    <td className="py-3 px-4 font-mono font-bold text-rose-600 whitespace-nowrap">
                      {p.currentWeight ? `${formatWeight(p.currentWeight)} KG` : "--.--"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status="REJECTED" size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenRecovery(p)}
                        className="gap-1 text-xs py-1 font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        <RotateCcw size={13} />
                        <span>Supervisor Review</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recovery Modal (RULE-011: Strictly only PASS or HOLD) */}
      <Modal
        isOpen={recoveryModalOpen}
        onClose={() => setRecoveryModalOpen(false)}
        title="Supervisor Appeal / Status Recovery"
        description="Official review of disqualified athlete. Per RULE-011, only PASS or HOLD are permitted."
        maxWidth="md"
      >
        {selectedAthlete && (
          <div className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-mono text-[#0052FF] font-bold">
                {selectedAthlete.division} • {selectedAthlete.weightCategory}
              </p>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                {selectedAthlete.athleteName}
              </h4>
              <p className="text-xs text-slate-500">{selectedAthlete.academyName}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Re-Weigh Weight (KG) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={recoveryWeight}
                onChange={(e) => setRecoveryWeight(e.target.value)}
                placeholder="e.g. 53.80"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Appeal Justification / Decision Notes
              </label>
              <textarea
                rows={2}
                value={recoveryNotes}
                onChange={(e) => setRecoveryNotes(e.target.value)}
                placeholder="e.g. Appeal granted by competition jury; athlete made weight on primary calibration scale."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
              />
            </div>

            {/* Strict Recovery Actions (RULE-011: PASS or HOLD only) */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Button
                variant="success"
                size="md"
                isLoading={isSubmitting}
                onClick={() => handleExecuteRecovery("PASSED")}
                className="w-full gap-2 font-bold shadow-sm"
              >
                <CheckCircle2 size={16} />
                <span>Recover & Mark PASSED</span>
              </Button>

              <Button
                variant="warning"
                size="md"
                isLoading={isSubmitting}
                onClick={() => handleExecuteRecovery("HOLD")}
                className="w-full gap-2 font-bold shadow-sm"
              >
                <Clock size={16} />
                <span>Reinstate to HOLD (Grant Extension)</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

