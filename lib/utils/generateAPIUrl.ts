import Constants from "expo-constants";

export const generateAPIUrl = (relativePath: string) => {
  const origin = Constants.experienceUrl.replace("exp://", "http://");
  return `${origin}${relativePath}`;
};