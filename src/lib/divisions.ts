export interface DivisionConfig {
  id: string;
  name: string; // Sub-Junior, Cadet, Junior, Senior, Dasara
  label: string; // e.g. "Senior (18+)", "Dasara"
  ageGroup: string; // e.g. "18+", "Open"
  weightCategories: {
    MALE: { label: string; minKg?: number; maxKg?: number }[];
    FEMALE: { label: string; minKg?: number; maxKg?: number }[];
  };
}

export const DIVISIONS: DivisionConfig[] = [
  {
    id: "sub-junior",
    name: "Sub-Junior",
    label: "Sub-Junior (Under 12)",
    ageGroup: "Under 12",
    weightCategories: {
      MALE: [
        { label: "Under 18kg", maxKg: 18 },
        { label: "Under 21kg", minKg: 18, maxKg: 21 },
        { label: "Under 23kg", minKg: 21, maxKg: 23 },
        { label: "Under 25kg", minKg: 23, maxKg: 25 },
        { label: "Under 27kg", minKg: 25, maxKg: 27 },
        { label: "Under 29kg", minKg: 27, maxKg: 29 },
        { label: "Under 32kg", minKg: 29, maxKg: 32 },
        { label: "Under 35kg", minKg: 32, maxKg: 35 },
        { label: "Under 38kg", minKg: 35, maxKg: 38 },
        { label: "Over 38kg", minKg: 38 },
      ],
      FEMALE: [
        { label: "Under 18kg", maxKg: 18 },
        { label: "Under 20kg", minKg: 18, maxKg: 20 },
        { label: "Under 22kg", minKg: 20, maxKg: 22 },
        { label: "Under 24kg", minKg: 22, maxKg: 24 },
        { label: "Under 26kg", minKg: 24, maxKg: 26 },
        { label: "Under 29kg", minKg: 26, maxKg: 29 },
        { label: "Under 32kg", minKg: 29, maxKg: 32 },
        { label: "Under 35kg", minKg: 32, maxKg: 35 },
        { label: "Over 35kg", minKg: 35 },
      ],
    },
  },
  {
    id: "cadet",
    name: "Cadet",
    label: "Cadet (12-14)",
    ageGroup: "12-14",
    weightCategories: {
      MALE: [
        { label: "Under 33kg", maxKg: 33 },
        { label: "Under 37kg", minKg: 33, maxKg: 37 },
        { label: "Under 41kg", minKg: 37, maxKg: 41 },
        { label: "Under 45kg", minKg: 41, maxKg: 45 },
        { label: "Under 49kg", minKg: 45, maxKg: 49 },
        { label: "Under 53kg", minKg: 49, maxKg: 53 },
        { label: "Under 57kg", minKg: 53, maxKg: 57 },
        { label: "Under 61kg", minKg: 57, maxKg: 61 },
        { label: "Under 65kg", minKg: 61, maxKg: 65 },
        { label: "Over 65kg", minKg: 65 },
      ],
      FEMALE: [
        { label: "Under 29kg", maxKg: 29 },
        { label: "Under 33kg", minKg: 29, maxKg: 33 },
        { label: "Under 37kg", minKg: 33, maxKg: 37 },
        { label: "Under 41kg", minKg: 37, maxKg: 41 },
        { label: "Under 44kg", minKg: 41, maxKg: 44 },
        { label: "Under 47kg", minKg: 44, maxKg: 47 },
        { label: "Under 51kg", minKg: 47, maxKg: 51 },
        { label: "Under 55kg", minKg: 51, maxKg: 55 },
        { label: "Under 59kg", minKg: 55, maxKg: 59 },
        { label: "Over 59kg", minKg: 59 },
      ],
    },
  },
  {
    id: "junior",
    name: "Junior",
    label: "Junior (15-17)",
    ageGroup: "15-17",
    weightCategories: {
      MALE: [
        { label: "Under 45kg", maxKg: 45 },
        { label: "Under 48kg", minKg: 45, maxKg: 48 },
        { label: "Under 51kg", minKg: 48, maxKg: 51 },
        { label: "Under 55kg", minKg: 51, maxKg: 55 },
        { label: "Under 59kg", minKg: 55, maxKg: 59 },
        { label: "Under 63kg", minKg: 59, maxKg: 63 },
        { label: "Under 68kg", minKg: 63, maxKg: 68 },
        { label: "Under 73kg", minKg: 68, maxKg: 73 },
        { label: "Under 78kg", minKg: 73, maxKg: 78 },
        { label: "Over 78kg", minKg: 78 },
      ],
      FEMALE: [
        { label: "Under 42kg", maxKg: 42 },
        { label: "Under 44kg", minKg: 42, maxKg: 44 },
        { label: "Under 46kg", minKg: 44, maxKg: 46 },
        { label: "Under 49kg", minKg: 46, maxKg: 49 },
        { label: "Under 52kg", minKg: 49, maxKg: 52 },
        { label: "Under 55kg", minKg: 52, maxKg: 55 },
        { label: "Under 59kg", minKg: 55, maxKg: 59 },
        { label: "Under 63kg", minKg: 59, maxKg: 63 },
        { label: "Under 68kg", minKg: 63, maxKg: 68 },
        { label: "Over 68kg", minKg: 68 },
      ],
    },
  },
  {
    id: "senior",
    name: "Senior",
    label: "Senior (18+)",
    ageGroup: "18+",
    weightCategories: {
      MALE: [
        { label: "Under 54kg", maxKg: 54 },
        { label: "Under 58kg", minKg: 54, maxKg: 58 },
        { label: "Under 63kg", minKg: 58, maxKg: 63 },
        { label: "Under 68kg", minKg: 63, maxKg: 68 },
        { label: "Under 74kg", minKg: 68, maxKg: 74 },
        { label: "Under 80kg", minKg: 74, maxKg: 80 },
        { label: "Under 87kg", minKg: 80, maxKg: 87 },
        { label: "Over 87kg", minKg: 87 },
      ],
      FEMALE: [
        { label: "Under 46kg", maxKg: 46 },
        { label: "Under 49kg", minKg: 46, maxKg: 49 },
        { label: "Under 53kg", minKg: 49, maxKg: 53 },
        { label: "Under 57kg", minKg: 53, maxKg: 57 },
        { label: "Under 62kg", minKg: 57, maxKg: 62 },
        { label: "Under 67kg", minKg: 62, maxKg: 67 },
        { label: "Under 73kg", minKg: 67, maxKg: 73 },
        { label: "Over 73kg", minKg: 73 },
      ],
    },
  },
  {
    id: "dasara",
    name: "Dasara",
    label: "Dasara",
    ageGroup: "Open",
    weightCategories: {
      MALE: [
        { label: "Under 45kg", maxKg: 45 },
        { label: "Under 50kg", minKg: 45, maxKg: 50 },
        { label: "Under 56kg", minKg: 50, maxKg: 56 },
        { label: "Under 62kg", minKg: 56, maxKg: 62 },
        { label: "Under 69kg", minKg: 62, maxKg: 69 },
        { label: "Under 76kg", minKg: 69, maxKg: 76 },
        { label: "Under 82kg", minKg: 76, maxKg: 82 },
        { label: "Above 82kg", minKg: 82 },
      ],
      FEMALE: [
        { label: "Under 42kg", maxKg: 42 },
        { label: "Under 46kg", minKg: 42, maxKg: 46 },
        { label: "Under 50kg", minKg: 46, maxKg: 50 },
        { label: "Under 55kg", minKg: 50, maxKg: 55 },
        { label: "Under 60kg", minKg: 55, maxKg: 60 },
        { label: "Under 65kg", minKg: 60, maxKg: 65 },
        { label: "Under 70kg", minKg: 65, maxKg: 70 },
        { label: "Above 70kg", minKg: 70 },
      ],
    },
  },
];

