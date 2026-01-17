import React from "react";
import { Image, XStack, YStack } from "tamagui";

export default function Logo() {
  return (
    <YStack style={{ alignItems: "center" }}>
      <XStack
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: 120,
          height: 120,
          borderRadius: 35,
          overflow: "hidden",
        }}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: 180, height: 180 }}
          resizeMode="contain"
        />
      </XStack>
    </YStack>
  );
}
