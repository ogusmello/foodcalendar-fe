# Criação de planejamentos

## Status
Plano para implementação futura. Campos e endpoints abaixo estão documentados no backend; decisões de interação estão propostas para revisão.

## Objetivo e entradas
Adicionar uma refeição ao calendário, com pessoa, tipo, vigência e recorrência.

- Ação Adicionar ao calendário no topo da Home.
- Ação adicionar em um dia ou espaço de tipo vazio nas visões Hoje/Semana/Mês.
- Botão Planejar esta refeição no modal de detalhes, separado de Editar refeição.
- O botão de edição existente continua alterando a refeição compartilhada. Este fluxo cria um vínculo no calendário.

Pré-preencher data, pessoa, tipo e refeição quando vierem explicitamente do contexto. A visão Ambos não autoriza criar para duas pessoas automaticamente.

## Formulário proposto
| Interface | Campo enviado | Regra |
| --- | --- | --- |
| Pessoa | userId | Obrigatório; usuário existente |
| Refeição com busca | mealId | Obrigatório; refeição existente |
| Tipo | mealType | BREAKFAST, LUNCH, SNACK, DINNER ou DESSERT |
| Data inicial | startDate | Data civil válida |
| Data final | endDate | Data civil válida, igual ou posterior ao início |
| Dias de repetição | targetDays | Pelo menos um dia válido, sem nulos ou repetições |

Rótulos em português; enums e datas YYYY-MM-DD no transporte. Não incluir horário.

## Recorrência
- Somente neste dia: startDate = endDate = data escolhida; targetDays contém o dia da semana correspondente.
- Repetir: período explícito e seleção de dias.
- Atalhos Dias úteis, Fim de semana e Todos os dias apenas preenchem targetDays; não são novos valores enviados à API.
- Mostrar prévia legível: pessoa, refeição, tipo, vigência, dias e quantidade de ocorrências.
- Se os dias escolhidos não ocorrerem dentro da vigência, sinalizar e pedir ajuste antes de salvar. Trata-se de proteção de UX proposta, não de validação já feita pelo backend.
- Datas passadas são aceitas pelo contrato; não bloquear.
- Sobreposição e múltiplas refeições no mesmo tipo são permitidas pelo backend. Não sobrescrever planos existentes nem inventar restrição de unicidade.

## Destinatários — proposta a confirmar
Primeira entrega com uma pessoa obrigatória e explícita por envio. Na visão individual, pré-selecionar a pessoa; em Ambos, solicitar a escolha.

Uma ação futura Aplicar aos dois pode realizar uma chamada por pessoa, mas não existe criação em lote ou transação conjunta. Caso adotada, exigir seleção explícita, informar sucesso parcial e nunca reenviar automaticamente a chamada já concluída. O seletor Ambos do calendário continua sendo apenas um filtro de visualização.

## Integração
POST interno /api/meal-plans → POST /v1/meal-plans:
```json
{
  "userId": 1,
  "mealId": 3,
  "mealType": "LUNCH",
  "startDate": "2026-11-02",
  "endDate": "2026-11-08",
  "targetDays": ["MONDAY", "WEDNESDAY", "FRIDAY"]
}
```

IDs ilustrativos: enviar os selecionados e usar o ID retornado. Sucesso 201 com plano completo; erro 400 de validação ou período; 404 se pessoa/refeição não existir.

Após salvar, atualizar calendário, painel do dia, TopNav e sugestões vazias da busca. Preservar visão e pessoa atuais; se o destino ficar fora do período visível, oferecer ação Ver no calendário. Não mover a tela silenciosamente para outro período.

## Estados, mocks e testes
- Carregar pessoas/refeições e oferecer cadastro quando a lista estiver vazia, preservando rascunho.
- Bloquear envio duplicado; manter dados em erro. Em 404, atualizar opções e pedir nova seleção.
- Timeout pode ter criado o plano: reconsultar antes de orientar repetição, sem afirmar que uma leitura elimina toda ambiguidade. Não repetir POST automaticamente.
- Evoluir os mocks para persistir os planos criados com as mesmas regras, sem regenerá-los ou duplicá-los a cada consulta.
- Testar ocorrência única, dias úteis/fim de semana, limites inclusivos, dias sem ocorrência, virada de mês/ano, pessoa ausente e atualização das três visões.