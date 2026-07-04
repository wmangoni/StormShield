/**
 * Tela do questionário: uma categoria por vez, na ordem de apresentação da
 * especificação. Ao terminar a última, replace para o resultado (o "voltar"
 * não reabre a última categoria).
 */
import { ScrollView, StyleSheet, View } from 'react-native';
import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';

import { QuestionCard } from '@/components/QuestionCard';
import { AppButton, Muted, Title } from '@/components/ui';
import { CATEGORIES, CategoryId, QUESTIONS } from '@/data/questionnaire';
import { useAssessment } from '@/features/assessment/context';
import { colors, spacing } from '@/theme';

/** Pré-gera as 6 rotas de categoria no export estático (web). */
export function generateStaticParams(): Array<{ categoria: string }> {
  return CATEGORIES.map((c) => ({ categoria: c.id }));
}

export default function CategoriaScreen() {
  const { categoria } = useLocalSearchParams<{ categoria: string }>();
  const { answers, setAnswer } = useAssessment();

  const index = CATEGORIES.findIndex((c) => c.id === categoria);
  if (index < 0) return <Redirect href="/" />;

  const category = CATEGORIES[index];
  const questions = QUESTIONS.filter((q) => q.category === category.id);
  const answered = questions.filter((q) => answers[q.id] !== undefined).length;
  const isLast = index === CATEGORIES.length - 1;

  function advance() {
    if (isLast) {
      router.replace('/avaliacao/resultado');
    } else {
      const next = CATEGORIES[index + 1];
      router.push({ pathname: '/avaliacao/[categoria]', params: { categoria: next.id } });
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: `Categoria ${index + 1} de ${CATEGORIES.length}` }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Title>
            {category.emoji} {category.title}
          </Title>
          <Muted>
            {answered}/{questions.length} respondidas nesta categoria
          </Muted>
        </View>

        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            value={answers[question.id]}
            onChange={(value) => setAnswer(question.id, value)}
          />
        ))}

        <AppButton
          label={isLast ? 'Ver resultado' : `Próxima: ${CATEGORIES[index + 1].emoji} ${CATEGORIES[index + 1].title}`}
          onPress={advance}
        />
        {answered < questions.length && (
          <Muted style={styles.hint}>
            Questões sem resposta ficam fora do cálculo — você pode avançar mesmo assim.
          </Muted>
        )}
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
  header: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  hint: {
    textAlign: 'center',
  },
});
