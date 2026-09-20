"use client";

import React from "react";
import { Participant } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatWeight } from "@/lib/utils";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryQueueListProps {
  athletes: Participant[];
  selectedAthleteId?: string;
  onSelectAthlete: (athlete: Participant) => void;
}

export const CategoryQueueList: React.FC<CategoryQueueListProps> = ({
  athletes,
  selectedAthleteId,
  onSelectAthlete,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col h-full max-h-[480px]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[#0052FF]" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Category Queue
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-slate-500">
          {athletes.length} Competitors
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {athletes.map((athlete) => {
          const isSelected = athlete.id === selectedAthleteId;

          return (
            <div
              key={athlete.id}
              onClick={() => onSelectAthlete(athlete)}
              className={cn(
                "flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border text-left",
                isSelected
                  ? "bg-blue-50 border-blue-400 shadow-sm"
                  : "bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-xs font-bold truncate",
                      isSelected ? "text-blue-950" : "text-slate-900"
                    )}
                  >
                    {athlete.athleteName}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {athlete.academyName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {athlete.currentWeight ? (
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {formatWeight(athlete.currentWeight)}
                  </span>
                ) : null}
                <StatusBadge status={athlete.currentStatus} size="sm" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
