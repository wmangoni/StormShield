# StormShield — Especificação do Questionário e do Rank

> **Objetivo:** gerar um rank de pontuação (0–100) mostrando o quão preparada uma residência
> se encontra para enfrentar uma tempestade com fortes rajadas de vento.
>
> **Status:** especificação aprovada em 2026-07-04. Fonte de verdade do produto — o código
> em `src/data` e `src/lib` deve espelhar este documento.

## Decisões de escopo (travadas)

| Decisão | Escolha |
|---|---|
| Tipo de índice | **Índice único** de "resiliência a tempestades" (sem separar vento/água) |
| Nº de questões | **25**, em 6 categorias |
| Escala de resposta | **1 a 4**, sempre com polaridade **4 = melhor, 1 = pior** |
| Piso da escala | Nota 1 vale **0%** — normalização `(resposta − 1) / 3`, escala real 0–100 |
| Respostas especiais | **N/A** e **"Não sei"** saem do numerador e do denominador |
| Pesos | Criticidade de 2 a 4 por questão (herdada do campo "Obs" do esboço original) |
| Falhas fatais | Nota 1 em item fatal trava o tier no máximo em **C — Vulnerável** |
| Saída acionável | **Top 3 ações prioritárias** = maiores `peso × (1 − nota_norm)` |

## Metodologia de cálculo

```
Por questão:   nota_norm = (resposta − 1) / 3        // 1→0.00 · 2→0.33 · 3→0.67 · 4→1.00
Score global:  Score = Σ(peso · nota_norm) / Σ(peso) × 100
               // somatório apenas sobre questões respondidas com 1–4
               // (N/A e "Não sei" ficam fora de numerador e denominador)
```

Regras complementares:

- **"Não sei"** não pontua, mas dispara uma recomendação de inspeção daquele item no resultado.
- **Falha fatal:** se qualquer questão marcada como fatal receber nota 1, o tier final é limitado
  a no máximo **C — Vulnerável**, independentemente do score numérico. O score numérico é exibido
  normalmente, acompanhado do motivo do rebaixamento.
- **Ações prioritárias:** ordenar as questões respondidas por `peso × (1 − nota_norm)` decrescente
  e exibir as 3 primeiras como plano de ação. Empates: priorizar itens fatais, depois maior peso.
- **Score por categoria** (para o radar/detalhe): mesma fórmula, restrita às questões da categoria.

### Faixas do rank (tiers)

| Score | Tier | Rótulo |
|---|---|---|
| ≥ 85 | A | 🟢 Muito preparada |
| 70–84 | B | 🔵 Preparada |
| 50–69 | C | 🟡 Vulnerável |
| < 50 | D | 🔴 Crítica |

## Questionário (25 questões, 6 categorias)

Legenda: **P** = peso (criticidade 2–4) · **Fatal** = nota 1 trava o tier · **N/A** = admite "não se aplica".

### 🏠 Cobertura e telhado

| # | Questão | 4 | 3 | 2 | 1 | P | Fatal | N/A |
|---|---|---|---|---|---|---|:---:|:---:|
| 1 | Fixação das telhas | Parafusos **+** grampos/clipes | Parafusadas | Pregadas | Só encaixadas | 4 | ☠️ | |
| 2 | Última inspeção do telhado | < 1 ano | < 2 anos | < 5 anos | > 5 anos / nunca | 3 | | |
| 3 | Integridade das telhas (trincas/deslocamento/vegetação) | Nenhuma anomalia | Vegetação leve pontual | 1–2 telhas trincadas/deslocadas | Várias quebradas ou muita vegetação | 4 | | |
| 4 | Estrutura (madeira/metálica): apodrecimento/corrosão | Sã, tratada/pintada | Sinais superficiais pontuais | Degradação localizada moderada | Generalizada / perda de seção | 4 | ☠️ | |
| 5 | Fixação de beirais e platibandas | Firmes, sem folga | Firmes, pequenos reparos | Folga perceptível | Soltos / faltando | 3 | | |

> **Por quê:** telhas sem fixação mecânica são arrancadas por ventos acima de ~60 km/h; uma única
> telha deslocada pode iniciar o colapso da cobertura; beirais soltos são os primeiros a falhar.

### 🌧️ Calhas e drenagem pluvial

| # | Questão | 4 | 3 | 2 | 1 | P | Fatal | N/A |
|---|---|---|---|---|---|---|:---:|:---:|
| 6 | Última limpeza das calhas | < 3 meses | < 6 meses | < 12 meses | > 12 meses / nunca | 4 | | ✔ |
| 7 | Escoamento das calhas (sem água parada) | Escoa 100% | Acúmulo pontual | Acúmulo em vários trechos | Água parada / sem calha | 3 | | ✔ |
| 8 | Condutores (tubos de descida) | Desobstruídos e íntegros | Defeito estético | Obstrução/dano parcial | Entupidos/quebrados | 4 | | ✔ |
| 9 | Retenção de sedimentos (caixa de areia/grelha) | Presente e limpa | Presente, manutenção atrasada | Improvisada/insuficiente | Inexistente | 3 | | ✔ |
| 10 | Destino da água pluvial | > 3 m da casa / rede | Afastada, mas próxima | Escoa junto à parede | Acumula na fundação | 4 | | |

> **Por quê:** calhas entupidas transbordam para dentro da cobertura e paredes; NBR 10844 exige
> inclinação mínima de 0,5%; água na fundação causa recalques e infiltrações.

### 🌱 Terreno e permeabilidade

