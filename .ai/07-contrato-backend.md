# Contrato de integração com o backend

## Fonte e responsabilidade
Baseado no README da Food Calendar API fornecido pelo usuário em 30/10/2026. É uma descrição do contrato, não uma API verificada em execução. O backend pertence a outro projeto/repositório e será desenvolvido por outra pessoa. Este repositório implementa somente o frontend; mudanças de contrato devem ser alinhadas com o responsável pelo backend.

## Convenções documentadas
- Base local: http://localhost:8080; prefixo /v1.
- JSON; datas civis YYYY-MM-DD sem horário ou fuso.
- IDs Long numéricos, gerados no cadastro. Usar IDs retornados, nunca IDs fixos dos exemplos. Alinhar representação se ultrapassarem a precisão segura de números JavaScript.
- Listagens retornam arrays sem paginação; lista vazia é [].
- Sem autenticação/autorização atualmente. Seleção de usuário é contexto da interface, não login ou controle de acesso.
- Respostas não expõem createdAt ou updatedAt.
- Swagger local: /swagger-ui/index.html; OpenAPI: /v3/api-docs.

## Recursos e operações
| Recurso | Operações |
| --- | --- |
| /v1/users | GET lista; POST cria |
| /v1/users/{userId} | PUT atualiza nome; DELETE exclui |
| /v1/meals | GET lista ou pesquisa por name; POST cria |
| /v1/meals/{mealId} | PATCH parcial; DELETE exclui |
| /v1/meal-plans | GET lista/filtra; POST cria |
| /v1/meal-plans/{mealPlanId} | PATCH parcial; DELETE exclui |
| /v1/meal-plans/clone | POST clona período |

Não há GET individual por ID. Não planejar chamadas a endpoints inexistentes. Para telas de detalhe, obter dados da listagem e tratar recurso ausente, inclusive ao abrir URL diretamente.

## Campos
- User: id, name. Cadastro/edição exige name não vazio, máximo de 255 caracteres.
- Meal: id, name, description. Cadastro exige ambos os textos não vazios; name tem máximo de 255 caracteres.
- MealPlan: id, user e meal completos, mealType, startDate, endDate, targetDays.
- Criação de plano: userId, mealId, mealType, startDate, endDate e targetDays.
- Edição de plano: mealId, mealType, startDate, endDate e targetDays; não permite mudar userId.
- mealType: BREAKFAST, LUNCH, SNACK, DINNER, DESSERT.
- targetDays: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY.
- Traduzir rótulos na interface e preservar enums no transporte.
- PATCH de refeições e planos: campos omitidos ou null mantêm valores; {} não altera dados. Enviar apenas alterações.

## Calendário e recorrência
1. Para um dia, consultar userId + date.
2. Para semana/mês, consultar userId + startDate + endDate completos.
3. date tem prioridade sobre o período; não misturar os dois modos.
4. userId sozinho ou com período incompleto retorna todos os planos. O frontend deve impedir essas consultas no fluxo de usuário e conferir o contexto dos resultados.
5. O período retorna planos com sobreposição inclusiva e não considera targetDays.
6. Expandir cada plano apenas nas datas visíveis dentro de sua vigência e com dia da semana presente em targetDays.
7. Manter datas como datas civis, evitando conversões UTC que mudem o dia.
8. Validar início <= fim e pelo menos um dia selecionado; enviar dias sem repetição. Explicar quando a seleção não tiver ocorrência na vigência.
9. Não presumir unicidade por usuário, dia e mealType: a API permite planos sobrepostos.
10. Editar ou excluir um plano afeta a recorrência inteira. Alteração isolada de uma ocorrência não possui endpoint documentado e exige alinhamento antes de oferecer essa ação.

## Clonagem
- Enviar userId, originalStartDate, originalEndDate, newStartDate, newEndDate.
- A origem usa início e fim exatamente iguais aos dos planos, não sobreposição nem apenas o intervalo visível no calendário.
- Mantém refeição, usuário, tipo e dias da semana; altera vigência e gera novos IDs.
- Origem e destino podem ter durações diferentes.
- Conflito 409 considera somente vigência de destino exatamente igual; sobreposição parcial não garante conflito.
- Sucesso 201 sem corpo: refazer a consulta do destino.
- Tratar 404 de origem sem planos e 400 de intervalos inválidos. Não repetir automaticamente a operação.

## Exclusão e efeitos relacionados
- Excluir usuário remove seus planos e preserva refeições.
- Excluir refeição remove seus planos associados e preserva usuários.
- Excluir plano preserva usuário e refeição.
- Informar o alcance na confirmação e invalidar as consultas afetadas após sucesso.
- DELETE retorna 204 sem corpo.

## Erros e transporte
- 400 de validação pode retornar mapa campo → mensagem.
- 400 de negócio, 404 e 409 podem retornar { status, message }.
- JSON inválido, enums, datas e parâmetros incorretos podem ter outro formato do Spring.
- Normalizar falhas de campo, de negócio, indisponibilidade e resposta desconhecida; oferecer mensagem alternativa sem depender de uma mensagem literal.
- Não tentar interpretar JSON em respostas sem corpo, inclusive 201 da clonagem.
- Invalidar/revalidar listas e planejamento afetados após mutações.

## Limites para o escopo de telas
O contrato oferece refeições com nome e descrição, sem ingredientes estruturados, preparo, porções, nutrientes ou imagens. Alimentos, receitas estruturadas, lista de compras, assistente e login são evolução futura dependente de contrato. Não simular suporte persistente inexistente.

## Alinhamentos pendentes
- URL e acesso aos ambientes; localização do repositório e processo para acompanhar mudanças.
- CORS caso o navegador acesse a API diretamente, ou conectividade servidor Next → API se adotada essa arquitetura.
- Escolha da estratégia de acesso, seleção de usuário e comportamento em implantação.
- Contrato futuro de autenticação e autorização, se necessário.
- Precisão de IDs, estabilidade do formato de erros e futura paginação.
- Obter OpenAPI do ambiente disponível e validar o contrato antes da implementação.

## Visão conjunta e individual confirmada
- O planejamento abre em Ambos por padrão e permite filtrar por cada uma das duas pessoas.
- Para a visão conjunta, a estratégia inicial proposta é consultar cada usuário com o mesmo date ou período completo e combinar os resultados preservando user.id e o ID do plano.
- Não usar userId isolado e não presumir que uma consulta sem userId representa somente o casal, pois a API pode conter outros usuários.
- Não fixar os IDs dos dois usuários no código. Resolver as pessoas a partir dos registros da API; a escolha inicial dos perfis do casal ainda precisa ser definida se houver outros registros.
- Falhas em uma das consultas devem ser identificadas como resultado parcial, com possibilidade de nova tentativa.
- O filtro individual usa a mesma operação com apenas um userId. Período e regras de expansão de recorrência permanecem iguais.
- O contrato não oferece mutação em lote para o casal. Uma futura ação para ambos exige chamadas separadas e tratamento de sucesso parcial, sem presumir atomicidade.

## TopNav implementada
O resumo diário usa uma faixa rolável de pílulas com ícone, mealType e nome da refeição; na visão conjunta, cada item identifica sua pessoa. Não há campo de horário no contrato; não criar horários presumidos. As rotas internas do Next usam API_BASE_URL (endereço base sem /v1) para acesso pelo servidor. Ver 09-topnav-e-busca.md e .env.example.
