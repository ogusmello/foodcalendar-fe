# Calendário mensal

## Implementado
- Calendário na Home (/), acessível pela Sidebar.
- Grade mensal com sete colunas, de segunda a domingo; mostra dias dos meses adjacentes para completar as semanas.
- Navegação entre meses, botão Hoje, indicação do dia atual e seleção de uma data pela URL.
- Visão Ambos por padrão e filtros individuais preservados ao trocar mês ou dia.
- Até três prévias por célula e contador das demais refeições. Selecionar o dia abre a lista completa no painel de detalhes.
- Painel de detalhes organizado pelos cinco tipos, com nome da refeição e da pessoa; links para consultar a refeição.
- Legenda de cores, temas claro/escuro e rolagem horizontal da grade em telas pequenas.
- Busca global de datas e pílulas da TopNav navegam para o calendário.

## Dados e recorrência
Consultar a API por pessoa com o período completo da grade. Expandir os planos por vigência inclusiva e targetDays. Preservar IDs por plano e tratar falhas parciais explicitamente. Usar a mesma camada de dados e os mesmos mocks da aplicação; sem inventar horários.

## Organização
CalendarView/index.tsx e types.tsx, com parts/DayCell/index.tsx e types.tsx. Categorias semânticas em lib/meals.ts; cálculo dos dias e troca de mês em lib/calendar.ts.

## Validação
Lint, TypeScript e build aprovados. Verificação temporária cobriu início/fim de mês e ano, fevereiro bissexto, semanas iniciando na segunda, data inválida e renderização HTTP da rota com dados mockados, visão conjunta e filtro individual. Revisão visual em navegador não executada nesta etapa.
## Visões Hoje, Semana e Mês
- Seletor de visão na Home (/), persistido na URL por view=day|week|month. Sem parâmetro ou com valor inválido, mantém Mês.
- Hoje abre o dia atual; visão diária detalha as refeições dos dois por tipo, incluindo descrição e pessoa.
- Semana apresenta segunda a domingo, com dias nas colunas e tipos de refeição nas linhas, exibindo todos os eventos e nomes das pessoas.
- Mês mantém a grade e o painel de detalhes do dia selecionado.
- Filtros de pessoa preservam a visão e a data. Trocar entre Semana e Mês mantém a data; selecionar Hoje retorna ao dia atual.
- Setas avançam ou recuam um dia, sete dias ou um mês conforme a visão. O botão Hoje retorna à data atual na visão ativa.
- Consultas usam somente o intervalo necessário da visão e expandem as recorrências conforme vigência e dias da semana.
- Microcomponente Schedule em parts/ com tipos separados, responsável pelas apresentações diária e semanal.
- Validação: lint, TypeScript, build e verificações HTTP das três visões, filtros individuais, fallback de visão inválida e limites de datas aprovados.

## Calendário como página inicial
O calendário substitui o planejamento anterior na rota /. Sidebar, busca de datas, TopNav e links internos apontam para a Home. /calendario redireciona para / preservando query parameters de data, pessoa e visão. A antiga implementação Planning foi removida por não ser mais utilizada. Verificações de lint, build, tipos, renderização das três visões na Home e preservação de parâmetros no redirecionamento aprovadas.
## Painel de refeições do dia
DayMeals em CalendarView/parts organiza o painel de detalhes com ícones por tipo junto ao título do grupo e dentro de cada card. Cards têm altura natural, padding compacto, nome com line-height de 16px e pessoa com 12px, separados por 2px. O espaçamento entre cards e grupos também foi reduzido. Os cliques continuam abrindo o modal de refeição. Lint, build, tipos e testes de navegador aprovados.

## Cards e ícones nas três visões
MealCard em CalendarView/parts centraliza o visual de Hoje, Semana e Mês, com variantes detalhada, padrão e compacta. Nome e pessoa usam uma coluna com gap de 2px e line-heights explícitos. Os cards diários mantêm a descrição com espaçamento reduzido. MealTypeIcon compartilha os ícones semânticos entre cabeçalhos, cards, painel do dia e legenda. A visão mensal preserva o nome compacto e o contexto completo no tooltip/modal. Lint, build, tipos e testes Chromium aprovados.
