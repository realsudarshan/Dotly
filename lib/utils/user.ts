import type { UserResource } from "@clerk/types";

/**
 * Get user's display name with fallback chain
 * Priority: Full Name > First Name > Username > "User"
 */
export const getUserDisplayName = (
  user: UserResource | null | undefined
): string => {
  if (!user) return "User";

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || user.username || "User";
};

/**
 * Get user's first name or friendly fallback
 * Priority: First Name > Username > "there"
 */
export const getUserFirstName = (
  user: UserResource | null | undefined
): string => {
  if (!user) return "there";
  return user.firstName ?? user.username ?? "there";
};

/**
 * Get user's initials for avatar display
 * Uses first letter of firstName and lastName, defaults to "U"
 */
export const getUserInitials = (
  user: UserResource | null | undefined
): string => {
  if (!user) return "U";

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return initials || "U";
};
