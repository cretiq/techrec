import { InternalProfile, InternalSkill } from "@/types/types";

/**
 * Rank skill levels so we can sort them (higher is better).
 */
const levelRank: Record<string, number> = {
  EXPERT: 3,
  ADVANCED: 2,
  INTERMEDIATE: 1,
  BEGINNER: 0,
};

/**
 * Picks up to `max` core skills from the developer profile ordered by proficiency.
 */
export const pickCoreSkills = (skills: InternalSkill[], max = 5): string[] => {
  return [...skills]
    .sort((a, b) => (levelRank[b.level as string] ?? 0) - (levelRank[a.level as string] ?? 0))
    .slice(0, max)
    .map((s) => s.name);
};

/**
 * Returns up to `max` unique keywords (requirements / skills) for ATS optimisation.
 */
export const rankRoleKeywords = (
  roleInfo: { requirements?: string[]; skills?: string[] },
  max = 4,
): string[] => {
  const set = new Set<string>();
  roleInfo.requirements?.forEach((r) => set.add(r));
  roleInfo.skills?.forEach((s) => set.add(s));
  return Array.from(set).slice(0, max);
};

/**
 * If the user did not supply achievements, attempt to extract up to `max` quantified achievements
 * from the profile's existing achievements or experience entries.
 */
export const deriveAchievements = (
  profile: InternalProfile,
  supplied: string[] | undefined,
  max = 3,
): string[] => {
  if (supplied && supplied.length) return supplied.slice(0, max);

  const results: string[] = [];

  // First look at explicit profile achievements
  profile.achievements?.forEach((ach) => {
    if (results.length >= max) return;
    if (/\d/.test(ach.description)) {
      results.push(ach.description);
    }
  });

  // Fallback to experience achievements / responsibilities
  if (results.length < max) {
    profile.experience?.forEach((exp) => {
      if (results.length >= max) return;
      exp.achievements?.forEach((a) => {
        if (results.length < max && /\d/.test(a)) {
          results.push(a);
        }
      });
    });
  }

  return results.slice(0, max);
}; 