import { validateTransition, validateWeight, getAllowedTransitions } from "../src/lib/state-machine";
import { Status } from "../src/types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runStateMachineTests() {
  console.log("\n🧪 Running Test Suite: State Machine & Weight Validation (tests/state-machine.test.ts)");

  // --- Weight Validation Tests (RULE-006, RULE-007) ---
  console.log("  Testing Weight Validations...");

  // Missing weight
  const missing1 = validateWeight(null);
  assert(!missing1.valid, "Null weight must be rejected");

  const missing2 = validateWeight("");
  assert(!missing2.valid, "Empty string weight must be rejected");

  const missing3 = validateWeight(undefined);
  assert(!missing3.valid, "Undefined weight must be rejected");

  // Invalid / non-numeric weight
  const textWeight = validateWeight("abc");
  assert(!textWeight.valid, "Non-numeric string weight must be rejected");

  const nanWeight = validateWeight(NaN);
  assert(!nanWeight.valid, "NaN weight must be rejected");

  // Negative and zero weight
  const negWeight = validateWeight(-53.4);
  assert(!negWeight.valid, "Negative weight must be rejected");

  const zeroWeight = validateWeight(0);
  assert(!zeroWeight.valid, "Zero weight must be rejected");

  // Out of tournament bounds
  const lowWeight = validateWeight(5.0);
  assert(!lowWeight.valid, "Weight below 10.00 KG must be rejected");

  const highWeight = validateWeight(250.0);
  assert(!highWeight.valid, "Weight above 200.00 KG must be rejected");

  // Valid weights
  const valid1 = validateWeight(53.4);
  assert(valid1.valid && valid1.parsedWeight === 53.4, "53.4 KG must be accepted");

  const valid2 = validateWeight("54.25");
  assert(valid2.valid && valid2.parsedWeight === 54.25, "'54.25' string must be parsed correctly");

  console.log("  ✅ Weight validation tests passed.");

  // --- PENDING Transitions (RULE-009) ---
  console.log("  Testing PENDING Transitions...");
  const pendingAllowed = getAllowedTransitions("PENDING");
  assert(pendingAllowed.includes("PASSED"), "PENDING must be allowed to transition to PASSED");
  assert(pendingAllowed.includes("HOLD"), "PENDING must be allowed to transition to HOLD");
  assert(pendingAllowed.includes("REJECTED"), "PENDING must be allowed to transition to REJECTED");

  assert(validateTransition("PENDING", "PASSED", 53.4).allowed, "PENDING -> PASSED with weight 53.4 must be allowed");
  assert(validateTransition("PENDING", "HOLD", 54.8).allowed, "PENDING -> HOLD with weight 54.8 must be allowed");
  assert(validateTransition("PENDING", "REJECTED", 57.0).allowed, "PENDING -> REJECTED with weight 57.0 must be allowed");
  assert(!validateTransition("PENDING", "PASSED", null).allowed, "PENDING -> PASSED without weight must be blocked");
  console.log("  ✅ PENDING transition tests passed.");

  // --- HOLD Transitions (RULE-010) ---
  console.log("  Testing HOLD Transitions...");
  const holdAllowed = getAllowedTransitions("HOLD");
  assert(holdAllowed.includes("PASSED"), "HOLD must be allowed to transition to PASSED");
  assert(holdAllowed.includes("HOLD"), "HOLD must be allowed to transition to HOLD (subsequent attempt)");
  assert(holdAllowed.includes("REJECTED"), "HOLD must be allowed to transition to REJECTED");

  assert(validateTransition("HOLD", "PASSED", 53.9).allowed, "HOLD -> PASSED with weight 53.9 must be allowed");
  assert(validateTransition("HOLD", "HOLD", 54.3).allowed, "HOLD -> HOLD with weight 54.3 must be allowed");
  assert(validateTransition("HOLD", "REJECTED", 55.5).allowed, "HOLD -> REJECTED with weight 55.5 must be allowed");
  console.log("  ✅ HOLD transition tests passed.");

  // --- REJECTED Transitions (RULE-011) ---
  console.log("  Testing REJECTED Transitions (RULE-011)...");
  const rejectedAllowed = getAllowedTransitions("REJECTED");
  assert(rejectedAllowed.includes("PASSED"), "REJECTED must be allowed to recover to PASSED");
  assert(rejectedAllowed.includes("HOLD"), "REJECTED must be allowed to recover to HOLD");
  assert(!rejectedAllowed.includes("REJECTED"), "REJECTED must NOT be allowed to transition to REJECTED");

  assert(validateTransition("REJECTED", "PASSED", 53.5).allowed, "REJECTED -> PASSED must be allowed");
  assert(validateTransition("REJECTED", "HOLD", 54.1).allowed, "REJECTED -> HOLD must be allowed");
  assert(!validateTransition("REJECTED", "REJECTED", 56.0).allowed, "REJECTED -> REJECTED must be blocked");
  console.log("  ✅ REJECTED transition tests passed.");

  // --- PASSED Terminal State (RULE-012) ---
  console.log("  Testing PASSED Terminal State (RULE-012)...");
  const passedAllowed = getAllowedTransitions("PASSED");
  assert(passedAllowed.length === 0, "PASSED must have zero allowed outgoing transitions in normal operations");

  assert(!validateTransition("PASSED", "HOLD", 54.0).allowed, "PASSED -> HOLD must be blocked");
  assert(!validateTransition("PASSED", "REJECTED", 56.0).allowed, "PASSED -> REJECTED must be blocked");
  assert(!validateTransition("PASSED", "PENDING" as Status, 53.0).allowed, "PASSED -> PENDING must be blocked");
  console.log("  ✅ PASSED terminal immutability tests passed.");

  console.log("🎉 All State Machine tests completed successfully!");
}

if (require.main === module) {
  runStateMachineTests();
}
