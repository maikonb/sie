# Infraestrutura e Arquitetura do SIE

Documentação completa da infraestrutura, estrutura de pastas e comandos essenciais do sistema SIE (Sistema de Informação Educacional).

---

## Stack Tecnológica

### Runtime & Framework
- **Node.js**: runtime principal
- **Next.js 16.0.1** (App Router): framework React fullstack
- **React 19.2.0**: biblioteca UI
- **TypeScript 5**: linguagem principal

### Banco de Dados & ORM
- **PostgreSQL 16**: banco de dados principal
- **Prisma 6.19.0**: ORM com schema-first approach
  - Client gerado em `prisma/client/`
  - Migrations em `prisma/migrations/`

### Autenticação & Autorização
- **NextAuth.js 4.24.13**: autenticação
- **bcryptjs**: hash de senhas
- Estratégia: email + código OTP (sem senha)
- Domínios permitidos configurados via `ALLOWED_EMAIL_DOMAINS`

### Storage & Arquivos
- **MinIO**: storage S3-compatible local/produção
- **AWS SDK S3 Client**: integração com MinIO
- Presigned URLs para upload direto do client

### Email
- **Nodemailer**: envio de emails
- **MailHog** (dev): captura e visualização de emails localmente

### Validação & Forms
- **Zod 4.1.12**: validação de schemas
- **React Hook Form 7.66.1**: gerenciamento de formulários

### UI & Design System
- **Tailwind CSS 4.1.17**: estilização utility-first
- **Radix UI**: componentes primitivos acessíveis
- **Lucide React**: ícones
- **Sonner**: toasts/notificações (encapsulado em `lib/notifications.tsx`)

### State Management & Fluxo
- **XState 5.24.0**: máquinas de estado (usado no wizard de classificação de instrumentos jurídicos)
- Server state gerenciado via server actions

### Outros
- **Axios**: HTTP client
- **date-fns**: manipulação de datas
- **react-easy-crop**: crop de imagens
- **uuid**: geração de IDs

---

## Infraestrutura Local (Docker Compose)

**Arquivo**: `infra/docker-compose.yml`

### Serviços Dev (profile: `dev`)

#### PostgreSQL
- **Imagem**: `postgres:16`
- **Container**: `sie-postgres`
- **Porta**: `2345` (host) → `5432` (container)
- **Credenciais**:
  - User: `postgres`
  - Pass: `postgres`
  - Database: `loja_cursos`
- **Volume persistente**: `sie_postgres_data`

