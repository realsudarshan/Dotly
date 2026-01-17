import { useClerk } from "@clerk/clerk-expo";
import { Alert, Text } from "react-native";
import { Button } from "tamagui";

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();
  const handleSignOut = async () => {
    // Are you sure you want to sign out?
    Alert.alert(
      "Are you sure you want to sign out?",
      "This will sign you out of your account and you will need to sign in again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            await signOut();
            // Redirect to the sign-in page happens automatically with the Protected Route
          },
        },
      ]
    );
  };
  return (
    <Button theme="red" borderColor="$borderColor" onPress={handleSignOut}>
      <Text>Sign out</Text>
    </Button>
  );
};