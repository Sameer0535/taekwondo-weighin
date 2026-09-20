"use client";

import React from "react";
import { WeighInAttempt } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatWeight, formatDateTime } from "@/lib/utils";
import { History, Calendar } from "lucide-react";

interface HistoryTimelineProps {
  attempts: WeighInAttempt[];
  athleteName: string;
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({
  attempts,
  athleteName,
}) => {
  if (!attempts || attempts.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
        <History size={30} className="mx-auto text-slate-400 mb-1.5 opacity-60" />
        <h4 className="text-xs font-bold text-slate-700">No Prior Attempts</h4>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Initial weigh-in attempt has not been recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <History size={16} className="text-[#0052FF]" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Weigh-In History
          </h3>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          {attempts.length} {attempts.length === 1 ? "Attempt" : "Attempts"}
        </span>
      </div>

      <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {attempts.map((att) => (
          <div key={att.id || att.attemptNumber} className="relative pl-8">
            <div className="absolute left-2 top-1.5 w-3.5 h-3.5 -translate-x-1/2 rounded-full border-2 border-white bg-[#0052FF] ring-2 ring-blue-100" />

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#0052FF] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Attempt #{att.attemptNumber}
                  </span>
                  <span className="text-base font-black font-mono text-slate-900">
                    {formatWeight(att.weight)} KG
                  </span>
                </div>
                <StatusBadge status={att.status} size="sm" />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" />
                  <span>{formatDateTime(att.weighedAt)}</span>
                </div>
                <span className="font-mono text-slate-500 font-medium">Operator: {att.operatorId || "OP-01"}</span>
              </div>

              {att.notes && (
                <p className="text-xs text-amber-800 italic mt-1.5 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  &ldquo;{att.notes}&rdquo;
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
