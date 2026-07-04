/**
 * Persistência das avaliações (AsyncStorage, chave única com o array).
 *
 * O ScoreResult NUNCA é persistido — sempre recalculado a partir de `answers`
 * (fonte de verdade única). `schemaVersion` + ids estáveis de questão permitem
 * migrar avaliações antigas se o questionário evoluir.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Answers } from '@/lib/score';

export interface Assessment {
  id: string;
  label: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  /** Parciais são válidas (retomar depois). */
  answers: Answers;
  schemaVersion: 1;
}

const STORAGE_KEY = 'stormshield/assessments/v1';

/** Id local simples (timestamp + aleatório) — não precisa ser UUID de verdade. */
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function newAssessment(label: string): Assessment {
  const now = new Date().toISOString();
  return { id: generateId(), label, createdAt: now, updatedAt: now, answers: {}, schemaVersion: 1 };
}

async function readAll(): Promise<Assessment[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(assessments: Assessment[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(assessments));
}

/** Todas as avaliações, mais recente primeiro. */
export async function listAssessments(): Promise<Assessment[]> {
  const all = await readAll();
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getAssessment(id: string): Promise<Assessment | null> {
  const all = await readAll();
  return all.find((a) => a.id === id) ?? null;
}

/** Upsert por id. */
export async function saveAssessment(assessment: Assessment): Promise<void> {
  const all = await readAll();
  const index = all.findIndex((a) => a.id === assessment.id);
  if (index >= 0) {
    all[index] = assessment;
  } else {
    all.push(assessment);
  }
  await writeAll(all);
}

export async function removeAssessment(id: string): Promise<void> {
  const all = await readAll();
  await writeAll(all.filter((a) => a.id !== id));
}

/** Renomeia mantendo o restante intacto; ignora id inexistente. */
export async function renameAssessment(id: string, label: string): Promise<void> {
  const assessment = await getAssessment(id);
  if (!assessment) return;
  await saveAssessment({ ...assessment, label, updatedAt: new Date().toISOString() });
}
