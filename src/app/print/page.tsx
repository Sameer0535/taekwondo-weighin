"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Participant } from "@/types";
import { Button } from "@/components/ui/Button";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import { parseCategoryId } from "@/lib/category-engine";

function PrintPassedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = searchParams.get("categoryId");

  const [passedAthletes, setPassedAthletes] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPassedData = useCallback(async () => {
    setLoading(true);
    try {
      const url = categoryId
        ? `/api/passed?categoryId=${encodeURIComponent(categoryId)}`
        : "/api/passed";

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        // RULE-018: Exclusively PASSED athletes
        const strictlyPassed = (json.data as Participant[]).filter(
          (a) => a.currentStatus === "PASSED"
        );
        setPassedAthletes(strictlyPassed);
      }
    } catch (err) {
      console.error("Failed to load passed data for printing:", err);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadPassedData();
  }, [loadPassedData]);

  const handleTriggerPrint = () => {
    window.print();
  };

  const parsedCat = categoryId ? parseCategoryId(categoryId) : null;

  return (
    <div className="space-y-6">
      {/* On-Screen Header (Class no-print ensures this is hidden in printed output) */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <Printer size={20} className="text-[#0052FF]" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {categoryId ? "Category Passed Print View" : "All Passed Print View"}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict A4 format conforming to RULE-018, RULE-019 &amp; RULE-020. Only Athlete Name and Academy Name are printed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="success"
            size="lg"
            onClick={handleTriggerPrint}
            disabled={loading || passedAthletes.length === 0}
            className="gap-2 font-bold px-6 shadow-sm"
          >
            <Printer size={18} />
            <span>Open Print Dialog (A4)</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 no-print">
          <Loader2 size={32} className="animate-spin mx-auto text-[#0052FF] mb-2" />
          <p className="text-sm font-semibold">Preparing certified passed roster...</p>
        </div>
      ) : passedAthletes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm no-print">
          <p className="text-base font-bold text-slate-800">No Passed Athletes Found</p>
          <p className="text-xs text-slate-500 mt-1">
            Only athletes with certified status PASSED are included in the print dataset.
          </p>
        </div>
      ) : (
        /* The Printed Container: strictly rendered with black text on white paper */
        <div className="print-document bg-white text-black p-8 sm:p-12 rounded-xl shadow-2xl max-w-[210mm] mx-auto min-h-[297mm]">
          {/* Official Document Header */}
          <div className="border-b-2 border-black pb-4 mb-6 text-center">
            <h2 className="text-xl font-black tracking-wider uppercase text-black">
              Official Weigh-In Roster — Passed Athletes
            </h2>
            {parsedCat ? (
              <p className="text-sm font-bold text-gray-800 uppercase mt-1">
                {parsedCat.division} {parsedCat.gender} • {parsedCat.category} ({parsedCat.weightCategory})
              </p>
            ) : (
              <p className="text-xs font-semibold text-gray-600 uppercase mt-1">
                All Certified Divisions
              </p>
            )}
            <p className="text-[11px] text-gray-500 mt-1 font-mono">
              Total Qualified Athletes: {passedAthletes.length}
            </p>
          </div>

          {/* 
            STRICT RULE-010 & RULE-019 ENFORCEMENT:
            The printed document must contain ONLY:
            1. Athlete Name
            2. Academy Name
            NO Weight, NO Status, NO LOT, NO Athlete ID, NO Controls!
          */}
          <table className="print-table w-full border-collapse border border-black text-left text-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-black">
                <th className="border border-black py-2.5 px-4 font-bold text-black uppercase tracking-wider w-1/2">
                  Athlete Name
                </th>
                <th className="border border-black py-2.5 px-4 font-bold text-black uppercase tracking-wider w-1/2">
                  Academy Name
                </th>
              </tr>
            </thead>
            <tbody>
              {passedAthletes.map((athlete) => (
                <tr key={athlete.id} className="border-b border-black">
                  <td className="border border-black py-2.5 px-4 font-bold text-black">
                    {athlete.athleteName}
                  </td>
                  <td className="border border-black py-2.5 px-4 text-gray-900 font-medium">
                    {athlete.academyName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Minimal Signoff Footer */}
          <div className="mt-12 pt-8 border-t border-gray-400 flex items-center justify-between text-xs text-gray-700">
            <div>
              <p className="font-bold text-black">Certified Official:</p>
              <p className="text-[11px] text-gray-500 mt-6">Signature / Stamp</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-black">Tournament Jury:</p>
              <p className="text-[11px] text-gray-500 mt-6">Signature / Stamp</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PrintPassedPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-gray-400">
          <Loader2 size={32} className="animate-spin mx-auto text-emerald-500 mb-2" />
          <p className="text-sm">Loading Print View...</p>
        </div>
      }
    >
      <PrintPassedContent />
    </Suspense>
  );
}
