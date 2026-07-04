/**
 * Testes estruturais: garantem que src/data/questionnaire.ts espelha
 * doc/ESPECIFICACAO_QUESTIONARIO.md (ids, pesos, fatais, N/A e ordem de apresentação).
 */
import { CATEGORIES, QUESTIONS } from '@/data/questionnaire';

describe('questionnaire (estrutura)', () => {
  it('tem 25 questões com ids únicos 1..25', () => {
    expect(QUESTIONS).toHaveLength(25);
    const ids = QUESTIONS.map((q) => q.id).sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
  });

  it('mantém a ordem de apresentação fixada na especificação', () => {
    expect(QUESTIONS.map((q) => q.id)).toEqual([
      22, 25, 23, 24, 21, // aberturas
      10, 9, 6, 7, 8, // drenagem
      14, 13, 12, 11, // terreno
      15, 17, 16, // arvores
      4, 3, 1, 2, 5, // cobertura
      19, 20, 18, // manutencao
    ]);
    expect(CATEGORIES.map((c) => c.id)).toEqual([
      'aberturas',
      'drenagem',
      'terreno',
      'arvores',
      'cobertura',
      'manutencao',
    ]);
  });

  it('agrupa as questões por categoria na ordem das categorias', () => {
    const sequence = QUESTIONS.map((q) => q.category);
    const grouped = CATEGORIES.flatMap((c) => sequence.filter((id) => id === c.id));
    expect(sequence).toEqual(grouped);
  });

  it('tem pesos ∈ {2,3,4}', () => {
    for (const q of QUESTIONS) {
      expect([2, 3, 4]).toContain(q.weight);
    }
  });

  it('marca exatamente as falhas fatais da especificação', () => {
    const fatais = QUESTIONS.filter((q) => q.fatal)
      .map((q) => q.id)
      .sort((a, b) => a - b);
    expect(fatais).toEqual([1, 4, 12, 16, 21]);
  });

  it('marca exatamente as questões que admitem N/A', () => {
    const na = QUESTIONS.filter((q) => q.allowNA)
      .map((q) => q.id)
      .sort((a, b) => a - b);
    expect(na).toEqual([6, 7, 8, 9, 15, 16, 17, 21, 25]);
  });

  it('toda questão tem 4 âncoras não vazias e um rationale', () => {
    for (const q of QUESTIONS) {
      expect(q.anchors).toHaveLength(4);
      for (const anchor of q.anchors) {
        expect(anchor.trim().length).toBeGreaterThan(0);
      }
      expect(q.rationale.trim().length).toBeGreaterThan(0);
    }
  });

  it('toda questão tem um serviço de busca (redirecionamento inteligente)', () => {
    for (const q of QUESTIONS) {
      expect(q.service.trim().length).toBeGreaterThan(0);
    }
  });
});
