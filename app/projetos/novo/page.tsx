import Link from "next/link"
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db"; // seu singleton (ex.: lib/db.ts)

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Server Action: cria o Projeto e redireciona
async function createProjeto(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    // usuário não autenticado
    redirect("/auth/login");
  }

  const titulo = String(formData.get("titulo") || "").trim();
  const objetivos = String(formData.get("objetivos") || "").trim();
  const justificativa = String(formData.get("justificativa") || "").trim();
  const abrangencia = String(formData.get("abrangencia") || "").trim();

  // validações mínimas
  if (!titulo || !objetivos || !justificativa || !abrangencia) {
    // em produção, troque por um padrão com mensagens amigáveis (ex.: retorno via cookies/headers)
    throw new Error("Preencha todos os campos obrigatórios.");
  }

  // encontra o Proponente pelo e-mail (único)
  const proponente = await prisma.proponent.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!proponente) {
    // Se for o 1º login e ainda não existe Proponente, garanta o upsert no fluxo de auth
    throw new Error("Proponente não encontrado para este usuário.");
  }

  await prisma.project.create({
    data: {
      title: titulo,
      objectives: objetivos,
      justification: justificativa,
      scope: abrangencia,
      proponent: { connect: { id: proponente.id } },
    },
  });

  redirect("/projetos/");
}

export default async function NovaPaginaProjeto() {
  // opcional: checar sessão aqui para proteger a página
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="p-4 bg-muted/50 aspect-video rounded-xl">

    <div className="mx-auto w-full max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo Projeto</CardTitle>
          <CardDescription>Preencha os dados do seu projeto (Plano de Trabalho ficará para depois).</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createProjeto} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                name="titulo"
                placeholder="Ex.: Plataforma de Inovação SIE/UFR"
                required
                maxLength={200}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="objetivos">Objetivos</Label>
              <Textarea
                id="objetivos"
                name="objetivos"
                placeholder="Descreva os objetivos do projeto..."
                required
                rows={6}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="justificativa">Justificativa</Label>
              <Textarea
                id="justificativa"
                name="justificativa"
                placeholder="Explique a relevância pública/acadêmica, demanda atendida, etc."
                required
                rows={6}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="abrangencia">Abrangência</Label>
              <Textarea
                id="abrangencia"
                name="abrangencia"
                placeholder="Defina localidades, público-alvo e alcance..."
                required
                rows={5}
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" asChild>
                <Link href="/projetos/">Cancelar</Link>
              </Button>
              <Button type="submit">Salvar projeto</Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