| # | Questão | 4 | 3 | 2 | 1 | P | Fatal | N/A |
|---|---|---|---|---|---|---|:---:|:---:|
| 11 | Área permeável do terreno | ≥ 50% | 20–50% | < 20% | 100% impermeável | 3 | | |
| 12 | Histórico de alagamento no terreno | Nunca | Só em evento extremo isolado | Ocasional em chuva forte | Recorrente | 4 | ☠️ | |
| 13 | Caimento do terreno | Claro, para fora da área construída | Adequado na maior parte | Plano/irregular | Direciona para a casa | 3 | | |
| 14 | Erosão / ravinas / movimentação de solo | Nenhum sinal | Superficial, estabilizado | Erosão ativa localizada | Ravinas / talude instável | 4 | | |

> **Por quê:** terreno 100% impermeável sobrecarrega a drenagem urbana; histórico de alagamento
> indica sistema operando no limite; erosão ativa piora muito em chuva intensa.

### 🌳 Árvores e entorno

| # | Questão | 4 | 3 | 2 | 1 | P | Fatal | N/A |
|---|---|---|---|---|---|---|:---:|:---:|
| 15 | Poda preventiva | < 12 meses (profissional) | < 24 meses | > 24 meses | Nunca / sem manejo | 3 | | ✔ |
| 16 | Galhos sobre a cobertura | Nenhum galho sobre a casa | Galhos vivos afastados | Galhos vivos sobre o telhado | Galhos **secos/inclinados** sobre o telhado | 4 | ☠️ | ✔ |
| 17 | Saúde/estabilidade da árvore (raízes) | Raízes livres, árvore sadia | Leve confinamento | Raízes confinadas | Confinada + inclinação/oco | 2 | | ✔ |

> **Por quê:** a maioria dos acidentes com arborização envolve queda de galhos, não da árvore
> inteira; galhos mortos sobre o telhado são risco imediato acima de ~50 km/h; raízes confinadas
> comprometem a estabilidade mecânica.

### 🔧 Manutenção e histórico

| # | Questão | 4 | 3 | 2 | 1 | P | Fatal | N/A |
|---|---|---|---|---|---|---|:---:|:---:|
| 18 | Histórico de infiltração | Nunca | Pontual, já corrigida | Recorrente pontual | Ativa / generalizada | 4 | | |
| 19 | Proteção elétrica externa | Grau IP adequado + DR/DPS | Protegida, sem DR/DPS | Parcialmente exposta | Exposta / improvisada | 3 | | |
| 20 | Última vistoria técnica com laudo | < 2 anos | < 5 anos | Informal / sem laudo | Nunca | 2 | | |

> **Por quê:** infiltrações anteriores indicam falhas que se agravam com eventos intensos;
> instalações elétricas expostas à umidade são risco de curto e incêndio durante tempestades.

### 💨 Aberturas, fachada e projéteis

| # | Questão | 4 | 3 | 2 | 1 | P | Fatal | N/A |
|---|---|---|---|---|---|---|:---:|:---:|
| 21 | Porta de garagem / portão grande | Reforçada p/ vento (bracing) | Robusta, bem fixada | Padrão leve | Leve sem reforço / empenada | 4 | ☠️ | ✔ |
| 22 | Janelas e portas externas (vedação + travas) | Boa vedação, múltiplas travas | Vedação ok, trava simples | Folgas perceptíveis | Frágeis / sem trava | 3 | | |
| 23 | Proteção contra impacto (persiana/película/shutter) | Todas as aberturas | Principais | Poucas | Nenhuma | 3 | | |
| 24 | Objetos soltos no entorno (móveis, lonas, antenas) | Nada solto / tudo ancorável | Poucos, fácil recolher | Vários itens | Muitos projéteis potenciais | 4 | | |
| 25 | Fixação de itens no telhado (solar, PV, caixa d'água) | Ancorados conforme norma | Bem fixados | Apoiados/fixação simples | Soltos / apoiados | 4 | | ✔ |

> **Por quê:** a porta de garagem é o modo de falha nº 1 por vento em residências — quando cede,
> pressuriza o interior e pode arrancar o telhado; objetos soltos viram projéteis; itens mal
> ancorados no telhado são arrancados e abrem caminho para a água.

## Racional das melhorias sobre o esboço original

1. **Polaridade normalizada** — no esboço, em várias perguntas o "SIM" era ruim (ex.: "há galhos
   secos?"). Todas foram reescritas para 4 = melhor, sempre, eliminando erro de cálculo.
2. **Escala 1–4 no lugar de SIM/NÃO** — captura gradação real de risco (uma telha trincada ≠
   telhado tomado por vegetação).
3. **Piso 0%** — com `resposta/4`, uma casa péssima ainda marcaria 25%. A normalização
   `(resposta−1)/3` dá escala honesta de 0 a 100.
4. **Pesos formalizados** — a criticidade que estava anotada no "Obs" (2–4) virou peso oficial.
5. **Falhas fatais** — média boa não pode esconder risco de colapso (telha só encaixada, galho
   seco sobre o telhado).
6. **N/A e "Não sei"** — nem toda casa tem árvore/calha, e leigo não sabe avaliar corrosão;
   "não sei" vira recomendação de inspeção em vez de chute.
7. **Categoria nova de vento** — o esboço era ~60% água/drenagem; os maiores modos de falha por
   vento (aberturas, porta de garagem, projéteis, itens do telhado) não eram cobertos.
8. **Resultado acionável** — além do número, o app entrega o top 3 de ações priorizadas por
   `peso × (1 − nota_norm)`.
