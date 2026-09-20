"use client";

import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { UploadCloud, FileSpreadsheet, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BulkImportDropzoneProps {
  onFileParsed: (rows: any[], filename: string) => void;
  isLoading?: boolean;
}

export const BulkImportDropzone: React.FC<BulkImportDropzoneProps> = ({
  onFileParsed,
  isLoading = false,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate & Download Template
  const handleDownloadTemplate = (format: "xlsx" | "csv") => {
    const sampleData = [
      {
        "LOT Number": "101",
        "Athlete Name": "Rahul Kumar",
        "Academy Name": "ABC Taekwondo Academy",
        Gender: "MALE",
        Division: "Senior",
        "Age Group": "18+",
        Category: "Kyorugi",
        "Weight Category": "Under 54 KG",
        "Athlete ID": "TKD-IND-101",
      },
      {
        "LOT Number": "102",
        "Athlete Name": "Sneha Sharma",
        "Academy Name": "Lion Heart TKD",
        Gender: "FEMALE",
        Division: "Senior",
        "Age Group": "18+",
        Category: "Kyorugi",
        "Weight Category": "Under 46 KG",
        "Athlete ID": "TKD-IND-102",
      },
      {
        "LOT Number": "103",
        "Athlete Name": "Kabir Mehta",
        "Academy Name": "Dragon Strike Martial Arts",
        Gender: "MALE",
        Division: "Junior",
        "Age Group": "15-17",
        Category: "Kyorugi",
        "Weight Category": "Under 48 KG",
        "Athlete ID": "TKD-IND-103",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Participants");

    if (format === "xlsx") {
      XLSX.writeFile(wb, "TKD_WeighIn_Participant_Template.xlsx");
    } else {
      XLSX.writeFile(wb, "TKD_WeighIn_Participant_Template.csv", { bookType: "csv" });
    }
  };

  // Process File
  const processFile = (file: File) => {
    setParseError(null);

    const isCsv = file.name.endsWith(".csv");
    const isXlsx = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (!isCsv && !isXlsx) {
      setParseError("Unsupported file type. Please upload a .CSV or .XLSX file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (!rawRows || rawRows.length === 0) {
          setParseError("The uploaded worksheet is empty.");
          return;
        }

        onFileParsed(rawRows, file.name);
      } catch (err: any) {
        console.error("Failed to parse worksheet:", err);
        setParseError("Failed to parse file. Please verify file integrity and try again.");
      }
    };

    reader.onerror = () => {
      setParseError("Error reading the file.");
    };

    reader.readAsBinaryString(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Download Template Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-[#0052FF]" />
            Download Standard Import Template
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Includes canonical column headers: LOT Number, Athlete Name, Academy Name, Gender, Division, Age Group, Category, Weight Category.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDownloadTemplate("xlsx")}
            className="gap-1.5 font-bold"
          >
            <Download size={14} />
            <span>Excel (.xlsx)</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadTemplate("csv")}
            className="gap-1.5 font-bold"
          >
            <Download size={14} />
            <span>CSV (.csv)</span>
          </Button>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? "border-[#0052FF] bg-blue-50/60"
            : "border-slate-300 hover:border-slate-400 bg-white"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileChange}
          className="hidden"
        />

        <UploadCloud size={48} className="mx-auto text-[#0052FF] mb-3 opacity-90" />
        <h4 className="text-base font-bold text-slate-900">
          Drop your tournament roster spreadsheet here
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Supports <span className="font-semibold text-slate-700">.XLSX</span> and{" "}
          <span className="font-semibold text-slate-700">.CSV</span> files. Click to browse files on your computer.
        </p>

        {parseError && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold inline-flex items-center gap-2">
            <AlertCircle size={14} className="text-rose-600" />
            <span>{parseError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
