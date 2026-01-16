import { Feather } from "@tamagui/lucide-icons";
import React from "react";

import { Text, XStack, YStack } from "tamagui";

export default function Logo({ hasText = false }: { hasText?: boolean }) {
  return (
    <YStack gap="$3" style={{ alignItems: "center" }} mb="$4">
      <XStack
        bg="$blue10"
        p="$3"
        style={{
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
        }}
      >
        <Feather size={32} color="white" />
      </XStack>
      {hasText && (
        <Text fontSize="$7" fontWeight="700" color="$color">
          Journal.ai
        </Text>
      )}
    </YStack>
  );
}