import { defineQuery } from "groq";
import type { ACTIVE_DAILY_PROMPTS_QUERY_RESULT } from "../../sanity/sanity.types";
import { sanityClient } from "./client";

// GROQ Queries - defined as module-level constants for Sanity typegen
export const ACTIVE_DAILY_PROMPTS_QUERY = defineQuery(`*[
  _type == "dailyPrompt" 
  && isActive == true
] | order(weight desc) {
  _id,
  title,
  prompt,
  emoji,
  category->{
    title,
    color
  },
  suggestedMood,
  isActive,
  weight,
  tags,
  createdAt
}`);

/**
 * Fetch all active daily prompts
 */
export const fetchActiveDailyPrompts =
  async (): Promise<ACTIVE_DAILY_PROMPTS_QUERY_RESULT> => {
    try {
      const prompts = await sanityClient.fetch(ACTIVE_DAILY_PROMPTS_QUERY);
      return prompts;
    } catch (error) {
      console.error("Error fetching daily prompts:", error);
      throw error;
    }
  };

/**
 * Get multiple random daily prompts without repeating
 * @param count Number of prompts to fetch
 */
export const getRandomDailyPrompts = async (
  count: number = 3
): Promise<ACTIVE_DAILY_PROMPTS_QUERY_RESULT> => {
  try {
    const allPrompts = await fetchActiveDailyPrompts();

    if (allPrompts.length === 0) {
      return [];
    }

    // Shuffle array using Fisher-Yates algorithm with weights
    const selectedPrompts: ACTIVE_DAILY_PROMPTS_QUERY_RESULT = [];
    const availablePrompts = [...allPrompts];

    for (let i = 0; i < Math.min(count, availablePrompts.length); i++) {
      const totalWeight = availablePrompts.reduce(
        (sum, prompt) => sum + (prompt.weight ?? 1),
        0
      );
      let random = Math.random() * totalWeight;

      let selectedIndex = 0;
      for (let j = 0; j < availablePrompts.length; j++) {
        random -= availablePrompts[j].weight ?? 1;
        if (random <= 0) {
          selectedIndex = j;
          break;
        }
      }

      selectedPrompts.push(availablePrompts[selectedIndex]);
      availablePrompts.splice(selectedIndex, 1);
    }

    return selectedPrompts;
  } catch (error) {
    console.error("Error getting random daily prompts:", error);
    throw error;
  }
};