import '../tamagui-web.css'

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Slot, Stack } from 'expo-router'
import { useColorScheme } from 'react-native'
import { TamaguiProvider } from 'tamagui'

import { tamaguiConfig } from '@/tamagui.config'
import { ClerkProvider } from '@clerk/clerk-expo'
import { ModalProvider } from '@/contexts/ModalContext'
export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    // add this
     <ClerkProvider>
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