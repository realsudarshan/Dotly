import { AppColors } from "@/constants/theme";
import { getMoodConfig } from "@/lib/constants/moods";
import { urlFor } from "@/lib/sanity/client";
import { formatLongDate } from "@/lib/utils/date";
import type { JOURNAL_ENTRY_BY_ID_QUERY_RESULT } from "@/sanity/sanity.types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { PortableText } from "@portabletext/react-native";
import { Image } from "expo-image";
import React, { type ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";

interface JournalEntryDisplayProps {
  entry: NonNullable<JOURNAL_ENTRY_BY_ID_QUERY_RESULT>;
}

export default function JournalEntryDisplay({
  entry,
}: JournalEntryDisplayProps) {
  const moodConfig = getMoodConfig(entry.mood ?? "neutral");
  const date = formatLongDate(entry.createdAt ?? new Date());

  // Custom components for Portable Text rendering
  const portableTextComponents = {
    types: {
      image: ({ value }: { value?: { asset?: unknown; caption?: string } }) => {
        if (!value?.asset) return null;

        // Use official Sanity image URL builder with optimizations
        const imageUrl = urlFor(value)
          .width(800)
          .height(400)
          .fit("crop")
          .auto("format")
          .url();

        return (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              contentFit="cover"
            />
            {value.caption && (
              <Text style={styles.imageCaption}>{value.caption}</Text>
            )}
          </View>
        );
      },
    },
    block: {
      // Custom block styles
      normal: ({ children }: { children?: React.ReactNode }) => (
        <Text style={styles.paragraph}>{children}</Text>
      ),
      h1: ({ children }: { children?: React.ReactNode }) => (
        <Text style={styles.heading1}>{children}</Text>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <Text style={styles.heading2}>{children}</Text>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <View style={styles.blockquote}>
          <Text style={styles.blockquoteText}>{children}</Text>
        </View>
      ),
    },
    marks: {
      // Custom text formatting
      strong: ({ children }: { children?: React.ReactNode }) => (
        <Text style={styles.bold}>{children}</Text>
      ),
      em: ({ children }: { children?: React.ReactNode }) => (
        <Text style={styles.italic}>{children}</Text>
      ),
      link: ({ children }: { children?: React.ReactNode }) => (
        <Text style={styles.link}>{children}</Text>
      ),
    },
    list: {
      bullet: ({ children }: { children?: React.ReactNode }) => (
        <View style={styles.bulletList}>{children}</View>
      ),
      number: ({ children }: { children?: React.ReactNode }) => (
        <View style={styles.numberedList}>{children}</View>
      ),
    },
    listItem: {
      bullet: ({ children }: { children?: React.ReactNode }) => (
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <View style={styles.listItemContent}>{children}</View>
        </View>
      ),
      number: ({
        children,
        index,
      }: {
        children?: React.ReactNode;
        index?: number;
      }) => (
        <View style={styles.listItem}>
          <Text style={styles.bullet}>{(index ?? 0) + 1}.</Text>
          <View style={styles.listItemContent}>{children}</View>
        </View>
      ),
    },
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.moodContainer}>
            <MaterialIcons
              size={28}
              name={
                moodConfig.icon as ComponentProps<typeof MaterialIcons>["name"]
              }
              color={moodConfig.color}
            />
          </View>
        </View>

        {entry.title && <Text style={styles.title}>{entry.title}</Text>}

        {entry.aiGeneratedCategory && (
          <View
            style={[
              styles.categoryTag,
              { backgroundColor: entry.aiGeneratedCategory.color || "#e1e5e9" },
            ]}
          >
            <Text style={styles.categoryText}>
              {entry.aiGeneratedCategory.title}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <PortableText
          value={entry.content ?? []}
          components={portableTextComponents}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
  header: {
    marginBottom: 32,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  date: {
    fontSize: 12,
    color: AppColors.gray500,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  moodContainer: {
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: AppColors.gray800,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  categoryTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contentContainer: {
    // Container for portable text content
  },
  paragraph: {
    fontSize: 17,
    lineHeight: 28,
    color: AppColors.gray800,
    marginBottom: 16,
  },
  heading1: {
    fontSize: 24,
    fontWeight: "700",
    color: AppColors.gray800,
    marginBottom: 16,
    marginTop: 24,
  },
  heading2: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.gray800,
    marginBottom: 12,
    marginTop: 20,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: AppColors.primary,
    paddingLeft: 16,
    marginVertical: 16,
    backgroundColor: "transparent",
  },
  blockquoteText: {
    fontSize: 17,
    fontStyle: "italic",
    color: AppColors.gray500,
    lineHeight: 28,
  },
  bold: {
    fontWeight: "700",
  },
  italic: {
    fontStyle: "italic",
  },
  link: {
    color: AppColors.primary,
    textDecorationLine: "underline",
  },
  bulletList: {
    marginVertical: 12,
  },
  numberedList: {
    marginVertical: 12,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  bullet: {
    fontSize: 17,
    color: AppColors.gray500,
    marginRight: 12,
    minWidth: 24,
  },
  listItemContent: {
    flex: 1,
  },
  imageContainer: {
    marginVertical: 24,
  },
  image: {
    width: "100%",
    height: 240,
    borderRadius: 16,
  },
  imageCaption: {
    fontSize: 14,
    color: AppColors.gray500,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 12,
  },
});