export type EmailTemplateKey = "OTP";

export interface EmailTemplateVars {
  OTP: {
    code: string;
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
}
