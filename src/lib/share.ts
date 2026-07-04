/**
 * Montagem do texto de compartilhamento do resultado — TypeScript puro.
 * O disparo (Share nativo / navigator.share / clipboard) fica na tela.
 */
import { CATEGORIES, QUESTIONS } from '@/data/questionnaire';
import { ScoreResult, TIERS } from '@/lib/score';

function questionText(id: number): string {
  return QUESTIONS.find((q) => q.id === id)?.text ?? `Questão ${id}`;
}

export function buildShareText(result: ScoreResult): string {
  const tier = TIERS[result.tier];
  const lines: string[] = [
    '🛡️ StormShield — preparação para tempestades',
    '',
    `Score: ${Math.round(result.score)}/100 · ${tier.emoji} Tier ${result.tier} — ${tier.label}`,
  ];

  if (result.cappedByFatal) {
    lines.push('⚠️ Contém falha crítica que trava o rank em "Vulnerável"');
  }

  lines.push('', 'Por categoria:');
  for (const cs of result.categoryScores) {
    const category = CATEGORIES.find((c) => c.id === cs.category);
    if (!category) continue;
    const value = cs.score === null ? '—' : `${Math.round(cs.score)}`;
    lines.push(`• ${category.emoji} ${category.title}: ${value}`);
  }

  if (result.priorityActions.length > 0) {
    lines.push('', '🎯 Prioridades:');
    result.priorityActions.forEach((action, i) => {
      lines.push(`${i + 1}. ${questionText(action.questionId)}`);
    });
  }

  lines.push('', 'Avalie a sua casa também: github.com/wmangoni/StormShield');
  return lines.join('\n');
}
