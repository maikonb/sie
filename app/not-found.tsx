"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogIn, Folder, ArrowLeft } from "lucide-react"
import Image from "next/image"

export default function NotFoundPage() {
  const { status } = useSession()
  const router = useRouter()

  const handlePrimary = () => {
    if (status === "authenticated") router.push("/projetos")
    else router.push("/auth/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full mx-auto text-center space-y-6">
        <div className="flex justify-center gap-10 items-center">
          <div className="h-20 w-20">
            <Image src="/images/logo.svg" alt="Logo" width={80} height={80} priority />
          </div>
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-3xl tracking-tighter">404</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground">Página não encontrada</h1>
          <p className="text-muted-foreground text-base md:text-lg">Desculpe, não conseguimos encontrar a página que você está procurando. Ela pode ter sido movida ou não existir mais.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Button onClick={handlePrimary} size="lg" className="gap-2 text-base font-medium">
            {status === "authenticated" ? <Folder className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
            {status === "authenticated" ? "Ir para Projetos" : "Acessar Sistema"}
          </Button>

          <Button variant="outline" size="lg" onClick={() => router.push("/")} className="gap-2 text-base">
            <ArrowLeft className="h-5 w-5" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  )
}
