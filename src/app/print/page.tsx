"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Participant } from "@/types";
import { Button } from "@/components/ui/Button";
import {
  Printer,
  ArrowLeft,
  Loader2,
  Filter,
  Layers,
  Users,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { parseCategoryId } from "@/lib/category-engine";
import { DIVISIONS, getDivisionSortRank, getWeightSortRank } from "@/lib/divisions";
import * as XLSX from "xlsx";

interface CategoryGroup {
  key: string;
  division: string;
  gender: "MALE" | "FEMALE";
  category: string;
  weightCategory: string;
  divisionRank: number;
  weightRank: number;
  athletes: Participant[];
}

function PrintPassedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = searchParams.get("categoryId");

  const [passedAthletes, setPassedAthletes] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for interactive on-screen view
  const [selectedDivision, setSelectedDivision] = useState<string>("ALL");
  const [selectedGender, setSelectedGender] = useState<string>("ALL");

  const loadPassedData = useCallback(async () => {
    setLoading(true);
    try {
      const url = categoryId
        ? `/api/passed?categoryId=${encodeURIComponent(categoryId)}&_t=${Date.now()}`
        : `/api/passed?_t=${Date.now()}`;

      const res = await fetch(url, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const json = await res.json();
      if (json.success) {
        // Exclusively PASSED athletes
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

  // If initial categoryId was supplied in URL, set defaults
  useEffect(() => {
    if (categoryId) {
      const parsed = parseCategoryId(categoryId);
      if (parsed.division) setSelectedDivision(parsed.division);
      if (parsed.gender) setSelectedGender(parsed.gender);
    }
  }, [categoryId]);

  // Group and sort weight-wise
  const sortedAndGroupedCategories = useMemo(() => {
    const groupMap = new Map<string, CategoryGroup>();

    // 1. Group athletes by Division + Gender + Weight Category
    passedAthletes.forEach((athlete) => {
      const divName = athlete.division || "Senior";
      const gender = (athlete.gender?.toUpperCase() === "FEMALE" ? "FEMALE" : "MALE") as "MALE" | "FEMALE";
      const weight = athlete.weightCategory || "Open Weight";
      const cat = athlete.category || "Kyorugi";

      const key = `${divName}__${gender}__${weight}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          key,
          division: divName,
          gender,
          category: cat,
          weightCategory: weight,
          divisionRank: getDivisionSortRank(divName),
          weightRank: getWeightSortRank(divName, gender, weight),
          athletes: [],
        });
      }

      groupMap.get(key)!.athletes.push(athlete);
    });

    // 2. Sort groups weight-wise in official Olympic tournament sequence
    const groups = Array.from(groupMap.values());
    groups.sort((a, b) => {
      if (a.divisionRank !== b.divisionRank) {
        return a.divisionRank - b.divisionRank;
      }
      if (a.gender !== b.gender) {
        return a.gender === "MALE" ? -1 : 1;
      }
      if (a.weightRank !== b.weightRank) {
        return a.weightRank - b.weightRank;
      }
      return a.weightCategory.localeCompare(b.weightCategory);
    });

    // 3. Sort athletes alphabetically inside each weight category
    groups.forEach((g) => {
      g.athletes.sort((a, b) => a.athleteName.localeCompare(b.athleteName));
    });

    return groups;
  }, [passedAthletes]);

  // Filter groups according to on-screen selection
  const filteredGroups = useMemo(() => {
    return sortedAndGroupedCategories.filter((group) => {
      if (
        selectedDivision !== "ALL" &&
        group.division.toLowerCase() !== selectedDivision.toLowerCase()
      ) {
        return false;
      }
      if (selectedGender !== "ALL" && group.gender !== selectedGender) {
        return false;
      }
      return true;
    });
  }, [sortedAndGroupedCategories, selectedDivision, selectedGender]);

  const totalFilteredAthletes = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.athletes.length, 0);
  }, [filteredGroups]);

  const handleTriggerPrint = () => {
    window.print();
  };

  // Export to Excel (.xlsx)
  const handleDownloadExcel = () => {
    const wb = XLSX.utils.book_new();
    const sheetData: (string | number)[][] = [
      ["OFFICIAL WEIGH-IN ROSTER — PASSED ATHLETES"],
      ["Certified for Official Draw, Pools & Tournament Fixtures"],
      [`Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`],
      [], // blank line
    ];

    filteredGroups.forEach((group) => {
      // Category Header row
      sheetData.push([
        `DIVISION: ${group.division.toUpperCase()} | GENDER: ${group.gender} | WEIGHT CATEGORY: ${group.weightCategory.toUpperCase()}`,
        `(${group.athletes.length} Athletes)`
      ]);
      // Table Header row (Strictly Athlete Name and Academy Name)
      sheetData.push(["Athlete Name", "Academy / Club Name"]);
      // Athlete rows
      group.athletes.forEach((athlete) => {
        sheetData.push([athlete.athleteName, athlete.academyName]);
      });
      // Blank spacing row between categories
      sheetData.push([]);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws["!cols"] = [{ wch: 38 }, { wch: 45 }];
    XLSX.utils.book_append_sheet(wb, ws, "Passed Roster");

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Taekwondo_Passed_Roster_${dateStr}.xlsx`);
  };

  // Export to Microsoft Word (.doc)
  const handleDownloadWord = () => {
    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    let html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Official Weigh-In Roster</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #000; margin: 20mm; }
          h1 { text-align: center; text-transform: uppercase; font-size: 16pt; margin: 0 0 4px 0; }
          .sub { text-align: center; font-size: 9.5pt; color: #444; margin-bottom: 22px; font-weight: bold; }
          .category-header { background-color: #E2E8F0; border: 2px solid #000; padding: 6px 12px; font-weight: bold; font-size: 11pt; margin-top: 20px; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th, td { border: 1px solid #000; padding: 7px 12px; text-align: left; }
          th { background-color: #F1F5F9; font-weight: bold; font-size: 10.5pt; text-transform: uppercase; }
          td { font-size: 10.5pt; }
          .athlete-name { font-weight: bold; }
          .sign-off { margin-top: 40px; border-top: 1px solid #000; padding-top: 12px; width: 100%; }
        </style>
      </head>
      <body>
        <h1>Official Weigh-In Roster &mdash; Passed Athletes</h1>
        <div class="sub">Certified for Official Draw, Pools &amp; Tournament Fixtures &bull; Date: ${dateStr}</div>
    `;

    filteredGroups.forEach((group) => {
      html += `
        <div class="category-header">
          DIVISION: ${group.division.toUpperCase()} &bull; GENDER: ${group.gender} &bull; WEIGHT CATEGORY: ${group.weightCategory.toUpperCase()} &nbsp;(${group.athletes.length} Athletes)
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 50%;">Athlete Name</th>
              <th style="width: 50%;">Academy / Club Name</th>
            </tr>
          </thead>
          <tbody>
      `;

      group.athletes.forEach((athlete) => {
        html += `
          <tr>
            <td class="athlete-name">${athlete.athleteName}</td>
            <td>${athlete.academyName}</td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
      `;
    });

    html += `
        <table class="sign-off" style="border: none; margin-top: 30px;">
          <tr style="border: none;">
            <td style="border: none; width: 50%; padding-top: 30px;">
              <strong>Official Weigh-In Marshal:</strong><br><br>
              _______________________________<br>
              Signature / Stamp
            </td>
            <td style="border: none; width: 50%; text-align: right; padding-top: 30px;">
              <strong>Tournament Jury / Director:</strong><br><br>
              _______________________________<br>
              Signature / Stamp
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Taekwondo_Passed_Roster_${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* On-Screen Header & Controls (Hidden during print) */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <Printer size={22} className="text-[#0052FF]" />
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Official Passed Athletes Roster
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Weight-wise certified roster. Download in Word or Excel format, or print directly.
            </p>
          </div>

          {/* Export & Print Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Download Excel */}
            <Button
              variant="outline"
              size="md"
              onClick={handleDownloadExcel}
              disabled={loading || totalFilteredAthletes === 0}
              className="gap-2 font-bold px-4 border-emerald-600 text-emerald-700 hover:bg-emerald-50 bg-white"
            >
              <FileSpreadsheet size={16} className="text-emerald-600" />
              <span>Download Excel</span>
            </Button>

            {/* Download Word */}
            <Button
              variant="outline"
              size="md"
              onClick={handleDownloadWord}
              disabled={loading || totalFilteredAthletes === 0}
              className="gap-2 font-bold px-4 border-blue-600 text-blue-700 hover:bg-blue-50 bg-white"
            >
              <FileText size={16} className="text-blue-600" />
              <span>Download Word</span>
            </Button>

            {/* Print */}
            <Button
              variant="primary"
              size="md"
              onClick={handleTriggerPrint}
              disabled={loading || totalFilteredAthletes === 0}
              className="gap-2 font-bold px-5 bg-slate-900 hover:bg-black text-white"
            >
              <Printer size={16} />
              <span>Print Sheet</span>
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <span className="font-bold text-slate-700">Filter By:</span>
          </div>

          {/* Division Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Division:</span>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            >
              <option value="ALL">All Divisions</option>
              {DIVISIONS.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Gender:</span>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          {/* Metrics summary */}
          <div className="ml-auto flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-[#0052FF] font-bold text-[11px] border border-blue-100">
              <Users size={12} />
              {totalFilteredAthletes} {totalFilteredAthletes === 1 ? "Athlete" : "Athletes"}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200">
              <Layers size={12} />
              {filteredGroups.length} {filteredGroups.length === 1 ? "Weight Class" : "Weight Classes"}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 no-print">
          <Loader2 size={32} className="animate-spin mx-auto text-[#0052FF] mb-2" />
          <p className="text-sm font-semibold">Organizing certified passed athletes weight-wise...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm no-print">
          <p className="text-base font-bold text-slate-800">No Passed Athletes in Selected Filter</p>
          <p className="text-xs text-slate-500 mt-1">
            Ensure athletes have completed weigh-in and received certified PASSED status.
          </p>
        </div>
      ) : (
        /* The Printed A4 Document Container */
        <div className="print-document bg-white text-black p-8 sm:p-12 rounded-xl shadow-2xl max-w-[210mm] mx-auto min-h-[297mm]">
          {/* Official Document Header */}
          <div className="border-b-2 border-black pb-4 mb-6 text-center">
            <h2 className="text-2xl font-black tracking-wider uppercase text-black">
              Official Weigh-In Roster — Passed Athletes
            </h2>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mt-1">
              Certified for Official Draw, Pools &amp; Tournament Fixtures
            </p>
            <div className="flex items-center justify-center gap-4 text-[11px] text-gray-600 mt-2 font-mono">
              <span>Total Qualified: {totalFilteredAthletes} Athletes</span>
              <span>•</span>
              <span>Weight Classes: {filteredGroups.length}</span>
              <span>•</span>
              <span>Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
            </div>
          </div>

          {/* Grouped Weight-Wise Categories with Athlete Details Below */}
          <div className="space-y-6">
            {filteredGroups.map((group) => (
              <div key={group.key} className="category-print-group">
                {/* Category Header: Division & Weight Category */}
                <div className="bg-gray-100 border-2 border-black px-3.5 py-2 mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="font-extrabold uppercase text-xs sm:text-sm tracking-wide text-black">
                      DIVISION: <span className="font-black text-black">{group.division}</span>
                    </span>
                    <span className="text-gray-400 font-bold">•</span>
                    <span className="font-extrabold uppercase text-xs sm:text-sm tracking-wide text-black">
                      GENDER: <span className="font-black text-black">{group.gender}</span>
                    </span>
                    <span className="text-gray-400 font-bold">•</span>
                    <span className="font-black uppercase text-xs sm:text-sm tracking-wider text-black bg-white px-2 py-0.5 border border-black rounded shadow-sm">
                      WEIGHT CATEGORY: {group.weightCategory}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 font-mono flex-shrink-0">
                    {group.athletes.length} {group.athletes.length === 1 ? "Athlete" : "Athletes"}
                  </span>
                </div>

                {/* Athlete Details Table Below (Strictly Athlete Name and Academy Name ONLY) */}
                <table className="print-table w-full border-collapse border border-black text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-black">
                      <th className="border border-black py-2.5 px-4 font-bold text-black uppercase tracking-wider text-xs w-1/2">
                        Athlete Name
                      </th>
                      <th className="border border-black py-2.5 px-4 font-bold text-black uppercase tracking-wider text-xs w-1/2">
                        Academy / Club Name
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.athletes.map((athlete) => (
                      <tr key={athlete.id} className="border-b border-black">
                        <td className="border border-black py-2.5 px-4 font-bold text-black text-sm">
                          {athlete.athleteName}
                        </td>
                        <td className="border border-black py-2.5 px-4 text-gray-900 font-medium text-sm">
                          {athlete.academyName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Minimal Signoff Footer for Official Verification */}
          <div className="mt-12 pt-6 border-t border-black flex items-center justify-between text-xs text-gray-700">
            <div>
              <p className="font-bold text-black uppercase text-[11px]">Official Weigh-In Marshal:</p>
              <p className="text-[10px] text-gray-500 mt-6 border-t border-dashed border-gray-400 pt-1 w-40">
                Signature / Stamp
              </p>
            </div>
            <div className="text-center">
              <p className="font-bold text-black uppercase text-[11px]">Certified Official Record</p>
              <p className="text-[10px] text-gray-500 mt-6 border-t border-dashed border-gray-400 pt-1 w-40 mx-auto">
                Tournament Date &amp; Seal
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-black uppercase text-[11px]">Tournament Jury / Director:</p>
              <p className="text-[10px] text-gray-500 mt-6 border-t border-dashed border-gray-400 pt-1 w-40 ml-auto">
                Signature / Stamp
              </p>
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
          <Loader2 size={32} className="animate-spin mx-auto text-[#0052FF] mb-2" />
          <p className="text-sm">Loading Print Roster...</p>
        </div>
      }
    >
      <PrintPassedContent />
    </Suspense>
  );
}
