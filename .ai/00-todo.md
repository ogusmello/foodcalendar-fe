# TODO — Foodist

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

Checks anteriores de lint, tipos, build e HTTP passaram. A revisão visual e de interação em navegador ainda precisa ser concluída; o backend real ainda não foi validado em execução.

## 1. Preparar a base de criação
- [ ] Reaproveitar o padrão aprovado de modal e campos para os novos formulários.
- [ ] Preparar transporte POST com tratamento de JSON e sucesso sem corpo.
- [ ] Padronizar erros de campo, erros de negócio e indisponibilidade.
- [ ] Preservar rascunhos em falhas e impedir envio duplicado enquanto pendente.
- [ ] Não repetir automaticamente criações ou clonagens em timeout.
- [ ] Centralizar armazenamento dos mocks para pessoas, refeições e planos.
- [ ] Preservar as edições atuais de demonstração ao evoluir o armazenamento.
- [ ] Gerar IDs estáveis e sem colisões para novos registros.
- [ ] Definir reset explícito dos mocks sem misturar registros criados com fixtures.
- [ ] Reutilizar atualização de dados entre calendário, catálogo, TopNav e busca.

## 2. Criar pessoas
Referência: [14-criacao-pessoas.md](14-criacao-pessoas.md).
- [ ] Adicionar botão Adicionar pessoa em Configurações.
- [ ] Criar formulário de nome obrigatório, com limite de 255 caracteres.
- [ ] Implementar POST interno /api/users e integração com POST /v1/users.
- [ ] Persistir pessoas criadas nos mocks.
- [ ] Atualizar seletores do calendário e perfil após criação.
- [ ] Oferecer cadastro quando não houver pessoas.
- [ ] Garantir que uma pessoa nova comece sem planos automáticos.
- [ ] Validar cadastro, limites e estados de falha.

## 3. Criar refeições
Referência: [13-criacao-refeicoes.md](13-criacao-refeicoes.md).
- [ ] Adicionar botão Nova refeição e ação no estado vazio do catálogo.
- [ ] Adaptar campos de nome e descrição para criação, preservando a edição existente.
- [ ] Implementar POST interno /api/meals e integração com POST /v1/meals.
- [ ] Persistir novas refeições nos mocks e usar o ID retornado.
- [ ] Atualizar catálogo e pesquisa global por nome.
- [ ] Permitir criar uma refeição dentro do fluxo de planejamento sem perder o rascunho.
- [ ] Selecionar a refeição recém-criada ao retornar ao formulário de planejamento.
- [ ] Manter sugestões vazias da busca limitadas ao dia, sem incluir refeições não planejadas.
- [ ] Validar cadastro, nome de até 255 caracteres, descrição e falhas.

## 4. Adicionar refeições ao calendário
Referência: [15-criacao-planejamentos.md](15-criacao-planejamentos.md).
- [ ] Criar ação Adicionar ao calendário na Home.
- [ ] Criar atalhos em dias e tipos de refeição vazios.
- [ ] Adicionar Planejar esta refeição ao modal de detalhes.
- [ ] Criar seletor de pessoa, refeição e tipo de refeição.
- [ ] Pré-preencher campos a partir do contexto de origem.
- [ ] Implementar ocorrência única com data inicial/final iguais.
- [ ] Implementar recorrência com período e seleção de dias.
- [ ] Adicionar atalhos Dias úteis, Fim de semana e Todos os dias.
- [ ] Exibir prévia das ocorrências antes de salvar.
- [ ] Validar datas, intervalo, dias e existência de pessoa/refeição.
- [ ] Sinalizar seleção de dias sem ocorrência na vigência.
- [ ] Implementar POST interno /api/meal-plans e integração com o backend.
- [ ] Persistir planos criados nos mocks sem regenerá-los a cada leitura.
- [ ] Atualizar as três visões, detalhes do dia, TopNav e sugestões da busca.
- [ ] Oferecer Ver no calendário quando o destino estiver fora do período visível.
- [ ] Validar recorrência, limites inclusivos e viradas de mês/ano.

