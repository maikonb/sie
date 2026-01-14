import { EmailTemplate } from "../types"

export const projectReturnedTemplate: EmailTemplate = {
  subject: "Ajustes solicitados no projeto: {{projectTitle}}",
  html: `
  <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">
    <p>Olá,</p>
    <p>Seu projeto <b>{{projectTitle}}</b> foi revisado e <b>solicitamos ajustes</b> para prosseguir com a aprovação.</p>
    <p><b>Observações do Administrador:</b> {{reason}}</p>
    <p>
      Você pode realizar as alterações e reenviar o projeto através do link:
      <a href="{{projectUrl}}" style="color:#0B6BFF">Acessar projeto</a>
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
    <p style="font-size:12px;color:#888">SIE · Sistema Integrado de Extensão</p>
  </div>
  `,
}
