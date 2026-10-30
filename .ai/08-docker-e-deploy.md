# Docker e Docker Compose — última etapa

## Requisitos confirmados
- Preparar o frontend para execução com Docker e Docker Compose.
- Objetivo: deixar o projeto pronto para subir em uma VPS quando estiver finalizado.
- Dockerização é a última etapa, depois das animações com Framer Motion.
- Não incluir Nginx ou outro proxy reverso nesta etapa.
- Este documento é planejamento; não criar a infraestrutura agora nem realizar deploy.

## Escopo
Empacotar somente este frontend. O backend pertence a outro repositório; seu empacotamento e banco continuam sob responsabilidade daquele projeto. Alinhar a conectividade entre os serviços sem assumir que o backend estará no mesmo Compose.

## Entregáveis planejados
- Dockerfile de produção com build em múltiplos estágios.
- compose.yaml para executar o frontend em produção.
- .dockerignore para excluir dependências locais, artefatos de build, Git e arquivos sensíveis.
- .env.example com as variáveis necessárias e valores ilustrativos, sem credenciais.
- Instruções de build, execução, atualização, consulta de logs e parada.

## Estratégia proposta
1. Configurar e validar a saída standalone do Next.js para reduzir a imagem de execução.
2. Usar o gerenciador de pacotes escolhido e seu lockfile com instalação reproduzível.
3. Separar dependências de build da imagem de execução; incluir os arquivos estáticos necessários.
4. Executar em modo de produção, com usuário sem privilégios, escutando na interface do container.
5. Publicar uma porta configurável da VPS diretamente para o serviço, sem Nginx.
6. Definir política de reinício, logs via stdout/stderr e verificação de saúde apropriada.
7. Não usar bind mount do código-fonte nem servidor de desenvolvimento na configuração de produção.
8. Documentar quais variáveis são necessárias no build e quais podem mudar em runtime.

## Integração com o backend
- localhost dentro do container aponta para o próprio container, não para o backend ou para a VPS.
- Se o Next acessar a API pelo servidor, configurar um endereço alcançável pelo container.
- Se o navegador acessar a API diretamente, usar endereço alcançável pelo navegador e alinhar CORS com o backend.
- Variáveis NEXT_PUBLIC_* são públicas e normalmente incorporadas no build; não tratá-las como segredos nem presumir troca em runtime.
- Definir a estratégia de acesso e os ambientes antes de fechar o Compose.

## Validação final
- Validar a configuração do Compose e construir a imagem a partir do lockfile.
- Subir o serviço e verificar página inicial, arquivos estáticos, navegação, temas e integração com a API.
- Validar reinício, logs, saúde do serviço e ausência de dependências do ambiente de desenvolvimento.
- Documentar atualização e retorno à imagem anterior.
- Confirmar arquitetura da VPS, porta disponível, endereço do backend e variáveis de produção.

## Sequência
Base visual e arquitetura → telas e integração → temas e validação funcional → animações → Docker/Compose → projeto pronto para implantação.

A execução do deploy na VPS é uma ação futura, fora da criação deste plano.

## Implementação e escopo atual
Dockerfile multiestágio com Node 24, pnpm 12.11.2, saída standalone e usuário uid 1001. compose.yaml inclui porta configurável, healthcheck, reinício e volume persistente para mocks. Sem Nginx. O usuário confirmou que a entrega atual usa apenas dados mockados, portanto USE_MOCK_DATA=true é o padrão; API_BASE_URL é opcional para o futuro. Instruções de execução, atualização e retorno de versão em README.md.

O teste tests/docker-smoke.mjs usa projeto, imagem e volume isolados, testa saúde/arquivos estáticos/uid/persistência após recriação e limpa seus próprios recursos. O deploy na VPS não faz parte desta execução.