## 5. Clonar períodos
Referência: [16-clonagem-periodos.md](16-clonagem-periodos.md).
- [ ] Criar ação Copiar período no calendário.
- [ ] Listar origens agrupadas pela pessoa e vigência exata dos planos.
- [ ] Criar formulário de pessoa, origem e intervalo de destino.
- [ ] Exibir prévia do conteúdo a copiar e dos dias mantidos.
- [ ] Implementar POST interno /api/meal-plans/clone.
- [ ] Tratar sucesso 201 sem corpo e reconsultar o destino.
- [ ] Tratar erros 400, 404 e 409 sem perder os campos.
- [ ] Reproduzir origem exata e conflitos do contrato nos mocks.
- [ ] Persistir cópias com novos IDs sem alterar a origem.
- [ ] Validar durações diferentes e sobreposições parciais.
- [ ] Atualizar calendário e oferecer acesso ao período copiado.

## 6. Completar a gestão prevista no escopo
Contrato: [07-contrato-backend.md](07-contrato-backend.md).
- [ ] Permitir editar nome de pessoa com PUT /v1/users/{id}.
- [ ] Planejar em detalhe e implementar edição do plano com PATCH /v1/meal-plans/{id}.
- [ ] Distinguir Editar refeição de Editar planejamento no contexto do evento.
- [ ] Informar que editar o plano afeta a recorrência inteira; não oferecer alteração isolada de ocorrência sem suporte do backend.
- [ ] Permitir excluir um plano, preservando pessoa e refeição.
- [ ] Permitir excluir refeição, confirmando a remoção dos planos associados.
- [ ] Permitir excluir pessoa, confirmando a remoção de seus planos.
- [ ] Reproduzir exclusões em cascata nos mocks.
- [ ] Atualizar listas, seletores e calendário após alterações e exclusões.

## 7. Fechar decisões e validar integração
- [ ] Confirmar se a criação/clonagem terá apenas uma pessoa por envio ou opção explícita para ambos.
- [ ] Se houver ação para ambos, definir resultados parciais entre chamadas independentes.
- [ ] Confirmar gerenciador de pacotes oficial e manter um único lockfile.
- [ ] Confirmar endereço e acesso ao backend real.
- [ ] Comparar contrato implementado com o OpenAPI do ambiente disponível.
- [ ] Validar os fluxos com USE_MOCK_DATA=false, sem fallback silencioso para mocks.
- [ ] Conferir respostas vazias, mensagens de erro e regras de recorrência.
- [ ] Validar IDs conforme a representação acordada com o backend.

## 8. Revisar experiência e acessibilidade
- [ ] Conferir desktop e mobile nos temas claro e escuro.
- [ ] Conferir as três visões com Ambos e com cada pessoa.
- [ ] Validar teclado, foco, Escape, retorno de foco e troca entre modais.
- [ ] Conferir estados vazios, carregamento, erros e dados parciais.
- [ ] Confirmar que criar e editar atualiza todas as regiões sem recarregar a página inteira.
- [ ] Executar lint, tipos, build e testes adequados aos fluxos implementados.

## 9. Framer Motion — penúltima etapa
Referência: [06-animacoes.md](06-animacoes.md).
- [ ] Definir microinterações e transições úteis nos fluxos já estáveis.
- [ ] Integrar Framer Motion e tokens de movimento.
- [ ] Aplicar a controles, modais, Sidebar e mudanças de visualização quando adequado.
- [ ] Respeitar redução de movimento e preservar foco.
- [ ] Validar fluidez e ausência de atraso funcional.

## 10. Docker/Compose — última etapa
Referência: [08-docker-e-deploy.md](08-docker-e-deploy.md).
- [ ] Preparar build de produção e saída standalone do Next.
- [ ] Criar Dockerfile em múltiplos estágios.
- [ ] Criar compose.yaml e .dockerignore.
- [ ] Executar com usuário sem privilégios e porta configurável, sem Nginx.
- [ ] Configurar conexão com o backend e variáveis de produção.
- [ ] Garantir mocks desativados na configuração da API real.
- [ ] Validar imagem, arquivos estáticos, saúde, logs e reinício.
- [ ] Documentar execução, atualização e retorno à imagem anterior na VPS.

Deploy na VPS será uma ação futura. Não fazem parte do contrato atual: autenticação, horários, ingredientes estruturados, receitas completas, nutrientes, imagens, lista de compras e assistente.