/**
 * Card de uma questão: enunciado, 4 âncoras (nota 4 → 1), chips especiais
 * ("Não se aplica" quando permitido, "Não sei" sempre) e o "por quê".
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Muted, Subtitle } from '@/components/ui';
import { Question } from '@/data/questionnaire';
import { AnswerValue } from '@/lib/score';
import { colors, font, radius, spacing } from '@/theme';

interface Props {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
}

const NOTAS = [4, 3, 2, 1] as const;

export function QuestionCard({ question, value, onChange }: Props) {
  return (
    <View style={styles.card}>
      <Subtitle>{question.text}</Subtitle>

      <View style={styles.options}>
        {NOTAS.map((nota) => {
          const selected = value === nota;
          return (
            <Pressable
              key={nota}
              onPress={() => onChange(nota)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <View style={[styles.notaBadge, selected && styles.notaBadgeSelected]}>
                <Text style={[styles.notaText, selected && styles.notaTextSelected]}>{nota}</Text>
              </View>
              <Text style={[styles.anchorText, selected && styles.anchorTextSelected]}>
                {question.anchors[nota - 1]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.chips}>
        {question.allowNA && (
          <Pressable
            onPress={() => onChange('na')}
            style={[styles.chip, value === 'na' && styles.chipSelected]}
          >
            <Text style={[styles.chipText, value === 'na' && styles.chipTextSelected]}>
              Não se aplica
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => onChange('unknown')}
          style={[styles.chip, value === 'unknown' && styles.chipSelected]}
        >
          <Text style={[styles.chipText, value === 'unknown' && styles.chipTextSelected]}>
            Não sei
          </Text>
        </Pressable>
      </View>

      <Muted style={styles.rationale}>💡 {question.rationale}</Muted>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.bg,
  },
  notaBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.border,
  },
  notaBadgeSelected: {
    backgroundColor: colors.primary,
  },
  notaText: {
    color: colors.text,
    fontSize: font.small,
    fontWeight: '700',
  },
  notaTextSelected: {
    color: colors.primaryText,
  },
  anchorText: {
    flex: 1,
    color: colors.text,
    fontSize: font.body,
  },
  anchorTextSelected: {
    fontWeight: '600',
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceAlt,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: font.small,
  },
  chipTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  rationale: {
    fontStyle: 'italic',
  },
});
