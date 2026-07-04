/**
 * Transparência da metodologia: como o score é calculado, pesos, faixas do
 * rank, falhas fatais e respostas especiais (doc/ESPECIFICACAO_QUESTIONARIO.md).
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';

import { Body, Muted, Subtitle } from '@/components/ui';
import { TIERS, Tier } from '@/lib/score';
import { colors, font, radius, spacing } from '@/theme';

const TIER_RANGES: Record<Tier, string> = {
  A: '85 a 100',
  B: '70 a 84',
  C: '50 a 69',
  D: 'abaixo de 50',
};

export default function SobreScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Como funciona' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Subtitle>📏 A escala de 1 a 4</Subtitle>
          <Body>
            Cada questão é respondida numa escala de 1 (pior situação) a 4 (melhor situação). A
            nota 1 vale 0% e a nota 4 vale 100% — o score final é a média dessas notas, ponderada
            pela criticidade de cada item.
          </Body>
        </View>

        <View style={styles.section}>
          <Subtitle>⚖️ Pesos por criticidade</Subtitle>
          <Body>
            Nem todo item pesa igual: uma telha solta é mais grave que a falta de um laudo. Cada
            questão tem peso 2, 3 ou 4 conforme o potencial de dano que representa numa
            tempestade.
          </Body>
        </View>

        <View style={styles.section}>
          <Subtitle>🏅 Faixas do rank</Subtitle>
          {(Object.keys(TIERS) as Tier[]).map((tier) => (
            <View key={tier} style={styles.tierRow}>
              <Text style={styles.tierLabel}>
                {TIERS[tier].emoji} Tier {tier} — {TIERS[tier].label}
              </Text>
              <Muted>{TIER_RANGES[tier]}</Muted>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Subtitle>⚠️ Falhas críticas</Subtitle>
          <Body>
            Alguns itens representam risco de colapso ou dano grave (ex.: telhas apenas
            encaixadas, galho seco sobre o telhado, porta de garagem sem reforço). Se qualquer um
            deles receber a pior nota, o rank fica travado em no máximo "Vulnerável" — uma média
            boa não pode esconder um risco crítico.
          </Body>
        </View>

        <View style={styles.section}>
          <Subtitle>🚫 "Não se aplica" e "Não sei"</Subtitle>
          <Body>
            Itens que não existem na sua casa (ex.: sem árvores, sem calhas) saem completamente do
            cálculo — não ajudam nem atrapalham. Já o "não sei" também fica fora do cálculo, mas
            entra na lista de itens a inspecionar: responder com certeza deixa seu rank mais
            preciso.
          </Body>
        </View>

        <View style={styles.section}>
          <Subtitle>🎯 Ações prioritárias</Subtitle>
          <Body>
            O resultado destaca os 3 itens onde investir primeiro: os de maior peso e pior nota —
            é onde cada real gasto mais sobe o seu rank (e mais protege a casa).
          </Body>
        </View>

        <Muted style={styles.footer}>
          O score é sempre recalculado a partir das suas respostas — nada é estimado.
        </Muted>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
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
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierLabel: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    paddingBottom: spacing.md,
  },
});
