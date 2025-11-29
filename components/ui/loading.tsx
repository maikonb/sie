import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string
}

export function Loading({ className, text, ...props }: LoadingProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)} {...props}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}
