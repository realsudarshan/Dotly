import { defaultConfig } from "@tamagui/config/v4";
import { createTamagui, createTokens } from "tamagui";

// Create custom blue color tokens
const customTokens = createTokens({
  color: {
    blue1: "#eff6ff",
    blue2: "#dbeafe",
    blue3: "#bfdbfe",
    blue4: "#93c5fd",
    blue5: "#60a5fa",
    blue6: "#3b82f6",
    blue7: "#2563eb",
    blue8: "#1d4ed8",
    blue9: "#1e40af",
    blue10: "#1e3a8a",
    blue11: "#172554",
    blue12: "#0a1a3c",
  },
  radius: defaultConfig.tokens.radius,
  zIndex: defaultConfig.tokens.zIndex,
  space: defaultConfig.tokens.space,
  size: defaultConfig.tokens.size,
});

// Get a base theme to copy structure from
const baseTheme = defaultConfig.themes.light_blue;

const config = {
  ...defaultConfig,
  tokens: customTokens,
  themes: {
    ...defaultConfig.themes,
    // Create blue theme with custom blue tokens
    blue: {
      ...baseTheme,
      background: "#3b82f6",
      backgroundHover: "#2563eb",
      backgroundPress: "#1d4ed8",
      backgroundFocus: "#1e40af",
      color: "#ffffff",
      colorHover: "#ffffff",
      colorPress: "#ffffff",
      colorFocus: "#ffffff",
      borderColor: "#3b82f6",
      borderColorHover: "#2563eb",
      borderColorPress: "#1d4ed8",
      borderColorFocus: "#1e40af",
    },
  },
};

export const tamaguiConfig = createTamagui(config);

export default tamaguiConfig;

export type Conf = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}