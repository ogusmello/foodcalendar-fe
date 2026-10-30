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

## Deploy pelo GitHub Actions

O workflow **CI** verifica PRs e pushes na main. Após os testes, um push na main publica a imagem em ghcr.io/ogusmello/foodcalendar-fe com a tag do SHA completo do commit. Actions são fixadas por SHA; apenas o job de publicação recebe permissão de escrita no registry.

O workflow **Deploy** é manual e aceita somente commits da main com CI/publicação concluídos com sucesso. A referência é resolvida para um digest antes da implantação. Na VPS, compose.production.yaml baixa a imagem pronta, sem build e sem checkout do projeto.

### GitHub Secrets

Cadastre em Settings → Secrets and variables → Actions → Repository secrets:

| Secret | Valor |
| --- | --- |
| VPS_HOST | Hostname ou IPv4 da VPS |
| VPS_PORT | Porta SSH, por exemplo 22 |
| VPS_USER | Usuário SSH com acesso ao Docker e ao diretório de deploy |
| VPS_DEPLOY_PATH | Caminho absoluto, por exemplo /opt/yummy; sem espaços ou .. |
| VPS_ARCH | amd64 ou arm64; utilizado pelo job de publicação |
| APP_PORT | Porta pública do frontend, por exemplo 3000 |
| API_BASE_URL | URL HTTP/HTTPS do backend acessível pelo container, sem /v1 |
| VPS_SSH_PRIVATE_KEY | Chave privada do usuário de deploy |
| VPS_KNOWN_HOSTS | Registro known_hosts da VPS, com fingerprint conferida por canal confiável |
| GHCR_READ_USER | Usuário para leitura de imagem privada no GHCR |
| GHCR_READ_TOKEN | Token com acesso de leitura ao pacote privado |

Os dois Secrets GHCR_READ_* podem ser omitidos somente se a imagem for pública. O GITHUB_TOKEN do workflow é fornecido automaticamente pelo GitHub para publicar e inspecionar a imagem; não precisa ser cadastrado.

Use Secrets do **repositório**, inclusive VPS_ARCH, pois a publicação não usa o environment production. O deploy usa o environment production, no qual você pode configurar proteções adicionais. Nenhuma credencial deve ser enviada ao Git.

API_BASE_URL deve ser uma URL simples, sem credenciais embutidas, query ou fragmento. Todos os dados de conexão e ambiente são configurados pelos Secrets. O .env da VPS é gerado pelo workflow com permissões restritas e enviado pela conexão SSH; não é commitado nem incluído na imagem. Alterações nos Secrets passam a valer no próximo deploy.

Para porta SSH diferente de 22, o known_hosts deve identificar [host]:porta. Não desative a validação da chave SSH.

### Preparar a VPS uma vez

Instale Docker Engine, Compose v2, Bash, tar e flock (util-linux). Garanta espaço para pelo menos a imagem atual e a anterior. O usuário de deploy deve conseguir executar Docker sem interação e criar/escrever no diretório escolhido. Prepare esse diretório antes do primeiro deploy, atribuindo as permissões adequadas ao usuário.

A VPS precisa acessar GHCR e o backend externo. O container precisa alcançar API_BASE_URL. Não há instalação automática de Docker, criação de usuário ou alteração do firewall neste workflow. Sem Nginx nesta etapa; porta pública, domínio e HTTPS dependem da infraestrutura escolhida.

### Primeiro deploy e atualizações

1. Configure os Secrets e a VPS.
2. Envie os workflows à main e aguarde o workflow CI terminar com sucesso, incluindo publicação.
3. Em Actions → Deploy → Run workflow, selecione a branch main, action=deploy e informe o SHA completo do commit aprovado.
4. Confira o resultado e os avisos no resumo do workflow.

O deploy baixa a imagem antes de alterar o serviço e aguarda saúde do frontend. Em falha de inicialização ou da verificação HTTP, tenta restaurar a imagem e o .env anteriores. No primeiro deploy não há versão anterior; uma falha interrompe o serviço novo e exige correção.

A consulta ao backend é verificada separadamente. Backend indisponível gera aviso explícito e não dispara rollback automático do frontend. A validação não cria nem exclui dados de produção.

A troca usa uma instância e pode causar breve indisponibilidade. Não há garantia de zero downtime.

### Rollback e operação

Execute Actions → Deploy → Run workflow com action=rollback; o campo commit é ignorado. A operação usa a versão anterior registrada na VPS, incluindo seu .env, e depende de a imagem ainda estar no cache Docker. Não altera dados do backend.

Estrutura do diretório de deploy:
- releases/<run-id>-<attempt>: Compose, script e .env de cada implantação.
- current e previous: referências para as versões atual e anterior.
- history.log: registro de versões e operações.
- .deploy.lock: bloqueio para impedir implantações simultâneas.

Para consultar o serviço diretamente na VPS, entre em <diretorio>/current e execute:

```sh
docker compose --project-name yummy --env-file .env -f compose.production.yaml ps
docker compose --project-name yummy --env-file .env -f compose.production.yaml logs --tail 100 web
```

Não use prune amplo: mantenha a imagem atual e anterior no host e suas tags por SHA no GHCR. O pipeline não exclui imagens do registry; a política inicial é retenção sem limpeza automática. Releases contêm configuração privada: mantenha permissões restritas e backups seguros. Rotacione credenciais comprometidas e atualize os Secrets.

### Validação local do deploy

```sh
pnpm test:deploy
pnpm test:docker
```

O primeiro testa a orquestração com Docker substituído por um comando isolado: falha de download, falha de inicialização, restauração automática, rollback manual, aviso de backend e validação do ambiente. O segundo constrói a imagem e usa o Compose de produção com Docker real. Não substituem a primeira execução no GitHub/VPS, que depende dos Secrets e acessos do seu ambiente.
