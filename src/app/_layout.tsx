/**
 * Layout raiz. Stack simples sobre o SafeAreaProvider, com a identidade visual escura.
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'StormShield' }} />
        <Stack.Screen name="avaliacao" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
