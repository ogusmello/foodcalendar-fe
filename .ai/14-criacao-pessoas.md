# Criação de pessoas

## Status e contrato
Planejamento futuro. POST /v1/users recebe name e retorna 201 com id e name. O recurso é uma pessoa do planejamento, não uma conta autenticada. Não há login ou senha no contrato.

## Entrada proposta
Configurações → Pessoas → Adicionar pessoa. Quando não houver pessoas, o calendário apresenta uma ação para esse fluxo.

O uso inicial é do casal, mas não fixar dois IDs nem limitar o cadastro a dois registros. O seletor usa os registros reais da API.

## Formulário
- Nome obrigatório, não apenas espaços, máximo de 255 caracteres.
- Modal compacto seguindo a referência visual aprovada.
- Não solicitar e-mail, senha, papel de acesso ou avatar enviado, pois o backend não oferece esses campos.
- Após sucesso, atualizar Pessoas, seletores do calendário e perfil da TopNav.
- Oferecer acesso ao planejamento da pessoa criada, sem trocar silenciosamente o filtro atual.
- Criar uma pessoa não cria refeições ou planos automaticamente.

## Integração proposta
POST interno /api/users encaminha a POST /v1/users. Usar a resposta como fonte do ID. A edição de nome é um fluxo distinto que usa PUT /v1/users/{id}, não PATCH; reutilização de campos é possível sem confundir os métodos.

## Estados e validação
Tratar formulário vazio, limite de tamanho, envio pendente, erro de campo e indisponibilidade. Preservar texto em falhas e não repetir a criação automaticamente. Nomes repetidos não possuem regra de unicidade documentada; não inventar bloqueio.

## Mocks e critérios de conclusão
Persistir novas pessoas no conjunto de demonstração e disponibilizá-las em todas as leituras. Não gerar planos fictícios automaticamente para novas pessoas: devem começar com planejamento vazio. Os dois perfis iniciais continuam dados demonstrativos.

Testar criação, atualização dos seletores, calendário vazio do novo perfil, validação e falhas de rede. Confirmar que a criação não modifica o planejamento dos perfis existentes.