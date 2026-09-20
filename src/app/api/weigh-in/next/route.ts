import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseCategoryId } from "@/lib/category-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const currentParticipantId = searchParams.get("currentParticipantId");

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: "Category ID is required to fetch next athlete." },
        { status: 400 }
      );
    }

    const { gender, division, ageGroup, category, weightCategory } = parseCategoryId(categoryId);

    // Fetch all unresolved athletes (PENDING or HOLD) in this category
    const unresolved = await prisma.participant.findMany({
      where: {
        gender,
        division,
        ageGroup,
        category,
        weightCategory,
        currentStatus: { in: ["PENDING", "HOLD"] },
      },
      orderBy: [{ lotNumber: "asc" }],
      include: {
        attempts: {
          orderBy: { attemptNumber: "asc" },
        },
      },
    });

    if (unresolved.length === 0) {
      return NextResponse.json({
        success: true,
        completed: true,
        message: "All athletes in this category have completed weigh-in.",
        data: null,
      });
    }

    // If currentParticipantId is given, find the next one in sequence after it, or wrap to first unresolved
    let nextAthlete = unresolved[0];
    if (currentParticipantId) {
      const currentIndex = unresolved.findIndex((p) => p.id === currentParticipantId);
      if (currentIndex !== -1 && currentIndex + 1 < unresolved.length) {
        nextAthlete = unresolved[currentIndex + 1];
      } else {
        // Wrap or pick the first different unresolved athlete
        const alternate = unresolved.find((p) => p.id !== currentParticipantId);
        if (alternate) nextAthlete = alternate;
      }
    }

    return NextResponse.json({
      success: true,
      completed: false,
      data: nextAthlete,
      remainingCount: unresolved.length,
    });
  } catch (error: any) {
    console.error("Failed to fetch next athlete:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching next athlete." },
      { status: 500 }
    );
  }
}
