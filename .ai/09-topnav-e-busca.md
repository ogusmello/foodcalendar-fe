# TopNav e busca global

## Estrutura implementada
- Busca global, mini calendário diário, botão de tema com ícones e acesso ao perfil.
- Em telas estreitas, o calendário ocupa uma segunda linha e rola dentro do próprio bloco.
- Componentes internos em TopNavBar/parts, com tipos em types.tsx quando necessários.

## Mini calendário — referência confirmada
- Grade compacta com colunas por mealType e linhas por pessoa.
- Refeições apresentadas como barras de evento dentro das células, com identificação da pessoa na coluna fixa à esquerda.
- Rolagem horizontal nativa e botões para deslocar o conteúdo. Não usar uma sequência de cards independentes.
- Não atribuir horários, duração ou escala de horas: o backend oferece BREAKFAST, LUNCH, SNACK, DINNER e DESSERT, sem horário.
- O dia e a pessoa são lidos da URL; sem filtro individual, mostrar a visão conjunta dos usuários cadastrados no contexto pessoal da aplicação.
- Cada pessoa é consultada com userId e date completos; falhas parciais são indicadas.
- Clicar em um evento navega pelo App Router com date, userId, mealType e planId. O calendário completo ainda está em construção.

## Busca modal
- Dialog nativo centralizado com fundo escurecido e borrado, input acima e resultados separados em Datas e Refeições abaixo.
- Abrir por clique ou Ctrl/Cmd+K; fechar por Escape, botão ou clique no fundo. Foco contido no dialog e devolvido ao disparador ao fechar.
- Teclas de seta navegam pelos resultados; Enter abre o resultado; Tab continua disponível.
- Datas: Hoje, Amanhã, Ontem, YYYY-MM-DD ou DD/MM/AAAA (DD/MM usa o ano atual).
- Refeições: pesquisa por nome na API, com debounce e cancelamento de requisições antigas.
- Sem dados fictícios. Falha na API não impede a pesquisa de datas.
- Resultados de refeições abrem a listagem filtrada na rota /refeicoes.

## Tema e perfil
- Botão com ícones alterna Sistema → Claro → Escuro; a seleção completa continua em Configurações.
- Perfil abre a visão Ambos, cada usuário cadastrado e Configurações. Não representa autenticação, pois a API não possui login.

## Integração
- Configurar API_BASE_URL em .env.local conforme .env.example. É uma variável do servidor, sem NEXT_PUBLIC_.
- O servidor Next acessa /v1/users, /v1/meals e /v1/meal-plans; o navegador consome as rotas internas /api/search e /api/navigation.
- Usar endereço alcançável pelo servidor Next; não presumir que localhost do Windows, WSL e containers é o mesmo ambiente.
- Sem configuração ou backend disponível, mostrar indisponibilidade, sem apresentar ausência de refeições como resultado válido.
- Fonte do contrato: 07-contrato-backend.md.

## Validação
Lint, TypeScript e build de produção aprovados. Verificação HTTP com API simulada cobriu busca, encoding, filtros individuais, visão conjunta, validação de datas e falhas parciais. O ambiente de automação do navegador falhou ao iniciar; revisão visual e de teclado em navegador ainda pendente.

Framer Motion permanece na penúltima etapa e Docker/Compose na última.