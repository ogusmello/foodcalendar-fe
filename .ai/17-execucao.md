# Execução da checklist

## Escopo confirmado
Aplicação pessoal com dados mockados baseados no README do backend. O backend não roda nem precisa rodar neste ambiente. API real é opção futura, fora da aceitação desta entrega. Usuário confirmou Ambos nos fluxos de criação/clonagem e pnpm como gerenciador oficial.

## Entregue
- Cadastros de pessoas e refeições em modais.
- Criação de refeição dentro do planejamento, preservando o rascunho e selecionando o novo ID.
- Planejamento único ou recorrente, prévia, atalhos de dias e seleção explícita de pessoas/Ambos.
- Clonagem por vigência exata, prévia, destino de duração diferente e resposta sem corpo.
- Sucesso parcial de operações para Ambos; repetição apenas das pendentes e bloqueio em resultado incerto.
- Edição de nome de pessoa, edição da recorrência do plano e exclusões com confirmação.
- Exclusões em cascata reproduzindo o contrato.
- Armazenamento versionado de usuários, refeições e planos, IDs estáveis, migração das edições antigas e reset explícito.
- Atualização do calendário, catálogo, TopNav e busca sem recarregar o documento.
- Framer Motion em modais, controles, Sidebar e mudanças do calendário, respeitando movimento reduzido.
- Foco contido nos modais com Tab/Shift+Tab, Escape e retorno ao disparador.
- pnpm 12.11.2 como padrão, único lockfile e scripts de verificação.
- Dockerfile multiestágio, Compose sem Nginx, runtime uid 1001 e volume persistente.
- README de desenvolvimento, testes, execução na VPS, atualização e retorno de versão.

## Verificações realizadas
1. pnpm install --frozen-lockfile.
2. pnpm lint, pnpm build e pnpm typecheck.
3. pnpm test:api: CRUD, validações, recorrência, clone exato, conflitos, respostas vazias, cascatas, reset, persistência e transporte sem fallback contra um servidor externo simulado.
4. pnpm test:ui: Chromium real; cadastro de refeição e pessoa, criação para Ambos com falha parcial e repetição sem duplicar, edição de plano/refeição/pessoa, cancelamento e confirmação de exclusão, clonagem, busca e modais, temas, mobile, ausência de overflow da página e teclado/movimento reduzido.
5. Revisão de capturas desktop e mobile, claro e escuro.
6. pnpm test:standalone: Home, saúde, arquivos estáticos e persistência depois de reiniciar.
7. Compose config e build real da imagem.
8. pnpm test:docker: container saudável, uid 1001, ausência de .env.local na imagem, CSS, logs e dados preservados depois de recriar o container.

Testes usam dados e portas isolados. Os projetos, containers, volumes e tags de teste foram removidos ao terminar. Dados de demonstração do usuário preservados.

## Ambiente
Foram instalados Chromium/Playwright e bibliotecas necessárias no WSL para testar a interface, além de Docker Engine, Compose e Buildx para validar a imagem. O serviço Docker foi iniciado. Nenhum backend ou serviço remoto foi instalado/deployado.

## Fora desta execução
Deploy na VPS; integração com backend real; autenticação e campos não oferecidos pelo README (horários, ingredientes estruturados, nutrientes, imagens etc.).