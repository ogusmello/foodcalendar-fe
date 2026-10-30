# Yummy!

Planejamento alimentar pessoal para o casal, com Next.js App Router, React, TypeScript, Tailwind CSS e Framer Motion. Todos os dados são lidos e gravados na Food Calendar API externa. Não há modo demonstração, fixtures ou persistência local na aplicação.

## Configuração

Requer Node.js 24 e pnpm 12.11.2.

```sh
pnpm install --frozen-lockfile
cp .env.example .env
```

Configure a URL da API no arquivo .env:

```dotenv
API_BASE_URL=https://api.example.com
PORT=3000
FOODIST_TAG=local
```

Use a URL base **sem /v1**, sem query string ou fragmento. O frontend acrescenta /v1 aos recursos. HTTP e HTTPS são aceitos. Reinicie o servidor após alterar o ambiente. Se existir .env.local, ele tem prioridade no Next.js: atualize ou remova valores conflitantes nesse arquivo. O Compose lê .env, não .env.local.

```sh
pnpm dev
```

Acesse http://localhost:3000. O navegador chama as rotas internas /api do frontend; o servidor Next acessa a API externa. API_BASE_URL não é NEXT_PUBLIC e não é exposta ao navegador. Sem configuração válida ou com a API indisponível, as consultas retornam erro; não há fallback para dados fictícios.

Crie as pessoas em Configurações, cadastre refeições e adicione planejamentos ao calendário. A API fornece os IDs: não há usuários ou refeições predefinidos. Criar ou copiar para Ambos usa uma chamada por pessoa e informa sucesso parcial.

## Contrato da API

JSON e recursos /v1/users, /v1/meals e /v1/meal-plans. O backend pertence a outro repositório. Datas são civis (YYYY-MM-DD), sem horários. Tipos de refeição: BREAKFAST, LUNCH, SNACK, DINNER e DESSERT. O contrato atual não oferece login, nutrientes ou ingredientes estruturados.

A integração foi construída conforme o README do backend fornecido. A validação com uma instância real ainda depende do ambiente externo estar disponível.

## Docker Compose

Requer Docker Engine e Compose v2. Configure API_BASE_URL no .env antes de subir:

```sh
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs -f web
```

A porta pública é definida por PORT (padrão 3000). Dentro do container, localhost aponta para o próprio container: use a URL externa da API ou um hostname alcançável pela rede do container.

A imagem usa Node 24, build em múltiplos estágios, saída standalone do Next.js e usuário sem privilégios. A URL da API é configurável em runtime, sem rebuild. Sem Nginx, banco ou volume de dados: a persistência é responsabilidade do backend. Volumes antigos da demonstração não são usados nem apagados automaticamente.

O healthcheck /api/health verifica que o frontend está respondendo, independentemente da disponibilidade do backend. Falhas do backend são apresentadas nas consultas e formulários.

Arquivos .env privados, .ai/, testes e dependências locais ficam fora do contexto de build. Fontes de next/font podem exigir internet durante o build.

### Atualização

```sh
docker compose up -d --build
```

FOODIST_TAG identifica a imagem (nome interno mantido por compatibilidade). Para retornar a uma imagem já construída, use FOODIST_TAG=v1 docker compose up -d --no-build. Para parar, docker compose down.

## Verificações

```sh
pnpm lint
pnpm build
pnpm typecheck
pnpm test
pnpm test:docker
```

pnpm test executa verificações do transporte externo, interface e runtime standalone. Os testes iniciam um servidor HTTP isolado com respostas de contrato, exclusivo dos testes; ele não faz parte da aplicação e não acessa sua API ou dados reais. Não equivalem à validação de um backend real.

Para os testes de interface:

```sh
pnpm exec playwright install --with-deps chromium
```

pnpm test:docker constrói uma imagem isolada e verifica saúde, usuário, arquivos estáticos e comportamento sem backend. Remove somente os recursos que cria.

## Organização

Componentes em pastas com index.tsx, types.tsx e parts/ para partes exclusivas. Tailwind e tokens em app/globals.css. Camada de dados em lib/api; calendário em app/_components/features/CalendarView.
