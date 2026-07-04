/**
 * Estado da avaliação em andamento. Montado no _layout do grupo avaliacao/,
 * então o estado zera ao sair do fluxo. Persistência (autosave) chega na fase 3.
 */
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { Answers, AnswerValue } from '@/lib/score';

interface AssessmentContextValue {
  answers: Answers;
  setAnswer: (questionId: number, value: AnswerValue) => void;
  reset: () => void;
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Answers>({});

  const setAnswer = useCallback((questionId: number, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const reset = useCallback(() => setAnswers({}), []);

  const value = useMemo(() => ({ answers, setAnswer, reset }), [answers, setAnswer, reset]);

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

export function useAssessment(): AssessmentContextValue {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error('useAssessment deve ser usado dentro de AssessmentProvider');
  return ctx;
}
