# Padrão do projeto e consumo de APIs

## Estado atual
Next.js App Router, React e TypeScript estrito. Sem integração com backend ou autenticação. Há lockfiles de npm e pnpm.

## Confirmado
- Tailwind em toda a interface.
- Usar clsx quando necessário para compor classes condicionais; instalar na implementação que precisar dele.
- Variantes devem usar classes completas, detectáveis pelo Tailwind.

clsx compõe classes, mas não gerencia tema nem resolve conflitos entre utilitários. Evitar conflitos por construção; avaliar outra dependência apenas se necessário.

## Organização proposta
- app/: rotas, layouts e composição.
- components/ui/: componentes visuais reutilizáveis.
- components/layout/: Sidebar, TopNavBar e estrutura.
- features/planning/: interface, operações e tipos do planejamento.
- features/meals/: interface, operações e tipos de refeições.
- features/users/: seleção de usuário, operações e tipos de usuários.
- lib/api/: transporte HTTP e erros compartilhados.
- lib/theme/: preferência e aplicação do tema.
- app/globals.css: entrada do Tailwind e tokens.

Migrar a estrutura atual gradualmente, preservando alterações locais. Esta organização ainda é uma proposta.

## Convenções propostas
- Server Components por padrão; cliente apenas onde houver interação ou APIs do navegador.
- PascalCase para componentes e tipos; camelCase para funções e hooks.
- Extrair componentes compartilhados quando houver responsabilidade reutilizável clara.
- Estado local para interação efêmera; URL para filtros compartilháveis.
- Definir necessidades antes de adotar estado global ou biblioteca de cache.
- Escolher um gerenciador e manter seu lockfile após confirmar a decisão.

## Plano de APIs
1. Confirmar contrato, ambientes, autenticação, paginação e formato de erros.
2. Decidir acesso pelo servidor Next ou navegador conforme autenticação e implantação.
3. Centralizar URL base, headers, serialização, respostas sem corpo e normalização de erros.
4. Criar operações por domínio, como getMeals e createMeal, separadas da interface.
5. Alinhar tipos ao contrato e validar dados externos nas fronteiras.
6. Definir cache e revalidação por operação; não compartilhar cache de dados privados.
7. Prever cancelamento e falhas. Não repetir mutações automaticamente sem garantia de idempotência.
8. Manter segredos no servidor. NEXT_PUBLIC_* é público. Definir armazenamento e renovação de credenciais conforme o backend.

## Validação da implementação
Lint, tipos e build. Testes proporcionais para regras de negócio e fluxos críticos. Validar integração real quando disponível; identificar dados simulados no desenvolvimento.

## Em aberto
Contrato do backend recebido: ver 07-contrato-backend.md. A API atual não possui autenticação nem paginação. Permanecem em aberto ambientes, CORS/estratégia de acesso, gerenciador oficial e cache no cliente.

## Animações antes da dockerização
Adicionar Framer Motion na penúltima etapa, antes de Docker/Compose, após estabilizar os fluxos, o layout responsivo, as APIs e os temas. Tailwind continua responsável pelos estilos; Framer Motion controla o comportamento animado. Isolar as fronteiras de cliente e evitar que uma animação decorativa force toda a página a ser renderizada no cliente. Ver plano 06-animacoes.md.


## Backend externo
O backend pertence a outro repositório e é responsabilidade de outra pessoa. Este projeto implementa a integração frontend. O contrato atual está registrado em 07-contrato-backend.md e prevalece sobre hipóteses anteriores sobre receitas, ingredientes ou autenticação. As etapas de confirmação se aplicam agora à validação do contrato documentado e às questões ainda pendentes.

## Padrão confirmado para pastas de componentes

Cada componente deve ter uma pasta com seu nome em PascalCase:

```text
NomeDoComponente/
├── index.tsx
├── types.tsx
└── parts/
    └── MicroComponente/
        ├── index.tsx
        └── types.tsx
```

- `index.tsx`: implementação e exportação do componente.
- `types.tsx`: interfaces e tipos específicos do componente, incluindo suas props. Manter essa extensão conforme a preferência definida para o projeto; usar `import type` ao consumir os tipos.
- `parts/`: microcomponentes relativos exclusivamente ao componente pai. Cada parte segue o mesmo padrão e pode ter suas próprias partes quando necessário.
- Criar `types.tsx` e `parts/` quando houver conteúdo; não criar arquivos ou diretórios vazios apenas para preencher a estrutura.
- Aplicar esse padrão tanto aos componentes compartilhados quanto aos componentes das funcionalidades, independentemente da localização final das pastas.
- Consumidores externos importam o componente pelo diretório público, por exemplo `components/ui/Button`, sem acessar suas partes internas.
- Se uma parte passar a ser usada fora do componente pai, movê-la para o nível compartilhado adequado em vez de importar diretamente de `parts/`.
- Tipos de domínio e contratos da API permanecem na funcionalidade ou camada de API; não duplicá-los em cada `types.tsx`.
- Manter a estilização com Tailwind no componente, sem adicionar arquivo de estilos por pasta.
- Aplicar a convenção aos componentes existentes durante a implementação, preservando as alterações locais. Esta etapa atual altera apenas o planejamento.

## Escala e finalidade do projeto
Uso pessoal inicial pelo usuário e sua mulher, sem finalidade comercial. Preferir soluções simples e manutenção fácil; não introduzir arquitetura multiempresa, cobrança ou camadas voltadas a escala comercial sem necessidade real. Preservar organização, validação, acessibilidade e integração correta. O contexto pessoal não altera o contrato de usuários e planos da API.


