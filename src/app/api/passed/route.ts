import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseCategoryId } from "@/lib/category-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const academy = searchParams.get("academy")?.trim() || "";
    const gender = searchParams.get("gender")?.trim() || "";
    const division = searchParams.get("division")?.trim() || "";

    const where: any = {
      // RULE-009 & RULE-018: Strictly only PASSED athletes
      currentStatus: "PASSED",
    };

    if (categoryId) {
      const parsed = parseCategoryId(categoryId);
      if (parsed.gender) where.gender = parsed.gender;
      if (parsed.division) where.division = parsed.division;
      if (parsed.ageGroup) where.ageGroup = parsed.ageGroup;
      if (parsed.category) where.category = parsed.category;
      if (parsed.weightCategory) where.weightCategory = parsed.weightCategory;
    } else {
      if (gender) where.gender = gender;
      if (division) where.division = division;
    }

    if (academy) {
      where.academyName = { contains: academy };
    }

    const passedAthletes = await prisma.participant.findMany({
      where,
      orderBy: [
        { division: "asc" },
        { gender: "asc" },
        { category: "asc" },
        { weightCategory: "asc" },
        { athleteName: "asc" },
      ],
      select: {
        id: true,
        athleteName: true,
        academyName: true,
        // Include category info for UI grouping before printing
        gender: true,
        division: true,
        ageGroup: true,
        category: true,
        weightCategory: true,
        lotNumber: true,
        currentStatus: true,
        currentWeight: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: passedAthletes.length,
      data: passedAthletes,
    });
  } catch (error: any) {
    console.error("Failed to fetch passed athletes:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching passed athletes." },
      { status: 500 }
    );
  }
}
