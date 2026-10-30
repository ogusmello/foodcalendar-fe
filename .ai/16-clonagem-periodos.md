# Clonagem de períodos

## Status e objetivo
Planejamento futuro para reaproveitar planos existentes. A operação disponível é POST /v1/meal-plans/clone; não corresponde a copiar qualquer recorte visível de um calendário.

## Entrada proposta
Menu de ações do calendário → Copiar período. Modal com escolha de pessoa, origem real, destino e prévia antes de confirmar.

## Campos
| Campo | Função |
| --- | --- |
| userId | Pessoa cujos planos serão copiados |
| originalStartDate | Início exato da vigência de origem |
| originalEndDate | Fim exato da vigência de origem |
| newStartDate | Início do destino |
| newEndDate | Fim do destino |

Os dois intervalos devem respeitar início <= fim. Não exigir duração de sete dias nem duração igual entre origem e destino: o contrato permite diferenças.

## Seleção de origem
- Consultar planos da pessoa com intervalo completo e agrupar por startDate + endDate reais.
- Apresentar vigências existentes, quantidade de planos e resumo das refeições, permitindo selecionar um grupo.
- Usar as datas desse grupo como origem exata; não substituir pela semana/mês visível.
- A prévia de um grupo pode ser calculada filtrando igualdade de datas entre os planos consultados.
- Se o grupo não existir mais no envio, tratar 404 preservando destino e pedindo nova origem.
- Nos mocks atuais a vigência é ampla: mostrar essa vigência real, sem prometer copiar apenas uma semana.

## Destino e confirmação
- Mostrar intervalo de destino, pessoa e conteúdo que será copiado.
- Manter dias da semana da origem. Não deslocar os dias com base na posição relativa do início.
- Informar quando os dias selecionados da origem não tiverem ocorrência no destino.
- Origem permanece intacta; cópias recebem novos IDs.
- Não criar rótulos como substituir semana: a operação não substitui nem remove planos.
- Primeira entrega proposta para uma pessoa por envio. Copiar para as duas pessoas exigiria chamadas independentes e tratamento de sucesso parcial; fica fora da primeira entrega até confirmação.

## Integração e erros
POST interno /api/meal-plans/clone encaminha o payload. Sucesso 201 sem corpo: não executar response.json() obrigatoriamente; reconsultar o destino para apresentar as cópias.

- 400: dados ou intervalo inválidos.
- 404: origem sem planos com datas exatas.
- 409: já existe plano do mesmo usuário com início e fim exatamente iguais ao destino.
- O conflito não cobre sobreposição parcial. A interface não pode garantir destino livre apenas por não haver 409.
- O backend verifica conflito no destino antes da busca da origem.
- Não repetir POST automaticamente em timeout. Consultar destino e comunicar incerteza quando necessário.

## Mocks, atualização e validação
Persistir cópias com novos IDs, preservando refeição, pessoa, tipo e targetDays. Reproduzir origem exata, ordem de conflitos e resposta vazia.

Atualizar calendário, TopNav e sugestões do dia. Oferecer Ver período copiado preservando a visão escolhida.

Testar datas exatas versus sobreposição, durações diferentes, preservação dos dias, 400/404/409, sucesso sem JSON e ausência de alteração nos registros de origem.