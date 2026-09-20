import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { WeighInRecordSchema } from "@/lib/validation";
import { validateTransition } from "@/lib/state-machine";
import { Status } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = WeighInRecordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid weigh-in submission.",
          details: parseResult.error.errors.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    const { participantId, weight, status: targetStatus, operatorId = "OP-01", notes } = parseResult.data;

    // Fetch current participant and their existing attempts
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        attempts: {
          orderBy: { attemptNumber: "asc" },
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { success: false, error: "Participant not found." },
        { status: 404 }
      );
    }

    // Strict State Machine & Weight Validation
    const transitionCheck = validateTransition(
      participant.currentStatus as Status,
      targetStatus as Status,
      weight
    );

    if (!transitionCheck.allowed) {
      return NextResponse.json(
        { success: false, error: transitionCheck.error },
        { status: 400 }
      );
    }

    const nextAttemptNumber = participant.attempts.length + 1;
    const previousStatus = participant.currentStatus;

    // Execute atomically via Prisma transaction
    const [createdAttempt, updatedParticipant, auditLog] = await prisma.$transaction([
      // 1. Create WeighInAttempt (RULE-007, RULE-013)
      prisma.weighInAttempt.create({
        data: {
          participantId: participant.id,
          attemptNumber: nextAttemptNumber,
          weight,
          status: targetStatus,
          operatorId,
          notes: notes || null,
        },
      }),

      // 2. Update Participant's currentStatus and currentWeight
      prisma.participant.update({
        where: { id: participant.id },
        data: {
          currentStatus: targetStatus,
          currentWeight: weight,
        },
        include: {
          attempts: {
            orderBy: { attemptNumber: "asc" },
          },
        },
      }),

      // 3. Create AuditLog entry (RULE-015)
      prisma.auditLog.create({
        data: {
          participantId: participant.id,
          action: "WEIGH_IN_DECISION",
          previousStatus,
          newStatus: targetStatus,
          weight,
          operatorId,
          details: `Attempt #${nextAttemptNumber} recorded: ${weight.toFixed(2)} KG -> ${targetStatus}${notes ? ` (${notes})` : ""}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        participant: updatedParticipant,
        attempt: createdAttempt,
        auditLogId: auditLog.id,
      },
    });
  } catch (error: any) {
    console.error("Failed to record weigh-in:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error recording weigh-in." },
      { status: 500 }
    );
  }
}
