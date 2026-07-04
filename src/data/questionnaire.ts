/**
 * As 25 questões do StormShield — espelho 1:1 de doc/ESPECIFICACAO_QUESTIONARIO.md.
 *
 * Regras estruturais (ver doc/REFINAMENTO_TECNICO.md):
 * - `CATEGORIES` e `QUESTIONS` estão na ORDEM DE APRESENTAÇÃO fixada na especificação.
 *   A UI apenas percorre os arrays — nenhum sort por id em lugar nenhum.
 * - `id` é estável e é a chave da persistência: nunca renumerar nem reaproveitar.
 * - `anchors` é indexado por `nota − 1` (posição 0 = nota 1, a pior; posição 3 = nota 4).
 */

export type CategoryId =
  | 'cobertura'
  | 'drenagem'
  | 'terreno'
  | 'arvores'
  | 'manutencao'
  | 'aberturas';

export interface Category {
  id: CategoryId;
  title: string;
  emoji: string;
}

export interface Question {
  id: number;
  category: CategoryId;
  text: string;
  /** Descrições das notas [1, 2, 3, 4] — posição 0 = nota 1 (pior). */
  anchors: [string, string, string, string];
  /** Criticidade: peso no cálculo do score. */
  weight: 2 | 3 | 4;
  /** Nota 1 trava o tier no máximo em 'C — Vulnerável'. */
  fatal?: boolean;
  /** Admite resposta "não se aplica". */
  allowNA?: boolean;
  /** O "por quê" da questão, exibido ao usuário. */
  rationale: string;
}

export const CATEGORIES: Category[] = [
  { id: 'aberturas', title: 'Aberturas, fachada e projéteis', emoji: '💨' },
  { id: 'drenagem', title: 'Calhas e drenagem pluvial', emoji: '🌧️' },
  { id: 'terreno', title: 'Terreno e permeabilidade', emoji: '🌱' },
  { id: 'arvores', title: 'Árvores e entorno', emoji: '🌳' },
  { id: 'cobertura', title: 'Cobertura e telhado', emoji: '🏠' },
  { id: 'manutencao', title: 'Manutenção e histórico', emoji: '🔧' },
];

