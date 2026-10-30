# À Mesa

Planejamento alimentar pessoal para o casal. Next.js App Router, React, TypeScript, Tailwind CSS e Framer Motion. A entrega atual funciona com dados de demonstração baseados no contrato da Food Calendar API; não precisa de backend local.

## Desenvolvimento

Node.js 24 e pnpm 12.11.2.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Acesse http://localhost:3000. Calendário como Home com Hoje, Semana e Mês; catálogo, busca global, detalhes, cadastros, edição, exclusões e cópia de períodos.

## Dados de demonstração

USE_MOCK_DATA=true ativa os mocks. Usuários, refeições e planos são persistidos juntos; IDs são estáveis. No desenvolvimento, o arquivo padrão é .next/cache/foodist-demo-v1.json. MOCK_DATA_PATH permite definir outro arquivo. A primeira execução migra edições do armazenamento antigo de refeições, se existir.

Restaurar dados, na faixa de demonstração, pede confirmação antes de repor as fixtures. Novas pessoas começam sem planos automáticos. Criar ou clonar para Ambos usa uma requisição por pessoa; sucesso parcial é informado e uma operação já concluída não é repetida.

Datas são civis, sem horário. O backend não oferece horário, ingredientes estruturados, nutrientes ou login; esses campos não são inventados.

## Verificações

```sh
pnpm lint
pnpm build
pnpm typecheck
pnpm test
```

Os testes iniciam servidores de produção em portas livres e usam arquivos temporários isolados, preservando os dados de demonstração da aplicação.

Para testes de interface, instale Chromium e suas bibliotecas uma vez:

```sh
pnpm exec playwright install --with-deps chromium
pnpm test:ui
```

Capturas ficam em test-results/ (ignorado pelo Git). pnpm test:api valida CRUD, validações, recorrência, cascatas, clonagem e o transporte contra um servidor externo simulado. Isso não equivale a testar um backend real.

## Produção com Docker Compose

Requer Docker Engine e Compose v2 na VPS. Sem Nginx ou outro proxy neste pacote.

```sh
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs -f web
```

Acesse a porta 3000 do servidor. Para outra porta, defina PORT no arquivo .env do Compose. USE_MOCK_DATA=true é o padrão, conforme o escopo atual. As variáveis do Compose podem ser copiadas de .env.example; o Compose não usa .env.local automaticamente.

O volume foodist-data guarda os dados em /data/foodist-demo-v1.json. Atualizar ou recriar o container preserva esse volume. Não use down -v quando quiser manter os dados.

```sh
docker compose down
docker compose up -d --build
```

A imagem usa múltiplos estágios e a saída standalone do Next. O runtime executa como usuário sem privilégios e expõe a saúde em /api/health. Código-fonte, dependências locais, arquivos .env privados e dados locais não entram no contexto de build. Fontes de next/font podem exigir internet durante o build.

### Atualização e retorno de versão

Defina FOODIST_TAG para identificar a versão. Por exemplo, FOODIST_TAG=v1 docker compose up -d --build cria e executa foodist-fe:v1. Antes de atualizar, preserve a imagem anterior e faça backup do arquivo de dados/volume.

Para retornar à imagem já construída: FOODIST_TAG=v1 docker compose up -d --no-build. O volume é mantido; mudanças futuras de formato de dados devem acompanhar migração ou backup.

## Integração futura opcional

O contrato do backend está registrado em .ai/07-contrato-backend.md. Para usar uma API disponível futuramente, configure USE_MOCK_DATA=false e API_BASE_URL com o endereço base acessível pelo servidor Next, sem /v1. Não há fallback silencioso para mocks quando a flag é false.

Dentro de um container, localhost é o próprio container. Use um endereço ou nome de serviço alcançável pelo frontend. O navegador acessa as rotas internas /api; não precisa conhecer a URL do backend.

## Organização

Componentes em pastas com index.tsx, types.tsx e parts/ para partes exclusivas. Tailwind e tokens em app/globals.css. Camada de dados em lib/api; calendário em app/_components/features/CalendarView. Checklist e planos por tema na pasta .ai/.
### Teste do pacote de produção

pnpm test:standalone verifica o runtime standalone e persistência após reinício. pnpm test:docker requer um Docker Engine acessível e Compose v2; constrói a imagem, sobe um projeto isolado, verifica saúde/arquivos estáticos/uid e persistência após recriar o container. O teste limpa apenas seus próprios containers, volume e tag de imagem.
