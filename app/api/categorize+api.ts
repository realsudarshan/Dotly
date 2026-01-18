import { createCategory, fetchCategories } from "@/lib/sanity/categories";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const openrouter = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { title, content, userId } = await req.json();

        if (!userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        if (!content) {
            return new Response("Content is required", { status: 400 });
        }

        console.log("Categorizing entry:", {
            title,
            contentLength: content.length,
        });

        // Fetch all existing categories
        const existingCategories = await fetchCategories();
        console.log(
            `Found ${existingCategories.length} existing categories:`,
            existingCategories.map((c) => c.title)
        );

        // Prepare the entry text for AI analysis
        const entryText = title
            ? `Title: ${title}\n\nContent: ${content}`
            : content;

        // Use AI to determine the best category or create a new one
        const result = await generateObject({
            model: openrouter("openai/gpt-oss-120b"),
            schema: z.object({
                categoryAction: z
                    .enum(["existing", "new"])
                    .describe(
                        "Whether to use an existing category or create a new one. IMPORTANT: Prefer 'existing' if any category is a reasonable match."
                    ),
                categoryId: z
                    .string()
                    .describe(
                        "REQUIRED if categoryAction is 'existing': The _id of the existing category to use. Leave empty string if creating new."
                    ),
                newCategoryTitle: z
                    .string()
                    .describe(
                        "REQUIRED if categoryAction is 'new': The title for the new category (e.g., 'Work & Career'). Leave empty string if using existing."
                    ),
                newCategoryColor: z
                    .string()
                    .describe(
                        "REQUIRED if categoryAction is 'new': Hex color for the new category (e.g., '#3B82F6'). Leave empty string if using existing."
                    ),
                reasoning: z
                    .string()
                    .describe(
                        "Brief explanation of why this category was chosen or created."
                    ),
            }),
            prompt: `You are a categorization expert for a personal journal application.

Analyze the following journal entry and determine the most appropriate category:

${entryText}

EXISTING CATEGORIES:
${existingCategories
                    .map((c) => `- ${c.title} (ID: ${c._id}) [Color: ${c.color || "none"}]`)
                    .join("\n")}

INSTRUCTIONS:
1. First, carefully review the existing categories to see if any are a good match for this entry
2. If an existing category matches well (even if not perfect), use it - don't create unnecessary duplicates
3. Only create a new category if:
   - None of the existing categories are a reasonable match
   - The entry clearly represents a distinct theme not covered by existing categories
   - The new category would be broadly useful for future entries
4. When using existing category:
   - Set categoryAction to "existing"
   - Provide the categoryId from the list above
   - Set newCategoryTitle and newCategoryColor to empty strings
5. When creating a new category:
   - Set categoryAction to "new"
   - Use the format "Theme & Subtheme" (e.g., "Work & Career", "Health & Wellness")
   - Keep title concise (2-4 words max)
   - Choose an appropriate hex color that visually represents the theme
   - Set categoryId to empty string
6. Always provide clear reasoning for your decision

IMPORTANT: Prefer using existing categories to maintain consistency and avoid category proliferation.`,
        });

        console.log("AI categorization result:", result.object);

        let categoryId: string;
        let categoryTitle: string;

        if (result.object.categoryAction === "existing") {
            if (!result.object.categoryId || result.object.categoryId.trim() === "") {
                return new Response(
                    "Category ID is required when using existing category",
                    { status: 400 }
                );
            }
            categoryId = result.object.categoryId;
            categoryTitle =
                existingCategories.find((c) => c._id === categoryId)?.title ||
                "Unknown";
            console.log("Using existing category:", categoryId, categoryTitle);
        } else {
            // Create a new category
            if (
                !result.object.newCategoryTitle ||
                result.object.newCategoryTitle.trim() === "" ||
                !result.object.newCategoryColor ||
                result.object.newCategoryColor.trim() === ""
            ) {
                return new Response(
                    "New category title and color are required when creating a new category",
                    { status: 400 }
                );
            }

            console.log("Creating new category:", result.object.newCategoryTitle);

            const newCategory = await createCategory({
                title: result.object.newCategoryTitle,
                color: result.object.newCategoryColor,
            });

            categoryId = newCategory._id;
            categoryTitle = result.object.newCategoryTitle;
            console.log("Created new category with ID:", categoryId);
        }

        return Response.json({
            categoryId,
            reasoning: result.object.reasoning,
            action: result.object.categoryAction,
            categoryTitle,
        });
    } catch (error) {
        console.error("Error in categorization:", error);
        return new Response(
            `Failed to categorize entry: ${error instanceof Error ? error.message : "Unknown error"
            }`,
            { status: 500 }
        );
    }
}