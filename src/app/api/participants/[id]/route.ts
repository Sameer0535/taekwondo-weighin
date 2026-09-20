import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ParticipantUpdateSchema } from "@/lib/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const participant = await prisma.participant.findUnique({
      where: { id: params.id },
      include: {
        attempts: {
          orderBy: { attemptNumber: "asc" },
        },
        auditLogs: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { success: false, error: "Participant not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: participant });
  } catch (error: any) {
    console.error("Failed to fetch participant:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching participant." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const parseResult = ParticipantUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parseResult.error.errors.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    const currentParticipant = await prisma.participant.findUnique({
      where: { id: params.id },
      include: { attempts: true },
    });

    if (!currentParticipant) {
      return NextResponse.json(
        { success: false, error: "Participant not found." },
        { status: 404 }
      );
    }

    const data = parseResult.data;

    // RULE-002 & RULE-003: LOT number uniqueness and immutability check
    if (data.lotNumber && data.lotNumber !== currentParticipant.lotNumber) {
      if (currentParticipant.attempts.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: "LOT Number cannot be changed once weigh-in attempts have commenced.",
          },
          { status: 400 }
        );
      }

      const existingLot = await prisma.participant.findUnique({
        where: { lotNumber: data.lotNumber },
      });
      if (existingLot) {
        return NextResponse.json(
          {
            success: false,
            error: `LOT Number '${data.lotNumber}' is already in use by another athlete.`,
          },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.participant.update({
      where: { id: params.id },
      data: {
        ...(data.athleteName ? { athleteName: data.athleteName } : {}),
        ...(data.academyName ? { academyName: data.academyName } : {}),
        ...(data.gender ? { gender: data.gender } : {}),
        ...(data.division ? { division: data.division } : {}),
        ...(data.ageGroup ? { ageGroup: data.ageGroup } : {}),
        ...(data.category ? { category: data.category } : {}),
        ...(data.weightCategory ? { weightCategory: data.weightCategory } : {}),
        ...(data.lotNumber ? { lotNumber: data.lotNumber } : {}),
        ...(data.athleteId !== undefined ? { athleteId: data.athleteId } : {}),
      },
      include: {
        attempts: { orderBy: { attemptNumber: "asc" } },
      },
    });

    await prisma.auditLog.create({
      data: {
        participantId: updated.id,
        action: "PARTICIPANT_EDITED",
        previousStatus: currentParticipant.currentStatus,
        newStatus: currentParticipant.currentStatus,
        operatorId: "ADMIN",
        details: "Participant details updated via management interface.",
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Failed to update participant:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error updating participant." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const participant = await prisma.participant.findUnique({
      where: { id: params.id },
      include: { attempts: true },
    });

    if (!participant) {
      return NextResponse.json(
        { success: false, error: "Participant not found." },
        { status: 404 }
      );
    }

    // RULE-005 & Data Integrity: Block accidental deletion if attempts have been recorded
    if (participant.attempts.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete participant with existing weigh-in attempts. Tournament records must be preserved for audit.",
        },
        { status: 403 }
      );
    }

    await prisma.participant.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: `Participant '${participant.athleteName}' (LOT ${participant.lotNumber}) deleted successfully.`,
    });
  } catch (error: any) {
    console.error("Failed to delete participant:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error deleting participant." },
      { status: 500 }
    );
  }
}
