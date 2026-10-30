# Animações — penúltima etapa

## Requisito confirmado
Adicionar Framer Motion para micro e macro animações como penúltima etapa do projeto, antes de Docker/Compose (08-docker-e-deploy.md). Não instalar ou implementar nesta fase de planejamento.

## Dependências
Telas e fluxos aprovados, tokens definidos, layout responsivo estável, integrações funcionais e Theme Switcher validado.

## Objetivo
Reforçar a interface clean, minimalista, útil e interativa. O movimento deve explicar mudanças, orientar atenção e dar retorno às ações.

## Microanimações propostas
- Feedback de botões e controles ao interagir.
- Seleção de itens, filtros e estados do planejamento.
- Abertura e fechamento de menus, popovers e tooltips.
- Confirmação visual de ações concluídas.
- Refinamento da troca de tema sem atrasar a aplicação da preferência.

## Macroanimações propostas
- Expansão e recolhimento da sidebar.
- Entrada e saída de diálogos, painéis e drawers.
- Mudanças de layout e reorganização de cards no bento grid.
- Transições entre períodos e visualizações do planejamento.
- Transições de conteúdo ou tela apenas quando ajudarem a manter orientação.

Esses casos são propostas; implementar os que existirem nos fluxos aprovados. Não adicionar funcionalidade apenas para demonstrar animações.

## Padrão técnico
- Tailwind permanece responsável por cores, tipografia, layout e estilos estáticos.
- Framer Motion controla valores animados e transições necessárias, evitando disputar as mesmas propriedades com transições CSS.
- Reutilizar tokens de duração e curvas, com poucos padrões consistentes.
- Preferir transform e opacity quando adequados; avaliar custo de animações de layout.
- Manter componentes de cliente restritos às regiões interativas.
- Não bloquear navegação, envio de formulários ou feedback de erro para aguardar uma animação.
- Verificar a versão e a integração adequadas ao Next.js e React antes de instalar.

## Acessibilidade e desempenho
- Respeitar prefers-reduced-motion, reduzindo ou removendo deslocamentos e movimentos não essenciais.
- Preservar foco, ordem de leitura e operação por teclado.
- Garantir conteúdo utilizável mesmo sem animações.
- Evitar movimento contínuo decorativo e entradas em cascata que atrasem leitura.
- Validar fluidez em mobile, nos dois temas e durante atualizações de dados.

## Plano
1. Inventariar interações reais e priorizar movimentos úteis.
2. Definir padrões de micro e macro animação e seus tokens.
3. Instalar e integrar Framer Motion.
4. Aplicar progressivamente aos componentes e fluxos.
5. Validar movimento reduzido, foco, responsividade, desempenho e ausência de regressões.

## Critérios de conclusão
Movimentos consistentes e discretos, sem atraso funcional, perda de foco, flash de tema ou mudança inesperada de layout. Fluxos continuam completos com movimento reduzido.



## Implementado
Framer Motion 14.7.1 integrado na penúltima etapa. MotionSystem centraliza MotionConfig com reducedMotion=user; a duração normal é lida do token CSS. AnimatedSurface anima mudanças de visão/data/pessoa; modais, Sidebar e controles receberam movimentos discretos. Tailwind continua responsável pelos estilos estáticos. Chromium verificou fluxos funcionais e a preferência de movimento reduzido. Referência técnica: https://motion.dev/docs/react-accessibility.
