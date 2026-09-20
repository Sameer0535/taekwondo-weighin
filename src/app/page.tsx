"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckCircle2,
  Hourglass,
  Clock,
  XCircle,
  Trophy,
  Scale,
  Printer,
  UserPlus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={36} className="animate-spin text-[#0052FF]" />
        <p className="text-sm font-semibold text-slate-500">Aggregating tournament metrics...</p>
      </div>
    );
  }

  const totals = stats?.totals || {
    total: 0,
    passed: 0,
    pending: 0,
    hold: 0,
    rejected: 0,
    completionPercentage: 0,
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Tournament Status & Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-widest text-[#0052FF] uppercase">
              Official Weigh-In System • Kyorix
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tournament Weigh-In Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Live official weight verification, 4-division segregation (Sub-Junior, Cadet, Junior, Senior), strict status state machine, and certified passed roster generation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => router.push("/participants")}
            className="gap-2 font-bold shadow-sm bg-[#0052FF] hover:bg-[#0045D8]"
          >
            <UserPlus size={18} />
            <span>Add Competitor</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => router.push("/weigh-in")}
            className="gap-2 font-bold border-slate-200 text-slate-800 hover:bg-slate-50"
          >
            <Scale size={18} className="text-[#0052FF]" />
            <span>Weigh-In Console</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => router.push("/print")}
            className="gap-2 font-bold border-slate-200 text-slate-800 hover:bg-slate-50"
          >
            <Printer size={16} />
            <span>Print Passed</span>
          </Button>
        </div>
      </div>

      {/* Main KPI Status Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Athletes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-black uppercase tracking-wider">Total Athletes</span>
            <Users size={18} className="text-[#0052FF]" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black font-mono text-slate-900">{totals.total}</p>
            <p className="text-[11px] text-slate-500 mt-1">Across all categories</p>
          </div>
        </div>

        {/* Passed */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-black uppercase tracking-wider">Passed</span>
            <CheckCircle2 size={18} />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black font-mono text-emerald-700">{totals.passed}</p>
            <p className="text-[11px] text-emerald-600 mt-1">Certified for fixtures</p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-black uppercase tracking-wider">Pending</span>
            <Hourglass size={18} />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black font-mono text-slate-800">{totals.pending}</p>
            <p className="text-[11px] text-slate-500 mt-1">Awaiting initial call</p>
          </div>
        </div>

        {/* Hold */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-black uppercase tracking-wider">Hold</span>
            <Clock size={18} />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black font-mono text-amber-700">{totals.hold}</p>
            <p className="text-[11px] text-amber-600 mt-1">Grace period active</p>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-black uppercase tracking-wider">Rejected</span>
            <XCircle size={18} />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black font-mono text-rose-700">{totals.rejected}</p>
            <p className="text-[11px] text-rose-600 mt-1">Disqualified / Forfeit</p>
          </div>
        </div>
      </div>

      {/* Weigh-In Overall Completion Rate Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            <span className="text-sm font-black uppercase tracking-wider text-slate-900">
              Overall Tournament Weigh-In Completion
            </span>
          </div>
          <span className="text-xl font-black font-mono text-emerald-600">
            {totals.completionPercentage}%
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0052FF] via-blue-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, totals.completionPercentage))}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
          <span>{totals.passed + totals.rejected} of {totals.total} Athletes Resolved</span>
          <span>{totals.pending + totals.hold} Athletes In Queue</span>
        </div>
      </div>
    </div>
  );
}

