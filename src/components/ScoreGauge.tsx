/**
 * Exibição do score 0–100 com o tier colorido e uma barra de progresso.
 * O arredondamento acontece SÓ aqui, na exibição — nunca no cálculo.
 */
import { StyleSheet, Text, View } from 'react-native';

import { Muted } from '@/components/ui';
import { Tier, TIERS } from '@/lib/score';
import { colors, font, radius, spacing } from '@/theme';

const TIER_COLORS: Record<Tier, string> = {
  A: colors.primary,
  B: colors.accent,
  C: colors.warning,
  D: colors.danger,
};

interface Props {
  score: number;
  tier: Tier;
}

export function ScoreGauge({ score, tier }: Props) {
  const color = TIER_COLORS[tier];
  const info = TIERS[tier];
  return (
    <View style={styles.container}>
      <Text style={[styles.score, { color }]}>{Math.round(score)}</Text>
      <Muted>de 100 pontos</Muted>
      <View style={[styles.badge, { borderColor: color }]}>
        <Text style={[styles.badgeText, { color }]}>
          {info.emoji} Tier {tier} — {info.label}
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[styles.fill, { width: `${Math.min(100, Math.max(0, score))}%`, backgroundColor: color }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  score: {
    fontSize: 64,
    fontWeight: '800',
    lineHeight: 68,
  },
  badge: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  badgeText: {
    fontSize: font.body,
    fontWeight: '700',
  },
  track: {
    alignSelf: 'stretch',
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
