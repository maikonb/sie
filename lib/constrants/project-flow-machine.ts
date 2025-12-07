import { setup, assign } from "xstate"

export type ProjectFlowContext = {
  answers: Record<string, boolean>
}

export type ProjectFlowEvent = {
  type: "ANSWER_YES" | "ANSWER_NO" | "RESET"
}

export function createProjectFlowMachine() {
  return setup({
    types: {
      context: {} as ProjectFlowContext,
      events: {} as ProjectFlowEvent,
    },
    actions: {
      logAnswerYes: assign({
        answers: ({ context }) => {
          return context.answers
        },
      }),
      logAnswerNo: assign({
        answers: ({ context }) => {
          return context.answers
        },
      }),
      resetContext: assign({
        answers: () => ({}),
      }),
    },
  }).createMachine({
    id: "projectFlow",
    initial: "check_funding",
    context: {
      answers: {},
    },
    on: {
      RESET: {
        target: ".check_funding",
        actions: "resetContext",
      },
    },
    states: {
      check_funding: {
        meta: {
          description: "Possui recurso financeiro?",
        },
        on: {
          ANSWER_YES: { target: "check_funding_origin" },
          ANSWER_NO: { target: "check_no_funding_r_and_d" },
        },
      },
      check_funding_origin: {
        meta: {
          description: "Origem do recurso é pública?",
        },
        on: {
          ANSWER_YES: { target: "check_public_r_and_d" },
          ANSWER_NO: { target: "check_private_r_and_d" },
        },
      },
      // --- Public Funding Branch ---
      check_public_r_and_d: {
        meta: {
          description: "Recurso público: é PD&I com coexecução e incerteza técnica?",
        },
        on: {
          ANSWER_YES: { target: "result_pdi_agreement" },
          ANSWER_NO: { target: "check_public_service" },
        },
      },
      check_public_service: {
        meta: {
          description: "Recurso público e sem PD&I: é prestação de serviço técnico com escopo e preço definidos?",
        },
        on: {
          ANSWER_YES: { target: "result_service_contract" }, // Contrato de Serviços Técnicos
          ANSWER_NO: { target: "result_appdi_private" }, // APPDI com aporte privado (Flowchart points here for NO)
        },
      },
      // --- Private Funding Branch ---
      check_private_r_and_d: {
        meta: {
          description: "Recurso privado: é PD&I com coexecução e incerteza técnica?",
        },
        on: {
          ANSWER_YES: { target: "result_pdi_agreement" }, // Convênio de PD&I
          ANSWER_NO: { target: "check_private_service" },
        },
      },
      check_private_service: {
        meta: {
          description: "Recurso privado e sem PD&I: é prestação de serviço técnico com escopo e preço definidos?",
        },
        on: {
          ANSWER_YES: { target: "result_service_contract" }, // Contrato de Serviços Técnicos
          ANSWER_NO: { target: "result_appdi_private" }, // APPDI com aporte privado
        },
      },
      // --- No Funding Branch ---
      check_no_funding_r_and_d: {
        meta: {
          description: "Sem recurso: é PD&I com coexecução e incerteza técnica?",
        },
        on: {
          ANSWER_YES: { target: "result_appdi_no_funding" }, // APPDI SEM aporte
          ANSWER_NO: { target: "check_institutional_coop" },
        },
      },
      check_institutional_coop: {
        meta: {
          description: "Sem recurso e sem PD&I: é cooperação institucional sem preço?",
        },
        on: {
          ANSWER_YES: { target: "result_coop_agreement" }, // Acordo / Termo de Cooperação
          ANSWER_NO: { target: "check_confidentiality" },
        },
      },
      check_confidentiality: {
        meta: {
          description: "Apenas troca de informações confidenciais?",
        },
        on: {
          ANSWER_YES: { target: "result_nda" }, // NDA/Termo de Confidencialidade
          ANSWER_NO: { target: "check_tech_transfer" },
        },
      },
      check_tech_transfer: {
        meta: {
          description: "Há tecnologia pré-existente para licenciar/transferir?",
        },
        on: {
          ANSWER_YES: { target: "result_tech_transfer" }, // Licenciamento/Transferência de Tecnologia
          ANSWER_NO: { target: "result_review_scope" }, // Rever escopo/enquadramento
        },
      },
      // --- Final States (Outcomes) ---
      result_pdi_agreement: {
        type: "final",
        meta: {
          description: "Convênio de PD&I",
        },
      },
      result_service_contract: {
        type: "final",
        meta: {
          description: "Contrato de Serviços Técnicos",
        },
      },
      result_appdi_private: {
        type: "final",
        meta: {
          description: "APPDI com aporte privado",
        },
      },
      result_appdi_no_funding: {
        type: "final",
        meta: {
          description: "APPDI SEM aporte",
        },
      },
      result_coop_agreement: {
        type: "final",
        meta: {
          description: "Acordo / Termo de Cooperação",
        },
      },
      result_nda: {
        type: "final",
        meta: {
          description: "NDA/Termo de Confidencialidade",
        },
      },
      result_tech_transfer: {
        type: "final",
        meta: {
          description: "Licenciamento/Transferência de Tecnologia",
        },
      },
      result_review_scope: {
        type: "final",
        meta: {
          description: "Rever escopo/enquadramento",
        },
      },
    },
  })
}

// Keep the old exported instance for docs/other usages that expect a machine value
export const projectFlowMachine = createProjectFlowMachine()
