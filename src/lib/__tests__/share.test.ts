/**
 * Testes do texto de compartilhamento.
 */
import { QUESTIONS } from '@/data/questionnaire';
import { computeScore } from '@/lib/score';
import { buildShareText } from '@/lib/share';

describe('buildShareText', () => {
  it('inclui score, tier, categorias e prioridades', () => {
    const answers: Record<number, 1 | 2 | 3 | 4> = {};
    for (const q of QUESTIONS) answers[q.id] = 4;
    answers[24] = 1; // objetos soltos (peso 4, não fatal) → prioridade nº 1
    const text = buildShareText(computeScore(answers));

    expect(text).toContain('StormShield');
    expect(text).toContain('/100');
    expect(text).toContain('Tier');
    expect(text).toContain('Por categoria:');
    expect(text).toContain('💨 Aberturas, fachada e projéteis');
    expect(text).toContain('🎯 Prioridades:');
    expect(text).toContain('1. Há objetos soltos no entorno');
    expect(text).not.toContain('falha crítica'); // sem fatais com nota 1
  });

  it('sinaliza a trava por falha crítica', () => {
    const answers: Record<number, 1 | 2 | 3 | 4> = {};
    for (const q of QUESTIONS) answers[q.id] = 4;
    answers[21] = 1; // porta de garagem (fatal)
    const text = buildShareText(computeScore(answers));
    expect(text).toContain('⚠️ Contém falha crítica');
  });

  it('categoria sem respostas pontuáveis aparece como —', () => {
    const text = buildShareText(computeScore({ 1: 4 }));
    expect(text).toContain('🌧️ Calhas e drenagem pluvial: —');
    expect(text).toContain('🏠 Cobertura e telhado: 100');
  });
});
