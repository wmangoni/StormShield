/**
 * Roundtrip da persistência (AsyncStorage mockado em memória via jest.setup.js).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getAssessment,
  listAssessments,
  newAssessment,
  removeAssessment,
  saveAssessment,
} from '@/storage/assessments';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('assessments storage', () => {
  it('newAssessment cria avaliação vazia com id e schemaVersion', () => {
    const a = newAssessment('Minha casa');
    expect(a.id.length).toBeGreaterThan(0);
    expect(a.label).toBe('Minha casa');
    expect(a.answers).toEqual({});
    expect(a.schemaVersion).toBe(1);
    expect(a.createdAt).toBe(a.updatedAt);
  });

  it('save → get → list roundtrip', async () => {
    const a = newAssessment('Casa A');
    await saveAssessment(a);
    expect(await getAssessment(a.id)).toEqual(a);
    expect(await listAssessments()).toEqual([a]);
  });

  it('save é upsert: atualiza sem duplicar', async () => {
    const a = newAssessment('Casa A');
    await saveAssessment(a);
    const updated = { ...a, answers: { 1: 4 as const }, updatedAt: '2099-01-01T00:00:00.000Z' };
    await saveAssessment(updated);
    const all = await listAssessments();
    expect(all).toHaveLength(1);
    expect(all[0].answers).toEqual({ 1: 4 });
  });

  it('lista ordena por updatedAt desc', async () => {
    const antiga = { ...newAssessment('Antiga'), updatedAt: '2020-01-01T00:00:00.000Z' };
    const recente = { ...newAssessment('Recente'), updatedAt: '2030-01-01T00:00:00.000Z' };
    await saveAssessment(antiga);
    await saveAssessment(recente);
    expect((await listAssessments()).map((a) => a.label)).toEqual(['Recente', 'Antiga']);
  });

  it('remove apaga só a avaliação alvo', async () => {
    const a = newAssessment('A');
    const b = newAssessment('B');
    await saveAssessment(a);
    await saveAssessment(b);
    await removeAssessment(a.id);
    expect(await getAssessment(a.id)).toBeNull();
    expect((await listAssessments()).map((x) => x.id)).toEqual([b.id]);
  });

  it('storage corrompido → lista vazia (sem crash)', async () => {
    await AsyncStorage.setItem('stormshield/assessments/v1', '{não é json válido');
    expect(await listAssessments()).toEqual([]);
  });
});
