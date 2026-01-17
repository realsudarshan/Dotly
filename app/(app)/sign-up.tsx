import Logo from "@/components/Logo";
import { useModal } from "@/contexts/ModalContext";
import { useSignUp } from "@clerk/clerk-expo";
import { Eye, EyeOff } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import * as React from "react";
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

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { showModal } = useModal();
  // ... (imports and top of component)
  <YStack gap="$2">
    <Label color="$color">Password</Label>
    <XStack style={{ alignItems: "center", justifyContent: "center" }}>
      <Input
        flex={1}
        secureTextEntry={!showPassword}
        value={password}
        placeholder="Create a password"
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

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));

      showModal({
        type: "alert",
        title: "Whoops",
        description: "Whoops an error occurred, please try again!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));

      showModal({
        type: "alert",
        title: "Whoops",
        description: "Whoops an error occurred, please try again!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <ScrollView
          flex={1}
          bg="$background"
          contentContainerStyle={{ flex: 1 }}
        >
          <YStack
            flex={1}
            p="$4"
            gap="$4"
            style={{ justifyContent: "center", minHeight: "100%" }}
          >
            <Logo />

            <YStack gap="$2" style={{ alignItems: "center" }}>
              <H1 color="$color" style={{ textAlign: "center" }}>
                Verify Your Email
              </H1>
              <Paragraph
                color="$color"
                opacity={0.7}
                style={{ textAlign: "center" }}
              >
                We&apos;ve sent a verification code to {emailAddress}
              </Paragraph>
            </YStack>

            <Card elevate padding="$4" gap="$2" backgroundColor="$background">
              <YStack gap="$2">
                <YStack gap="$2">
                  <Label color="$color">Verification Code</Label>
                  <Input
                    value={code}
                    placeholder="Enter verification code"
                    onChangeText={setCode}
                    borderColor="$borderColor"
                    focusStyle={{
                      borderColor: "$blue10",
                    }}
                    keyboardType="numeric"
                    autoComplete="one-time-code"
                  />
                </YStack>

                <Spacer />

                <Button
                  size="$4"
                  bg="#904BFF"
                  color="white"
                  borderColor="#904BFF"
                  onPress={onVerifyPress}
                  disabled={!isLoaded || isLoading}
                  opacity={!isLoaded || isLoading ? 0.5 : 1}
                >
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>
              </YStack>
            </Card>

            <XStack
              gap="$2"
              style={{ justifyContent: "center", alignItems: "center" }}
            >
              <Paragraph color="$color" opacity={0.7}>
                Didn&apos;t receive the code?
              </Paragraph>
              <Button
                variant="outlined"
                size="$3"
                borderColor="#904BFF"
                color="#904BFF"
                onPress={() => setPendingVerification(false)}
              >
                Resend
              </Button>
            </XStack>
          </YStack>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
              Create Account
            </H1>
            <Paragraph
              color="$color"
              opacity={0.7}
              style={{ textAlign: "center" }}
            >
              Sign up to get started with your account
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
                    placeholder="Create a password"
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

              <Spacer />

              <Button
                size="$4"
                bg="#904BFF"
                color="white"
                borderColor="#904BFF"
                onPress={onSignUpPress}
                disabled={!isLoaded || isLoading}
                opacity={!isLoaded || isLoading ? 0.5 : 1}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </YStack>
          </Card>

          <XStack
            gap="$2"
            style={{ justifyContent: "center", alignItems: "center" }}
          >
            <Paragraph color="$color" opacity={0.7}>
              Already have an account?
            </Paragraph>

            <Button
              variant="outlined"
              size="$3"
              borderColor="#904BFF"
              color="#904BFF"
              onPress={() => router.canGoBack() && router.back()}
            >
              Sign In
            </Button>
          </XStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}