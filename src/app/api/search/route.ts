import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query) {
      return NextResponse.json({ success: true, count: 0, data: [] });
    }

    const results = await prisma.participant.findMany({
      where: {
        OR: [
          { athleteName: { contains: query } },
          { lotNumber: { contains: query } },
          { academyName: { contains: query } },
          { athleteId: { contains: query } },
          { category: { contains: query } },
          { weightCategory: { contains: query } },
          { division: { contains: query } },
        ],
      },
      take: 20,
      orderBy: [{ athleteName: "asc" }],
      include: {
        attempts: {
          orderBy: { attemptNumber: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error: any) {
    console.error("Failed to perform search:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during search." },
      { status: 500 }
    );
  }
}
