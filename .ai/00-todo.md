# TODO — À Mesa

Checklist consolidada. Marcar itens concluídos conforme a implementação e as verificações correspondentes. Os documentos por tema continuam sendo a referência detalhada.

## Já implementado
- [x] Base visual com Tailwind, tokens semânticos e paleta por tipo de refeição.
- [x] Temas Claro, Escuro e Sistema com persistência.
- [x] Layout compartilhado e Sidebar navegável sem recarregar o documento.
- [x] Calendário como Home com visões Hoje, Semana e Mês.
- [x] Visão conjunta por padrão e filtros individuais.
- [x] TopNav com faixa rolável de refeições e seleção de perfil.
- [x] Busca modal: sugestões do dia e pesquisa global por nome.
- [x] Catálogo de refeições e exibição de pessoas em Configurações.
- [x] Modal de detalhes e edição de nome/descrição de refeições.
- [x] Dados mockados de pessoas, refeições e planos recorrentes.
- [x] Edição de refeições persistida no armazenamento de demonstração.
- [x] Camada de leitura da API e PATCH de refeições conforme o contrato documentado.
- [x] Planos de criação separados por tema na pasta .ai.

Execução concluída no escopo de demonstração confirmado pelo usuário: somente mocks baseados no README, sem backend local. Lint, tipos, build, testes de integração, testes reais em Chromium e produção standalone foram verificados. A última etapa Docker é registrada abaixo e em 17-execucao.md.

## 1. Preparar a base de criação
- [x] Reaproveitar o padrão aprovado de modal e campos para os novos formulários.
- [x] Preparar transporte POST com tratamento de JSON e sucesso sem corpo.
- [x] Padronizar erros de campo, erros de negócio e indisponibilidade.
- [x] Preservar rascunhos em falhas e impedir envio duplicado enquanto pendente.
- [x] Não repetir automaticamente criações ou clonagens em timeout.
- [x] Centralizar armazenamento dos mocks para pessoas, refeições e planos.
- [x] Preservar as edições atuais de demonstração ao evoluir o armazenamento.
- [x] Gerar IDs estáveis e sem colisões para novos registros.
- [x] Definir reset explícito dos mocks sem misturar registros criados com fixtures.
- [x] Reutilizar atualização de dados entre calendário, catálogo, TopNav e busca.

## 2. Criar pessoas
Referência: [14-criacao-pessoas.md](14-criacao-pessoas.md).
- [x] Adicionar botão Adicionar pessoa em Configurações.
- [x] Criar formulário de nome obrigatório, com limite de 255 caracteres.
- [x] Implementar POST interno /api/users e integração com POST /v1/users.
- [x] Persistir pessoas criadas nos mocks.
- [x] Atualizar seletores do calendário e perfil após criação.
- [x] Oferecer cadastro quando não houver pessoas.
- [x] Garantir que uma pessoa nova comece sem planos automáticos.
- [x] Validar cadastro, limites e estados de falha.

## 3. Criar refeições
Referência: [13-criacao-refeicoes.md](13-criacao-refeicoes.md).
- [x] Adicionar botão Nova refeição e ação no estado vazio do catálogo.
- [x] Adaptar campos de nome e descrição para criação, preservando a edição existente.
- [x] Implementar POST interno /api/meals e integração com POST /v1/meals.
- [x] Persistir novas refeições nos mocks e usar o ID retornado.
- [x] Atualizar catálogo e pesquisa global por nome.
- [x] Permitir criar uma refeição dentro do fluxo de planejamento sem perder o rascunho.
- [x] Selecionar a refeição recém-criada ao retornar ao formulário de planejamento.
- [x] Manter sugestões vazias da busca limitadas ao dia, sem incluir refeições não planejadas.
- [x] Validar cadastro, nome de até 255 caracteres, descrição e falhas.

## 4. Adicionar refeições ao calendário
Referência: [15-criacao-planejamentos.md](15-criacao-planejamentos.md).
- [x] Criar ação Adicionar ao calendário na Home.
- [x] Criar atalhos em dias e tipos de refeição vazios.
- [x] Adicionar Planejar esta refeição ao modal de detalhes.
- [x] Criar seletor de pessoa, refeição e tipo de refeição.
- [x] Pré-preencher campos a partir do contexto de origem.
- [x] Implementar ocorrência única com data inicial/final iguais.
- [x] Implementar recorrência com período e seleção de dias.
- [x] Adicionar atalhos Dias úteis, Fim de semana e Todos os dias.
- [x] Exibir prévia das ocorrências antes de salvar.
- [x] Validar datas, intervalo, dias e existência de pessoa/refeição.
- [x] Sinalizar seleção de dias sem ocorrência na vigência.
- [x] Implementar POST interno /api/meal-plans e integração com o backend.
- [x] Persistir planos criados nos mocks sem regenerá-los a cada leitura.
- [x] Atualizar as três visões, detalhes do dia, TopNav e sugestões da busca.
- [x] Oferecer Ver no calendário quando o destino estiver fora do período visível.
- [x] Validar recorrência, limites inclusivos e viradas de mês/ano.

