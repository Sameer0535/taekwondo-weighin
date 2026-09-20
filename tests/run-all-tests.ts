import { runStateMachineTests } from "./state-machine.test";
import { runImportValidationTests } from "./import-validation.test";
import { runDatabaseIntegrityTests } from "./database-integrity.test";

async function main() {
  console.log("=================================================================");
  console.log("🥋 TAEKWONDO WEIGH-IN MANAGEMENT SYSTEM — AUTOMATED TEST SUITE");
  console.log("=================================================================");

  try {
    // 1. State Machine & Weight Validation
    runStateMachineTests();

    // 2. Import & Spreadsheet Parser Validation
    runImportValidationTests();

    // 3. Database Persistence & History Preservation
    await runDatabaseIntegrityTests();

    console.log("\n=================================================================");
    console.log("🏆 ALL TEST SUITES PASSED (100% SUCCESS RATE)");
    console.log("=================================================================\n");
  } catch (err) {
    console.error("\n❌ TEST SUITE FAILURE:", err);
    process.exit(1);
  }
}

main();
