/**
 * Testes da metodologia de cálculo (doc/ESPECIFICACAO_QUESTIONARIO.md):
 * normalização 0–100, N/A e "não sei" fora do denominador, falha fatal,
 * fronteiras de tier e ações prioritárias.
 */
import { QUESTIONS } from '@/data/questionnaire';
import { Answers, AnswerValue, computeScore, tierFromScore } from '@/lib/score';

/** Responde todas as 25 questões com o mesmo valor. */
function answerAll(value: AnswerValue): Answers {
  const answers: Answers = {};
  for (const q of QUESTIONS) answers[q.id] = value;
  return answers;
}

describe('computeScore', () => {
  it('tudo nota 4 → score 100, tier A, sem fatais nem ações', () => {
    const result = computeScore(answerAll(4));
    expect(result.score).toBe(100);
    expect(result.tier).toBe('A');
    expect(result.cappedByFatal).toBe(false);
    expect(result.fatalQuestionIds).toEqual([]);
    expect(result.priorityActions).toEqual([]);
  });

  it('tudo nota 1 → score 0 (piso real), tier D', () => {
    const result = computeScore(answerAll(1));
    expect(result.score).toBe(0);
    expect(result.tier).toBe('D');
    // Fatais registradas, mas sem rebaixamento: o tier já era pior que C.
    expect(result.fatalQuestionIds.sort((a, b) => a - b)).toEqual([1, 4, 12, 16, 21]);
    expect(result.cappedByFatal).toBe(false);
  });

  it('falha fatal com média alta → tier travado em C', () => {
    const answers = answerAll(4);
    answers[21] = 1; // porta de garagem leve sem reforço (fatal, peso 4)
    const result = computeScore(answers);
    // Σpesos = 86; nota 1 zera os 4 pontos da q21 → 82/86.
    expect(result.score).toBeCloseTo((82 / 86) * 100, 10);
    expect(tierFromScore(result.score)).toBe('A'); // sem a trava seria A
    expect(result.tier).toBe('C');
    expect(result.cappedByFatal).toBe(true);
    expect(result.fatalQuestionIds).toEqual([21]);
  });

  it('nota 1 em questão NÃO fatal não trava o tier', () => {
    const answers = answerAll(4);
    answers[24] = 1; // objetos soltos (peso 4, não fatal)
    const result = computeScore(answers);
    expect(result.tier).toBe('A');
    expect(result.cappedByFatal).toBe(false);
    expect(result.fatalQuestionIds).toEqual([]);
  });

  it('N/A e "não sei" saem do numerador e do denominador', () => {
    const result = computeScore({ 1: 4, 6: 'na', 16: 'unknown' });
    expect(result.score).toBe(100); // só a q1 pontua
    expect(result.inspectionQuestionIds).toEqual([16]);
    const cobertura = result.categoryScores.find((c) => c.category === 'cobertura');
    expect(cobertura).toMatchObject({ score: 100, answered: 1, total: 5 });
    const drenagem = result.categoryScores.find((c) => c.category === 'drenagem');
    expect(drenagem).toMatchObject({ score: null, answered: 0, total: 5 });
  });

  it('sem respostas pontuáveis → score 0 e categorias null', () => {
    const result = computeScore({});
    expect(result.score).toBe(0);
    expect(result.tier).toBe('D');
    for (const c of result.categoryScores) {
      expect(c.score).toBeNull();
      expect(c.answered).toBe(0);
    }
  });

  it('ações prioritárias: top 3 por gap, fatal > peso > id no empate', () => {
    const answers = answerAll(4);
    answers[3] = 1; // peso 4, não fatal → gap 4
    answers[1] = 1; // peso 4, FATAL → gap 4 (empate: fatal vem antes)
    answers[2] = 1; // peso 3 → gap 3
    answers[5] = 3; // peso 3 → gap 1 (fica de fora do top 3)
    const result = computeScore(answers);
    expect(result.priorityActions.map((a) => a.questionId)).toEqual([1, 3, 2]);
    expect(result.priorityActions[0].gap).toBe(4);
    expect(result.priorityActions[2].gap).toBe(3);
  });

  it('nota 4 (gap 0) nunca vira ação prioritária', () => {
    const result = computeScore({ 1: 4, 2: 4, 3: 3 });
    expect(result.priorityActions.map((a) => a.questionId)).toEqual([3]);
  });
});

describe('tierFromScore (fronteiras inclusivas, sem arredondar antes)', () => {
  it.each([
    [100, 'A'],
    [85, 'A'],
    [84.999, 'B'], // exibido como "85", mas classifica como B
    [70, 'B'],
    [69.999, 'C'],
    [50, 'C'],
    [49.999, 'D'],
    [0, 'D'],
  ] as const)('score %p → tier %p', (score, tier) => {
    expect(tierFromScore(score)).toBe(tier);
  });
});
