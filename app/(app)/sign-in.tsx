import Logo from "@/components/Logo";
import SignInWithGoogle from "@/components/SignInWithGoogle";
import { useModal } from "@/contexts/ModalContext";
import { isClerkAPIResponseError, useSignIn } from "@clerk/clerk-expo";
import { ClerkAPIResponseError } from "@clerk/types";
import { Eye, EyeOff } from "@tamagui/lucide-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Button,
  Card,
  H1,
  Input,
  Label,
  Paragraph,
  ScrollView,
  Spacer,
  XStack,
  YStack,
} from "tamagui";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { showModal } = useModal();
  // ... (rest of imports/code until Password Input)
  <YStack gap="$2">
    <Label color="$color">Password</Label>
    <XStack alignItems="center">
      <Input
        flex={1}
        secureTextEntry={!showPassword}
        value={password}
        placeholder="Enter your password"
        onChangeText={setPassword}
        borderColor="$borderColor"
        focusStyle={{
          borderColor: "$blue10",
        }}
      />
      <Button
        chromeless
        position="absolute"
        right={0}
        icon={showPassword ? Eye : EyeOff}
        onPress={() => setShowPassword(!showPassword)}
      />
    </XStack>
  </YStack>

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling

      const clerkError = isClerkAPIResponseError(err)
        ? (err as ClerkAPIResponseError)
        : null;

      showModal({
        type: "dialog",
        title: "Error",
        description:
          clerkError?.errors[0]?.longMessage ||
          clerkError?.errors[0]?.message ||
          "Whoops an error occurred, please try again!",
        onCancel: () => {
          setIsLoading(false);
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <ScrollView flex={1} bg="$background" contentContainerStyle={{ flex: 1 }}>
        <YStack
          flex={1}
          p="$4"
          gap="$4"
          style={{ justifyContent: "center", minHeight: "100%" }}
        >
          <Logo />

          <YStack gap="$2" style={{ alignItems: "center" }}>
            <H1 color="$color" style={{ textAlign: "center" }}>
              Welcome
            </H1>
            <Paragraph
              color="$color"
              opacity={0.7}
              style={{ textAlign: "center" }}
            >
              Sign in to Dotly to continue
            </Paragraph>
          </YStack>

          <Card elevate padding="$4" gap="$2" backgroundColor="$background">
            <YStack gap="$2">
              <YStack gap="$2">
                <Label color="$color">Email Address</Label>
                <Input
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={emailAddress}
                  placeholder="Enter your email"
                  onChangeText={setEmailAddress}
                  borderColor="$borderColor"
                  focusStyle={{
                    borderColor: "$blue10",
                  }}
                />
              </YStack>

              <YStack gap="$2">
                <Label color="$color">Password</Label>
                <XStack style={{ alignItems: "center", justifyContent: "center" }}>
                  <Input
                    flex={1}
                    secureTextEntry={!showPassword}
                    value={password}
                    placeholder="Enter your password"
                    onChangeText={setPassword}
                    borderColor="$borderColor"
                    focusStyle={{
                      borderColor: "$blue10",
                    }}
                  />
                  <Button
                    chromeless
                    style={{ position: "absolute", right: 8 }}
                    icon={showPassword ? Eye : EyeOff}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                </XStack>
              </YStack>

              <Spacer size="$2" />

              <Button
                size="$4"
                bg="#904BFF"
                color="white"
                borderColor="#904BFF"
                onPress={onSignInPress}
                disabled={!isLoaded || isLoading}
                opacity={!isLoaded || isLoading ? 0.5 : 1}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <SignInWithGoogle />
            </YStack>
          </Card>

          <XStack
            gap="$2"
            style={{ justifyContent: "center", alignItems: "center" }}
          >
            <Paragraph color="$color" opacity={0.7}>
              Don&apos;t have an account?
            </Paragraph>
            <Link href="/sign-up" asChild>
              <Button
                variant="outlined"
                size="$3"
                borderColor="#904BFF"
                color="#904BFF"
              >
                Sign Up
              </Button>
            </Link>
          </XStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}