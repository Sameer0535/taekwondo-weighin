import { Participant, CategorySummary } from "@/types";

/**
 * Builds a deterministic, URL-safe category identifier from category attributes
 */
export function buildCategoryId(
  gender: string,
  division: string,
  ageGroup: string,
  category: string,
  weightCategory: string
): string {
  return [gender, division, ageGroup, category, weightCategory]
    .map((s) => encodeURIComponent(s.trim()))
    .join("::");
}

/**
 * Decodes a category identifier back into its individual components
 */
export function parseCategoryId(categoryId: string): {
  gender: string;
  division: string;
  ageGroup: string;
  category: string;
  weightCategory: string;
} {
  const parts = categoryId.split("::").map((s) => decodeURIComponent(s));
  return {
    gender: parts[0] || "",
    division: parts[1] || "",
    ageGroup: parts[2] || "",
    category: parts[3] || "",
    weightCategory: parts[4] || "",
  };
}

/**
 * Formats a clean, professional sports title for a category
 * e.g. "Senior Men Kyorugi Under 54 KG"
 */
export function formatCategoryTitle(
  gender: string,
  division: string,
  ageGroup: string,
  category: string,
  weightCategory: string
): string {
  const genderLabel =
    gender.toUpperCase() === "MALE"
      ? division.toLowerCase().includes("senior")
        ? "Men"
        : "Boys"
      : division.toLowerCase().includes("senior")
      ? "Women"
      : "Girls";

  return `${division.toUpperCase()} ${genderLabel.toUpperCase()} ${category.toUpperCase()} ${weightCategory.toUpperCase()}`;
}

/**
 * Dynamically organizes any list of participants into segregated category groups
 * with exact real-time status counts and progress rates
 */
export function groupParticipantsByCategory(participants: Participant[]): CategorySummary[] {
  const categoryMap = new Map<string, CategorySummary>();

  for (const p of participants) {
    const catId = buildCategoryId(
      p.gender,
      p.division,
      p.ageGroup,
      p.category,
      p.weightCategory
    );

    let cat = categoryMap.get(catId);
    if (!cat) {
      cat = {
        id: catId,
        gender: p.gender,
        division: p.division,
        ageGroup: p.ageGroup,
        category: p.category,
        weightCategory: p.weightCategory,
        label: formatCategoryTitle(
          p.gender,
          p.division,
          p.ageGroup,
          p.category,
          p.weightCategory
        ),
        total: 0,
        passed: 0,
        pending: 0,
        hold: 0,
        rejected: 0,
        completionRate: 0,
      };
      categoryMap.set(catId, cat);
    }

    cat.total += 1;
    if (p.currentStatus === "PASSED") cat.passed += 1;
    else if (p.currentStatus === "HOLD") cat.hold += 1;
    else if (p.currentStatus === "REJECTED") cat.rejected += 1;
    else cat.pending += 1;
  }

  const summaries = Array.from(categoryMap.values()).map((c) => {
    // Resolved athletes are those who are PASSED or REJECTED. (Or completed attempts)
    const resolved = c.passed + c.rejected;
    c.completionRate = c.total > 0 ? Math.round((resolved / c.total) * 100) : 0;
    return c;
  });

  // Sort logically: Division -> Gender -> Weight
  return summaries.sort((a, b) => a.label.localeCompare(b.label));
}
