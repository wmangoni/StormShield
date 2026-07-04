/**
 * Layout do fluxo de avaliação: monta o AssessmentProvider (estado zera ao
 * sair do fluxo) e o Stack interno com a identidade visual do app.
 */
import { Stack } from 'expo-router';

import { AssessmentProvider } from '@/features/assessment/context';
import { colors } from '@/theme';

export default function AvaliacaoLayout() {
  return (
    <AssessmentProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </AssessmentProvider>
  );
}
