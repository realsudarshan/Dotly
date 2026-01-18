import CreateEntryButton from "@/components/CreateEntryButton";
import { AppColors } from "@/constants/theme";
import { getMoodConfig } from "@/lib/constants/moods";
import { fetchJournalEntries } from "@/lib/sanity/journal";
import type { USER_JOURNAL_ENTRIES_QUERY_RESULT } from "@/sanity/sanity.types";
import { useUser } from "@clerk/clerk-expo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React, { type ComponentProps, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "tamagui";

type JournalEntry = USER_JOURNAL_ENTRIES_QUERY_RESULT[0];

interface GroupedEntries {
  [date: string]: JournalEntry[];
}

export default function EntriesScreen() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<USER_JOURNAL_ENTRIES_QUERY_RESULT>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = async () => {
    if (!user?.id) return;

    try {
      const fetchedEntries = await fetchJournalEntries(user.id);
      setEntries(fetchedEntries);
    } catch (error) {
      console.error("Failed to load journal entries:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEntries();
  };

  // Group entries by date (using UTC to match Sanity timestamps)
  const groupEntriesByDate = (
    entries: USER_JOURNAL_ENTRIES_QUERY_RESULT
  ): GroupedEntries => {
    return entries.reduce((groups: GroupedEntries, entry) => {
      // Use UTC date components to match the date stored in Sanity
      const dateObj = new Date(entry.createdAt ?? new Date());
      const year = dateObj.getUTCFullYear();
      const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getUTCDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${day}`;

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
      return groups;
    }, {});
  };

  const handleEntryPress = (entryId: string) => {
    router.push(`/entry/${entryId}`);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={styles.loadingText}>Loading your journal entries...</Text>
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No Journal Entries Yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the + button to write your first journal entry!
        </Text>
        <CreateEntryButton />
      </View>
    );
  }

  const groupedEntries = groupEntriesByDate(entries);

  // Sort grouped entries by date (newest first)
  const sortedGroupedEntries = Object.entries(groupedEntries).sort(
    ([dateA], [dateB]) => {
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    }
  );

  return (
    <View bg="$background" style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top / 2 },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressBackgroundColor={AppColors.white}
            progressViewOffset={0}
          />
        }
      >
        <Text style={styles.title}>Your Journal</Text>

        {sortedGroupedEntries.map(([date, dayEntries]) => {
          // Sort entries within the day by createdAt (newest first)
          const sortedDayEntries = [...dayEntries].sort(
            (a, b) =>
              new Date(b.createdAt ?? new Date()).getTime() -
              new Date(a.createdAt ?? new Date()).getTime()
          );

          return (
            <View key={date} style={styles.dayGroup}>
              <Text style={styles.dateHeader}>
                {new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </Text>

              {sortedDayEntries.map((entry) => {
                const moodConfig = getMoodConfig(entry.mood ?? "neutral");
                const firstBlock = entry.content?.[0];
                const preview =
                  (firstBlock && "children" in firstBlock
                    ? firstBlock.children?.[0]?.text?.slice(0, 100)
                    : null) ?? "No content";

                return (
                  <View key={entry._id} style={styles.entryCardContainer}>
                    <TouchableOpacity
                      style={styles.entryCard}
                      onPress={() => handleEntryPress(entry._id)}
                    >
                      <View style={styles.entryHeader}>
                        <Text style={styles.entryTitle}>
                          {entry.title ??
                            new Date(
                              entry.createdAt ?? new Date()
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                        </Text>
                        <View style={styles.entryActions}>
                          <MaterialIcons
                            size={20}
                            name={
                              moodConfig.icon as ComponentProps<
                                typeof MaterialIcons
                              >["name"]
                            }
                            color={moodConfig.color}
                          />
                          <Text
                            style={[
                              styles.moodLabel,
                              { color: moodConfig.color },
                            ]}
                          >
                            {moodConfig.label}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.entryPreview}>
                        {preview}
                        {preview.length >= 100 ? "..." : ""}
                      </Text>

                      {entry.aiGeneratedCategory && (
                        <View
                          style={[
                            styles.categoryTag,
                            {
                              backgroundColor:
                                entry.aiGeneratedCategory.color || "#e1e5e9",
                            },
                          ]}
                        >
                          <Text style={styles.categoryText}>
                            {entry.aiGeneratedCategory.title}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100, // Space for FAB
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.white,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: AppColors.gray800,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: AppColors.gray500,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: AppColors.gray800,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: AppColors.gray500,
    textAlign: "center",
    lineHeight: 24,
  },
  dayGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.gray500,
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.gray200,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  entryCardContainer: {
    marginBottom: 32,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.gray100,
  },
  entryCard: {
    backgroundColor: "transparent",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.gray800,
    flex: 1,
    letterSpacing: -0.3,
  },
  entryActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 12,
  },
  moodLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  entryPreview: {
    fontSize: 16,
    color: AppColors.gray500,
    lineHeight: 26,
    marginBottom: 16,
  },
  categoryTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});