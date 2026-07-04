/**
 * Resultado da avaliação: score + tier (com aviso de falha fatal), ações
 * prioritárias e itens a inspecionar. Barras por categoria chegam na fase 3.
 */
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, Stack } from 'expo-router';

import { ScoreGauge } from '@/components/ScoreGauge';
import { AppButton, Body, Muted, Subtitle } from '@/components/ui';
import { QUESTIONS } from '@/data/questionnaire';
import { useAssessment } from '@/features/assessment/context';
import { computeScore } from '@/lib/score';
import { colors, radius, spacing } from '@/theme';

function questionText(id: number): string {
  return QUESTIONS.find((q) => q.id === id)?.text ?? `Questão ${id}`;
}

export default function ResultadoScreen() {
  const { answers } = useAssessment();
  const result = computeScore(answers);

  const scorable = Object.values(answers).filter((v) => typeof v === 'number').length;

  return (
    <>
      <Stack.Screen options={{ title: 'Resultado' }} />
      <ScrollView contentContainerStyle={styles.content}>
        {scorable === 0 ? (
          <View style={styles.section}>
            <Subtitle>Avaliação incompleta</Subtitle>
            <Body>
              Nenhuma questão foi respondida com nota — não há como calcular o score. Refaça a
              avaliação respondendo ao menos parte das questões.
            </Body>
          </View>
        ) : (
          <>
            <ScoreGauge score={result.score} tier={result.tier} />

            {result.cappedByFatal && (
              <View style={[styles.section, styles.fatalSection]}>
                <Subtitle style={styles.fatalTitle}>⚠️ Falha crítica detectada</Subtitle>
                <Body>
                  Sua pontuação seria maior, mas itens críticos com a pior nota travam o rank em
                  "Vulnerável" — eles representam risco de colapso ou dano grave:
                </Body>
                {result.fatalQuestionIds.map((id) => (
                  <Body key={id} style={styles.listItem}>
                    • {questionText(id)}
                  </Body>
                ))}
              </View>
            )}

            {result.priorityActions.length > 0 && (
              <View style={styles.section}>
                <Subtitle>🎯 Ações prioritárias</Subtitle>
                <Muted>Onde investir primeiro para subir no rank:</Muted>
                {result.priorityActions.map((action, i) => {
                  const question = QUESTIONS.find((q) => q.id === action.questionId);
                  return (
                    <View key={action.questionId} style={styles.actionCard}>
                      <Body style={styles.actionTitle}>
                        {i + 1}. {question?.text}
                      </Body>
                      {question && <Muted>{question.rationale}</Muted>}
                    </View>
                  );
                })}
              </View>
            )}

            {result.inspectionQuestionIds.length > 0 && (
              <View style={styles.section}>
                <Subtitle>🔍 Itens para inspecionar</Subtitle>
                <Muted>
                  Você respondeu "não sei" — estes itens ficaram fora do cálculo. Uma inspeção
                  deixa seu rank mais preciso:
                </Muted>
                {result.inspectionQuestionIds.map((id) => (
                  <Body key={id} style={styles.listItem}>
                    • {questionText(id)}
                  </Body>
                ))}
              </View>
            )}
          </>
        )}

        <AppButton label="Nova avaliação" variant="ghost" onPress={() => router.replace('/')} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.lg,
    backgroundColor: colors.bg,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  fatalSection: {
    borderColor: colors.danger,
  },
  fatalTitle: {
    color: colors.danger,
  },
  listItem: {
    color: colors.textMuted,
  },
  actionCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  actionTitle: {
    fontWeight: '600',
  },
});
