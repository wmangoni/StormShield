/**
 * Home: apresenta o app e inicia uma nova avaliação.
 * A lista de avaliações salvas chega na fase 3 (persistência).
 */
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, Body, Muted, Title } from '@/components/ui';
import { CATEGORIES, QUESTIONS } from '@/data/questionnaire';
import { colors, spacing } from '@/theme';

export default function HomeScreen() {
  function startAssessment() {
    router.push({ pathname: '/avaliacao/[categoria]', params: { categoria: CATEGORIES[0].id } });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Title style={styles.title}>StormShield 🛡️</Title>
          <Body style={styles.subtitle}>
            Descubra o quão preparada sua casa está para enfrentar uma tempestade com fortes
            rajadas de vento — e o que fazer para melhorar.
          </Body>
        </View>
        <View style={styles.footer}>
          <AppButton label="Nova avaliação" onPress={startAssessment} />
          <Muted style={styles.meta}>
            {QUESTIONS.length} questões · {CATEGORIES.length} categorias · ~5 minutos
          </Muted>
        </View>
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
    padding: spacing.lg,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textMuted,
  },
  footer: {
    gap: spacing.sm,
  },
  meta: {
    textAlign: 'center',
  },
});
