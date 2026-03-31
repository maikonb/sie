"use client"

import { useSingleTab } from "./providers/single-tab"
import { Button } from "./ui/button"
import { Logo } from "./logo"

export function SingleTabGuard({ children }: { children: React.ReactNode }) {
  const { isBlocked, takeOver } = useSingleTab()

  if (isBlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <div className="flex max-w-md w-full flex-col items-center justify-center space-y-8 rounded-xl border bg-card p-10 text-center shadow-2xl">
          <div className="transform transition-all hover:scale-105">
            <Logo className="h-16 w-auto" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Sessão Ativa em Outra Aba</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">O SIE já está aberto em outra janela ou aba deste navegador. Para garantir a segurança e integridade dos dados, permitimos apenas uma aba ativa por vez.</p>
          </div>
          <div className="w-full pt-2">
            <Button onClick={takeOver} size="lg" className="w-full font-semibold shadow-md transition-all hover:shadow-lg">
              Usar Aqui
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">Ao clicar em &quot;Usar Aqui&quot;, a outra aba será desconectada.</p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
