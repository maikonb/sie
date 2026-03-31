"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Bell, Check, Trash2, ExternalLink, CheckCircle2, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { markAsRead, markAllAsRead, deleteNotification, getNotifications } from "@/actions/notifications"
import NotificationCard from "./notification-card"
import Link from "next/link"
import { toast } from "sonner"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  url: string | null
  read: boolean
  createdAt: Date
}

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Notification | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications()
      setNotifications(data as any)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      if (selected?.id === id) setSelected((s) => s ? { ...s, read: true } : s)
    } catch (error) {
      toast.error("Erro ao marcar como lida")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      toast.success("Todas as notificações marcadas como lidas")
    } catch (error) {
      toast.error("Erro ao marcar todas como lidas")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      if (selected?.id === id) setSelected(null)
      toast.success("Notificação removida")
    } catch (error) {
      toast.error("Erro ao remover notificação")
    }
  }

  const openNotification = async (n: Notification) => {
    // If the clicked notification is already selected, close the panel (toggle)
    if (selected?.id === n.id) {
      closePanel()
      return
    }

    setSelected(n)
    // open sheet only on small screens (sheet content is hidden on md+)
    const isSmall = typeof window !== "undefined" ? window.innerWidth < 768 : false
    setSheetOpen(isSmall)
    if (!n.read) {
      try {
        await markAsRead(n.id)
        setNotifications((prev) => prev.map((p) => (p.id === n.id ? { ...p, read: true } : p)))
        setSelected((s) => s ? { ...s, read: true } : s)
      } catch {
      }
    } 
  }

  const closePanel = () => {
    setSelected(null)
    setSheetOpen(false)
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse bg-muted/50 h-24 border-none" />
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <Card className="border-dashed bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">Nenhuma notificação</h3>
          <p className="text-sm text-muted-foreground/60 max-w-xs">Você está em dia! Novas notificações aparecerão aqui conforme o status dos seus projetos mudar.</p>
        </CardContent>
      </Card>
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-2">
            {notifications.length} Total
          </Badge>
          {unreadCount > 0 && (
            <Badge variant="default" className="px-2">
              {unreadCount} Não lidas
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs h-8">
            <Check className="h-3.5 w-3.5 mr-2" /> Marcar tudo como lido
          </Button>
        )}
      </div>

      <div className="flex">
        <div className="flex flex-col gap-y-3 w-full flex-1 md:w-1/2">
          {notifications.map((n, i) => (
            <NotificationCard
              key={`${n.id}-${i}`}
              notification={n}
              onClick={() => openNotification(n)}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {selected && (
          <div className="hidden md:block p-5 md:w-1/2">
            <div className="sticky top-24">
              <Card className="h-full">
                <CardContent className="flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold">{selected.title}</h3>
                      <p className="text-xs text-muted-foreground">{format(new Date(selected.createdAt), "dd MMM yyyy, HH:mm", { locale: ptBR })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!selected.read && (
                        <Button variant="ghost" size="icon" onClick={() => handleMarkAsRead(selected.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(selected.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={closePanel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 text-sm leading-relaxed flex-1">
                    <p>{selected.message}</p>
                  </div>

                  {selected.url && (
                    <div className="mt-4">
                      <Link href={selected.url} className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                        Ir para o item <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        <Sheet open={sheetOpen} onOpenChange={(v) => { setSheetOpen(v); if (!v) setSelected(null) }}>
          <SheetContent side="right" className="md:hidden">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>{selected?.title}</SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{selected ? format(new Date(selected.createdAt), "dd MMM yyyy, HH:mm", { locale: ptBR }) : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!selected?.read && (
                    <Button variant="ghost" size="icon" onClick={() => selected && handleMarkAsRead(selected.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  {selected && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(selected.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-4 text-sm leading-relaxed">
                <p>{selected?.message}</p>
              </div>

              {selected?.url && (
                <div className="mt-4">
                  <Link href={selected.url} className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Ir para o item <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
