"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Participant } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AddCompetitorCard } from "@/components/participants/AddCompetitorCard";
import { BulkTextImportModal } from "@/components/import/BulkTextImportModal";
import { formatWeight } from "@/lib/utils";
import {
  Users,
  Search,
  Scale,
  Trash2,
  Filter,
  Loader2,
} from "lucide-react";

export default function CompetitorsPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [divisionFilter, setDivisionFilter] = useState("ALL");
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (divisionFilter !== "ALL") params.set("division", divisionFilter);

      const res = await fetch(`/api/participants?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setParticipants(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch participants:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, divisionFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchParticipants();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchParticipants]);

  const handleDelete = async (p: Participant) => {
    if ((p.attempts?.length || 0) > 0) {
      alert("Cannot delete participant with existing weigh-in attempts. Tournament records must be preserved for audit.");
      return;
    }

    if (!confirm(`Are you sure you want to delete competitor '${p.athleteName}' (LOT ${p.lotNumber})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/participants/${p.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        alert(json.error || "Failed to delete competitor.");
      } else {
        fetchParticipants();
      }
    } catch (err) {
      alert("Error deleting competitor.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Users size={24} className="text-[#0052FF]" />
          Competitor Intake &amp; Roster Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Register individual athletes into Olympic weight classes, bulk import rosters, and monitor live status.
        </p>
      </div>

      {/* Main Split Layout: Form Card on Left, Live Roster on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Add Competitor Card (Matching Image 1) */}
        <div className="lg:col-span-5">
          <AddCompetitorCard
            onSuccess={fetchParticipants}
            onOpenBulkImport={() => setIsBulkModalOpen(true)}
          />
        </div>

        {/* Right: Live Competitor Table & Quick Search */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search competitors by Name, Academy..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <Filter size={13} className="text-slate-400" />
                {["ALL", "PENDING", "HOLD", "PASSED", "REJECTED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      statusFilter === st
                        ? "bg-[#0052FF] text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Division filter */}
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="ALL">All Divisions</option>
                <option value="Senior">Senior</option>
                <option value="Junior">Junior</option>
                <option value="Cadet">Cadet</option>
                <option value="Sub-Junior">Sub-Junior</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Registered Competitors ({participants.length})</span>
            </div>

            <div className="overflow-x-auto max-h-[580px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-400 z-10">
                  <tr>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Club / Affiliation</th>
                    <th className="py-2.5 px-3">Division &amp; Weight</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Loader2 size={24} className="animate-spin mx-auto text-[#0052FF] mb-2" />
                        <span>Loading competitors...</span>
                      </td>
                    </tr>
                  ) : participants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <p className="font-bold text-slate-600">No competitors registered</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Use the form on the left or click &quot;Reset with Sample Data&quot;.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    participants.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                          {p.athleteName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {p.academyName}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-bold text-slate-800">{p.division}</span>{" "}
                          <span className="text-slate-500 text-[11px]">({p.gender})</span>
                          <div className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">
                            {p.weightCategory}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <StatusBadge status={p.currentStatus} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1">
                          <button
                            title="Weigh-In Athlete"
                            onClick={() => router.push(`/weigh-in?lot=${encodeURIComponent(p.lotNumber)}`)}
                            className="p-1 rounded-lg bg-blue-50 text-[#0052FF] hover:bg-blue-100 border border-blue-200 transition-colors"
                          >
                            <Scale size={14} />
                          </button>
                          <button
                            title="Delete Competitor"
                            onClick={() => handleDelete(p)}
                            className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Competitor Import Modal (Matching Image 2) */}
      <BulkTextImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={fetchParticipants}
      />
    </div>
  );
}
