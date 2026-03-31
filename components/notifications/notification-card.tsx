"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Check, Trash2, ExternalLink, CheckCircle2, Info } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Notification {
	id: string
	title: string
	message: string
	type: string
	url: string | null
	read: boolean
	createdAt: Date
}

export default function NotificationCard({
	notification,
	onClick,
	onMarkAsRead,
	onDelete,
}: {
	notification: Notification
	onClick: () => void
	onMarkAsRead: (id: string) => void
	onDelete: (id: string) => void
}) {
	const n = notification

	return (
		<Card
			onClick={onClick}
			className={cn(
				"group transition-all p-1 duration-200 border-none shadow-sm relative overflow-hidden cursor-pointer",
				!n.read ? "bg-primary/5 ring-1 ring-primary/10" : "bg-card hover:bg-muted/30",
			)}
		>
			{!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
			<CardContent className="p-4 sm:p-5">
				<div className="flex items-start gap-4">
					<div
						className={cn(
							"mt-1 p-2 rounded-lg bg-background border shadow-xs transition-colors",
							n.type === "PROJECT_STATUS" && !n.read ? "text-primary border-primary/20" : "text-muted-foreground",
						)}
					>
						{n.type === "PROJECT_STATUS" ? <CheckCircle2 className="h-5 w-5" /> : <Info className="h-5 w-5" />}
					</div>

					<div className="flex-1 space-y-1 min-w-0">
						<div className="flex items-center justify-between gap-2">
							<h4 className={cn("text-sm font-bold truncate", !n.read ? "text-foreground" : "text-muted-foreground")}>{n.title}</h4>
							<span className="text-[10px] text-muted-foreground font-medium shrink-0">
								{format(new Date(n.createdAt), "dd MMM, HH:mm", { locale: ptBR })}
							</span>
						</div>

						<p className={cn("text-sm truncate", !n.read ? "text-muted-foreground" : "text-muted-foreground/60")}>{n.message}</p>

						<div className="flex items-center justify-between pt-2">
							<div className="flex items-center gap-2">
								{n.url && (
									<Button variant="ghost" size="sm" asChild className="h-7 px-2 text-[11px] font-bold uppercase tracking-wider hover:bg-primary/10 hover:text-primary" onClick={(e: any) => e.stopPropagation()}>
										<Link href={n.url}>
											Ver Detalhes <ExternalLink className="h-3 w-3 ml-2" />
										</Link>
									</Button>
								)}
							</div>

							<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
								{!n.read && (
									<Button variant="ghost" size="icon" onClick={(e: any) => { e.stopPropagation(); onMarkAsRead(n.id) }} className="h-7 w-7 text-muted-foreground hover:text-primary">
										<Check className="h-4 w-4" />
									</Button>
								)}
								<Button variant="ghost" size="icon" onClick={(e: any) => { e.stopPropagation(); onDelete(n.id) }} className="h-7 w-7 text-muted-foreground hover:text-destructive">
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