export const COUNTRIES = [
  { code: "IND", name: "India (IND)" },
  { code: "KOR", name: "South Korea (KOR)" },
  { code: "USA", name: "United States (USA)" },
  { code: "GBR", name: "Great Britain (GBR)" },
  { code: "ESP", name: "Spain (ESP)" },
  { code: "TUR", name: "Turkey (TUR)" },
  { code: "IRI", name: "Iran (IRI)" },
  { code: "FRA", name: "France (FRA)" },
  { code: "ITA", name: "Italy (ITA)" },
  { code: "THA", name: "Thailand (THA)" },
  { code: "MEX", name: "Mexico (MEX)" },
  { code: "BRA", name: "Brazil (BRA)" },
  { code: "CHN", name: "China (CHN)" },
  { code: "TPE", name: "Chinese Taipei (TPE)" },
  { code: "UZB", name: "Uzbekistan (UZB)" },
  { code: "CRO", name: "Croatia (CRO)" },
];

export function getDivisionById(divisionIdOrName: string): DivisionConfig {
  if (!divisionIdOrName) return DIVISIONS[3]; // default to Senior
  const term = divisionIdOrName.trim().toLowerCase();

  // 1. Exact ID match (e.g. "junior", "sub-junior", "cadet", "senior", "dasara")
  const byId = DIVISIONS.find((d) => d.id.toLowerCase() === term);
  if (byId) return byId;

  // 2. Exact Name match
  const byName = DIVISIONS.find((d) => d.name.toLowerCase() === term);
  if (byName) return byName;

  // 3. Exact Label match
  const byLabel = DIVISIONS.find((d) => d.label.toLowerCase() === term);
  if (byLabel) return byLabel;

  // 4. Safe substring check: check "sub" and "dasara" BEFORE "junior" to avoid accidental collision!
  if (term.includes("dasara")) {
    return DIVISIONS[4]; // Dasara
  }
  if (term.includes("sub")) {
    return DIVISIONS[0]; // Sub-Junior
  }
  if (term.includes("cadet")) {
    return DIVISIONS[1]; // Cadet
  }
  if (term.includes("junior")) {
    return DIVISIONS[2]; // Junior
  }
  if (term.includes("senior")) {
    return DIVISIONS[3]; // Senior
  }

  return DIVISIONS[3]; // default to Senior
}

export function getWeightCategories(
  divisionIdOrName: string,
  gender: string
): { label: string; minKg?: number; maxKg?: number }[] {
  const div = getDivisionById(divisionIdOrName);
  const g = gender.toUpperCase() === "FEMALE" ? "FEMALE" : "MALE";
  return div.weightCategories[g];
}

export function getDivisionSortRank(divisionIdOrName: string): number {
  const div = getDivisionById(divisionIdOrName);
  const idx = DIVISIONS.findIndex((d) => d.id === div.id);
  return idx !== -1 ? idx : 999;
}

export function getWeightSortRank(
  divisionIdOrName: string,
  gender: string,
  weightCategory: string
): number {
  const div = getDivisionById(divisionIdOrName);
  const g = gender.toUpperCase() === "FEMALE" ? "FEMALE" : "MALE";
  const categories = div.weightCategories[g] || [];

  const normTarget = weightCategory.toLowerCase().replace(/\s+/g, "");
  const idx = categories.findIndex(
    (c) => c.label.toLowerCase().replace(/\s+/g, "") === normTarget
  );
  if (idx !== -1) return idx;

  // Fallback to numeric value extracted from string (e.g. 45 from "Under 45kg")
  const numMatch = weightCategory.match(/\d+(\.\d+)?/);
  return numMatch ? parseFloat(numMatch[0]) : 999;
}

