/**
 * Estado da avaliação em andamento, identificado pelo search param `id` das
 * rotas do grupo avaliacao/. Carrega do AsyncStorage ao montar e autosalva a
 * cada resposta — fechar o app não perde progresso. Sem `id`, opera apenas em
 * memória (fallback; a home sempre navega com id).
 */
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useGlobalSearchParams } from 'expo-router';

import { Answers, AnswerValue } from '@/lib/score';
import { Assessment, getAssessment, saveAssessment } from '@/storage/assessments';

interface AssessmentContextValue {
  answers: Answers;
  setAnswer: (questionId: number, value: AnswerValue) => void;
  /** true enquanto a avaliação persiste está sendo carregada. */
  loading: boolean;
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const params = useGlobalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : undefined;

  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(Boolean(id));
  const assessmentRef = useRef<Assessment | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!id) {
      assessmentRef.current = null;
      setLoading(false);
      return;
    }
    setLoading(true);
    getAssessment(id).then((assessment) => {
      if (cancelled) return;
      assessmentRef.current = assessment;
      setAnswers(assessment?.answers ?? {});
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const setAnswer = useCallback((questionId: number, value: AnswerValue) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: value };
      const assessment = assessmentRef.current;
      if (assessment) {
        const updated: Assessment = {
          ...assessment,
          answers: next,
          updatedAt: new Date().toISOString(),
        };
        assessmentRef.current = updated;
        // Autosave fire-and-forget: a UI não espera o disco.
        void saveAssessment(updated);
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ answers, setAnswer, loading }), [answers, setAnswer, loading]);

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

export function useAssessment(): AssessmentContextValue {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error('useAssessment deve ser usado dentro de AssessmentProvider');
  return ctx;
}
