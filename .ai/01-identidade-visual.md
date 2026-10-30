# Identidade visual

## Confirmado
- Tailwind CSS em toda a interface.
- Temas claro e escuro com Theme Switcher.
- Cores centralizadas nos tokens semânticos de 03-tokens.md.

## Proposta a validar
- Interface leve e acolhedora, focada em planejamento alimentar.
- Base implementada: verde como principal, neutros suaves e terracota como apoio. Valores em app/globals.css; refinamentos visuais podem ser feitos após revisão da interface.
- Avaliar DM Sans para interface e Outfit para marca, já presentes no projeto.

## Plano
1. Comparar paletas na mesma tela, nos dois temas.
2. Aprovar cores, fontes, ícones e hierarquia visual.
3. Validar contraste WCAG AA, foco e estados de interação.
4. Aplicar a identidade aos componentes compartilhados.

## Critérios de conclusão
- Paleta e tipografia aprovadas e representadas por tokens.
- Hover, foco, seleção, erro e desabilitado legíveis nos dois temas.
- Estados não comunicados apenas por cor.

## Em aberto
Identidade definitiva da marca e detalhes da rotina de uso do casal.

## Referência visual confirmada pelo usuário
- Interface clean, minimalista, útil e interativa, conforme a imagem compartilhada nesta conversa.
- Cantos arredondados em cards, painéis, campos e controles, com raios consistentes e hierarquia entre contêineres e elementos internos.
- Bento grid: composição modular com cards de tamanhos diferentes, alinhamentos claros e espaçamento uniforme. Adaptar a grade à importância do conteúdo e reorganizá-la no mobile.
- Superfícies discretas, separação suave entre fundo e cards, bordas leves e sombras sutis quando necessárias.
- Navegação lateral compacta, tipografia legível e ações contextuais próximas ao conteúdo.
- Usar espaço em branco e hierarquia para facilitar leitura; cada card deve ter uma função real no planejamento alimentar.
- A imagem é referência de linguagem visual, não de paleta ou de funcionalidades. Sua predominância azul não é a direção desejada. A base implementada usa verde e terracota.
- Traduzir a mesma linguagem para o tema escuro, preservando contraste e profundidade.

## Ordem de execução
Concluir telas, tokens, componentes, integração e Theme Switcher antes das animações descritas em 06-animacoes.md. Docker/Compose vem por último, conforme 08-docker-e-deploy.md.

## Público e finalidade confirmados
Projeto pessoal, sem finalidade comercial neste momento. O público inicial é o usuário e sua mulher. Priorizar clareza, conforto e utilidade na rotina alimentar dos dois. A identidade deve refletir o gosto do casal; não há necessidade de linguagem de vendas, planos pagos ou indicadores comerciais.


## Paleta base implementada
| Papel | Claro | Escuro |
| --- | --- | --- |
| Fundo | #f5f6f2 | #141a17 |
| Superfície | #ffffff | #1c2420 |
| Texto principal | #202a24 | #edf2eb |
| Texto secundário | #5e6b62 | #afbeb1 |
| Primária | #286344 | #a0d5ac |
| Apoio | #a54c23 | #f0b48b |

O azul fica restrito ao feedback informativo, sem dominar a identidade.

## Refinamento de cor
A pedido do usuário, ampliar a variedade cromática. Verde principal mais vivo (#18794e no tema claro) e apoio laranja (#b5481d). Refeições usam famílias próprias: café em amarelo, almoço em verde, lanche em pêssego, jantar em lavanda e sobremesa em rosa. Manter as superfícies neutras para destacar o conteúdo sem sobrecarregar a interface. Esta revisão substitui os valores anteriores de primary e accent da tabela base; a fonte de verdade permanece app/globals.css.


## Ajuste de saturação
Após revisão do usuário, suavizar a paleta: manter amarelo, verde, pêssego, lavanda e rosa em fundos discretos, com textos de cor moderada. Verde principal #2b6d4f e apoio #a55732 no claro. No escuro, reduzir também a saturação dos fundos e textos. Esses valores substituem a revisão mais vibrante anterior; app/globals.css é a fonte de verdade.

## Logo e temas
BrandMark renderiza a marca SVG inline com fill=currentColor e a classe text-foreground, substituindo a imagem de preenchimento preto fixo na Sidebar. A forma original foi preservada. Chromium verificou que os paths herdam a cor do texto nos temas claro e escuro e que a cor muda ao alternar o tema.

## Nome da plataforma
A marca passa a ser Yummy, refletindo a rotina alimentar compartilhada do casal. Sidebar, títulos de páginas e textos visíveis usam o novo nome. A forma da marca gráfica permanece. Identificadores internos de armazenamento, eventos, arquivos e volumes já existentes são mantidos por compatibilidade, preservando preferências e dados.
