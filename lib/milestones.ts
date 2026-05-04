export interface OwlMilestone {
  threshold: number;
  name: string;
  title: string;
  message: string;
  emoji: string;
}

export const OWL_MILESTONES: readonly OwlMilestone[] = [
  {
    threshold: 5,
    name: "Owlet",
    title: "You're hatching!",
    message: "Five days in. The nest is getting warm. 🌴",
    emoji: "🐣",
  },
  {
    threshold: 10,
    name: "Fledgling",
    title: "Spreading your wings",
    message: "You just earned your wings. Boca Raton is calling 🌴",
    emoji: "🐥",
  },
  {
    threshold: 20,
    name: "Soaring Owl",
    title: "Halfway to Boca",
    message: "20 days of flight. FAU can see you coming. 🦉",
    emoji: "🦅",
  },
  {
    threshold: 30,
    name: "Wise Owl",
    title: "Almost there",
    message: "Wisdom earned. 11 days to go. Owlsley is proud. 🎓",
    emoji: "🦉",
  },
  {
    threshold: 41,
    name: "Full Owl",
    title: "FAU bound!",
    message: "You did it. 41 days. See you at FAU. 🦉🎓",
    emoji: "🦉🎓",
  },
];

/**
 * Returns the highest milestone whose threshold is ≤ completedDays,
 * or undefined if completedDays < 5 (the lowest threshold).
 */
export function getCurrentMilestone(
  completedDays: number,
): OwlMilestone | undefined {
  let current: OwlMilestone | undefined;
  for (const milestone of OWL_MILESTONES) {
    if (milestone.threshold <= completedDays) {
      current = milestone;
    }
  }
  return current;
}

/**
 * Returns the lowest milestone whose threshold is > completedDays,
 * or undefined if completedDays ≥ 41 (the highest threshold).
 */
export function getNextMilestone(
  completedDays: number,
): OwlMilestone | undefined {
  for (const milestone of OWL_MILESTONES) {
    if (milestone.threshold > completedDays) {
      return milestone;
    }
  }
  return undefined;
}

/**
 * Returns the highest milestone crossed when going from previousCount
 * to newCount, or undefined if no milestone threshold falls in
 * (previousCount, newCount].
 */
export function checkMilestoneCrossed(
  previousCount: number,
  newCount: number,
): OwlMilestone | undefined {
  let crossed: OwlMilestone | undefined;
  for (const milestone of OWL_MILESTONES) {
    if (milestone.threshold > previousCount && milestone.threshold <= newCount) {
      crossed = milestone;
    }
  }
  return crossed;
}
