"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Bell, Check, Trash2, ExternalLink, Archive, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { markAsRead, markAllAsRead, deleteNotification, getNotifications } from "@/actions/notifications"
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

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
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
      toast.success("Notificação removida")
    } catch (error) {
      toast.error("Erro ao remover notificação")
    }
  }

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

      <div className="grid gap-3">
        {notifications.map((n) => (
          <Card key={n.id} className={cn("group transition-all duration-200 border-none shadow-sm relative overflow-hidden", !n.read ? "bg-primary/5 ring-1 ring-primary/10" : "bg-card hover:bg-muted/30")}>
            {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <div className={cn("mt-1 p-2 rounded-lg bg-background border shadow-xs transition-colors", n.type === "PROJECT_STATUS" && !n.read ? "text-primary border-primary/20" : "text-muted-foreground")}>{n.type === "PROJECT_STATUS" ? <CheckCircle2 className="h-5 w-5" /> : <Info className="h-5 w-5" />}</div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={cn("text-sm font-bold truncate", !n.read ? "text-foreground" : "text-muted-foreground")}>{n.title}</h4>
                    <span className="text-[10px] text-muted-foreground font-medium shrink-0">{format(new Date(n.createdAt), "dd MMM, HH:mm", { locale: ptBR })}</span>
                  </div>

                  <p className={cn("text-sm leading-relaxed line-clamp-2", !n.read ? "text-muted-foreground" : "text-muted-foreground/60")}>{n.message}</p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {n.url && (
                        <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-[11px] font-bold uppercase tracking-wider hover:bg-primary/10 hover:text-primary">
                          <Link href={n.url}>
                            Ver Detalhes <ExternalLink className="h-3 w-3 ml-2" />
                          </Link>
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.read && (
                        <Button variant="ghost" size="icon" onClick={() => handleMarkAsRead(n.id)} className="h-7 w-7 text-muted-foreground hover:text-primary">
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(n.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
