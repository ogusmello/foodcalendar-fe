# Criação de refeições

## Status e contrato
Implementado conforme o README do backend e 07-contrato-backend.md. Ver resultados da execução em 17-execucao.md.

POST /v1/meals cria um recurso compartilhado, com resposta 201 e objeto contendo id, name e description. Tipo de refeição, pessoa, data e recorrência pertencem ao plano, não a este cadastro.

## Entradas propostas
- Botão Nova refeição no catálogo /refeicoes.
- Ação Criar refeição no seletor de refeições do formulário de planejamento quando não encontrar a opção desejada.
- Estado vazio do catálogo com a mesma ação.

## Formulário
| Campo | Regra |
| --- | --- |
| Nome | Obrigatório, não apenas espaços, até 255 caracteres |
| Descrição | Obrigatória, não apenas espaços; sem limite adicional arbitrário |

Não incluir horários, ingredientes estruturados, preparo, porções, nutrientes, upload de imagens ou vínculo obrigatório a pessoa.

## Experiência
- Modal no padrão aprovado da busca e dos detalhes: fundo borrado, painel arredondado e foco controlado.
- Reaproveitar os campos e validações de MealDialog/parts/MealForm, distinguindo criação POST e edição PATCH por props tipadas.
- Em cadastro a partir do planejamento, preservar o rascunho do plano e selecionar o ID retornado da nova refeição.
- Evitar empilhar dialogs; alternar o conteúdo do mesmo fluxo ou suspender o formulário pai preservando seus dados.
- Criar refeição e criar plano são operações independentes. Se o plano for cancelado ou falhar depois, a refeição criada permanece no catálogo.
- Após sucesso, abrir os detalhes da refeição ou retornar ao seletor de origem, conforme o ponto de entrada.
- A pesquisa global mantém sua regra: sem texto mostra apenas as refeições planejadas do dia; uma refeição recém-criada e ainda não planejada aparece no catálogo e na pesquisa por nome.

## Integração proposta
POST interno /api/meals encaminha ao backend. A camada de transporte deve distinguir 201 com JSON da clonagem 201 sem corpo. Usar o ID da resposta, sem inventar IDs no frontend.

Atualizar catálogo e pesquisa de nomes. O resumo diário só muda após criar um plano.

## Estados e validação
Preservar os campos em falha, mostrar erros 400 por campo e falha geral de rede, bloquear envio duplicado enquanto pendente e não repetir POST automaticamente. Em timeout com resultado incerto, consultar o catálogo antes de orientar nova tentativa; o backend não documenta idempotência ou unicidade por nome.

## Critérios de conclusão
Criar com mocks e API real pela mesma interface; recurso aparece no catálogo, pode abrir no modal, editar e ser selecionado em um planejamento. Testar textos inválidos, limite de nome, sucesso e falhas sem perder o formulário.
## Executado
Cadastro implementado no catálogo e dentro do planejamento, preservando o rascunho e selecionando o ID retornado. Modal, validações, persistência, atualização das telas e estados de erro testados. A edição existente continua separada do vínculo de planejamento.
