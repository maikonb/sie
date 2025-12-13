# Documentação da Máquina de Estados de Fluxo de Projeto

Esta documentação descreve a máquina de estados gerada em `lib/project-flow-machine.ts`, baseada no fluxograma de classificação de projetos.

## Estrutura Geral

A máquina utiliza o **XState** para gerenciar o fluxo de decisão. O contexto (`context`) armazena as respostas dadas pelo usuário (`answers`) para histórico, embora o fluxo seja determinado pelas transições de estado.

## Estados (States)

Os estados representam as perguntas ou etapas de decisão do fluxograma.

### Decisões (Perguntas)

| Estado ID                  | Descrição (Pergunta)                                           | Próximos Passos (Sim / Não)                                         |
| :------------------------- | :------------------------------------------------------------- | :------------------------------------------------------------------ |
| `check_funding`            | Possui recurso financeiro?                                     | Sim: `check_funding_origin` <br> Não: `check_no_funding_r_and_d`    |
| `check_funding_origin`     | Origem do recurso é pública?                                   | Sim: `check_public_r_and_d` <br> Não: `check_private_r_and_d`       |
| `check_public_r_and_d`     | Recurso público: é PD&I com coexecução e incerteza técnica?    | Sim: `result_pdi_agreement` <br> Não: `check_public_service`        |
| `check_public_service`     | Recurso público e sem PD&I: é prestação de serviço técnico...? | Sim: `result_service_contract` <br> Não: `result_appdi_private`     |
| `check_private_r_and_d`    | Recurso privado: é PD&I com coexecução e incerteza técnica?    | Sim: `result_pdi_agreement` <br> Não: `check_private_service`       |
| `check_private_service`    | Recurso privado e sem PD&I: é prestação de serviço técnico...? | Sim: `result_service_contract` <br> Não: `result_appdi_private`     |
| `check_no_funding_r_and_d` | Sem recurso: é PD&I com coexecução e incerteza técnica?        | Sim: `result_appdi_no_funding` <br> Não: `check_institutional_coop` |
| `check_institutional_coop` | Sem recurso e sem PD&I: é cooperação institucional sem preço?  | Sim: `result_coop_agreement` <br> Não: `check_confidentiality`      |
| `check_confidentiality`    | Apenas troca de informações confidenciais?                     | Sim: `result_nda` <br> Não: `check_tech_transfer`                   |
| `check_tech_transfer`      | Há tecnologia pré-existente para licenciar/transferir?         | Sim: `result_tech_transfer` <br> Não: `result_review_scope`         |

### Resultados Finais (Final States)

Estes são os estados finais da máquina, representando a classificação conclusiva do projeto.

- **`result_pdi_agreement`**: Convênio de PD&I
- **`result_service_contract`**: Contrato de Serviços Técnicos
- **`result_appdi_private`**: APPDI com aporte privado
- **`result_appdi_no_funding`**: APPDI SEM aporte
- **`result_coop_agreement`**: Acordo / Termo de Cooperação
- **`result_nda`**: NDA/Termo de Confidencialidade
- **`result_tech_transfer`**: Licenciamento/Transferência de Tecnologia
- **`result_review_scope`**: Rever escopo/enquadramento (Fluxo não encontrou classificação adequada)

## Eventos (Events)

Para navegar pela máquina, envie os seguintes eventos:

- **`ANSWER_YES`**: Responde "Sim" para a pergunta atual e avança para o próximo estado correspondente.
- **`ANSWER_NO`**: Responde "Não" para a pergunta atual e avança para o próximo estado correspondente.
- **`RESET`**: Reinicia a máquina para o estado inicial (`check_funding`) e limpa o histórico de respostas.

## Exemplo de Uso

```typescript
import { createActor } from "xstate"
import { projectFlowMachine } from "@/lib/project-flow-machine"

const actor = createActor(projectFlowMachine)
actor.start()

// Estado inicial: check_funding
console.log(actor.getSnapshot().value) // 'check_funding'

// Usuário responde "Sim"
actor.send({ type: "ANSWER_YES" })
console.log(actor.getSnapshot().value) // 'check_funding_origin'

// Usuário responde "Não" (Recurso Privado)
actor.send({ type: "ANSWER_NO" })
console.log(actor.getSnapshot().value) // 'check_private_r_and_d'
```
