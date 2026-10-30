# Calendário mensal

## Implementado
- Nova rota /calendario acessível pela Sidebar.
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
- Seletor de visão na rota /calendario, persistido na URL por view=day|week|month. Sem parâmetro ou com valor inválido, mantém Mês.
- Hoje abre o dia atual; visão diária detalha as refeições dos dois por tipo, incluindo descrição e pessoa.
- Semana apresenta segunda a domingo, com dias nas colunas e tipos de refeição nas linhas, exibindo todos os eventos e nomes das pessoas.
- Mês mantém a grade e o painel de detalhes do dia selecionado.
- Filtros de pessoa preservam a visão e a data. Trocar entre Semana e Mês mantém a data; selecionar Hoje retorna ao dia atual.
- Setas avançam ou recuam um dia, sete dias ou um mês conforme a visão. O botão Hoje retorna à data atual na visão ativa.
- Consultas usam somente o intervalo necessário da visão e expandem as recorrências conforme vigência e dias da semana.
- Microcomponente Schedule em parts/ com tipos separados, responsável pelas apresentações diária e semanal.
- Validação: lint, TypeScript, build e verificações HTTP das três visões, filtros individuais, fallback de visão inválida e limites de datas aprovados.
