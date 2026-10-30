# Theme Switcher

## Confirmado
Toda a interface deve suportar temas claro e escuro com Tailwind e alternância pelo usuário.

## Comportamento proposto
- Opções Claro, Escuro e Sistema.
- Sistema na primeira visita; acompanhar o sistema apenas nessa opção.
- Persistir preferência entre visitas e navegações.
- Controle na TopNavBar e preferência em Configurações.
- Aplicar tema ao html para toda a interface herdar os tokens.

## Plano técnico
1. Selecionar valores dos tokens por atributo global, como data-theme="light" ou "dark".
2. Expor tokens pelo Tailwind; usar variante de tema para diferenças que tokens não expressem.
3. Isolar provider e controle em componentes de cliente; manter layout como Server Component.
4. Resolver preferência antes da primeira pintura para evitar flash, respeitando a política de scripts.
5. Tratar hidratação sem renderizar APIs do navegador no servidor e sem suprimir avisos indiscriminadamente.
6. Persistir no navegador com tolerância a falhas. Usar cookie se o servidor precisar conhecer a escolha.
7. Definir color-scheme para controles nativos.

Avaliar implementação própria pequena ou biblioteca especializada na implementação. clsx pode compor classes do controle; persistência e resolução do tema precisam de lógica própria ou biblioteca.

## Acessibilidade
Nome acessível, opção selecionada identificada, teclado, foco visível e respeito à redução de movimento.

## Critérios de conclusão
- Todos os componentes funcionam nos dois temas.
- Preferência persiste em recarregamento e navegação.
- Mudanças do sistema afetam apenas a opção Sistema.
- Sem flash perceptível ou avisos de hidratação no primeiro acesso e recarregamento.
- Falha de armazenamento não impede uso.
- Validar mobile, desktop e estados de foco, erro e carregamento.

## Dependências
Identidade em 01-identidade-visual.md e tokens em 03-tokens.md.

## Relação com a etapa de animações
Concluir e validar o Theme Switcher antes de adicionar Framer Motion. A troca de tema deve funcionar de imediato, inclusive com movimento reduzido; qualquer transição visual será refinada na etapa de animações, antes da dockerização final.


## Implementado na base estrutural
Controle nativo na TopNavBar com Claro, Escuro e Sistema; preferência em localStorage e data-theme no html. Script inicial resolve o tema antes da pintura. O controle usa useSyncExternalStore para sincronizar preferência, mudanças do sistema e outras abas, tolerando falha do armazenamento. A supressão de hidratação fica limitada ao html, cujos atributos são ajustados pelo script inicial. Nenhuma dependência adicional foi necessária. Validação visual em navegador permanece pendente.
