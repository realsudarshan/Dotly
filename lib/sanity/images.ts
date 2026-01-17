import type { SanityImageAsset } from "@/sanity/sanity.types";
import type { SanityImageSource } from "@sanity/image-url";
import { sanityClient, urlFor } from "./client";

// Helper function to upload image to Sanity
export const uploadImageToSanity = async (
  imageUri: string
): Promise<SanityImageAsset> => {
  try {
    // Convert image to blob for upload
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Upload to Sanity - returns generic SanityDocument, narrowing to SanityImageAsset
    const asset = await sanityClient.assets.upload("image", blob, {
      filename: `journal-image-${Date.now()}.jpg`,
    });

    return asset as SanityImageAsset;
  } catch (error) {
    console.error("Error uploading image to Sanity:", error);
    throw error;
  }
};

// Helper to get image URL from Sanity asset (using official builder)
export const getImageUrl = (
  asset: SanityImageSource | null | undefined,
  width = 800
) => {
  if (!asset) return null;
  return urlFor(asset).width(width).auto("format").url();
};