export const QUESTIONS: Question[] = [
  // ── 1ª · 💨 Aberturas, fachada e projéteis ─────────────────────────────
  {
    id: 22,
    category: 'aberturas',
    text: 'Como estão a vedação e as travas das janelas e portas externas?',
    anchors: [
      'Frágeis / sem trava',
      'Folgas perceptíveis',
      'Vedação ok, trava simples',
      'Boa vedação, múltiplas travas',
    ],
    weight: 3,
    rationale:
      'Aberturas com folga permitem entrada de vento e água; quando uma abertura cede, o interior é pressurizado e o dano se propaga.',
  },
  {
    id: 25,
    category: 'aberturas',
    text: 'Como estão fixados os itens instalados no telhado (aquecedor solar, placas, caixa d’água, antena)?',
    anchors: [
      'Soltos / apenas apoiados',
      'Apoiados / fixação simples',
      'Bem fixados',
      'Ancorados conforme norma',
    ],
    weight: 4,
    allowNA: true,
    rationale:
      'Itens mal ancorados no telhado são arrancados pelo vento e abrem caminho para a entrada de água.',
  },
  {
    id: 23,
    category: 'aberturas',
    text: 'As aberturas possuem proteção contra impacto (persiana, película, shutter)?',
    anchors: ['Nenhuma', 'Poucas', 'Principais', 'Todas as aberturas'],
    weight: 3,
    rationale:
      'Proteção contra impacto evita a quebra de vidros por projéteis — a quebra de uma abertura pressuriza o interior da casa.',
  },
  {
    id: 24,
    category: 'aberturas',
    text: 'Há objetos soltos no entorno (móveis de quintal, lonas, antenas)?',
    anchors: [
      'Muitos projéteis potenciais',
      'Vários itens',
      'Poucos, fácil recolher',
      'Nada solto / tudo ancorável',
    ],
    weight: 4,
    rationale: 'Objetos soltos viram projéteis em rajadas fortes, atingindo a própria casa e as vizinhas.',
  },
  {
    id: 21,
    category: 'aberturas',
    text: 'Como é a porta de garagem / portão grande?',
    anchors: [
      'Leve sem reforço / empenada',
      'Padrão leve',
      'Robusta, bem fixada',
      'Reforçada para vento (bracing)',
    ],
    weight: 4,
    fatal: true,
    allowNA: true,
    rationale:
      'A porta de garagem é o modo de falha nº 1 por vento em residências: quando cede, pressuriza o interior e pode arrancar o telhado.',
  },

  // ── 2ª · 🌧️ Calhas e drenagem pluvial ──────────────────────────────────
  {
    id: 10,
    category: 'drenagem',
    text: 'Para onde é direcionada a água da chuva?',
    anchors: [
      'Acumula na fundação',
      'Escoa junto à parede',
      'Afastada, mas próxima',
      'Mais de 3 m da casa / rede pluvial',
    ],
    weight: 4,
    rationale:
      'Água acumulada próxima às fundações causa recalques, infiltrações e deterioração estrutural ao longo do tempo.',
  },
  {
    id: 9,
    category: 'drenagem',
    text: 'Existe retenção de sedimentos (caixa de areia / grelha) antes das tubulações enterradas?',
    anchors: [
      'Inexistente',
      'Improvisada / insuficiente',
      'Presente, manutenção atrasada',
      'Presente e limpa',
    ],
    weight: 3,
    allowNA: true,
    rationale:
      'Folhas e sedimentos sem retenção entopem galerias subterrâneas, especialmente em eventos intensos.',
  },
  {
    id: 6,
    category: 'drenagem',
    text: 'Quando as calhas foram limpas pela última vez?',
    anchors: ['Mais de 12 meses / nunca', 'Menos de 12 meses', 'Menos de 6 meses', 'Menos de 3 meses'],
    weight: 4,
    allowNA: true,
    rationale:
      'Calhas entupidas transbordam durante chuvas intensas, forçando a água para dentro da cobertura e das paredes.',
  },
  {
    id: 7,
    category: 'drenagem',
    text: 'Como está o escoamento das calhas (sem água parada)?',
    anchors: [
      'Água parada / sem calha',
      'Acúmulo em vários trechos',
      'Acúmulo pontual',
      'Escoa 100%',
    ],
    weight: 3,
    allowNA: true,
    rationale:
      'A NBR 10844 exige inclinação mínima de 0,5%. Água parada indica acúmulo de sedimentos e entupimentos frequentes.',
  },
  {
    id: 8,
    category: 'drenagem',
    text: 'Como estão os condutores pluviais (tubos de descida)?',
    anchors: [
      'Entupidos / quebrados',
      'Obstrução ou dano parcial',
      'Defeito apenas estético',
      'Desobstruídos e íntegros',
    ],
    weight: 4,
    allowNA: true,
    rationale: 'Condutores entupidos ou quebrados redirecionam a água para fundações e paredes.',
  },

  // ── 3ª · 🌱 Terreno e permeabilidade ───────────────────────────────────
  {
    id: 14,
    category: 'terreno',
    text: 'Há sinais de erosão, ravinas ou movimentação de solo no terreno ou em taludes próximos?',
    anchors: [
      'Ravinas / talude instável',
      'Erosão ativa localizada',
      'Superficial, estabilizado',
      'Nenhum sinal',
    ],
    weight: 4,
    rationale:
      'Erosão ativa indica instabilidade que piora significativamente durante eventos de chuva intensa.',
  },
  {
    id: 13,
    category: 'terreno',
    text: 'O caimento do terreno direciona a água para onde?',
    anchors: [
      'Direciona para a casa',
      'Plano / irregular',
      'Adequado na maior parte',
      'Claro, para fora da área construída',
    ],
    weight: 3,
    rationale: 'Terrenos mal caimentados retêm água próxima às paredes e fundações.',
  },
  {
    id: 12,
    category: 'terreno',
    text: 'Qual o histórico de alagamento do terreno em chuvas fortes?',
    anchors: ['Recorrente', 'Ocasional em chuva forte', 'Só em evento extremo isolado', 'Nunca'],
    weight: 4,
    fatal: true,
    rationale:
      'Histórico de alagamento indica que o sistema de drenagem já opera no limite ou abaixo dele.',
  },
  {
    id: 11,
    category: 'terreno',
    text: 'Quanto do terreno é permeável (solo exposto, jardim)?',
    anchors: ['100% impermeável', 'Menos de 20%', 'Entre 20% e 50%', '50% ou mais'],
    weight: 3,
    rationale:
      'Terrenos 100% impermeáveis aumentam o escoamento superficial e sobrecarregam o sistema de drenagem urbano.',
  },

  // ── 4ª · 🌳 Árvores e entorno ──────────────────────────────────────────
  {
    id: 15,
    category: 'arvores',
    text: 'Quando foi a última poda das árvores próximas da casa?',
    anchors: [
      'Nunca / sem manejo',
      'Mais de 24 meses',
      'Menos de 24 meses',
      'Menos de 12 meses (profissional)',
    ],
    weight: 3,
    allowNA: true,
    rationale:
      'A maioria dos acidentes com arborização envolve queda de galhos, não da árvore inteira. Poda preventiva reduz esse risco.',
  },
  {
    id: 17,
    category: 'arvores',
    text: 'Qual a saúde e a estabilidade das árvores do terreno (raízes)?',
    anchors: [
      'Confinada + inclinação / oco',
      'Raízes confinadas',
      'Leve confinamento',
      'Raízes livres, árvore sadia',
    ],
    weight: 2,
    allowNA: true,
    rationale:
      'Raízes confinadas por pavimentação comprometem a estabilidade mecânica da árvore ao longo do tempo.',
  },
  {
    id: 16,
    category: 'arvores',
    text: 'Existem galhos sobre a cobertura da casa?',
    anchors: [
      'Galhos secos/inclinados sobre o telhado',
      'Galhos vivos sobre o telhado',
      'Galhos vivos afastados',
      'Nenhum galho sobre a casa',
    ],
    weight: 4,
    fatal: true,
    allowNA: true,
    rationale: 'Galhos mortos sobre o telhado representam risco imediato em ventos acima de ~50 km/h.',
  },

  // ── 5ª · 🏠 Cobertura e telhado ────────────────────────────────────────
  {
    id: 4,
    category: 'cobertura',
    text: 'Qual o estado da estrutura do telhado (madeira/metálica) quanto a apodrecimento ou corrosão?',
    anchors: [
      'Generalizada / perda de seção',
      'Degradação localizada moderada',
      'Sinais superficiais pontuais',
      'Sã, tratada / pintada',
    ],
    weight: 4,
    fatal: true,
    rationale:
      'Estruturas degradadas perdem resistência e podem colapsar sob carga de vento ou granizo.',
  },
  {
    id: 3,
    category: 'cobertura',
    text: 'Qual a integridade das telhas (trincas, deslocamento, vegetação)?',
    anchors: [
      'Várias quebradas ou muita vegetação',
      '1–2 telhas trincadas/deslocadas',
      'Vegetação leve pontual',
      'Nenhuma anomalia',
    ],
    weight: 4,
    rationale:
      'Uma única telha deslocada pode iniciar o colapso de toda a cobertura durante uma tempestade.',
  },
  {
    id: 1,
    category: 'cobertura',
    text: 'Como as telhas estão fixadas?',
    anchors: ['Apenas encaixadas', 'Pregadas', 'Parafusadas', 'Parafusos + grampos/clipes'],
    weight: 4,
    fatal: true,
    rationale:
      'Telhas sem fixação mecânica são arrancadas com facilidade por ventos acima de ~60 km/h.',
  },
  {
    id: 2,
    category: 'cobertura',
    text: 'Quando foi a última inspeção do telhado?',
    anchors: ['Mais de 5 anos / nunca', 'Menos de 5 anos', 'Menos de 2 anos', 'Menos de 1 ano'],
    weight: 3,
    rationale:
      'Fissuras, microvegetação e desgaste acumulado reduzem a resistência ao impacto do granizo e do vento.',
  },
  {
    id: 5,
    category: 'cobertura',
    text: 'Como estão fixados os beirais e platibandas?',
    anchors: ['Soltos / faltando', 'Folga perceptível', 'Firmes, pequenos reparos', 'Firmes, sem folga'],
    weight: 3,
    rationale: 'Beirais soltos são os primeiros elementos a falhar e podem causar danos em cadeia.',
  },

  // ── 6ª · 🔧 Manutenção e histórico ─────────────────────────────────────
  {
    id: 19,
    category: 'manutencao',
    text: 'As instalações elétricas externas estão protegidas contra umidade?',
    anchors: [
      'Exposta / improvisada',
      'Parcialmente exposta',
      'Protegida, sem DR/DPS',
      'Grau IP adequado + DR/DPS',
    ],
    weight: 3,
    rationale:
      'Instalações elétricas expostas à umidade representam risco de curto-circuito e incêndio durante tempestades.',
  },
  {
    id: 20,
    category: 'manutencao',
    text: 'Quando foi a última vistoria técnica completa (cobertura e drenagem) com laudo?',
    anchors: ['Nunca', 'Informal / sem laudo', 'Menos de 5 anos', 'Menos de 2 anos'],
    weight: 2,
    rationale:
      'Sem histórico de manutenção, é impossível saber quais sistemas estão operando fora dos parâmetros de projeto.',
  },
  {
    id: 18,
    category: 'manutencao',
    text: 'Qual o histórico de infiltração nas paredes ou teto?',
    anchors: ['Ativa / generalizada', 'Recorrente pontual', 'Pontual, já corrigida', 'Nunca'],
    weight: 4,
    rationale:
      'Infiltrações anteriores indicam falhas em impermeabilização ou drenagem que tendem a se agravar com eventos mais intensos.',
  },
];
