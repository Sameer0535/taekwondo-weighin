import { BulkImportRowSchema } from "../src/lib/validation";
import * as XLSX from "xlsx";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runImportValidationTests() {
  console.log("\n🧪 Running Test Suite: Import & Validation (tests/import-validation.test.ts)");

  // 1. Valid Row Schema Check
  console.log("  Testing single row schema parsing...");
  const validRow = {
    lotNumber: "101",
    athleteName: "Rahul Kumar",
    academyName: "ABC Academy",
    gender: "MALE",
    division: "Senior",
    ageGroup: "18+",
    category: "Kyorugi",
    weightCategory: "Under 54 KG",
  };
  const parseValid = BulkImportRowSchema.safeParse(validRow);
  assert(parseValid.success, "Valid row must pass Zod validation");

  // 2. Missing Required Values
  console.log("  Testing missing required values...");
  const missingName = { ...validRow, athleteName: "" };
  assert(!BulkImportRowSchema.safeParse(missingName).success, "Missing athlete name must fail");

  const missingAcademy = { ...validRow, academyName: "" };
  assert(!BulkImportRowSchema.safeParse(missingAcademy).success, "Missing academy name must fail");

  const withoutLot = { ...validRow, lotNumber: undefined };
  assert(BulkImportRowSchema.safeParse(withoutLot).success, "Omitted lot number must pass because backend auto-assigns LOT numbers");

  const invalidGender = { ...validRow, gender: "OTHER" };
  assert(!BulkImportRowSchema.safeParse(invalidGender).success, "Invalid gender must fail");

  // 3. Duplicate LOT in file simulation (RULE-022)
  console.log("  Testing duplicate LOT detection within file (RULE-022)...");
  const fileRows = [
    { lotNumber: "201", athleteName: "Athlete One" },
    { lotNumber: "202", athleteName: "Athlete Two" },
    { lotNumber: "201", athleteName: "Athlete Three Duplicate" },
  ];

  const lotFreq = new Map<string, number>();
  fileRows.forEach((r) => {
    lotFreq.set(r.lotNumber, (lotFreq.get(r.lotNumber) || 0) + 1);
  });

  const duplicatesInFile = fileRows.filter((r) => (lotFreq.get(r.lotNumber) || 0) > 1);
  assert(duplicatesInFile.length === 2, "Both rows with LOT 201 must be flagged as duplicates");
  assert(duplicatesInFile[0].lotNumber === "201" && duplicatesInFile[1].lotNumber === "201", "Identified duplicate LOT correctly");

  // 4. Excel & CSV buffer serialization check using SheetJS
  console.log("  Testing SheetJS CSV & XLSX encoding/decoding...");
  const sampleSheetData = [
    {
      "LOT Number": "301",
      "Athlete Name": "Test Athlete",
      "Academy Name": "TKD Club",
      Gender: "MALE",
      Division: "Senior",
      "Age Group": "18+",
      Category: "Kyorugi",
      "Weight Category": "Under 58 KG",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleSheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Test");

  const xlsxBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const readWb = XLSX.read(xlsxBuffer, { type: "buffer" });
  const parsedSheet = readWb.Sheets[readWb.SheetNames[0]];
  const parsedRows: any[] = XLSX.utils.sheet_to_json(parsedSheet);

  assert(parsedRows.length === 1, "SheetJS must read back 1 row from generated workbook");
  assert(parsedRows[0]["LOT Number"] === "301", "SheetJS must preserve LOT number value");
  assert(parsedRows[0]["Athlete Name"] === "Test Athlete", "SheetJS must preserve Athlete Name");

  console.log("  ✅ Import and worksheet parser tests passed.");
  console.log("🎉 All Import Validation tests completed successfully!");
}

if (require.main === module) {
  runImportValidationTests();
}
