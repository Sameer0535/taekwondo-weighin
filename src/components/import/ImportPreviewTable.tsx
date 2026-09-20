"use client";

import React from "react";
import { ImportSummary } from "@/types";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, AlertTriangle, XCircle, ArrowLeft, Check } from "lucide-react";

interface ImportPreviewTableProps {
  summary: ImportSummary;
  filename: string;
  onConfirm: () => void;
  onCancel: () => void;
  isImporting?: boolean;
}

export const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({
  summary,
  filename,
  onConfirm,
  onCancel,
  isImporting = false,
}) => {
  const hasErrors = summary.errorCount > 0;
  const canImport = summary.validCount > 0;

  return (
    <div className="space-y-6">
      {/* File & Validation Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Total Rows */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">File</p>
          <p className="text-sm font-bold text-slate-900 truncate mt-1" title={filename}>
            {filename}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{summary.totalRows} Total Rows</p>
        </div>

        {/* Valid Rows */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Valid Rows</p>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black font-mono text-emerald-700 mt-1">
            {summary.validCount}
          </p>
          <p className="text-xs text-emerald-600 mt-0.5">Ready to ingest</p>
        </div>

        {/* Error Rows */}
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Error Rows</p>
            <XCircle size={16} className="text-rose-600" />
          </div>
          <p className="text-2xl font-black font-mono text-rose-700 mt-1">
            {summary.errorCount}
          </p>
          <p className="text-xs text-rose-600 mt-0.5">Flagged for issues</p>
        </div>

        {/* Action Confirmation Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-center gap-2">
          <Button
            variant="success"
            size="md"
            onClick={onConfirm}
            disabled={!canImport || isImporting}
            isLoading={isImporting}
            className="w-full gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Check size={16} />
            <span>Confirm Import ({summary.validCount})</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isImporting}
            className="w-full gap-1 text-xs text-slate-600"
          >
            <ArrowLeft size={14} />
            <span>Cancel & Upload New File</span>
          </Button>
        </div>
      </div>

      {/* Duplicate LOT Alert Banners */}
      {summary.duplicateLotsInFile.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Duplicate LOT Numbers in File: </span>
            <span>
              The following LOT numbers appear multiple times in this file:{" "}
              <strong className="font-mono">{summary.duplicateLotsInFile.join(", ")}</strong>.
              All matching rows are marked invalid per RULE-022.
            </span>
          </div>
        </div>
      )}

      {summary.duplicateLotsInDb.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <XCircle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Database Collision Detected: </span>
            <span>
              The following LOT numbers already exist in the tournament database:{" "}
              <strong className="font-mono">{summary.duplicateLotsInDb.join(", ")}</strong>.
              These rows are blocked per RULE-002 & RULE-023.
            </span>
          </div>
        </div>
      )}

      {/* Interactive Preview Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Row-by-Row Pre-Import Validation
          </h3>
          <span className="text-xs text-slate-500">
            {hasErrors ? "Errors are highlighted in red below" : "All rows verified successfully"}
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600 z-10">
              <tr>
                <th className="py-2.5 px-4 w-16">Row</th>
                <th className="py-2.5 px-4 w-28">Status</th>
                <th className="py-2.5 px-4">LOT</th>
                <th className="py-2.5 px-4">Athlete Name</th>
                <th className="py-2.5 px-4">Academy</th>
                <th className="py-2.5 px-4">Division & Category</th>
                <th className="py-2.5 px-4">Weight Category</th>
                <th className="py-2.5 px-4">Validation Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {summary.rows.map((row) => (
                <tr
                  key={row.rowNumber}
                  className={
                    row.isValid
                      ? "hover:bg-slate-50 transition-colors"
                      : "bg-rose-50/60 hover:bg-rose-50 transition-colors"
                  }
                >
                  <td className="py-2.5 px-4 font-mono text-slate-500">{row.rowNumber}</td>

                  {/* Status Indicator */}
                  <td className="py-2.5 px-4">
                    {row.isValid ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 size={10} /> Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <XCircle size={10} /> Error
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-4 font-mono font-bold text-[#0052FF]">
                    {row.lotNumber || "--"}
                  </td>

                  <td className="py-2.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {row.athleteName || "--"}
                  </td>

                  <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                    {row.academyName || "--"}
                  </td>

                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <span className="text-slate-800 font-semibold">{row.division}</span>{" "}
                    <span className="text-slate-500">({row.gender})</span>
                  </td>

                  <td className="py-2.5 px-4 text-slate-700 whitespace-nowrap">
                    {row.weightCategory || "--"}
                  </td>

                  {/* Validation Error Notes */}
                  <td className="py-2.5 px-4">
                    {row.isValid ? (
                      <span className="text-emerald-600 font-mono text-[11px] font-bold">Ready</span>
                    ) : (
                      <div className="text-rose-600 text-[11px] font-medium space-y-0.5">
                        {row.errors.map((err, i) => (
                          <div key={i}>• {err}</div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
