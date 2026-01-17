import { generateAPIUrl } from "@/lib/utils/generateAPIUrl";

interface CategorizeResponse {
  categoryId: string;
  reasoning: string;
  action: "existing" | "new";
  categoryTitle: string;
}

/**
 * Calls the AI categorization API to automatically categorize a journal entry
 * @param title - Optional title of the journal entry
 * @param content - Content of the journal entry
 * @param userId - User ID for authentication
 * @returns Category ID and categorization details
 */
export async function categorizeJournalEntry(
  title: string | undefined,
  content: string,
  userId: string
): Promise<CategorizeResponse> {
  try {
    const response = await fetch(generateAPIUrl("/api/categorize"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
        userId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Categorization failed: ${response.status} ${errorText}`);
    }

    const result: CategorizeResponse = await response.json();
    console.log("Categorization result:", result);

    return result;
  } catch (error) {
    console.error("Error calling categorization API:", error);
    throw error;
  }
}
