import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { groupParticipantsByCategory } from "@/lib/category-engine";
import { Participant } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rawParticipants = await prisma.participant.findMany({
      select: {
        id: true,
        lotNumber: true,
        athleteName: true,
        academyName: true,
        gender: true,
        division: true,
        ageGroup: true,
        category: true,
        weightCategory: true,
        athleteId: true,
        currentStatus: true,
        currentWeight: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const participants = rawParticipants as unknown as Participant[];
    const categories = groupParticipantsByCategory(participants);

    return NextResponse.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error: any) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching categories." },
      { status: 500 }
    );
  }
}
