# Dados de demonstração

## Conjunto inicial
Dois perfis (Você e Seu par), 20 refeições e 20 planos recorrentes para os cinco tipos. Há variantes de dias úteis e fim de semana. Na inicialização/reset, a vigência usa a data de São Paulo, entre 28 dias antes e 56 dias depois. Depois de inicializar, os registros ficam estáveis, sem regeneração a cada leitura.

## Persistência
Usuários, refeições e planos ficam juntos em um armazenamento versionado: .next/cache/foodist-demo-v1.json, ou o caminho indicado por MOCK_DATA_PATH. A inicialização migra edições do antigo foodist-mock-meals.json. O reset explícito restaura as fixtures originais, sem reimportar as edições antigas.

Criação, edição e exclusão são persistidas. IDs crescem e não são reutilizados após exclusão. Novas pessoas não recebem planos automaticamente. Planos mantêm referências a pessoa/refeição e refletem mudanças de nome e descrição. Exclusões em cascata e clonagem seguem o contrato documentado.

## Modo atual confirmado pelo usuário
O backend não está e não vai rodar neste ambiente. Esta entrega utiliza apenas mocks baseados no README. USE_MOCK_DATA=true também é o padrão do Docker; em container, /data é um volume persistente. Não há dependência de backend local.

USE_MOCK_DATA=false e API_BASE_URL permanecem como opção futura, sem fallback silencioso. O transporte é testado com um servidor externo simulado, não com o backend real.

## Reset
Restaurar dados, na faixa de demonstração, abre confirmação. A ação substitui apenas os dados de demonstração e não acessa API real. Não usar a demonstração como banco de produção de múltiplas instâncias: o arquivo é destinado ao uso pessoal e uma única instância.

## Validação
Suíte isolada em tests/api-workflows.mjs cobre criação, validações, PATCH parcial, IDs, recorrência, clonagem exata e conflito, resposta 201 sem corpo, exclusões em cascata, reset e persistência. Os testes de navegador e standalone usam arquivos próprios temporários, preservando os dados do usuário.