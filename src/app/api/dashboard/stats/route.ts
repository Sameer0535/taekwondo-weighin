import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { groupParticipantsByCategory } from "@/lib/category-engine";
import { Participant } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Status aggregates
    const [total, passed, pending, hold, rejected] = await Promise.all([
      prisma.participant.count(),
      prisma.participant.count({ where: { currentStatus: "PASSED" } }),
      prisma.participant.count({ where: { currentStatus: "PENDING" } }),
      prisma.participant.count({ where: { currentStatus: "HOLD" } }),
      prisma.participant.count({ where: { currentStatus: "REJECTED" } }),
    ]);

    const resolved = passed + rejected;
    const completionPercentage = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // 2. Gender distribution
    const [maleCount, femaleCount] = await Promise.all([
      prisma.participant.count({ where: { gender: "MALE" } }),
      prisma.participant.count({ where: { gender: "FEMALE" } }),
    ]);

    // 3. Division distribution
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

    const divisionMap: Record<string, number> = {};
    rawParticipants.forEach((p) => {
      divisionMap[p.division] = (divisionMap[p.division] || 0) + 1;
    });

    // 4. Dynamic category breakdown
    const categories = groupParticipantsByCategory(rawParticipants as unknown as Participant[]);

    // 5. Recent audit events (latest 8)
    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 8,
      orderBy: { timestamp: "desc" },
      include: {
        participant: {
          select: {
            athleteName: true,
            lotNumber: true,
            weightCategory: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          total,
          passed,
          pending,
          hold,
          rejected,
          completionPercentage,
        },
        genderDistribution: {
          male: maleCount,
          female: femaleCount,
        },
        divisionDistribution: divisionMap,
        categoryBreakdown: categories.slice(0, 10), // top categories
        totalCategories: categories.length,
        recentAuditLogs,
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching stats." },
      { status: 500 }
    );
  }
}
