# Telas e fluxos

## Base atual
Uma rota / com conteúdo provisório, Sidebar, TopNavBar e Wrapper. Backend externo documentado em 07-contrato-backend.md. O escopo abaixo é uma proposta ajustada ao contrato disponível.

## MVP proposto
| Tela/fluxo | Responsabilidade |
| --- | --- |
| Seleção e gestão de usuários | Listar, cadastrar e editar nome; definir contexto do planejamento |
| Planejamento | Consultar dia/semana, exibir recorrências por tipo de refeição |
| Cadastro e edição de plano | Selecionar usuário, refeição, tipo, vigência e dias da semana |
| Clonar período | Selecionar vigência exata de origem e período de destino |
| Refeições | Listar, buscar por nome, cadastrar e editar nome e descrição |
| Detalhe da refeição | Consultar os campos existentes sem pressupor GET individual |
| Configurações | Preferências locais e tema |

Excluir usuários e refeições exige informar a remoção dos planos associados. Edição/exclusão de plano afeta toda a recorrência; ocorrência isolada depende de evolução do contrato.

## Fluxo principal
Selecionar ou cadastrar usuário → cadastrar refeição → criar plano recorrente → consultar e ajustar planejamento → opcionalmente clonar período.

Propor planejamento como página inicial. Seleção de usuário não é autenticação; não projetar login como recurso existente.

## Evolução futura dependente de backend
Receitas estruturadas, ingredientes/alimentos, preparo, porções, nutrientes, imagens, lista de compras e assistente não estão cobertos pelo contrato atual.

## Plano
1. Confirmar a tarefa principal e o MVP para a rotina do casal; o público inicial já está definido.
2. Desenhar navegação e fluxo com usuários, refeições e planos.
3. Aprovar planejamento em mobile e desktop nos dois temas.
4. Especificar estados e operações de cada tela conforme 07-contrato-backend.md.
5. Implementar por fluxo completo; Framer Motion após estabilizar a aplicação; Docker/Compose é a última etapa.

## Requisitos visuais e interação
- Tailwind e tokens semânticos em todas as telas.
- Bento grid com cards de cantos arredondados, dimensões por relevância e gaps consistentes.
- Reorganizar módulos no mobile preservando leitura e ordem de foco.
- Espaço em branco, separação suave de superfícies e ações contextuais; referência visual sem copiar a paleta azul.
- Estados de carregamento, vazio, erro e sucesso, teclado e foco visível.
- Theme Switcher global e preferência em Configurações.
- Não inventar indicadores ou dados que o backend não fornece.

## Em aberto
Rotas finais, aprovação dos demais fluxos do MVP e comportamento de ações destinadas às duas pessoas.

## Contexto pessoal confirmado
- Uso inicial pelo usuário e sua mulher, sem finalidade comercial.
- Priorizar planejamento alimentar e reaproveitamento de refeições e períodos na rotina dos dois.
- Proposta: seleção simples de pessoa no planejamento; cadastro e edição dos nomes podem ficar em Configurações, sem uma área administrativa dedicada.
- Não limitar o banco a dois registros nem fixar nomes ou IDs no código; usar os usuários retornados pela API.
- Não incluir onboarding comercial, assinaturas, cobrança, organizações ou gestão complexa de permissões no escopo atual.
- Visão conjunta do casal confirmada como padrão, com acesso ao planejamento individual de cada pessoa. O contrato atual vincula cada plano a um usuário; ações para ambos ainda exigem definir o comportamento e as chamadas correspondentes.


## Modos de visualização confirmados
- Três opções: Ambos (padrão), usuário e mulher do usuário, identificados pelos nomes reais retornados pela API.
- Ao abrir o planejamento sem filtro explícito, mostrar os dois juntos.
- Permitir alternar para cada pessoa sem perder o período ou a visualização de calendário atual.
- Proposta de controle: seletor segmentado com Ambos e os dois nomes; adaptar para seletor compacto em telas pequenas quando necessário.
- Representar a seleção na URL para preservar contexto em navegação e compartilhamento. Sem parâmetro de pessoa, usar Ambos.
- Na visão conjunta, identificar a pessoa em cada ocorrência por nome ou rótulo; cor pode complementar, mas não substituir essa identificação.
- Preservar a identidade de cada plano mesmo quando as duas pessoas tiverem a mesma refeição no mesmo dia.
- Filtro de visualização não implica criar, editar, excluir ou clonar automaticamente para ambos. Essas ações precisam explicitar a pessoa destinatária; operações em lote ainda não estão definidas.
- Tratar carregamento, vazio e falha por pessoa, sem apresentar uma resposta parcial como planejamento completo.

## Próximo passo do planejamento
Esboçar a tela semanal com a visão Ambos como principal e suas variações individuais, em desktop e mobile. Usar a direção clean, cantos arredondados e bento grid; definir a paleta em seguida.

## Navegação estrutural implementada
- Rotas: / (Planejamento), /refeicoes e /configuracoes.
- Sidebar com Link do Next.js e rota ativa via usePathname, incluindo correspondência de subrotas.
- Sidebar, TopNavBar e Wrapper permanecem no layout raiz compartilhado; as páginas ocupam o slot children, com navegação pelo App Router sem recarregar o documento.
- Recolhimento no desktop preservado durante a navegação; menu expansível no mobile fecha ao navegar e aceita Escape com retorno do foco ao botão.
- Páginas estruturais com informação explícita sobre integrações ainda não implementadas. Configurações permite trocar o tema.
- Componentes internos da Sidebar organizados em parts/NavItem com tipos separados.
- Lint, tipos e build de produção aprovados. Revisão interativa no navegador ainda pendente.
