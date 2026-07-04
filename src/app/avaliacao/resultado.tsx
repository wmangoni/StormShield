/**
 * Resultado da avaliação: score + tier (com aviso de falha fatal), barras por
 * categoria, ações prioritárias e itens a inspecionar.
 */
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { router, Stack } from 'expo-router';

import { CategoryBar } from '@/components/CategoryBar';
import { ScoreGauge } from '@/components/ScoreGauge';
import { AppButton, Body, Muted, Subtitle } from '@/components/ui';
import { CATEGORIES, QUESTIONS } from '@/data/questionnaire';
import { useAssessment } from '@/features/assessment/context';
import { buildMapsSearchUrl, buildWebSearchUrl } from '@/lib/maps';
import { computeScore } from '@/lib/score';
import { buildShareText } from '@/lib/share';
import { getUserLocation, setUserLocation } from '@/storage/settings';
import { colors, font, radius, spacing } from '@/theme';

/** Abre a busca no Google Maps; se falhar, cai para a Google Busca. */
async function openProfessionalSearch(service: string, location: string): Promise<void> {
  try {
    await Linking.openURL(buildMapsSearchUrl(service, location));
  } catch {
    await Linking.openURL(buildWebSearchUrl(service, location)).catch(() => {});
  }
}

/** Web: navigator.share quando existir; senão copia e avisa. Nativo: Share. */
async function shareText(text: string): Promise<void> {
  if (Platform.OS === 'web') {
    const nav = (
      globalThis as {
        navigator?: {
          share?: (data: { text: string }) => Promise<void>;
          clipboard?: { writeText: (text: string) => Promise<void> };
        };
      }
    ).navigator;
    try {
      if (nav?.share) {
        await nav.share({ text });
        return;
      }
      await nav?.clipboard?.writeText(text);
      (globalThis as { alert?: (msg: string) => void }).alert?.(
        'Resultado copiado para a área de transferência!',
      );
    } catch {
      // Usuário cancelou o diálogo de compartilhar — nada a fazer.
    }
    return;
  }
  await Share.share({ message: text });
}

function questionText(id: number): string {
  return QUESTIONS.find((q) => q.id === id)?.text ?? `Questão ${id}`;
}

export default function ResultadoScreen() {
  const { answers, loading } = useAssessment();
  const result = computeScore(answers);
  const [region, setRegion] = useState('');

  useEffect(() => {
    getUserLocation().then(setRegion);
  }, []);

  function handleRegionChange(value: string) {
    setRegion(value);
    void setUserLocation(value); // autosave fire-and-forget
  }

  const scorable = Object.values(answers).filter((v) => typeof v === 'number').length;

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Resultado' }} />
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </>
    );
  }

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

            <View style={styles.section}>
              <Subtitle>📊 Por categoria</Subtitle>
              {result.categoryScores.map((cs) => {
                const category = CATEGORIES.find((c) => c.id === cs.category);
                if (!category) return null;
                return (
                  <CategoryBar
                    key={cs.category}
                    category={category}
                    score={cs.score}
                    answered={cs.answered}
                    total={cs.total}
                  />
                );
              })}
            </View>

            {result.priorityActions.length > 0 && (
              <View style={styles.section}>
                <Subtitle>🎯 Ações prioritárias</Subtitle>
                <Muted>Onde investir primeiro para subir no rank:</Muted>
                {result.priorityActions.map((action, i) => {
                  const question = QUESTIONS.find((q) => q.id === action.questionId);
                  if (!question) return null;
                  return (
                    <View key={action.questionId} style={styles.actionCard}>
                      <Body style={styles.actionTitle}>
                        {i + 1}. {question.text}
                      </Body>
                      <Muted>{question.rationale}</Muted>
                      <AppButton
                        label={`📍 Buscar: ${question.service}`}
                        variant="ghost"
                        onPress={() => openProfessionalSearch(question.service, region)}
                      />
                    </View>
                  );
                })}
                <View style={styles.regionBox}>
                  <Muted>Sua região (opcional — CEP, bairro ou cidade):</Muted>
                  <TextInput
                    value={region}
                    onChangeText={handleRegionChange}
                    placeholder="ex.: Porto Alegre, RS"
                    placeholderTextColor={colors.textMuted}
                    style={styles.regionInput}
                    maxLength={80}
                  />
                  <Muted>Sem região, o Maps busca perto da sua posição atual.</Muted>
                </View>
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

        <Muted style={styles.savedHint}>Avaliação salva automaticamente ✓</Muted>
        {scorable > 0 && (
          <AppButton
            label="Compartilhar resultado"
            onPress={() => shareText(buildShareText(result))}
          />
        )}
        <AppButton label="Voltar ao início" variant="ghost" onPress={() => router.replace('/')} />
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
  regionBox: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  regionInput: {
    color: colors.text,
    fontSize: font.body,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  savedHint: {
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
