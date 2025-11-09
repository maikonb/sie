-- CreateEnum
CREATE TYPE "SituacaoCronograma" AS ENUM ('PLANEJADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'ATRASADO', 'SUSPENSO');

-- CreateEnum
CREATE TYPE "EsferaAdministrativa" AS ENUM ('FEDERAL', 'ESTADUAL', 'MUNICIPAL', 'PRIVADO', 'OUTRO');

-- CreateEnum
CREATE TYPE "SetorAprovacao" AS ENUM ('TECNICO', 'JURIDICO', 'OUTRO');

-- CreateTable
CREATE TABLE "Proponente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "instituicao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proponente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "objetivos" TEXT NOT NULL,
    "justificativa" TEXT NOT NULL,
    "abrangencia" TEXT NOT NULL,
    "proponenteId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Projeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanoTrabalho" (
    "id" SERIAL NOT NULL,
    "projetoId" INTEGER NOT NULL,
    "objeto" TEXT,
    "diagnostico" TEXT,
    "abrangenciaPlano" TEXT,
    "justificativaPlano" TEXT,
    "objetivoGeral" TEXT NOT NULL,
    "objetivosEspecificos" JSONB,
    "metodologia" TEXT,
    "unidadeResponsavel" TEXT,
    "gestorICT" TEXT,
    "gestorParceiro" TEXT,
    "acompanhamento" TEXT,
    "resultadosEsperados" TEXT,
    "vigenciaInicio" TIMESTAMP(3),
    "vigenciaFim" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanoTrabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CronogramaItem" (
    "id" SERIAL NOT NULL,
    "planoTrabalhoId" INTEGER NOT NULL,
    "eixoMeta" TEXT NOT NULL,
    "acaoEtapa" TEXT NOT NULL,
    "indicador" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "termino" TIMESTAMP(3) NOT NULL,
    "situacao" "SituacaoCronograma" NOT NULL DEFAULT 'PLANEJADO',

    CONSTRAINT "CronogramaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipeItem" (
    "id" SERIAL NOT NULL,
    "planoTrabalhoId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "titulacaoArea" TEXT,
    "instituicao" TEXT,
    "funcao" TEXT,
    "cargaHorariaSemanal" INTEGER,

    CONSTRAINT "EquipeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participante" (
    "id" SERIAL NOT NULL,
    "planoTrabalhoId" INTEGER NOT NULL,
    "orgaoEntidade" TEXT NOT NULL,
    "cnpj" TEXT,
    "esfera" "EsferaAdministrativa",
    "endereco" TEXT,
    "autoridadeNome" TEXT,
    "autoridadeCargo" TEXT,
    "autoridadeDoc" TEXT,
    "contato" TEXT,

    CONSTRAINT "Participante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Responsabilidade" (
    "id" SERIAL NOT NULL,
    "planoTrabalhoId" INTEGER NOT NULL,
    "participanteId" INTEGER,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "Responsabilidade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proponente_email_key" ON "Proponente"("email");

-- CreateIndex
CREATE INDEX "Projeto_proponenteId_idx" ON "Projeto"("proponenteId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanoTrabalho_projetoId_key" ON "PlanoTrabalho"("projetoId");

-- CreateIndex
CREATE INDEX "CronogramaItem_planoTrabalhoId_idx" ON "CronogramaItem"("planoTrabalhoId");

-- CreateIndex
CREATE INDEX "EquipeItem_planoTrabalhoId_idx" ON "EquipeItem"("planoTrabalhoId");

-- CreateIndex
CREATE INDEX "Participante_planoTrabalhoId_idx" ON "Participante"("planoTrabalhoId");

-- CreateIndex
CREATE INDEX "Responsabilidade_planoTrabalhoId_idx" ON "Responsabilidade"("planoTrabalhoId");

-- CreateIndex
CREATE INDEX "Responsabilidade_participanteId_idx" ON "Responsabilidade"("participanteId");

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_proponenteId_fkey" FOREIGN KEY ("proponenteId") REFERENCES "Proponente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanoTrabalho" ADD CONSTRAINT "PlanoTrabalho_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CronogramaItem" ADD CONSTRAINT "CronogramaItem_planoTrabalhoId_fkey" FOREIGN KEY ("planoTrabalhoId") REFERENCES "PlanoTrabalho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipeItem" ADD CONSTRAINT "EquipeItem_planoTrabalhoId_fkey" FOREIGN KEY ("planoTrabalhoId") REFERENCES "PlanoTrabalho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participante" ADD CONSTRAINT "Participante_planoTrabalhoId_fkey" FOREIGN KEY ("planoTrabalhoId") REFERENCES "PlanoTrabalho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Responsabilidade" ADD CONSTRAINT "Responsabilidade_planoTrabalhoId_fkey" FOREIGN KEY ("planoTrabalhoId") REFERENCES "PlanoTrabalho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Responsabilidade" ADD CONSTRAINT "Responsabilidade_participanteId_fkey" FOREIGN KEY ("participanteId") REFERENCES "Participante"("id") ON DELETE SET NULL ON UPDATE CASCADE;
