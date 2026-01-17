// Minimal type for streak calculations - only needs _id and createdAt
type JournalEntry = {
  _id: string;
  createdAt: string;
};

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string | null;
  streakDates: string[];
}

/**
 * Converts date to YYYY-MM-DD format
 */
const toDateString = (date: Date | string): string =>
  new Date(date).toISOString().split("T")[0];

/**
 * Gets unique entry dates sorted newest first
 */
const getUniqueDates = (entries: JournalEntry[]): string[] =>
  [...new Set(entries.map((entry) => toDateString(entry.createdAt)))].sort(
    (a, b) => b.localeCompare(a)
  );

/**
 * Creates date object and moves it by specified days
 */
const addDays = (date: string, days: number): string => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return toDateString(newDate);
};

/**
 * Calculates days between two dates
 */
const daysBetween = (date1: string, date2: string): number =>
  Math.floor(
    (new Date(date1).getTime() - new Date(date2).getTime()) /
      (1000 * 60 * 60 * 24)
  );

/**
 * Calculates current streak starting from today or yesterday
 */
const calculateCurrentStreak = (
  entryDates: string[]
): { streak: number; dates: string[] } => {
  const today = toDateString(new Date());
  const yesterday = addDays(today, -1);

  const hasEntryToday = entryDates.includes(today);
  const startDate = hasEntryToday ? today : yesterday;

  // Generate consecutive dates backwards from start date
  const generateConsecutiveDates = (start: string): string[] =>
    Array.from({ length: entryDates.length }, (_, i) => addDays(start, -i));

  const consecutiveDates = generateConsecutiveDates(startDate);
  const streakDates = consecutiveDates.filter((date) =>
    entryDates.includes(date)
  );

  // Find where the streak breaks
  const streakEndIndex = consecutiveDates.findIndex(
    (date) => !entryDates.includes(date)
  );
  const streak = streakEndIndex === -1 ? streakDates.length : streakEndIndex;

  return {
    streak,
    dates: streakDates.slice(0, streak).reverse(),
  };
};

/**
 * Finds the longest consecutive streak in the data
 */
const findLongestStreak = (entryDates: string[]): number => {
  if (!entryDates.length) return 0;

  // Create pairs of consecutive dates with their day differences
  const datePairs = entryDates.slice(1).map((date, i) => ({
    date,
    prevDate: entryDates[i],
    isConsecutive: daysBetween(entryDates[i], date) === 1,
  }));

  // Group consecutive dates into streaks
  const streaks = datePairs.reduce(
    (acc, { isConsecutive }, index) => {
      if (isConsecutive) {
        acc[acc.length - 1] = (acc[acc.length - 1] || 1) + 1;
      } else {
        acc.push(1);
      }
      return acc;
    },
    [1] as number[]
  );

  return Math.max(...streaks);
};

/**
 * Calculates user's journaling streak statistics
 */
export const calculateStreaks = (entries: JournalEntry[]): StreakData => {
  if (!entries?.length) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastEntryDate: null,
      streakDates: [],
    };
  }

  const entryDates = getUniqueDates(entries);
  const { streak: currentStreak, dates: streakDates } =
    calculateCurrentStreak(entryDates);
  const longestStreak = findLongestStreak(entryDates);

  return {
    currentStreak,
    longestStreak,
    lastEntryDate: entryDates[0] ?? null,
    streakDates,
  };
};

/**
 * Checks if the user's current streak is active (entry today or yesterday)
 */
export const isStreakActive = (entries: JournalEntry[]): boolean => {
  if (!entries?.length) return false;

  const today = toDateString(new Date());
  const yesterday = addDays(today, -1);
  const entryDates = entries.map((entry) => toDateString(entry.createdAt));

  return entryDates.includes(today) || entryDates.includes(yesterday);
};

/**
 * Gets streak status message for display
 */
export const getStreakStatusMessage = ({
  currentStreak,
  lastEntryDate,
}: StreakData): string => {
  if (currentStreak === 0) {
    return "Start your journaling streak today! ✨";
  }

  const hasEntryToday = lastEntryDate === toDateString(new Date());

  const messages = {
    1: hasEntryToday
      ? "Great start! Keep it going tomorrow! 🔥"
      : "1 day streak - write today to continue! 💪",
    default: hasEntryToday
      ? `Amazing! ${currentStreak} day streak! 🔥`
      : `${currentStreak} day streak - write today to continue! 🔥`,
  };

  return messages[currentStreak as keyof typeof messages] ?? messages.default;
};

/**
 * Calculates days until next milestone
 */
export const getDaysUntilNextMilestone = (
  currentStreak: number
): {
  daysUntil: number;
  milestone: number;
} => {
  const milestones = [5, 10, 25, 50, 100, 200, 365, 500, 1000];

  const nextMilestone =
    milestones.find((milestone) => currentStreak < milestone) ??
    Math.ceil(currentStreak / 100) * 100;

  return {
    daysUntil: nextMilestone - currentStreak,
    milestone: nextMilestone,
  };
};
