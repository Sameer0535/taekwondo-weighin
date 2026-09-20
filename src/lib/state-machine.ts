import { Status } from "@/types";

export interface TransitionValidation {
  allowed: boolean;
  error?: string;
}

export interface WeightValidation {
  valid: boolean;
  error?: string;
  parsedWeight?: number;
}

/**
 * Validates the official weigh-in weight according to RULE-006, RULE-007, RULE-008
 */
export function validateWeight(rawWeight: unknown): WeightValidation {
  if (rawWeight === undefined || rawWeight === null || rawWeight === "") {
    return { valid: false, error: "Official weight is required before recording a decision." };
  }

  const weight = typeof rawWeight === "string" ? parseFloat(rawWeight.trim()) : Number(rawWeight);

  if (isNaN(weight) || !isFinite(weight)) {
    return { valid: false, error: "Official weight must be a valid numeric value." };
  }

  if (weight <= 0) {
    return { valid: false, error: "Official weight must be greater than zero." };
  }

  if (weight < 10.0) {
    return { valid: false, error: "Weight is below tournament minimum threshold (10.00 KG)." };
  }

  if (weight > 200.0) {
    return { valid: false, error: "Weight exceeds tournament maximum threshold (200.00 KG)." };
  }

  // Round to 2 decimal places
  const rounded = Math.round(weight * 100) / 100;
  return { valid: true, parsedWeight: rounded };
}

/**
 * Returns allowed next statuses from current status based on RULE-009, RULE-010, RULE-011, RULE-012
 */
export function getAllowedTransitions(currentStatus: Status): Status[] {
  switch (currentStatus) {
    case "PENDING":
      return ["PASSED", "HOLD", "REJECTED"];
    case "HOLD":
      return ["PASSED", "HOLD", "REJECTED"];
    case "REJECTED":
      // RULE-011: REJECTED can only transition to PASS or HOLD. Never REJECT again.
      return ["PASSED", "HOLD"];
    case "PASSED":
      // RULE-012: PASSED is terminal in normal weigh-in operations. No action buttons.
      return [];
    default:
      return [];
  }
}

/**
 * Validates an attempted status transition against rules and state machine
 */
export function validateTransition(
  currentStatus: Status,
  targetStatus: Status,
  rawWeight: unknown
): TransitionValidation {
  // 1. Check weight validity first (RULE-006)
  const weightCheck = validateWeight(rawWeight);
  if (!weightCheck.valid) {
    return { allowed: false, error: weightCheck.error };
  }

  // 2. Terminal state check
  if (currentStatus === "PASSED") {
    return {
      allowed: false,
      error: "Athlete has already PASSED weigh-in. Certified status cannot be altered.",
    };
  }

  // 3. Allowed target status check
  const allowed = getAllowedTransitions(currentStatus);
  if (!allowed.includes(targetStatus)) {
    if (currentStatus === "REJECTED" && targetStatus === "REJECTED") {
      return {
        allowed: false,
        error: "Athlete is already REJECTED. Only recovery to PASS or HOLD is permitted.",
      };
    }
    return {
      allowed: false,
      error: `Invalid status transition from ${currentStatus} to ${targetStatus}.`,
    };
  }

  return { allowed: true };
}
