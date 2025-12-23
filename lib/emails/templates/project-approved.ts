import { EmailTemplate } from "../types"

export const projectApprovedTemplate: EmailTemplate = {
  subject: "Projeto aprovado: {{projectTitle}}",
  html: `
  <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">
    <p>Olá,</p>
    <p>Seu projeto <b>{{projectTitle}}</b> foi <b>aprovado</b> por <b>{{approverName}}</b>.</p>
    <p>
      Veja os detalhes do projeto:
      <a href="{{projectUrl}}" style="color:#0B6BFF">Abrir projeto</a>
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
    <p style="font-size:12px;color:#888">SIE · Sistema Integrado de Extensão</p>
  </div>
  `,
}
