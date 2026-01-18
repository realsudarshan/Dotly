import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/theme";
import { getRandomDailyPrompts } from "@/lib/sanity/dailyPrompts";
import type { ACTIVE_DAILY_PROMPTS_QUERY_RESULT } from "@/sanity/sanity.types";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Card, Spinner, Text, View, XStack, YStack } from "tamagui";

type DailyPrompt = ACTIVE_DAILY_PROMPTS_QUERY_RESULT[0];

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;
const CARD_SPACING = 16;

export default function DailyPromptCards() {
  const [prompts, setPrompts] = useState<DailyPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const fetchedPrompts = await getRandomDailyPrompts(3); // Get 3 random prompts
      setPrompts(fetchedPrompts);
      setActiveIndex(0); // Reset to first card when loading new prompts
    } catch (error) {
      console.error("Error loading daily prompts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + CARD_SPACING));
    setActiveIndex(index);
  };

  const handlePromptPress = (prompt: DailyPrompt) => {
    // Navigate to new entry with the prompt pre-filled
    router.push({
      pathname: "/new-entry",
      params: {
        promptTitle: prompt.title,
        promptText: prompt.prompt,
        suggestedMood: prompt.suggestedMood || "",
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="small" />
      </View>
    );
  }

  if (prompts.length === 0) {
    return null; // Don't show anything if there are no prompts
  }

  return (
    <YStack gap="$3" mb="$4">
      <XStack
        style={{ alignItems: "center", justifyContent: "space-between" }}
        px="$1"
      >
        <Text fontSize="$5" fontWeight="600" color="$color12">
          Daily Prompts
        </Text>
        <Pressable onPress={loadPrompts}>
          <IconSymbol
            size={20}
            name="arrow.clockwise"
            color={AppColors.gray500}
          />
        </Pressable>
      </XStack>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {prompts.map((prompt, index) => (
          <Pressable
            key={prompt._id}
            onPress={() => handlePromptPress(prompt)}
            style={({ pressed }) => [
              styles.cardWrapper,
              { opacity: pressed ? 0.8 : 1 },
              index === 0 && styles.firstCard,
            ]}
          >
            <Card
              elevate
              size="$4"
              bordered
              bg="$background"
              borderColor="$borderColor"
              style={styles.card}
            >
              <YStack gap="$3" style={{ height: "100%" }}>
                {/* Icon and Title */}
                <XStack gap="$2" style={{ alignItems: "center" }}>
                  {prompt.emoji && <Text fontSize="$7">{prompt.emoji}</Text>}
                  {!prompt.emoji && (
                    <IconSymbol
                      size={32}
                      name="lightbulb.fill"
                      color={AppColors.warning}
                    />
                  )}
                  <Text
                    fontSize="$5"
                    fontWeight="600"
                    color="$color12"
                    style={{ flex: 1 }}
                    numberOfLines={2}
                  >
                    {prompt.title}
                  </Text>
                </XStack>

                {/* Prompt Text */}
                <Text
                  fontSize="$4"
                  color="$color11"
                  style={{ flex: 1 }}
                  numberOfLines={4}
                >
                  {prompt.prompt}
                </Text>

                {/* Bottom Info */}
                <XStack
                  gap="$2"
                  style={{
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {prompt.category && (
                    <View
                      style={[
                        styles.categoryBadge,
                        prompt.category.color && {
                          backgroundColor: prompt.category.color + "20",
                          borderColor: prompt.category.color,
                        },
                      ]}
                    >
                      <Text
                        fontSize="$2"
                        style={{
                          color: prompt.category.color || undefined,
                        }}
                        fontWeight="500"
                      >
                        {prompt.category.title}
                      </Text>
                    </View>
                  )}

                  <View style={{ flex: 1 }} />

                  <XStack gap="$1" style={{ alignItems: "center" }}>
                    <IconSymbol
                      size={16}
                      name="pencil.circle.fill"
                      color={AppColors.primary}
                    />
                    <Text fontSize="$2" color="$blue9" fontWeight="600">
                      Start Writing
                    </Text>
                  </XStack>
                </XStack>
              </YStack>
            </Card>
          </Pressable>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      {prompts.length > 1 && (
        <XStack gap="$2" style={{ justifyContent: "center" }} mt="$2">
          {prompts.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === activeIndex && styles.activeDot]}
            />
          ))}
        </XStack>
      )}
    </YStack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: CARD_SPACING / 2,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_SPACING / 2,
  },
  firstCard: {
    marginLeft: 0,
  },
  card: {
    padding: 20,
    height: 180,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.gray300,
    backgroundColor: AppColors.gray100,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.gray300,
  },
  activeDot: {
    backgroundColor: AppColors.primary,
    width: 20,
  },
});