## 5. Clonar períodos
Referência: [16-clonagem-periodos.md](16-clonagem-periodos.md).
- [x] Criar ação Copiar período no calendário.
- [x] Listar origens agrupadas pela pessoa e vigência exata dos planos.
- [x] Criar formulário de pessoa, origem e intervalo de destino.
- [x] Exibir prévia do conteúdo a copiar e dos dias mantidos.
- [x] Implementar POST interno /api/meal-plans/clone.
- [x] Tratar sucesso 201 sem corpo e reconsultar o destino.
- [x] Tratar erros 400, 404 e 409 sem perder os campos.
- [x] Reproduzir origem exata e conflitos do contrato nos mocks.
- [x] Persistir cópias com novos IDs sem alterar a origem.
- [x] Validar durações diferentes e sobreposições parciais.
- [x] Atualizar calendário e oferecer acesso ao período copiado.

## 6. Completar a gestão prevista no escopo
Contrato: [07-contrato-backend.md](07-contrato-backend.md).
- [x] Permitir editar nome de pessoa com PUT /v1/users/{id}.
- [x] Planejar em detalhe e implementar edição do plano com PATCH /v1/meal-plans/{id}.
- [x] Distinguir Editar refeição de Editar planejamento no contexto do evento.
- [x] Informar que editar o plano afeta a recorrência inteira; não oferecer alteração isolada de ocorrência sem suporte do backend.
- [x] Permitir excluir um plano, preservando pessoa e refeição.
- [x] Permitir excluir refeição, confirmando a remoção dos planos associados.
- [x] Permitir excluir pessoa, confirmando a remoção de seus planos.
- [x] Reproduzir exclusões em cascata nos mocks.
- [x] Atualizar listas, seletores e calendário após alterações e exclusões.

## 7. Fechar decisões e validar integração
- [x] Decisão confirmada: criação e clonagem permitem selecionar Ambos explicitamente.
- [x] Tratar sucesso parcial para Ambos e reenviar somente pessoas pendentes; resultado incerto bloqueia repetição automática.
- [x] pnpm confirmado como padrão; package-lock.json removido e instalação frozen validada.
- [x] Escopo confirmado: o backend não roda neste ambiente; a entrega usa somente mocks.
- [x] Usar o README fornecido como contrato; consulta a OpenAPI real fora do escopo atual.
- [x] Validar transporte opcional sem fallback contra servidor externo simulado; não confundir com validação de backend real.
- [x] Conferir respostas vazias, mensagens de erro e regras de recorrência.
- [x] Usar IDs numéricos estáveis, sem colisões; rejeitar IDs fora da precisão segura do JavaScript.

## 8. Revisar experiência e acessibilidade
- [x] Conferir desktop e mobile nos temas claro e escuro.
- [x] Conferir as três visões com Ambos e com cada pessoa.
- [x] Validar teclado, foco, Escape, retorno de foco e troca entre modais.
- [x] Conferir estados vazios, carregamento, erros e dados parciais.
- [x] Confirmar que criar e editar atualiza todas as regiões sem recarregar a página inteira.
- [x] Executar lint, tipos, build e testes adequados aos fluxos implementados.

## 9. Framer Motion — penúltima etapa
Referência: [06-animacoes.md](06-animacoes.md).
- [x] Definir microinterações e transições úteis nos fluxos já estáveis.
- [x] Integrar Framer Motion e tokens de movimento.
- [x] Aplicar a controles, modais, Sidebar e mudanças de visualização quando adequado.
- [x] Respeitar redução de movimento e preservar foco.
- [x] Validar fluidez e ausência de atraso funcional.

## 10. Docker/Compose — última etapa
Referência: [08-docker-e-deploy.md](08-docker-e-deploy.md).
- [x] Preparar build de produção e saída standalone do Next.
- [x] Criar Dockerfile em múltiplos estágios.
- [x] Criar compose.yaml e .dockerignore.
- [x] Executar com usuário sem privilégios e porta configurável, sem Nginx.
- [x] Configurar variáveis de produção e opção futura de backend; mocks são o padrão desta entrega.
- [x] Manter mocks ativos por padrão e permitir desativá-los explicitamente em futura integração.
- [x] Validar imagem, arquivos estáticos, saúde, logs e reinício.
- [x] Documentar execução, atualização e retorno à imagem anterior na VPS.

Deploy na VPS será uma ação futura; nenhum deploy remoto foi realizado. Não fazem parte do contrato atual: autenticação, horários, ingredientes estruturados, receitas completas, nutrientes, imagens, lista de compras e assistente.