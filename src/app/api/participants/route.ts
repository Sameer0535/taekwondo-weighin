import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ParticipantSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const gender = searchParams.get("gender")?.trim() || "";
    const division = searchParams.get("division")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const weightCategory = searchParams.get("weightCategory")?.trim() || "";

    const where: any = {};

    if (status) {
      where.currentStatus = status;
    }
    if (gender) {
      where.gender = gender;
    }
    if (division) {
      where.division = division;
    }
    if (category) {
      where.category = category;
    }
    if (weightCategory) {
      where.weightCategory = weightCategory;
    }

    if (search) {
      where.OR = [
        { athleteName: { contains: search } },
        { lotNumber: { contains: search } },
        { academyName: { contains: search } },
        { athleteId: { contains: search } },
        { category: { contains: search } },
        { weightCategory: { contains: search } },
      ];
    }

    const participants = await prisma.participant.findMany({
      where,
      orderBy: [
        { division: "asc" },
        { category: "asc" },
        { weightCategory: "asc" },
        { lotNumber: "asc" },
      ],
      include: {
        attempts: {
          orderBy: { attemptNumber: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, count: participants.length, data: participants });
  } catch (error: any) {
    console.error("Failed to fetch participants:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching participants." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Special Action: CLEAR_ALL
    if (body.action === "CLEAR_ALL") {
      await prisma.auditLog.deleteMany();
      await prisma.weighInAttempt.deleteMany();
      await prisma.participant.deleteMany();
      return NextResponse.json({ success: true, message: "All competitors cleared." });
    }

    // Special Action: RESET_SAMPLE
    if (body.action === "RESET_SAMPLE") {
      await prisma.auditLog.deleteMany();
      await prisma.weighInAttempt.deleteMany();
      await prisma.participant.deleteMany();

      const sampleAthletes = [
        { lotNumber: "001", athleteName: "Lee Dae-hoon", academyName: "Seoul TKD (KOR)", gender: "MALE", division: "Senior", ageGroup: "18+", category: "Kyorugi", weightCategory: "Under 68kg (63-68kg)", currentStatus: "PASSED", currentWeight: 67.8 },
        { lotNumber: "002", athleteName: "Alexei Denisenko", academyName: "Rostov Club (RUS)", gender: "MALE", division: "Senior", ageGroup: "18+", category: "Kyorugi", weightCategory: "Under 68kg (63-68kg)", currentStatus: "HOLD", currentWeight: 68.3 },
        { lotNumber: "003", athleteName: "Joel Gonzalez", academyName: "Madrid High Performance (ESP)", gender: "MALE", division: "Senior", ageGroup: "18+", category: "Kyorugi", weightCategory: "Under 68kg (63-68kg)", currentStatus: "PENDING", currentWeight: null },
        { lotNumber: "004", athleteName: "Rahul Kumar", academyName: "ABC Taekwondo Academy (IND)", gender: "MALE", division: "Senior", ageGroup: "18+", category: "Kyorugi", weightCategory: "Under 58kg (54-58kg)", currentStatus: "PASSED", currentWeight: 57.4 },
        { lotNumber: "005", athleteName: "Panipak Wongpattanakit", academyName: "Bangkok Dojang (THA)", gender: "FEMALE", division: "Senior", ageGroup: "18+", category: "Kyorugi", weightCategory: "Under 49kg (46-49kg)", currentStatus: "PASSED", currentWeight: 48.6 },
        { lotNumber: "006", athleteName: "Aryan Khan", academyName: "Lion Heart TKD (IND)", gender: "MALE", division: "Junior", ageGroup: "15-17", category: "Kyorugi", weightCategory: "Under 55kg (51-55kg)", currentStatus: "PENDING", currentWeight: null },
        { lotNumber: "007", athleteName: "Deepak Verma", academyName: "Tiger Claw Dojang (IND)", gender: "MALE", division: "Senior", ageGroup: "18+", category: "Kyorugi", weightCategory: "Under 68kg (63-68kg)", currentStatus: "REJECTED", currentWeight: 70.2 },
      ];

      for (const item of sampleAthletes) {
        await prisma.participant.create({
          data: {
            ...item,
            auditLogs: {
              create: {
                action: "SAMPLE_SEED",
                previousStatus: "PENDING",
                newStatus: item.currentStatus,
                operatorId: "ADMIN",
                details: "Sample athlete loaded.",
              },
            },
            ...(item.currentWeight ? {
              attempts: {
                create: {
                  attemptNumber: 1,
                  weight: item.currentWeight,
                  status: item.currentStatus,
                  operatorId: "OP-01",
                  notes: "Official weigh-in recorded.",
                }
              }
            } : {})
          },
        });
      }

      return NextResponse.json({ success: true, message: "Sample competitors restored successfully." });
    }

    const parseResult = ParticipantSchema.safeParse(body);

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

    const data = parseResult.data;

    // Helper: Determine LOT Number automatically if not given
    let lotNumber = data.lotNumber?.trim();
    if (!lotNumber) {
      const allParticipants = await prisma.participant.findMany({
        select: { lotNumber: true },
      });
      const numericLots = allParticipants
        .map((p) => parseInt(p.lotNumber, 10))
        .filter((n) => !isNaN(n));
      const nextNum = numericLots.length > 0 ? Math.max(...numericLots) + 1 : 1;
      lotNumber = String(nextNum).padStart(3, "0");
    }

    // RULE-002: Check duplicate LOT Number
    const existing = await prisma.participant.findUnique({
      where: { lotNumber },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `LOT Number '${lotNumber}' is already registered to athlete '${existing.athleteName}'. LOT numbers must be unique across the tournament.`,
        },
        { status: 409 }
      );
    }

    // Combine academy with country if present
    let academyName = data.academyName;
    if (data.country && !academyName.includes(data.country)) {
      academyName = `${academyName} (${data.country})`;
    }

    // RULE-001: Every new participant starts with PENDING status
    const participant = await prisma.participant.create({
      data: {
        lotNumber,
        athleteName: data.athleteName,
        academyName,
        gender: data.gender,
        division: data.division,
        ageGroup: data.ageGroup,
        category: data.category || "Kyorugi",
        weightCategory: data.weightCategory,
        athleteId: data.athleteId || null,
        currentStatus: "PENDING",
      },
    });

    // Create registration audit record
    await prisma.auditLog.create({
      data: {
        participantId: participant.id,
        action: "PARTICIPANT_REGISTERED",
        previousStatus: "PENDING",
        newStatus: "PENDING",
        operatorId: "ADMIN",
        details: `Participant registered with LOT ${participant.lotNumber}`,
      },
    });

    return NextResponse.json({ success: true, data: participant }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create participant:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error creating participant." },
      { status: 500 }
    );
  }
}

