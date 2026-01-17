import { defineQuery } from "groq";
import type {
  JOURNAL_ENTRY_BY_ID_QUERY_RESULT,
  USER_JOURNAL_ENTRIES_QUERY_RESULT,
  USER_JOURNAL_ENTRIES_WITH_DATE_RANGE_QUERY_RESULT,
} from "../../sanity/sanity.types";
import { categorizeJournalEntry } from "../utils/categorize";
import { sanityClient } from "./client";
import { uploadImageToSanity } from "./images";

interface JournalEntryInput {
  title?: string;
  content: string;
  images: { uri: string; caption?: string; alt?: string }[];
  mood: string;
  userId: string;
}

// GROQ Queries - defined as module-level constants for Sanity typegen
export const USER_JOURNAL_ENTRIES_QUERY = defineQuery(`*[
  _type == "journalEntry" 
  && userId == $userId
] | order(createdAt desc) {
  _id,
  title,
  content,
  mood,
  createdAt,
  aiGeneratedCategory->{
    title,
    color
  }
}`);

export const JOURNAL_ENTRY_BY_ID_QUERY = defineQuery(`*[
  _type == "journalEntry" 
  && _id == $entryId
][0]{
  _id,
  title,
  content,
  mood,
  createdAt,
  userId,
  aiGeneratedCategory->{
    title,
    color
  }
}`);

export const USER_JOURNAL_ENTRIES_WITH_DATE_RANGE_QUERY = defineQuery(`*[
  _type == "journalEntry" 
  && userId == $userId
  && createdAt >= $startDate
  && createdAt <= $endDate
] | order(createdAt desc) {
  _id,
  title,
  content,
  mood,
  createdAt,
  aiGeneratedCategory->{
    title,
    color
  }
}`);

// Helper function to create journal entry in Sanity
export const createJournalEntry = async (entry: JournalEntryInput) => {
  try {
    console.log("Creating journal entry with auto-categorization...");

    // Step 1: Categorize the entry using AI
    let categoryId: string | undefined;
    try {
      const categorization = await categorizeJournalEntry(
        entry.title,
        entry.content,
        entry.userId
      );
      categoryId = categorization.categoryId;
      console.log(
        `Entry categorized as: ${categorization.categoryTitle} (${categorization.action})`
      );
      console.log(`Reasoning: ${categorization.reasoning}`);
    } catch (categorizationError) {
      console.error(
        "Categorization failed, continuing without category:",
        categorizationError
      );
      // Continue without category if categorization fails
    }

    // Step 2: Upload all images
    const uploadedImages = await Promise.all(
      entry.images.map(async (img) => {
        const asset = await uploadImageToSanity(img.uri);
        return {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: asset._id,
          },
          alt: img.alt || "Journal entry image",
          caption: img.caption || "",
        };
      })
    );

    // Step 3: Create content blocks - mix text and images
    const contentBlocks = [
      {
        _type: "block",
        _key: "content-block",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "content-span",
            text: entry.content,
            marks: [],
          },
        ],
        markDefs: [],
      },
      ...uploadedImages.map((img, index) => ({
        ...img,
        _key: `image-${index}`,
      })),
    ];

    // Step 4: Create the journal entry document with category
    const journalEntry = {
      _type: "journalEntry" as const,
      title: entry.title,
      content: contentBlocks,
      mood: entry.mood,
      userId: entry.userId,
      createdAt: new Date().toISOString(),
      ...(categoryId && {
        aiGeneratedCategory: {
          _type: "reference" as const,
          _ref: categoryId,
        },
      }),
    };

    // Step 5: Save to Sanity
    const result = await sanityClient.create(journalEntry);
    console.log("Journal entry created successfully with ID:", result._id);
    return result;
  } catch (error) {
    console.error("Error creating journal entry:", error);
    throw error;
  }
};

// Helper function to fetch user's journal entries
export const fetchJournalEntries = async (
  userId: string
): Promise<USER_JOURNAL_ENTRIES_QUERY_RESULT> => {
  try {
    const entries = await sanityClient.fetch(USER_JOURNAL_ENTRIES_QUERY, {
      userId,
    });
    return entries;
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    throw error;
  }
};

// Helper function to update journal entry
export const updateJournalEntry = async (
  entryId: string,
  updates: Partial<JournalEntryInput>
) => {
  try {
    console.log("Updating journal entry with auto-categorization...");

    // Step 1: Re-categorize if content or title is being updated
    let categoryId: string | undefined;
    if (updates.content || updates.title) {
      try {
        // Get the current entry to access userId and combine with updates
        const currentEntry = await sanityClient.fetch(
          JOURNAL_ENTRY_BY_ID_QUERY,
          { entryId }
        );

        if (currentEntry && currentEntry.userId) {
          const categorization = await categorizeJournalEntry(
            updates.title !== undefined
              ? updates.title
              : currentEntry.title ?? undefined,
            updates.content || "", // If content is being updated, use new content
            currentEntry.userId
          );
          categoryId = categorization.categoryId;
          console.log(
            `Entry re-categorized as: ${categorization.categoryTitle} (${categorization.action})`
          );
          console.log(`Reasoning: ${categorization.reasoning}`);
        }
      } catch (categorizationError) {
        console.error(
          "Re-categorization failed, continuing without updating category:",
          categorizationError
        );
        // Continue without updating category if categorization fails
      }
    }

    // Step 2: Prepare update data
    const updateData = {
      ...updates,
      ...(updates.content && {
        content: [
          {
            _type: "block" as const,
            _key: "updated-content-block",
            style: "normal" as const,
            children: [
              {
                _type: "span" as const,
                _key: "updated-content-span",
                text: updates.content,
                marks: [],
              },
            ],
            markDefs: [],
          },
        ],
      }),
      ...(categoryId && {
        aiGeneratedCategory: {
          _type: "reference" as const,
          _ref: categoryId,
        },
      }),
    };

    // Step 3: Update the entry
    const result = await sanityClient.patch(entryId).set(updateData).commit();
    console.log("Journal entry updated successfully");
    return result;
  } catch (error) {
    console.error("Error updating journal entry:", error);
    throw error;
  }
};

// Helper function to delete journal entry
export const deleteJournalEntry = async (entryId: string) => {
  try {
    const result = await sanityClient.delete(entryId);
    return result;
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    throw error;
  }
};

// Helper function to get journal entry by ID
export const getJournalEntryById = async (
  entryId: string
): Promise<JOURNAL_ENTRY_BY_ID_QUERY_RESULT> => {
  try {
    const entry = await sanityClient.fetch(JOURNAL_ENTRY_BY_ID_QUERY, {
      entryId,
    });
    return entry;
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    throw error;
  }
};

// Helper function to fetch journal entries with date range
export const fetchJournalEntriesWithDateRange = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<USER_JOURNAL_ENTRIES_WITH_DATE_RANGE_QUERY_RESULT> => {
  try {
    const entries = await sanityClient.fetch(
      USER_JOURNAL_ENTRIES_WITH_DATE_RANGE_QUERY,
      {
        userId,
        startDate,
        endDate,
      }
    );
    return entries;
  } catch (error) {
    console.error("Error fetching journal entries with date range:", error);
    throw error;
  }
};