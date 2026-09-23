"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Participant } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatWeight } from "@/lib/utils";
import { Clock, Hourglass, Scale, Loader2, ArrowRight } from "lucide-react";

export default function PendingHoldPage() {
  const router = useRouter();
  const [athletes, setAthletes] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "HOLD" | "PENDING">("ALL");

  const loadUnresolved = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await fetch(`/api/participants?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const json = await res.json();
      if (json.success) {
        const unresolved = (json.data as Participant[]).filter(
          (p) => p.currentStatus === "PENDING" || p.currentStatus === "HOLD"
        );
        setAthletes(unresolved);
      }
    } catch (err) {
      console.error("Failed to load unresolved athletes:", err);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadUnresolved(true);
  }, [loadUnresolved]);

  // Real-time synchronization across multiple systems (every 4s + on focus)
  useEffect(() => {
    const interval = setInterval(() => {
      loadUnresolved(false);
    }, 4000);

    const onFocus = () => loadUnresolved(false);
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadUnresolved]);


  const filtered = athletes.filter((a) => {
    if (activeTab === "ALL") return true;
    return a.currentStatus === activeTab;
  });

  const holdCount = athletes.filter((a) => a.currentStatus === "HOLD").length;
  const pendingCount = athletes.filter((a) => a.currentStatus === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Clock size={22} className="text-amber-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Pending & Hold Queue
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Athletes awaiting official initial weigh-in call or currently in designated re-weigh grace period.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => router.push("/weigh-in")}
          className="gap-2 font-bold shadow-sm bg-[#0052FF] hover:bg-[#0045D8]"
        >
          <Scale size={16} />
          <span>Open Weigh-In Console</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "ALL"
              ? "bg-[#0052FF] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200"
          }`}
        >
          All Unresolved ({athletes.length})
        </button>

        <button
          onClick={() => setActiveTab("HOLD")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "HOLD"
              ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-sm"
              : "text-amber-700 bg-amber-50 hover:bg-amber-100"
          }`}
        >
          <Clock size={14} />
          <span>Active Hold ({holdCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("PENDING")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "PENDING"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-600 bg-slate-100 hover:bg-slate-200"
          }`}
        >
          <Hourglass size={14} />
          <span>Awaiting Weigh-In ({pendingCount})</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Athlete Name</th>
                <th className="py-3 px-4">Academy / Club</th>
                <th className="py-3 px-4">Division & Category</th>
                <th className="py-3 px-4">Latest Recorded</th>
                <th className="py-3 px-4">Attempts</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 size={24} className="animate-spin mx-auto text-amber-500 mb-2" />
                    <span>Loading queue...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-bold text-slate-700">Queue is clear</p>
                    <p className="text-xs text-slate-400 mt-1">
                      No athletes currently in this queue status.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isHold = p.currentStatus === "HOLD";

                  return (
                    <tr
                      key={p.id}
                      className={
                        isHold
                          ? "bg-amber-50/40 hover:bg-amber-50/70 transition-colors"
                          : "hover:bg-slate-50 transition-colors"
                      }
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={p.currentStatus} size="sm" />
                      </td>
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
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {p.currentWeight ? `${formatWeight(p.currentWeight)} KG` : "Pending Call"}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {p.attempts?.length || 0}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Button
                          variant={isHold ? "warning" : "primary"}
                          size="sm"
                          onClick={() => router.push(`/weigh-in?lot=${encodeURIComponent(p.lotNumber)}`)}
                          className={`gap-1.5 text-xs py-1 font-bold ${
                            !isHold ? "bg-[#0052FF] hover:bg-[#0045D8]" : ""
                          }`}
                        >
                          <span>Weigh-In</span>
                          <ArrowRight size={12} />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

