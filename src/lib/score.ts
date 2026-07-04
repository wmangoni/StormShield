/**
 * Cálculo do rank de resiliência — implementa a metodologia de
 * doc/ESPECIFICACAO_QUESTIONARIO.md (ver também doc/REFINAMENTO_TECNICO.md).
 *
 * TypeScript puro, sem React: o ScoreResult nunca é persistido — é sempre
 * recalculado a partir das respostas.
 */
import { CATEGORIES, QUESTIONS, CategoryId } from '@/data/questionnaire';

/** 1–4 = nota (4 melhor) · 'na' = não se aplica · 'unknown' = não sei. */
export type AnswerValue = 1 | 2 | 3 | 4 | 'na' | 'unknown';

/** questionId → resposta. Respostas parciais são válidas. */
export type Answers = Partial<Record<number, AnswerValue>>;

export type Tier = 'A' | 'B' | 'C' | 'D';

export interface TierInfo {
  min: number;
  label: string;
  emoji: string;
}

/** Faixas do rank — limites inclusivos, exatamente como na especificação. */
export const TIERS: Record<Tier, TierInfo> = {
  A: { min: 85, label: 'Muito preparada', emoji: '🟢' },
  B: { min: 70, label: 'Preparada', emoji: '🔵' },
  C: { min: 50, label: 'Vulnerável', emoji: '🟡' },
  D: { min: 0, label: 'Crítica', emoji: '🔴' },
};

export interface CategoryScore {
  category: CategoryId;
  /** 0–100, ou null se nenhuma questão da categoria foi pontuável. */
  score: number | null;
  /** Questões respondidas com nota 1–4 (as que entram no cálculo). */
  answered: number;
  total: number;
}

export interface PriorityAction {
  questionId: number;
  /** peso × (1 − nota_norm) — quanto maior, mais urgente. */
  gap: number;
}

export interface ScoreResult {
  /** 0–100. Arredondar SOMENTE na exibição — nunca antes de classificar o tier. */
  score: number;
  /** Tier final, já com o rebaixamento por falha fatal aplicado. */
  tier: Tier;
  /** true quando o tier foi efetivamente rebaixado por uma falha fatal. */
  cappedByFatal: boolean;
  /** Questões fatais respondidas com nota 1. */
  fatalQuestionIds: number[];
  /** Questões respondidas com "não sei" → recomendar inspeção. */
  inspectionQuestionIds: number[];
  categoryScores: CategoryScore[];
  /** Top 3 por gap; empates: fatal primeiro, depois maior peso, depois menor id. */
  priorityActions: PriorityAction[];
}

/** nota_norm = (resposta − 1) / 3 → 1→0.00 · 2→0.33 · 3→0.67 · 4→1.00 */
function normalize(answer: 1 | 2 | 3 | 4): number {
  return (answer - 1) / 3;
}

function isScorable(value: AnswerValue | undefined): value is 1 | 2 | 3 | 4 {
  return typeof value === 'number';
}

/** Classifica o score bruto (sem arredondar) na faixa do rank. */
export function tierFromScore(score: number): Tier {
  if (score >= TIERS.A.min) return 'A';
  if (score >= TIERS.B.min) return 'B';
  if (score >= TIERS.C.min) return 'C';
  return 'D';
}

const TIER_ORDER: Tier[] = ['A', 'B', 'C', 'D'];

/** Retorna o pior (mais baixo) entre dois tiers. */
function worstTier(a: Tier, b: Tier): Tier {
  return TIER_ORDER.indexOf(a) >= TIER_ORDER.indexOf(b) ? a : b;
}

export function computeScore(answers: Answers): ScoreResult {
  let weightedSum = 0;
  let weightTotal = 0;
  const fatalQuestionIds: number[] = [];
  const inspectionQuestionIds: number[] = [];
  const candidates: Array<PriorityAction & { fatal: boolean; weight: number }> = [];

  for (const question of QUESTIONS) {
    const answer = answers[question.id];
    if (answer === undefined || answer === 'na') continue;
    if (answer === 'unknown') {
      inspectionQuestionIds.push(question.id);
      continue;
    }

    const norm = normalize(answer);
    weightedSum += question.weight * norm;
    weightTotal += question.weight;

    if (question.fatal && answer === 1) fatalQuestionIds.push(question.id);

    const gap = question.weight * (1 - norm);
    if (gap > 0) {
      candidates.push({
        questionId: question.id,
        gap,
        fatal: question.fatal === true,
        weight: question.weight,
      });
    }
  }

  const score = weightTotal > 0 ? (weightedSum / weightTotal) * 100 : 0;

  const baseTier = tierFromScore(score);
  const tier = fatalQuestionIds.length > 0 ? worstTier(baseTier, 'C') : baseTier;
  const cappedByFatal = tier !== baseTier;

  const categoryScores: CategoryScore[] = CATEGORIES.map((category) => {
    const questions = QUESTIONS.filter((q) => q.category === category.id);
    let sum = 0;
    let total = 0;
    let answered = 0;
    for (const q of questions) {
      const answer = answers[q.id];
      if (!isScorable(answer)) continue;
      sum += q.weight * normalize(answer);
      total += q.weight;
      answered += 1;
    }
    return {
      category: category.id,
      score: total > 0 ? (sum / total) * 100 : null,
      answered,
      total: questions.length,
    };
  });

  const priorityActions: PriorityAction[] = candidates
    .sort(
      (a, b) =>
        b.gap - a.gap ||
        Number(b.fatal) - Number(a.fatal) ||
        b.weight - a.weight ||
        a.questionId - b.questionId,
    )
    .slice(0, 3)
    .map(({ questionId, gap }) => ({ questionId, gap }));

  return {
    score,
    tier,
    cappedByFatal,
    fatalQuestionIds,
    inspectionQuestionIds,
    categoryScores,
    priorityActions,
  };
}
