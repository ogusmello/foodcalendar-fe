# Modal de refeição e edição

## Comportamento
- Clicar em uma refeição abre um modal centralizado com o mesmo tratamento da busca: fundo borrado, painel arredondado e hierarquia discreta.
- Um box apresenta nome, descrição e, quando disponíveis no contexto do planejamento, tipo de refeição, pessoa e data.
- Abrir pelos eventos das visões Hoje/Semana/Mês, detalhes do dia, pílulas da TopNav, resultados da busca e títulos do catálogo.
- Os dias e contadores do calendário continuam navegando entre datas; apenas a refeição abre o modal.
- Escape, clique no fundo e botão fecham o modal, com devolução do foco. Durante salvamento, aguardar a conclusão antes de fechar.
- Bloqueio de rolagem compartilhado entre busca e modal evita conflito na troca de um dialog para o outro.

## Edição
- Botão Editar refeição abre formulário de nome e descrição no mesmo modal.
- Validar textos não vazios e nome de até 255 caracteres; mostrar falhas por campo e falhas de conexão.
- Enviar somente campos alterados via PATCH. Campos omitidos ou null mantêm valores existentes, conforme backend.
- A edição afeta a refeição compartilhada, não apenas a ocorrência selecionada. Informar esse alcance no formulário.
- Após sucesso, atualizar o box, revalidar o conteúdo da página e atualizar o resumo diário, sem recarregar o documento.

## Integração
- Rota interna /api/meals/[mealId]: GET resolve a refeição pela listagem do backend, pois não existe GET individual no contrato externo; PATCH encaminha a /v1/meals/{id}.
- Em modo mock, alterações ficam em .next/cache/foodist-mock-meals.json e são refletidas em todas as consultas. A limpeza desse cache restaura as fixtures. Não são gravadas na API real.
- Fora do modo mock, encaminhar atualizações ao backend configurado e preservar erros de validação, recurso ausente e conflito.
- MealDialog e MealTrigger são compartilhados; formulário em MealDialog/parts/MealForm, com types.tsx separado.

## Validação
Lint, build e TypeScript aprovados. Testes HTTP em mocks cobriram validação, PATCH parcial, recurso ausente, persistência e atualização de busca, resumo diário e renderização das três visões do calendário. Dados temporários dos testes restaurados ao terminar. Validação interativa no navegador permanece pendente.