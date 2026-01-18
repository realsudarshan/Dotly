import '../tamagui-web.css'

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Slot } from 'expo-router'
import { useColorScheme } from 'react-native'
import { TamaguiProvider } from 'tamagui'

import { ModalProvider } from '@/contexts/ModalContext'
import { tamaguiConfig } from '@/tamagui.config'
import { ClerkProvider } from '@clerk/clerk-expo'
export default function RootLayout() {
  const colorScheme = useColorScheme()

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

  if (!publishableKey) {
    throw new Error(
      'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
    )
  }

  return (
    // add this
    <ClerkProvider publishableKey={publishableKey}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme!}>
        <ModalProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Slot />
          </ThemeProvider>
        </ModalProvider>
      </TamaguiProvider>
    </ClerkProvider>
  )
}