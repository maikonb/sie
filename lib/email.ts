import nodemailer from "nodemailer";
import { EmailTemplateKey, EmailTemplateVars } from "./emails/types";
import { otpTemplate } from "./emails/templates/otp";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT!),
  secure: false,
  auth: process.env.NODE_ENV !== "production" ? undefined : {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

const TEMPLATES = {
  OTP: otpTemplate,
};

function replaceVariables(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || "");
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? "no-reply@ufr.edu.br",
    to,
    subject,
    text,
    html,
  });
}

export async function sendByTemplate<K extends EmailTemplateKey>(
  key: K,
  vars: EmailTemplateVars[K],
  to: string
) {
  const template = TEMPLATES[key];
  
  const logoUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/sie.svg` 
    : "https://raw.githubusercontent.com/maikonb/sie/main/public/sie.svg";

  const globalVars = {
    logoUrl,
    year: new Date().getFullYear().toString(),
  };

  const allVars = { ...globalVars, ...vars } as Record<string, string>;

  const html = replaceVariables(template.html, allVars);
  const subject = replaceVariables(template.subject, allVars);

  // Simple text fallback (strips HTML tags)
  const text = html.replace(/<[^>]*>/g, "");

  await sendEmail({
    to,
    subject,
    text,
    html,
  });
}
