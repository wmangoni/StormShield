# StormShield — Refinamento Técnico

> Como a especificação de produto ([ESPECIFICACAO_QUESTIONARIO.md](./ESPECIFICACAO_QUESTIONARIO.md))
> vira código nesta base Expo. Este documento define modelo de dados, módulo de score,
> navegação, persistência e o plano de implementação em fases.

## Stack (já montada)

- **Expo SDK 56** + **expo-router** (file-based, raiz em `src/app`)
- **TypeScript strict**, alias `@/*` → `src/*`
- Tema escuro centralizado em `src/theme` (tokens: `colors`, `spacing`, `radius`, `font`)
- Primitivos de UI em `src/components/ui.tsx` (`Title`, `Subtitle`, `Body`, `Muted`)

## Estrutura de pastas alvo

```
src/
├── app/                          # rotas (expo-router)
│   ├── _layout.tsx               # Stack raiz (existente)
│   ├── index.tsx                 # Home: avaliações salvas + "Nova avaliação"
│   ├── avaliacao/
│   │   ├── [categoria].tsx       # questionário, uma categoria por tela
│   │   └── resultado.tsx         # score, tier, detalhe por categoria, ações
│   └── sobre.tsx                 # metodologia explicada ao usuário (opcional, F3)
├── components/
│   ├── ui.tsx                    # primitivos (existente)
│   ├── QuestionCard.tsx          # questão + 4 âncoras + N/A/Não sei
│   ├── ScoreGauge.tsx            # score 0–100 + tier colorido
│   └── CategoryBar.tsx           # barra de score por categoria
├── data/
│   └── questionnaire.ts          # AS 25 QUESTÕES — espelho 1:1 da especificação
├── lib/
│   └── score.ts                  # cálculo puro: score, tiers, fatais, ações
├── storage/
│   └── assessments.ts            # persistência (AsyncStorage) de avaliações
└── theme/
    └── index.ts                  # tokens (existente)
```

Princípio: **`data` e `lib` são TypeScript puro, sem React** — testáveis isoladamente e
imunes a refactors de UI.

## Modelo de dados (`src/data/questionnaire.ts`)

```ts
export type CategoryId =
  | 'cobertura'
  | 'drenagem'
  | 'terreno'
  | 'arvores'
  | 'manutencao'
  | 'aberturas';

export interface Category {
  id: CategoryId;
  title: string;      // ex.: 'Cobertura e telhado'
  emoji: string;      // ex.: '🏠'
}

export interface Question {
  id: number;                              // 1..25, estável (usado na persistência)
  category: CategoryId;
  text: string;                            // enunciado
  anchors: [string, string, string, string]; // descrições das notas [1, 2, 3, 4]
  weight: 2 | 3 | 4;                       // criticidade
  fatal?: boolean;                         // nota 1 trava o tier em 'C'
  allowNA?: boolean;                       // admite "não se aplica"
  rationale: string;                       // o "por quê" mostrado ao usuário
}

export const CATEGORIES: Category[];       // na ORDEM DE APRESENTAÇÃO da especificação
export const QUESTIONS: Question[];        // 25 itens, na ORDEM DE APRESENTAÇÃO da especificação
```

Notas de design:

- **Ordem de apresentação ≠ id.** A ordem dos arrays `CATEGORIES` e `QUESTIONS` segue a ordem
  embaralhada fixada na especificação (categorias: aberturas → drenagem → terreno → árvores →
  cobertura → manutenção). A UI apenas percorre os arrays — nenhum sort por id em lugar nenhum.
- `anchors` indexado por `nota − 1` (posição 0 = nota 1). Tupla fixa de 4 garante em
  compile-time que nenhuma questão fique sem âncora.
- `id` numérico estável é a chave da persistência — **nunca renumerar nem reaproveitar**;
  reordenação de apresentação não afeta ids; questão removida aposenta o id, questão nova
  pega id novo.
- `rationale` guarda o texto "Por quê" da especificação — exibido no card e no resultado.

## Respostas e score (`src/lib/score.ts`)

```ts
export type AnswerValue = 1 | 2 | 3 | 4 | 'na' | 'unknown';
export type Answers = Record<number, AnswerValue>;   // questionId → resposta

export type Tier = 'A' | 'B' | 'C' | 'D';

export interface CategoryScore {
  category: CategoryId;
  score: number | null;      // null se nenhuma questão da categoria foi pontuável
  answered: number;
  total: number;
}

export interface PriorityAction {
  questionId: number;
  gap: number;               // peso × (1 − nota_norm)
}

export interface ScoreResult {
  score: number;             // 0–100, arredondado para inteiro na exibição
  tier: Tier;                // já com o rebaixamento fatal aplicado
  cappedByFatal: boolean;
  fatalQuestionIds: number[];        // fatais respondidas com nota 1
  inspectionQuestionIds: number[];   // respondidas com 'unknown'
  categoryScores: CategoryScore[];
  priorityActions: PriorityAction[]; // top 3
}

export function computeScore(answers: Answers): ScoreResult;
```

