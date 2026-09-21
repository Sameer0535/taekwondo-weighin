import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BulkImportRowSchema } from "@/lib/validation";
import { ImportPreviewRow, ImportSummary } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rows, confirm = false } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "No rows provided for import." },
        { status: 400 }
      );
    }

    // 1. Fetch all existing LOT numbers from the database
    const existingParticipants = await prisma.participant.findMany({
      select: { lotNumber: true },
    });
    const existingDbLots = new Set(existingParticipants.map((p) => p.lotNumber.toLowerCase().trim()));

    // Find highest existing numeric lot for auto-assignment
    let maxLotNumber = 0;
    existingParticipants.forEach((p) => {
      const num = parseInt(p.lotNumber, 10);
      if (!isNaN(num) && num > maxLotNumber) {
        maxLotNumber = num;
      }
    });

    // 2. Normalize and auto-assign LOT if missing
    const preparedRows = rows.map((raw: any) => {
      let lot = String(raw.lotNumber ?? raw["LOT Number"] ?? raw["LOT"] ?? raw["Lot Number"] ?? "").trim();
      if (!lot) {
        maxLotNumber += 1;
        lot = String(maxLotNumber).padStart(3, "0");
      }
      return {
        ...raw,
        lotNumber: lot,
      };
    });

    // 3. Track duplicate LOT numbers inside the file
    const lotFrequency = new Map<string, number>();
    preparedRows.forEach((r: any) => {
      const lot = r.lotNumber.toLowerCase();
      lotFrequency.set(lot, (lotFrequency.get(lot) || 0) + 1);
    });

    const previewRows: ImportPreviewRow[] = [];
    const duplicateLotsInFile: string[] = [];
    const duplicateLotsInDb: string[] = [];
    let validCount = 0;
    let errorCount = 0;

    // 4. Validate each row
    for (let i = 0; i < preparedRows.length; i++) {
      const raw = preparedRows[i];
      const rowNumber = i + 1;

      const normalized = {
        lotNumber: raw.lotNumber,
        athleteName: String(raw.athleteName ?? raw["Athlete Name"] ?? raw["Name"] ?? "").trim(),
        academyName: String(raw.academyName ?? raw["Academy Name"] ?? raw["Academy"] ?? raw["Club"] ?? "").trim(),
        gender: String(raw.gender ?? raw["Gender"] ?? "").trim().toUpperCase(),
        division: String(raw.division ?? raw["Division"] ?? "").trim(),
        ageGroup: String(raw.ageGroup ?? raw["Age Group"] ?? raw["Age"] ?? "").trim(),
        category: String(raw.category ?? raw["Category"] ?? "Kyorugi").trim(),
        weightCategory: String(raw.weightCategory ?? raw["Weight Category"] ?? raw["Weight"] ?? "").trim(),
        athleteId: raw.athleteId ? String(raw.athleteId).trim() : undefined,
      };

      const errors: string[] = [];

      // Zod schema check
      const validation = BulkImportRowSchema.safeParse(normalized);
      if (!validation.success) {
        errors.push(...validation.error.errors.map((e) => e.message));
      }

      // Check file-internal duplicate LOT (RULE-022)
      const lotKey = normalized.lotNumber.toLowerCase();
      if (lotKey && (lotFrequency.get(lotKey) || 0) > 1) {
        errors.push(`Duplicate LOT Number '${normalized.lotNumber}' found multiple times in this file.`);
        if (!duplicateLotsInFile.includes(normalized.lotNumber)) {
          duplicateLotsInFile.push(normalized.lotNumber);
        }
      }

      // Check database collision (RULE-023)
      if (lotKey && existingDbLots.has(lotKey)) {
        errors.push(`LOT Number '${normalized.lotNumber}' already exists in tournament database.`);
        if (!duplicateLotsInDb.includes(normalized.lotNumber)) {
          duplicateLotsInDb.push(normalized.lotNumber);
        }
      }

      const isValid = errors.length === 0;
      if (isValid) validCount++;
      else errorCount++;

      previewRows.push({
        rowNumber,
        ...normalized,
        isValid,
        errors,
      });
    }

    const summary: ImportSummary = {
      totalRows: preparedRows.length,
      validCount,
      errorCount,
      duplicateLotsInFile,
      duplicateLotsInDb,
      rows: previewRows,
    };

    if (!confirm) {
      return NextResponse.json({
        success: true,
        previewOnly: true,
        summary,
      });
    }

    if (errorCount > 0 && !body.allowPartial) {
      return NextResponse.json(
        {
          success: false,
          error: `Import halted: ${errorCount} invalid rows detected. Review and fix errors before confirming.`,
          summary,
        },
        { status: 400 }
      );
    }

    const rowsToInsert = previewRows.filter((r) => r.isValid);
    if (rowsToInsert.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid rows available to import.", summary },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      rowsToInsert.map((r) =>
        prisma.participant.create({
          data: {
            lotNumber: r.lotNumber,
            athleteName: r.athleteName,
            academyName: r.academyName,
            gender: r.gender,
            division: r.division,
            ageGroup: r.ageGroup,
            category: r.category,
            weightCategory: r.weightCategory,
            athleteId: r.athleteId || null,
            currentStatus: "PENDING",
            auditLogs: {
              create: {
                action: "BULK_IMPORT",
                previousStatus: "PENDING",
                newStatus: "PENDING",
                operatorId: "ADMIN",
                details: "Created via bulk import.",
              },
            },
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      importedCount: rowsToInsert.length,
      summary,
    });
  } catch (error: any) {
    console.error("Bulk import failed:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error during bulk import." },
      { status: 500 }
    );
  }
}

