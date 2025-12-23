import { EmailTemplate } from "../types"

export const projectSubmittedTemplate: EmailTemplate = {
  subject: "Novo projeto para análise: {{projectTitle}}",
  html: `
  <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">
    <p>Olá,</p>
    <p>Um novo projeto foi <b>enviado para análise</b> por <b>{{submitterName}}</b>.</p>
    <p><b>Título:</b> {{projectTitle}}</p>
    <p>
      Você pode revisar o projeto clicando no link abaixo:<br/>
      <a href="{{reviewUrl}}" style="color:#0B6BFF">Revisar projeto</a>
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
    <p style="font-size:12px;color:#888">SIE · Sistema Integrado de Extensão</p>
  </div>
  `,
}
