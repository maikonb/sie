# 📦 Ambiente Docker – MailHog (Desenvolvimento)

Este diretório contém a configuração necessária para executar o **MailHog** localmente, permitindo testar o envio de e-mails **sem depender de um servidor SMTP externo** durante o desenvolvimento da aplicação.

---

## 🚀 O que é o MailHog?

O MailHog é um servidor SMTP de desenvolvimento que:

- recebe os e-mails enviados pela aplicação,
- não envia nada para a internet,
- disponibiliza uma interface web para visualizar todas as mensagens.

Ideal para testes de envio de e-mail durante o desenvolvimento.

---

## ▶️ Como iniciar

Estando dentro da pasta `infra/`, execute:

```bash
docker compose up -d
```

Isso irá iniciar o MailHog em segundo plano.

---

## 🌐 Acessos

- **Servidor SMTP (usado pela aplicação):**  
  `localhost:1025`

- **Interface Web para visualizar os e-mails:**  
  http://localhost:8025

---

## ⚙️ Exemplo de configuração no `.env.local`

```env
SMTP_HOST=localhost
SMTP_PORT=1025
```

A partir disso, qualquer e-mail enviado pela aplicação será capturado pelo MailHog.

---

## 🧪 Testando com Next.js / Nodemailer (exemplo)

```ts
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
});
```

---

## 🧹 Parar os serviços

```bash
docker compose down
```


## 📝 Observação

O MailHog é utilizado **apenas para desenvolvimento**.  
Em produção, substitua por um provedor SMTP real (Amazon SES, Mailgun, SendGrid, etc.).