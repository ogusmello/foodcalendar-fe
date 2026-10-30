# Dados de demonstração

## Implementado
- Dois perfis fictícios: Você e Seu par. Os nomes servem apenas à demonstração.
- 20 refeições com id, nome e descrição, seguindo o contrato do backend.
- 20 planos recorrentes: cinco tipos por pessoa, com variantes para dias úteis e fins de semana.
- Vigência relativa à data atual de São Paulo: 28 dias anteriores e 56 posteriores. Mantém hoje e as semanas próximas preenchidos.
- Respostas de usuários, busca por refeição, filtros por pessoa, data e sobreposição de período compatíveis com o contrato atual.
- Sem horários, ingredientes estruturados, nutrientes ou outros campos não disponíveis na API.

## Visualização
- TopNav com refeições reais do conjunto de demonstração e seleção individual/conjunta.
- Busca global com resultados e navegação até a refeição.
- Página inicial com semana completa, mudança de semana, seleção do dia e filtro de pessoa.
- Catálogo com as 20 refeições e detalhe filtrado pelos resultados de pesquisa.
- Configurações com os dois perfis e controle de tema.
- Aviso global de modo demonstração. Nenhum dado é gravado no backend; as refeições agora permitem edição de demonstração, persistida em .next/cache/foodist-mock-meals.json. Limpar esse arquivo restaura as fixtures. Ver 12-modal-refeicao.md.

## Ativar e desativar
- USE_MOCK_DATA=true ativa explicitamente os mocks, mesmo com API_BASE_URL definida.
- USE_MOCK_DATA=false desativa os mocks e utiliza a API real via API_BASE_URL.
- Sem flag, o fallback automático só ocorre em desenvolvimento quando API_BASE_URL não está configurada.
- Ambiente local já ativado em .env.local, arquivo ignorado pelo Git. .env.example documenta as opções.
- Para usar o backend real, definir USE_MOCK_DATA=false e o endereço de API_BASE_URL; reiniciar o servidor se necessário.
- Fonte das fixtures: lib/api/mocks.ts. A camada getApi seleciona a origem, mantendo os componentes independentes de mocks.

## Validação
Lint, TypeScript e build aprovados. Verificação HTTP cobriu as 20 refeições, busca sem distinção de maiúsculas, pesquisa vazia, visão conjunta e individual, cinco tipos por pessoa, recorrência no sábado, período fora da vigência e páginas renderizadas com os dados e aviso de demonstração.