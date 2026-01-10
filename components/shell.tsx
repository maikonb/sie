"use client"

import * as React from "react"
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
    <div
      className={cn(
        "page-header md:sticky md:top-14 md:z-20 -mx-8 px-8 py-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 flex items-center justify-between space-y-2 transition-all",
        // When merged, we remove the background and blur on desktop to avoid "double blur"
        "in-[.is-merged]:md:bg-transparent in-[.is-merged]:md:backdrop-blur-none in-[.is-merged]:md:border-b-transparent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface PageSecondaryHeaderPropos extends React.HTMLAttributes<HTMLDivElement> {}

export function PageSecondaryHeader({ children, className, ...props }: PageSecondaryHeaderPropos) {
  const [headerHeight, setHeaderHeight] = React.useState(0)
  const [isStuck, setIsStuck] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const header = document.querySelector(".page-header") as HTMLElement
    if (!header) return

    // Signal that we are merging to the PageHeader
    header.classList.add("is-merged")

    // Set initial height
    setHeaderHeight(header.getBoundingClientRect().height)

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeaderHeight(entry.target.getBoundingClientRect().height)
      }
    })

    resizeObserver.observe(header)

    // Sticky detection
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(entry.intersectionRatio < 1)
      },
      {
        threshold: [1],
        rootMargin: `-${56 + (window.innerWidth >= 768 ? headerHeight : 0) + 1}px 0px 0px 0px`,
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      header.classList.remove("is-merged")
      resizeObserver.disconnect()
      observer.disconnect()
    }
  }, [headerHeight])

  React.useEffect(() => {
    const header = document.querySelector(".page-header") as HTMLElement
    if (!header) return

    if (isStuck) {
      header.style.borderBottomColor = "transparent"
    } else {
      header.style.borderBottomColor = ""
    }
  }, [isStuck])

  return (
    <div ref={ref} className={cn("sticky top-14 -mx-8 px-8 pt-3 md:pt-0 pb-3 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 transition-colors md:top-[calc(3.5rem+var(--header-height,0px))] z-10", !isStuck ? "border-b-transparent" : "border-b-border", className)} style={{ "--header-height": `${headerHeight}px` } as React.CSSProperties} {...props}>
      {/* Background Shim: This "stretches" the blur upwards on desktop to cover the PageHeader area */}
      <div className="absolute inset-x-0 bottom-full hidden bg-inherit backdrop-blur-inherit supports-backdrop-filter:bg-inherit md:block" style={{ height: `${headerHeight}px` }} />

      {/* Content wrapper to stay above shim */}
      <div className="relative z-10">{children}</div>
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
