import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

// Initialize Sanity client
export const sanityClient = createClient({
  projectId: process.env.EXPO_PUBLIC_SANITY_PROJECT_ID, // Your project ID from sanity.config.ts
  dataset: process.env.EXPO_PUBLIC_SANITY_DATASET,
  useCdn: false, // Set to false for write operations
  apiVersion: "2024-01-01",
  token: process.env.EXPO_PUBLIC_SANITY_TOKEN, // You'll need to add this
});

// Create image URL builder using the official Sanity package
const builder = imageUrlBuilder(sanityClient);

// Export the official urlFor function
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}