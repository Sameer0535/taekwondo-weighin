import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { groupParticipantsByCategory } from "@/lib/category-engine";
import { Participant } from "@/types";

/**
 * Certified Passed Export endpoint structured for integration with tkdfixture.vercel.app
 */
export async function GET() {
  try {
    const rawPassed = await prisma.participant.findMany({
      where: { currentStatus: "PASSED" },
      orderBy: [
        { division: "asc" },
        { gender: "asc" },
        { category: "asc" },
        { weightCategory: "asc" },
        { lotNumber: "asc" },
      ],
      include: {
        attempts: {
          orderBy: { attemptNumber: "desc" },
          take: 1,
        },
      },
    });

    const passedAthletes = rawPassed as unknown as Participant[];
    const categories = groupParticipantsByCategory(passedAthletes);

    // Format category buckets for draw and bracket seeding
    const fixtureBuckets = categories.map((cat) => {
      const athletes = passedAthletes.filter(
        (p) =>
          p.gender === cat.gender &&
          p.division === cat.division &&
          p.ageGroup === cat.ageGroup &&
          p.category === cat.category &&
          p.weightCategory === cat.weightCategory
      );

      return {
        categoryId: cat.id,
        categoryLabel: cat.label,
        gender: cat.gender,
        division: cat.division,
        category: cat.category,
        weightCategory: cat.weightCategory,
        totalPassedAthletes: athletes.length,
        roster: athletes.map((a, index) => ({
          seed: index + 1,
          lotNumber: a.lotNumber,
          athleteName: a.athleteName,
          academyName: a.academyName,
          athleteId: a.athleteId || null,
          officialWeight: a.currentWeight,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      certifiedAt: new Date().toISOString(),
      targetSystem: "tkdfixture.vercel.app",
      totalPassedCount: passedAthletes.length,
      categoriesCount: fixtureBuckets.length,
      fixtures: fixtureBuckets,
    });
  } catch (error: any) {
    console.error("Fixture export failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error exporting fixtures." },
      { status: 500 }
    );
  }
}
