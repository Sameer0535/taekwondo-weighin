import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export async function runDatabaseIntegrityTests() {
  console.log("\n🧪 Running Test Suite: Database Persistence & History Preservation (tests/database-integrity.test.ts)");

  try {
    // 1. Create a test participant
    const testLot = `TEST-LOT-${Date.now()}`;
    console.log(`  Creating test participant with LOT: ${testLot}...`);
    const participant = await prisma.participant.create({
      data: {
        lotNumber: testLot,
        athleteName: "Integration Test Athlete",
        academyName: "Test Academy",
        gender: "MALE",
        division: "Senior",
        ageGroup: "18+",
        category: "Kyorugi",
        weightCategory: "Under 54 KG",
        currentStatus: "PENDING",
      },
    });

    assert(participant.id !== undefined, "Participant ID must be generated");
    assert(participant.currentStatus === "PENDING", "Initial status must be PENDING (RULE-001)");

    // 2. Record Attempt 1: HOLD (weight 54.50 kg)
    console.log("  Recording Attempt 1: HOLD (54.50 KG)...");
    const attempt1 = await prisma.weighInAttempt.create({
      data: {
        participantId: participant.id,
        attemptNumber: 1,
        weight: 54.5,
        status: "HOLD",
        operatorId: "OP-TEST",
        notes: "Overweight by 0.50 kg",
      },
    });

    await prisma.participant.update({
      where: { id: participant.id },
      data: { currentStatus: "HOLD", currentWeight: 54.5 },
    });

    await prisma.auditLog.create({
      data: {
        participantId: participant.id,
        action: "WEIGH_IN_DECISION",
        previousStatus: "PENDING",
        newStatus: "HOLD",
        weight: 54.5,
        operatorId: "OP-TEST",
        details: "Attempt 1 recorded as HOLD",
      },
    });

    // 3. Record Attempt 2: PASSED (weight 53.80 kg)
    console.log("  Recording Attempt 2: PASSED (53.80 KG)...");
    const attempt2 = await prisma.weighInAttempt.create({
      data: {
        participantId: participant.id,
        attemptNumber: 2,
        weight: 53.8,
        status: "PASSED",
        operatorId: "OP-TEST",
        notes: "Re-weigh passed",
      },
    });

    await prisma.participant.update({
      where: { id: participant.id },
      data: { currentStatus: "PASSED", currentWeight: 53.8 },
    });

    await prisma.auditLog.create({
      data: {
        participantId: participant.id,
        action: "WEIGH_IN_DECISION",
        previousStatus: "HOLD",
        newStatus: "PASSED",
        weight: 53.8,
        operatorId: "OP-TEST",
        details: "Attempt 2 recorded as PASSED",
      },
    });

    // 4. Verify History Preservation (RULE-007, RULE-008, RULE-013)
    console.log("  Verifying historical attempts preservation (RULE-007, RULE-013)...");
    const retrieved = await prisma.participant.findUnique({
      where: { id: participant.id },
      include: {
        attempts: { orderBy: { attemptNumber: "asc" } },
        auditLogs: { orderBy: { timestamp: "asc" } },
      },
    });

    assert(retrieved !== null, "Participant must be retrievable from database");
    assert(retrieved?.currentStatus === "PASSED", "Final status must be PASSED");
    assert(retrieved?.currentWeight === 53.8, "Current weight must be 53.80 KG");

    // Check attempts
    assert(retrieved?.attempts.length === 2, "Must have exactly 2 attempts preserved in history");
    assert(retrieved?.attempts[0].attemptNumber === 1, "Attempt 1 must exist");
    assert(retrieved?.attempts[0].status === "HOLD", "Attempt 1 status must be HOLD");
    assert(retrieved?.attempts[0].weight === 54.5, "Attempt 1 weight must be 54.50 KG");

    assert(retrieved?.attempts[1].attemptNumber === 2, "Attempt 2 must exist");
    assert(retrieved?.attempts[1].status === "PASSED", "Attempt 2 status must be PASSED");
    assert(retrieved?.attempts[1].weight === 53.8, "Attempt 2 weight must be 53.80 KG");

    // Check audit logs
    assert((retrieved?.auditLogs.length || 0) >= 2, "Must have at least 2 audit logs recorded");

    // Clean up test participant
    await prisma.participant.delete({ where: { id: participant.id } });
    console.log("  ✅ Cleaned up temporary test participant.");

    console.log("🎉 All Database Integrity tests completed successfully!");
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  runDatabaseIntegrityTests();
}