Regras de implementação (espelham a especificação):

1. `notaNorm = (resposta − 1) / 3`; somam apenas respostas numéricas (1–4).
2. `score = Σ(weight · notaNorm) / Σ(weight) × 100`. Se nada pontuável, `score = 0` e
   a UI mostra estado "avaliação incompleta".
3. Tier por faixa (≥85 A, 70–84 B, 50–69 C, <50 D). Se existir fatal com nota 1:
   `tier = pior(tier, 'C')` e `cappedByFatal = true`.
4. Ações: ordenar respostas numéricas por `gap = weight · (1 − notaNorm)` desc;
   desempate por `fatal` primeiro, depois `weight` maior, depois `id` menor; cortar em 3.
5. Comparações de tier com limites **inclusivos** exatamente como na tabela
   (85 → A; 84.6 exibido como 85 continua B — arredondar **só na exibição**, nunca
   antes de classificar o tier).

## Persistência (`src/storage/assessments.ts`)

- **AsyncStorage** (`@react-native-async-storage/async-storage` — adicionar com
  `npx expo install`), mesma abordagem do roteirizador.
- Uma avaliação salva:

```ts
export interface Assessment {
  id: string;            // id local simples (timestamp+aleatório — dispensa expo-crypto)
  label: string;         // ex.: 'Minha casa'
  createdAt: string;     // ISO
  updatedAt: string;
  answers: Answers;      // parciais são válidas (retomar depois)
  schemaVersion: 1;      // migração futura do questionário
}
```

- API: `listAssessments()`, `getAssessment(id)`, `saveAssessment(a)`, `removeAssessment(id)`.
- O `ScoreResult` **não** é persistido — sempre recalculado a partir de `answers`
  (fonte de verdade única; mudança de metodologia rescoreia o histórico automaticamente).
- `schemaVersion` + ids estáveis de questão permitem migrar avaliações antigas se o
  questionário evoluir.

## Navegação e telas

| Rota | Tela | Conteúdo |
|---|---|---|
| `/` | Home | Lista de avaliações (label, data, score, tier) + botão "Nova avaliação" |
| `/avaliacao/[categoria]` | Questionário | Uma categoria por tela; progresso "3/6"; avançar/voltar; salva rascunho a cada resposta |
| `/avaliacao/resultado` | Resultado | Gauge do score + tier; aviso de fatal (se houver); barras por categoria; top 3 ações; itens "não sei" → sugerir inspeção |
| `/sobre` | Metodologia | Explicação da fórmula, pesos e tiers (transparência) — fase 3 |

Fluxo do questionário:

- Rota dinâmica `[categoria]` percorre `CATEGORIES` em ordem; ao terminar a última,
  `router.replace('/avaliacao/resultado')` (replace para o "voltar" não reabrir a última página).
- Estado da avaliação em andamento: contexto leve (`AssessmentProvider` no `_layout` do grupo
  `avaliacao/`) + autosave no AsyncStorage a cada resposta — fechar o app não perde progresso.
- `QuestionCard`: enunciado, 4 opções com âncora textual (tocáveis, radio-style), chips
  "Não se aplica" (só se `allowNA`) e "Não sei", e o `rationale` em texto `Muted`.

## Testes

- Adicionar `jest-expo` (dev) na fase 1.
- Prioridade absoluta: **`lib/score.ts`** — casos mínimos:
  - tudo 4 → 100 / tier A; tudo 1 → 0 / tier D;
  - mistura com N/A e `unknown` fora do denominador;
  - fatal nota 1 com média alta → tier limitado a C, `cappedByFatal = true`;
  - fronteiras exatas de tier (85, 70, 50) e não-arredondamento antes da classificação;
  - top 3 ações com desempate (fatal > peso > id).
- `data/questionnaire.ts`: teste estrutural — 25 questões, ids únicos 1..25, todas as
  categorias presentes, pesos ∈ {2,3,4}, fatais = {1, 4, 12, 16, 21}, e ordem de
  apresentação igual à da especificação (snapshot da sequência de ids).

## Plano de implementação por fases

| Fase | Entrega | Toca em |
|---|---|---|
| **F1 — Núcleo** | `questionnaire.ts` + `score.ts` + testes passando | `src/data`, `src/lib`, jest-expo |
| **F2 — Fluxo mínimo** | Questionário navegável + resultado (sem persistência); home aponta para nova avaliação | `src/app`, `QuestionCard`, `ScoreGauge` |
| **F3 — Persistência e polimento** | AsyncStorage, lista na home, retomar rascunho, tela "Sobre a metodologia", `CategoryBar` | `src/storage`, home, resultado |

Cada fase fecha com `npx tsc --noEmit` limpo + testes verdes + commit próprio.

## Decisões em aberto (não bloqueiam F1)

- **Ícones**: manter emoji (padrão do roteirizador) ou `expo-symbols`/vector icons — decidir na F2.
- **Gauge do score**: componente próprio com `View`s (simples) vs SVG — começar simples.
- **Compartilhar resultado** (imagem/texto): candidata a fase 4, fora do escopo atual.
