import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Taekwondo Weigh-In Tournament database...");

  // Clean previous data
  await prisma.auditLog.deleteMany();
  await prisma.weighInAttempt.deleteMany();
  await prisma.participant.deleteMany();

  const seedParticipants = [
    // --- SENIOR MEN KYORUGI UNDER 54 KG ---
    {
      lotNumber: "014",
      athleteName: "Rahul Kumar",
      academyName: "ABC Taekwondo Academy",
      gender: "MALE",
      division: "Senior",
      ageGroup: "18+",
      category: "Kyorugi",
      weightCategory: "Under 54 KG",
      athleteId: "TKD-IND-014",
      currentStatus: "HOLD",
      currentWeight: 54.2,
      attempts: [
        {
          attemptNumber: 1,
          weight: 54.2,
          status: "HOLD",
          notes: "Initial weigh-in 0.20 kg over category threshold. Granted 1 hr grace period.",
          weighedAt: new Date(Date.now() - 45 * 60 * 1000),
        },
      ],
      auditLogs: [
        {
          action: "WEIGH_IN_DECISION",
          previousStatus: "PENDING",
          newStatus: "HOLD",
          weight: 54.2,
          details: "Attempt 1 recorded. Status placed on HOLD.",
        },
      ],
    },
    {
      lotNumber: "015",
      athleteName: "Arjun Sharma",
      academyName: "Lion Heart TKD",
      gender: "MALE",
      division: "Senior",
      ageGroup: "18+",
      category: "Kyorugi",
      weightCategory: "Under 54 KG",
      athleteId: "TKD-IND-015",
      currentStatus: "PASSED",
      currentWeight: 53.4,
      attempts: [
        {
          attemptNumber: 1,
          weight: 53.4,
          status: "PASSED",
          notes: "Official weight verified.",
          weighedAt: new Date(Date.now() - 60 * 60 * 1000),
        },
      ],
      auditLogs: [
        {
          action: "WEIGH_IN_DECISION",
          previousStatus: "PENDING",
          newStatus: "PASSED",
          weight: 53.4,
          details: "Attempt 1 recorded. Status approved as PASSED.",
        },
      ],
    },
    {
      lotNumber: "016",
      athleteName: "Vikram Singh",
      academyName: "Dragon Strike Martial Arts",
      gender: "MALE",
      division: "Senior",
      ageGroup: "18+",
      category: "Kyorugi",
      weightCategory: "Under 54 KG",
      athleteId: "TKD-IND-016",
      currentStatus: "PENDING",
      currentWeight: null,
      attempts: [],
      auditLogs: [],
    },
    {
      lotNumber: "017",
      athleteName: "Karan Patel",
      academyName: "Olympic Dream Academy",
      gender: "MALE",
      division: "Senior",
      ageGroup: "18+",
      category: "Kyorugi",
      weightCategory: "Under 54 KG",
      athleteId: "TKD-IND-017",
      currentStatus: "PASSED",
      currentWeight: 53.8,
      attempts: [
        {
          attemptNumber: 1,
          weight: 54.4,
          status: "HOLD",
          notes: "Attempt 1 over limit.",
          weighedAt: new Date(Date.now() - 90 * 60 * 1000),
        },
        {
          attemptNumber: 2,
          weight: 53.8,
          status: "PASSED",
          notes: "Attempt 2 re-weigh within category specification.",
          weighedAt: new Date(Date.now() - 30 * 60 * 1000),
        },
      ],
      auditLogs: [
        {
          action: "WEIGH_IN_DECISION",
          previousStatus: "PENDING",
          newStatus: "HOLD",
          weight: 54.4,
          details: "Attempt 1 recorded as HOLD.",
        },
        {
          action: "WEIGH_IN_DECISION",
          previousStatus: "HOLD",
          newStatus: "PASSED",
          weight: 53.8,
          details: "Attempt 2 recorded as PASSED.",
        },
      ],
    },
    {
      lotNumber: "018",
      athleteName: "Deepak Verma",
      academyName: "Tiger Claw Dojang",
      gender: "MALE",
      division: "Senior",
      ageGroup: "18+",
      category: "Kyorugi",
      weightCategory: "Under 54 KG",
      athleteId: "TKD-IND-018",
      currentStatus: "REJECTED",
      currentWeight: 56.1,
      attempts: [
        {
          attemptNumber: 1,
          weight: 56.1,
          status: "REJECTED",
          notes: "Exceeded weight allowance by 2.1 kg after final call.",
          weighedAt: new Date(Date.now() - 15 * 60 * 1000),
        },
      ],
      auditLogs: [
        {
          action: "WEIGH_IN_DECISION",
          previousStatus: "PENDING",
          newStatus: "REJECTED",
          weight: 56.1,
          details: "Attempt 1 recorded as REJECTED.",
        },
      ],
    },
    {
      lotNumber: "019",
      athleteName: "Rohan Nair",
      academyName: "Warrior Taekwondo Club",
      gender: "MALE",
      division: "Senior",
      ageGroup: "18+",
      category: "Kyorugi",
      weightCategory: "Under 54 KG",
      athleteId: "TKD-IND-019",
      currentStatus: "PENDING",
      currentWeight: null,
      attempts: [],
      auditLogs: [],
    },

    // --- SENIOR MEN KYORUGI UNDER 58 KG ---
    {
      lotNumber: "030",
      athleteName: "Aman Gupta",
      academyName: "ABC Taekwondo Academy",
      gender: "MALE",
      division: "Senior",
      ageGroup: "18+",
      category: "Kyorugi",
      weightCategory: "Under 58 KG",
      athleteId: "TKD-IND-030",
      currentStatus: "PASSED",
      currentWeight: 57.5,
      attempts: [
        {
          attemptNumber: 1,
          weight: 57.5,
          status: "PASSED",
          notes: "Official weight verified.",
          weighedAt: new Date(Date.now() - 50 * 60 * 1000),
        },
      ],
      auditLogs: [
        {
          action: "WEIGH_IN_DECISION",
          previousStatus: "PENDING",
          newStatus: "PASSED",
          weight: 57.5,
          details: "Attempt 1 recorded as PASSED.",
        },
      ],
    },
    {
      lotNumber: "031",
      athleteName: "Manish Reddy",
      academyName: "Apex Martial Arts",
      gender: "MALE",
      division: "Senior",
      ageGroup: "18+",
      category: "Kyorugi",
      weightCategory: "Under 58 KG",
      athleteId: "TKD-IND-031",
      currentStatus: "PENDING",
      currentWeight: null,
      attempts: [],
      auditLogs: [],
    },

    // --- SENIOR WOMEN KYORUGI UNDER 46 KG ---
    {
      lotNumber: "050",
      athleteName: "Pooja Hegde",
      academyName: "Olympic Dream Academy",
      gender: "FEMALE",
      division: "Senior",
      ageGroup: "18+",
      category: "Kyorugi",
      weightCategory: "Under 46 KG",
      athleteId: "TKD-IND-050",
      currentStatus: "PASSED",
      currentWeight: 45.2,
      attempts: [
        {
          attemptNumber: 1,
          weight: 45.2,
          status: "PASSED",
          notes: "Official weight verified.",
          weighedAt: new Date(Date.now() - 70 * 60 * 1000),
        },
      ],
      auditLogs: [
        {
          action: "WEIGH_IN_DECISION",
          previousStatus: "PENDING",
          newStatus: "PASSED",
          weight: 45.2,
          details: "Attempt 1 recorded as PASSED.",
        },
      ],
    },
    {
      lotNumber: "051",
      athleteName: "Sneha Roy",
      academyName: "Lion Heart TKD",
      gender: "FEMALE",
      division: "Senior",
      ageGroup: "18+",
      category: "Kyorugi",
      weightCategory: "Under 46 KG",
      athleteId: "TKD-IND-051",
      currentStatus: "PASSED",
      currentWeight: 45.8,
      attempts: [
        {
          attemptNumber: 1,
          weight: 45.8,
          status: "PASSED",
          notes: "Official weight verified.",
          weighedAt: new Date(Date.now() - 40 * 60 * 1000),
        },
      ],
      auditLogs: [
        {
          action: "WEIGH_IN_DECISION",
          previousStatus: "PENDING",
          newStatus: "PASSED",
          weight: 45.8,
          details: "Attempt 1 recorded as PASSED.",
        },
      ],
    },
    {
      lotNumber: "052",
      athleteName: "Ananya Deshmukh",
      academyName: "Eagle Taekwondo Institute",
      gender: "FEMALE",
      division: "Senior",
      ageGroup: "18+",
      category: "Kyorugi",
      weightCategory: "Under 46 KG",
      athleteId: "TKD-IND-052",
      currentStatus: "PENDING",
      currentWeight: null,
      attempts: [],
      auditLogs: [],
    },

    // --- JUNIOR BOYS KYORUGI UNDER 48 KG ---
    {
      lotNumber: "070",
      athleteName: "Kabir Mehta",
      academyName: "Rising Sun Taekwondo",
      gender: "MALE",
      division: "Junior",
      ageGroup: "15-17",
      category: "Kyorugi",
      weightCategory: "Under 48 KG",
      athleteId: "TKD-IND-070",
      currentStatus: "PASSED",
      currentWeight: 47.4,
      attempts: [
        {
          attemptNumber: 1,
          weight: 47.4,
          status: "PASSED",
          notes: "Official weight verified.",
          weighedAt: new Date(Date.now() - 25 * 60 * 1000),
        },
      ],
      auditLogs: [
        {
          action: "WEIGH_IN_DECISION",
          previousStatus: "PENDING",
          newStatus: "PASSED",
          weight: 47.4,
          details: "Attempt 1 recorded as PASSED.",
        },
      ],
    },
    {
      lotNumber: "071",
      athleteName: "Aryan Khan",
      academyName: "Tiger Claw Dojang",
      gender: "MALE",
      division: "Junior",
      ageGroup: "15-17",
      category: "Kyorugi",
      weightCategory: "Under 48 KG",
      athleteId: "TKD-IND-071",
      currentStatus: "PENDING",
      currentWeight: null,
      attempts: [],
      auditLogs: [],
    },
  ];

  for (const item of seedParticipants) {
    const { attempts, auditLogs, ...participantData } = item;

    const created = await prisma.participant.create({
      data: participantData,
    });

    for (const attempt of attempts) {
      await prisma.weighInAttempt.create({
        data: {
          ...attempt,
          participantId: created.id,
          operatorId: "OP-01",
        },
      });
    }

    for (const log of auditLogs) {
      await prisma.auditLog.create({
        data: {
          ...log,
          participantId: created.id,
          operatorId: "OP-01",
        },
      });
    }
  }

  const count = await prisma.participant.count();
  console.log(`Successfully seeded ${count} participants across multiple categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
