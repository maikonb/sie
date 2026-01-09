import { cn } from "@/lib/utils"

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageShell({ children, className, ...props }: PageShellProps) {
  return (
    <div className={cn("flex-1 space-y-8 p-8 pt-6", className)} {...props}>
      {children}
    </div>
  )
}

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageHeader({ children, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("md:sticky md:top-14 md:z-20 -mx-8 px-8 py-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 flex items-center justify-between space-y-2 transition-all", className)} {...props}>
      {children}
    </div>
  )
}

interface PageHeaderHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function PageHeaderHeading({ children, className, ...props }: PageHeaderHeadingProps) {
  return (
    <h2 className={cn("text-3xl font-bold tracking-tight", className)} {...props}>
      {children}
    </h2>
  )
}

interface PageHeaderDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function PageHeaderDescription({ children, className, ...props }: PageHeaderDescriptionProps) {
  return (
    <p className={cn("text-muted-foreground", className)} {...props}>
      {children}
    </p>
  )
}

interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageContent({ children, className, ...props }: PageContentProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {children}
    </div>
  )
}
