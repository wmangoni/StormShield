/**
 * Barra de score de uma categoria no resultado: título, barra 0–100 colorida
 * pelo tier da categoria e o detalhe respondidas/total.
 */
import { StyleSheet, Text, View } from 'react-native';

import { Muted } from '@/components/ui';
import { Category } from '@/data/questionnaire';
import { tierFromScore } from '@/lib/score';
import { colors, font, radius, spacing } from '@/theme';

const SCORE_COLORS = {
  A: colors.primary,
  B: colors.accent,
  C: colors.warning,
  D: colors.danger,
} as const;

interface Props {
  category: Category;
  /** 0–100, ou null quando nenhuma questão da categoria pontuou. */
  score: number | null;
  answered: number;
  total: number;
}

export function CategoryBar({ category, score, answered, total }: Props) {
  const color = score === null ? colors.border : SCORE_COLORS[tierFromScore(score)];
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>
          {category.emoji} {category.title}
        </Text>
        <Text style={[styles.value, { color: score === null ? colors.textMuted : color }]}>
          {score === null ? '—' : Math.round(score)}
        </Text>
      </View>
      <View style={styles.track}>
        {score !== null && (
          <View style={[styles.fill, { width: `${score}%`, backgroundColor: color }]} />
        )}
      </View>
      <Muted>
        {answered}/{total} questões pontuadas
      </Muted>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: font.body,
    fontWeight: '600',
  },
  value: {
    fontSize: font.body,
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
