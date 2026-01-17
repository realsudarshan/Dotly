/**
 * Date formatting utilities for consistent date display across the app
 */

/**
 * Format date as full date with weekday
 * Example: "Monday, January 1, 2024"
 */
export const formatLongDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format date as uppercase weekday and date
 * Example: "MONDAY JANUARY 1, 2024"
 */
export const formatUppercaseDate = (date: Date | string): string => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();
  const dateStr = dateObj.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${dayOfWeek} ${dateStr}`;
};

/**
 * Format time only
 * Example: "2:30 PM"
 */
export const formatTime = (date: Date | string): string => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get current greeting based on time of day
 */
export const getTimeOfDayGreeting = (hour?: number): string => {
  const currentHour = hour ?? new Date().getHours();

  if (currentHour < 12) return "Good Morning";
  if (currentHour < 17) return "Good Afternoon";
  return "Good Evening";
};