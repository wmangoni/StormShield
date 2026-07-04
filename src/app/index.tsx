/**
 * Home: lista as avaliações salvas (score/tier recalculados das respostas) e
 * inicia uma nova. Recarrega sempre que a tela ganha foco.
 */
import { useCallback, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { confirmAsync } from '@/components/confirm';
import { AppButton, Body, Muted, Subtitle, Title } from '@/components/ui';
import { CATEGORIES, QUESTIONS } from '@/data/questionnaire';
import { computeScore, TIERS } from '@/lib/score';
import {
  Assessment,
  listAssessments,
  newAssessment,
  removeAssessment,
  renameAssessment,
  saveAssessment,
} from '@/storage/assessments';
import { colors, font, radius, spacing } from '@/theme';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

/** Retoma na primeira categoria com questão sem resposta; completa → resultado. */
function openAssessment(assessment: Assessment) {
  const pending = CATEGORIES.find((c) =>
    QUESTIONS.some((q) => q.category === c.id && assessment.answers[q.id] === undefined),
  );
  if (pending) {
    router.push({
      pathname: '/avaliacao/[categoria]',
      params: { categoria: pending.id, id: assessment.id },
    });
  } else {
    router.push({ pathname: '/avaliacao/resultado', params: { id: assessment.id } });
  }
}

export default function HomeScreen() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [renaming, setRenaming] = useState<Assessment | null>(null);
  const [labelDraft, setLabelDraft] = useState('');

  const reload = useCallback(() => {
    listAssessments().then(setAssessments);
  }, []);

  // Recarrega ao ganhar foco (ex.: voltando do fluxo de avaliação).
  useFocusEffect(reload);

  async function startAssessment() {
    const assessment = newAssessment(`Avaliação de ${formatDate(new Date().toISOString())}`);
    await saveAssessment(assessment);
    router.push({
      pathname: '/avaliacao/[categoria]',
      params: { categoria: CATEGORIES[0].id, id: assessment.id },
    });
  }

  async function confirmRemoval(assessment: Assessment) {
    const ok = await confirmAsync('Remover avaliação', `Remover "${assessment.label}"?`);
    if (ok) {
      await removeAssessment(assessment.id);
      reload();
    }
  }

  function startRename(assessment: Assessment) {
    setLabelDraft(assessment.label);
    setRenaming(assessment);
  }

  async function saveRename() {
    const label = labelDraft.trim();
    if (renaming && label) {
      await renameAssessment(renaming.id, label);
      reload();
    }
    setRenaming(null);
  }

  function renderItem({ item }: { item: Assessment }) {
    const answered = QUESTIONS.filter((q) => item.answers[q.id] !== undefined).length;
    const result = computeScore(item.answers);
    const hasScore = QUESTIONS.some((q) => typeof item.answers[q.id] === 'number');
    return (
      <Pressable onPress={() => openAssessment(item)} style={styles.card}>
        <View style={styles.cardInfo}>
          <Subtitle numberOfLines={1}>{item.label}</Subtitle>
          <Muted>
            {answered}/{QUESTIONS.length} respondidas · atualizada em {formatDate(item.updatedAt)}
          </Muted>
        </View>
        <View style={styles.cardScore}>
          {hasScore ? (
            <>
              <Text style={styles.scoreValue}>{Math.round(result.score)}</Text>
              <Muted>{TIERS[result.tier].emoji} Tier {result.tier}</Muted>
            </>
          ) : (
            <Muted>sem notas</Muted>
          )}
        </View>
        <View style={styles.cardActions}>
          <Pressable onPress={() => startRename(item)} hitSlop={spacing.sm}>
            <Text style={styles.actionIcon}>✏️</Text>
          </Pressable>
          <Pressable onPress={() => confirmRemoval(item)} hitSlop={spacing.sm}>
            <Text style={styles.actionIcon}>✕</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <FlatList
          data={assessments}
          keyExtractor={(a) => a.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.hero}>
              <Title style={styles.centered}>StormShield 🛡️</Title>
              <Body style={[styles.centered, styles.subtitle]}>
                Descubra o quão preparada sua casa está para enfrentar uma tempestade com fortes
                rajadas de vento — e o que fazer para melhorar.
              </Body>
            </View>
          }
          ListEmptyComponent={
            <Muted style={styles.centered}>
              Nenhuma avaliação ainda. Comece a primeira — leva ~5 minutos.
            </Muted>
          }
        />
        <View style={styles.footer}>
          <AppButton label="Nova avaliação" onPress={startAssessment} />
          <AppButton
            label="Como funciona o cálculo?"
            variant="ghost"
            onPress={() => router.push('/sobre')}
          />
          <Muted style={styles.centered}>
            {QUESTIONS.length} questões · {CATEGORIES.length} categorias · ~5 minutos
          </Muted>
        </View>
      </View>

      <Modal
        visible={renaming !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setRenaming(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Subtitle>Renomear avaliação</Subtitle>
            <TextInput
              value={labelDraft}
              onChangeText={setLabelDraft}
              style={styles.input}
              placeholder="Nome da avaliação"
              placeholderTextColor={colors.textMuted}
              autoFocus
              maxLength={60}
              onSubmitEditing={saveRename}
            />
            <View style={styles.modalActions}>
              <AppButton
                label="Cancelar"
                variant="ghost"
                onPress={() => setRenaming(null)}
                style={styles.modalButton}
              />
              <AppButton
                label="Salvar"
                onPress={saveRename}
                disabled={!labelDraft.trim()}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    padding: spacing.md,
    gap: spacing.md,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  hero: {
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  centered: {
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  cardScore: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  scoreValue: {
    color: colors.text,
    fontSize: font.subtitle,
    fontWeight: '800',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.sm,
  },
  actionIcon: {
    color: colors.textMuted,
    fontSize: font.subtitle,
  },
  footer: {
    gap: spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: spacing.lg,
  },
  modalCard: {
    alignSelf: 'stretch',
    maxWidth: 420,
    marginHorizontal: 'auto',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  input: {
    color: colors.text,
    fontSize: font.body,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
});
