# Design tokens

## Confirmado
- Tailwind CSS em todo o projeto.
- Tokens compartilhados para temas claro e escuro.
- Aqui, tokens significa valores de design. Credenciais pertencem ao plano de APIs.

## Estratégia proposta
Definir variáveis CSS semânticas e expô-las pelo tema do Tailwind CSS 4. Componentes usam utilitários como bg-surface, text-foreground e border-border.

Reservar CSS global para importação do Tailwind, tema, variáveis e ajustes globais necessários. Estilizar componentes com Tailwind, evitando CSS Modules, CSS-in-JS e estilos inline estáticos. Valores realmente dinâmicos podem usar variáveis CSS.

## Grupos de tokens
| Grupo | Exemplos propostos |
| --- | --- |
| Superfícies | background, surface, surface-muted |
| Texto | foreground, muted-foreground |
| Interação | primary, primary-foreground, accent, accent-foreground |
| Estrutura | border, ring |
| Feedback | success, warning, danger, info e pares de texto |
| Tipografia | Famílias, tamanhos, pesos e alturas de linha |
| Espaçamento | Escala consistente baseada no Tailwind |
| Forma | Raios, bordas e sombras |
| Movimento | Durações, curvas e redução de movimento |
| Layout | Sidebar, barra superior e largura de conteúdo |

Nomes e valores finais dependem da identidade aprovada. Validar os pares de fundo e texto em ambos os temas.

## Plano
1. Inventariar valores atuais; corrigir ou remover a variável --font-oufit.
2. Definir tokens e mapear fontes de next/font.
3. Integrar ao tema do Tailwind.
4. Migrar cores fixas da estrutura atual para utilitários semânticos.
5. Validar componentes e estados nos dois temas.

## Critérios de conclusão
Trocar o tema atualiza toda a interface. Novas telas reutilizam tokens e escalas, sem duplicar valores existentes.

## Referência de forma e layout confirmada
- Criar uma escala de raios para controles, cards e contêineres maiores; os cantos arredondados são parte da identidade.
- Definir gaps e espaçamentos internos consistentes para o bento grid, com variações responsivas.
- Evitar raios e espaçamentos arbitrários por componente.
- Compartilhar tokens de duração e curvas entre transições Tailwind e a etapa de Framer Motion, anterior à dockerização, conforme 06-animacoes.md.


## Base implementada
- Fonte de verdade: app/globals.css, com variáveis semânticas e integração @theme do Tailwind 4.
- Utilitários de cores: bg-background, bg-surface, bg-surface-muted, text-foreground, text-muted-foreground, bg-primary, text-primary-foreground, bg-primary-muted e feedbacks semânticos.
- Tipografia: font-sans (DM Sans), font-brand (Outfit); tamanhos e espaçamento geral usam a escala padrão do Tailwind.
- Raios: rounded-control (12px), rounded-card (20px), rounded-panel (28px).
- Elevação: shadow-card e shadow-popover, com valores por tema.
- Layout: w-sidebar (224px), min-h-topbar (64px), max-w-content (1280px), gap-bento (16px).
- Movimento preparado: duration-fast (120ms), duration-normal (180ms), duration-slow (280ms), ease-standard. Framer Motion permanece para a etapa posterior; Docker continua por último.
- Foco global visível e seleção de texto usam tokens.
- Pares de texto/fundo principais e de feedback verificados por cálculo WCAG: todos acima de 4,5:1 nos dois temas. Isso não substitui revisão visual de componentes.
- Lint, TypeScript e build de produção passaram após a implementação.
