export type EmailTemplateKey = "OTP" | "PROJECT_SUBMITTED" | "PROJECT_APPROVED" | "PROJECT_REJECTED" | "PROJECT_RETURNED"

export interface EmailTemplateVars {
  OTP: {
    code: string
  }
  PROJECT_SUBMITTED: {
    projectTitle: string
    submitterName: string
    reviewUrl: string
  }
  PROJECT_APPROVED: {
    projectTitle: string
    approverName: string
    projectUrl: string
    opinion?: string
  }
  PROJECT_REJECTED: {
    projectTitle: string
    approverName: string
    reason: string
    projectUrl: string
  }
  PROJECT_RETURNED: {
    projectTitle: string
    approverName: string
    reason: string
    projectUrl: string
  }
}

export interface EmailTemplate {
  subject: string
  html: string
}