#### MailHog (SMTP Fake)
- **Imagem**: `mailhog/mailhog`
- **Container**: `sie-mailhog`
- **Portas**:
  - `1025`: SMTP server
  - `8025`: Web UI (http://localhost:8025)

### Serviços Dev & Prod (profiles: `dev`, `prod`)

#### MinIO (S3-compatible storage)
- **Imagem**: `minio/minio`
- **Container**: `sie-minio`
- **Portas**:
  - `9000`: API S3
  - `9001`: Console Web UI (http://localhost:9001)
- **Credenciais**:
  - User: `minio`
  - Pass: `minio123`
- **CORS configurado** para `http://localhost:3000`
- **Volume persistente**: `sie_minio_data`
- **Inicialização**: script em `infra/minio/init/`

#### Create Bucket (init container)
- Cria bucket automaticamente via `minio/mc`
- Bucket padrão: `sie-localhost-bucket` (ou `AWS_BUCKET_NAME`)
- Policy: download público

---

## Variáveis de Ambiente

**Arquivo de template**: `.env.templ` (copie para `.env` local)

### Essenciais

```bash
# Ambiente
NODE_ENV=development

# Database (PostgreSQL local via Docker)
DATABASE_URL="postgresql://postgres:postgres@localhost:2345/loja_cursos?schema=public"

# NextAuth (gere um secret seguro para produção)
NEXTAUTH_SECRET=88dfebb898bc...

# SMTP (MailHog local ou SMTP real)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=

# MinIO / S3
AWS_BUCKET_NAME=sie-localhost-bucket
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=minio
AWS_SECRET_ACCESS_KEY=minio123
AWS_ENDPOINT=http://localhost:9000

# Email Whitelist (domínios permitidos, separados por vírgula)
ALLOWED_EMAIL_DOMAINS="ufr.edu.br"
```

---

## Comandos Essenciais

### Setup Inicial

```bash
# 1. Instalar dependências
npm install

# 2. Copiar template de env
cp .env.templ .env
# (edite .env conforme necessário)

# 3. Subir infraestrutura Docker (dev)
npm run docker:dev:up

# 4. Rodar migrations do Prisma
npm run prisma:dev:migrate

# 5. Popular banco com dados iniciais
npm run prisma:dev:seed

# 6. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

### Desenvolvimento

```bash
# Servidor de dev (hot reload)
npm run dev

# Lint
npm run lint

# Formatar código
npm run format

# Gerar Prisma Client (roda automaticamente no postinstall)
npm run prisma:generate

# Formatar schema do Prisma
npm run prisma:format
```

### Banco de Dados (Prisma)

```bash
# Criar migration (dev)
npm run prisma:dev:migrate

# Deploy migrations (prod)
npm run prisma:prod:migrate

# Popular banco (dev)
npm run prisma:dev:seed

# Popular banco (prod)
npm run prisma:prod:seed

# Prisma Studio (GUI para DB)
npx prisma studio
```

### Docker

```bash
# Subir serviços dev (PostgreSQL + MailHog + MinIO)
npm run docker:dev:up

# Subir serviços prod (apenas MinIO)
npm run docker:prod:up

# Parar todos os serviços
npm run docker:down

# Acessar container MinIO interativamente
npm run docker:it:minio
```

### Build & Deploy

```bash
# Build para produção (roda migrate, seed e build Next)
npm run build

# Iniciar servidor produção
npm run start
```

---

## Estrutura de Pastas

```
sie/
├── actions/                    # Server Actions (Next.js)
│   ├── legal-instruments/      # CRUD de instrumentos jurídicos
│   │   ├── index.ts            # Funções server-side
│   │   └── types.ts            # Tipos (Prisma payloads)
│   ├── permissions/            # Lógica de permissões
│   ├── projects/               # CRUD e aprovação de projetos
│   ├── storage/                # Upload S3/MinIO
│   ├── user/                   # CRUD de usuários
│   └── work-plan/              # Plano de trabalho
│
├── app/                        # App Router (Next.js 13+)
│   ├── globals.css             # Estilos globais
│   ├── layout.tsx              # Layout raiz
│   ├── page.tsx                # Página inicial
│   ├── admin/                  # Área administrativa
│   │   ├── layout.tsx
│   │   ├── legal-instruments/  # Gestão de instrumentos (admin)
│   │   └── projetos/           # Aprovação de projetos
│   ├── api/                    # Route handlers (API)
│   │   ├── auth/               # NextAuth endpoints
│   │   ├── files/              # Proxy para S3/MinIO
│   │   └── projects/           # APIs de projetos
│   ├── auth/                   # Páginas de autenticação
│   │   ├── login/
│   │   └── otp/
│   ├── conta/                  # Perfil do usuário
│   │   ├── feedback/
│   │   ├── notificacoes/
│   │   ├── primeiro-acesso/
│   │   └── suporte/
│   ├── dashboard/              # Dashboard
│   └── projetos/               # CRUD de projetos (usuário)
│       ├── [slug]/             # Detalhes de projeto
│       │   ├── legal-instrument/
│       │   └── work-plan/
│       └── novo/               # Criar projeto
│
├── components/                 # Componentes React
│   ├── ui/                     # Design system (shadcn/ui)
│   ├── admin/                  # Componentes admin
│   ├── forms/                  # Formulários reutilizáveis
│   │   ├── account/
│   │   ├── login/
│   │   └── project/
│   ├── layouts/                # Layouts compartilhados
│   ├── navs/                   # Navegação (main, secondary, projects)
│   ├── permissions/            # Guards de permissão
│   ├── projects/               # Componentes específicos de projetos
│   │   ├── classification-wizard.tsx  # Wizard XState
│   │   ├── legal-instrument-fill.tsx
│   │   └── edit-sheet.tsx
│   └── providers/              # Context providers
│       ├── index.tsx           # Root provider
│       ├── project.tsx         # Context de projeto
│       ├── sidebar.tsx
│       └── single-tab.tsx
│
├── hooks/                      # Custom hooks
│   ├── use-can.tsx             # Hook de permissões
│   ├── use-many-can.tsx
│   └── use-mobile.ts
│
├── lib/                        # Bibliotecas e utilitários
│   ├── api-client.ts           # Cliente Axios configurado
│   ├── api-utils.ts            # Utilitários de API
│   ├── errors.ts               # Catálogo de erros (APP_ERRORS)
│   ├── guards.ts               # Type guards
│   ├── notifications.tsx       # Sistema de notificações (notify)
│   ├── utils.ts                # Utilitários gerais (cn, etc)
│   ├── config/                 # Configurações (auth, etc)
│   ├── constrants/             # Constantes (typo: deveria ser constants/)
│   ├── emails/                 # Templates de email
│   ├── schemas/                # Schemas Zod
│   │   ├── work-plan.ts
│   │   └── ...
│   └── services/               # Serviços de negócio
│       ├── audit.ts            # Auditoria
│       ├── file.ts             # Upload/download de arquivos
│       ├── nav-items.ts        # Geração de navegação
│       └── ...
│
├── prisma/                     # Prisma ORM
│   ├── schema.prisma           # Schema do banco (source of truth)
│   ├── seed.ts                 # Script de seed principal
│   ├── client/                 # Cliente gerado (não commitar)
│   ├── migrations/             # Histórico de migrations
│   └── seeds/                  # Seeds modulares
│       ├── test-users.ts
│       └── ...
│
├── types/                      # Tipos TypeScript compartilhados
│   ├── legal-instrument.ts     # Tipos de domínio (independente de Prisma)
│   └── next-auth.d.ts          # Extensões de tipos NextAuth
│
├── public/                     # Assets estáticos
│   └── images/
│
├── infra/                      # Infraestrutura Docker
│   ├── docker-compose.yml
│   └── minio/
│       └── init/               # Scripts de init do MinIO
│
├── .env                        # Variáveis de ambiente (local, não commitar)
├── .env.templ                  # Template de .env
├── package.json                # Dependências e scripts npm
├── tsconfig.json               # Configuração TypeScript
├── next.config.ts              # Configuração Next.js
├── postcss.config.mjs          # PostCSS (Tailwind)
├── eslint.config.mjs           # ESLint
├── components.json             # Configuração shadcn/ui
└── prisma.config.ts            # Configuração Prisma
```

---

## Convenções de Código

### Server vs Client

- **Server-only**: `actions/`, `lib/services/`, Prisma imports
  - Devem incluir `import "server-only"` (quando aplicável)
- **Client-only**: componentes com `"use client"`
- **Compartilhado**: `types/`, `lib/schemas/`, utilitários puros

### Tipagem

- **Domínio**: `types/*.ts` (ex: `types/legal-instrument.ts`)
- **IO/DB**: `actions/*/types.ts` (Prisma validators)
- **Componentes**: tipos inline ou co-located

### Notificações

- **Sempre usar** `notify.*` de `lib/notifications.tsx`
- **Nunca** usar `toast` direto de `sonner`
- Códigos de erro em `lib/errors.ts` (APP_ERRORS)

### Actions (Server Actions)

- Sempre validar inputs no servidor (Zod)
- Retornar objetos estruturados: `{ success, data?, error? }`
- Tratar erros com `try/catch` e retornar mensagens amigáveis

### Banco de Dados (Prisma)

- **Sempre** use `Prisma.validator` para queries complexas (`actions/*/types.ts`)
- **Evite** N+1 queries (use `include`)
- **JSON fields**: use `Prisma.InputJsonValue` para escrita

---

## Fluxos Principais

### 1. Autenticação

1. Usuário entra com email (@ufr.edu.br)
2. Sistema gera código OTP e envia via email
3. Usuário insere código OTP
4. NextAuth cria sessão
5. Primeiro acesso: redirect para `/conta/primeiro-acesso`

### 2. Criação de Projeto

1. Usuário cria projeto (título, objetivos, justificativa, abrangência)
2. Status inicial: `DRAFT`
3. Wizard de classificação de instrumento jurídico (XState)
4. Preenchimento do plano de trabalho
5. Preenchimento do instrumento jurídico
6. Submissão para análise → status `PENDING_REVIEW`

### 3. Aprovação de Projeto (Admin)

1. Admin acessa `/admin/projetos`
2. Inicia análise → status `UNDER_REVIEW`
3. Revisa projeto, plano, instrumento
4. Aprova (`APPROVED`) ou Rejeita (`REJECTED`)
5. Auditoria registrada automaticamente

### 4. Upload de Arquivos

1. Client solicita presigned URL (`actions/storage`)
2. MinIO retorna URL temporária
3. Client faz PUT direto no MinIO
4. Client salva `fileKey` no banco (via action)

---

## Prisma Schema (Principais Modelos)

### User
- Autenticação via email + OTP (sem senha)
- Campos: `name`, `email`, `imageFile`, `color`
- Relações: `projects`, `audits`, `permissions`

### Project
- Status: `DRAFT` → `PENDING_REVIEW` → `UNDER_REVIEW` → `APPROVED`/`REJECTED`
- Relações: `user`, `workPlan`, `legalInstruments`, `audits`
- Approval tracking: `submittedAt`, `approvedAt`, `reviewStartedBy`, etc.

### WorkPlan
- Relação 1:1 com `Project`
- Campos: `generalObjective`, `specificObjectives` (JSON), `methodology`, etc.
- Relações: `schedule`, `team`, `participants`, `responsibilities`

### LegalInstrument (template)
- Nome, descrição, tipo (`LegalInstrumentType`)
- `fieldsJson`: array de campos do formulário (JSON)
- `file`: template DOC/PDF

### ProjectLegalInstrument
- Relação M:N entre `Project` e `LegalInstrument`
- `legalInstrumentInstance`: respostas preenchidas pelo usuário

### LegalInstrumentInstance
- Status: `PENDING`, `PARTIAL`, `FILLED`
- `answers`: JSON com respostas do formulário
- `fieldsJson`: cópia dos campos do template (snapshot)
- `answerFile`: documento gerado final

### ProjectAudit
- Log de ações: `SUBMITTED`, `APPROVED`, `REJECTED`, etc.
- `changeDetails`: JSON com informações extras (ex: motivo de rejeição)

---

## Troubleshooting

### Banco não conecta
```bash
# Verificar se containers estão rodando
docker ps

# Recriar infra se necessário
npm run docker:down
npm run docker:dev:up
```

### Migrations quebradas
```bash
# Resetar banco (CUIDADO: apaga dados)
npx prisma migrate reset

# Recriar migrations
npm run prisma:dev:migrate
```

### MinIO não cria bucket
```bash
# Acessar console MinIO
open http://localhost:9001
# Login: minio / minio123

# Criar bucket manualmente ou verificar logs
docker logs sie-create-bucket
```

### Emails não chegam (dev)
```bash
# Acessar MailHog
open http://localhost:8025

# Verificar se container está rodando
docker ps | grep mailhog
```

### TypeScript errors após git pull
```bash
# Regerar Prisma Client
npm run prisma:generate

# Limpar cache Next
rm -rf .next
npm run dev
```

---

## Próximos Passos (Melhorias Sugeridas)

### Urgentes
1. **Separar `lib/` em server vs shared** (evitar bundle acidental)
2. **Adicionar `import "server-only"` em actions e serviços**
3. **Padronizar retornos de actions** (`ActionResult<T>`)
4. **Consolidar `getErrorMessage` em util único**
5. **Corrigir typo** `lib/constrants/` → `lib/constants/`

### Médio Prazo
1. Migrar para feature folders (`features/<feature>/`)
2. Setup CI/CD (GitHub Actions)
3. Testes E2E (Playwright já instalado)
4. Observabilidade (logs estruturados, monitoring)
5. Rate limiting (auth endpoints)

### Longo Prazo
1. Multi-tenancy (se aplicável)
2. Internacionalização (i18n)
3. PWA/offline support
4. Analytics e métricas de uso

---

## Contatos & Recursos

- **Repositório**: sie (owner: maikonb)
- **Branch principal**: `main`
- **Branch de trabalho**: `admin_flow`
- **Documentação adicional**: `RECOMENDACOES.md`

---

**Última atualização**: 2025-12-24

### Mudanças recentes (UI)

- **Página 404 personalizada**: `app/not-found.tsx` — página amigável (sem imagem) que redireciona para `/auth/login` quando o usuário não está autenticado e para `/projetos` quando está autenticado.
- **Componente de overlay de carregamento**: `components/ui/loading-overlay.tsx` — overlay reutilizável para indicar operações de longa duração no client.

**Última atualização**: 2025-12-29
