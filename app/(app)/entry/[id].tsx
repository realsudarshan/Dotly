import JournalEntryDisplay from "@/components/JournalEntryDisplay";
import { AppColors } from "@/constants/theme";
import { deleteJournalEntry, getJournalEntryById } from "@/lib/sanity/journal";
import { formatTime } from "@/lib/utils/date";
import type { JOURNAL_ENTRY_BY_ID_QUERY_RESULT } from "@/sanity/sanity.types";
import { useUser } from "@clerk/clerk-expo";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, XStack } from "tamagui";

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const [entry, setEntry] = useState<JOURNAL_ENTRY_BY_ID_QUERY_RESULT>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadEntry = async () => {
      try {
        const fetchedEntry = await getJournalEntryById(id);
        if (fetchedEntry) {
          setEntry(fetchedEntry);
        } else {
          setError("Entry not found");
        }
      } catch (err) {
        console.error("Failed to load entry:", err);
        setError("Failed to load entry");
      } finally {
        setLoading(false);
      }
    };

    loadEntry();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  if (error || !entry) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>
          {error || "Something went wrong loading this entry."}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleEdit = () => {
    if (!id) return;
    router.push(`/edit-entry/${id}`);
  };

  const handleDelete = () => {
    if (!id || !entry) return;

    Alert.alert(
      "Delete Entry?",
      "Are you sure you want to delete this journal entry? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!id) return;

    setDeleting(true);

    try {
      await deleteJournalEntry(id);
      // Navigate back to journal list
      router.dismissAll();
    } catch (error) {
      console.error("Failed to delete journal entry:", error);
      Alert.alert(
        "Error",
        "Failed to delete your journal entry. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  // Check if current user owns this entry
  const canEdit = user?.id === entry?.userId;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.backButtonTop}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonTopText}>← Back to Journal</Text>
          </TouchableOpacity>

          {canEdit && (
            <XStack gap="$2">
              <Button
                size="$3"
                borderWidth={1}
                borderColor="$blue9"
                bg="transparent"
                color="$blue9"
                pressStyle={{
                  bg: "$blue2",
                  borderColor: "$blue10",
                }}
                onPress={handleEdit}
              >
                Edit
              </Button>
              <Button
                size="$3"
                borderWidth={1}
                borderColor="$red9"
                bg="transparent"
                color="$red9"
                pressStyle={{
                  bg: "$red2",
                  borderColor: "$red10",
                }}
                onPress={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </XStack>
          )}
        </View>

        <Text style={styles.timeText}>
          {formatTime(entry.createdAt ?? new Date())}
        </Text>

        <JournalEntryDisplay entry={entry} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  contentContainer: {
    padding: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.white,
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: AppColors.gray500,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.gray800,
    textAlign: "center",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: AppColors.gray500,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  backButtonTop: {
    paddingVertical: 8,
  },
  backButtonTopText: {
    color: AppColors.gray500,
    fontSize: 14,
    fontWeight: "500",
  },
  timeText: {
    fontSize: 13,
    color: AppColors.gray400,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});