/**
 * Tela inicial (Hello World). Ponto de partida do El Niño.
 */
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Title } from '@/components/ui';
import { colors, spacing } from '@/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <Title>El Niño 🌊</Title>
        <Body style={styles.subtitle}>
          Hello World! Setup inicial com Expo Router + TypeScript pronto.
        </Body>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textMuted,
  },
});
