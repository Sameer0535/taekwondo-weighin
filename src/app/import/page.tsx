"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BulkImportDropzone } from "@/components/import/BulkImportDropzone";
import { ImportPreviewTable } from "@/components/import/ImportPreviewTable";
import { ImportSummary } from "@/types";
import { FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ImportPage() {
  const router = useRouter();
  const [parsedRows, setParsedRows] = useState<any[] | null>(null);
  const [currentFilename, setCurrentFilename] = useState<string>("");
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  // When file is selected & parsed by SheetJS
  const handleFileParsed = async (rows: any[], filename: string) => {
    setParsedRows(rows);
    setCurrentFilename(filename);
    setIsValidating(true);
    setSuccessCount(null);

    try {
      // Trigger pre-import preview validation
      const res = await fetch("/api/participants/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows, confirm: false }),
      });

      const json = await res.json();
      if (json.summary) {
        setSummary(json.summary);
      }
    } catch (err) {
      console.error("Validation request failed:", err);
      alert("Failed to communicate with import validation service.");
    } finally {
      setIsValidating(false);
    }
  };

  // When user confirms import of valid rows
  const handleConfirmImport = async () => {
    if (!parsedRows) return;
    setIsImporting(true);

    try {
      const res = await fetch("/api/participants/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: parsedRows,
          confirm: true,
          allowPartial: true,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessCount(json.importedCount);
        setSummary(null);
        setParsedRows(null);
      } else {
        alert(json.error || "Failed to complete batch import.");
      }
    } catch (err) {
      console.error("Import error:", err);
      alert("Failed to execute batch insertion.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    setParsedRows(null);
    setSummary(null);
    setCurrentFilename("");
    setSuccessCount(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={22} className="text-[#0052FF]" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Bulk Participant Import
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fast onboarding from tournament CSV and Excel files with automated duplicate checking.
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {successCount !== null && (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm text-center space-y-3 animate-in fade-in">
          <CheckCircle2 size={42} className="mx-auto text-emerald-600" />
          <h3 className="text-lg font-bold text-slate-900">Import Successfully Completed!</h3>
          <p className="text-sm text-slate-700 max-w-md mx-auto">
            Successfully imported <strong className="text-emerald-700">{successCount}</strong> athletes into the tournament database. All participants start in <span className="font-mono font-bold">PENDING</span> status per RULE-001.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSuccessCount(null);
                handleCancel();
              }}
            >
              Import Another File
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/participants")}
            >
              View Participants Roster
            </Button>
          </div>
        </div>
      )}

      {/* Upload Dropzone or Interactive Validation Preview */}
      {!summary && successCount === null && (
        <BulkImportDropzone
          onFileParsed={handleFileParsed}
          isLoading={isValidating}
        />
      )}

      {summary && (
        <ImportPreviewTable
          summary={summary}
          filename={currentFilename}
          onConfirm={handleConfirmImport}
          onCancel={handleCancel}
          isImporting={isImporting}
        />
      )}
    </div>
  );
}
