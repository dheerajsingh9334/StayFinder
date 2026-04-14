import * as React from "react"
import { useTheme } from "next-themes"
import { twMerge } from "tailwind-merge"
import { clsx, type ClassValue } from "clsx"
import { Loader2 } from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface FeyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  isLoading?: boolean
}

export function FeyButton({
  className,
  children,
  isLoading,
  ...props
}: FeyButtonProps) {
  const { resolvedTheme } = useTheme()
  // Since the app heavily uses dark mode natively, default to true if resolvedTheme isn't populated
  const isDark = resolvedTheme === 'dark' || resolvedTheme === undefined || true

  return (
    <button
      className={cn(
        "group relative flex items-center justify-center gap-2",
        "h-10 min-w-[136px] whitespace-nowrap rounded-[28px] px-4 py-2",
        "text-sm font-semibold leading-tight",
        "text-white", 
        // Base gradient
        isDark
          ? "bg-[radial-gradient(61.35%_50.07%_at_48.58%_50%,rgb(0,0,0)_0%,rgba(255,255,255,0.08)_100%)]"
          : "bg-[radial-gradient(61.35%_50.07%_at_48.58%_50%,rgb(255,255,255)_0%,rgba(0,0,0,0.02)_100%)]",
        // Shadows
        isDark
          ? "[box-shadow:inset_0_0_0_0.5px_rgba(134,143,151,0.2),inset_1px_1px_0_-0.5px_rgba(134,143,151,0.4),inset_-1px_-1px_0_-0.5px_rgba(134,143,151,0.4)]"
          : "[box-shadow:inset_0_0_0_0.5px_hsl(var(--border)),inset_1px_1px_0_-0.5px_hsl(var(--border)),inset_-1px_-1px_0_-0.5px_hsl(var(--border))]",
        "after:absolute after:inset-0 after:rounded-[28px] after:opacity-0 after:transition-opacity after:duration-200",
        isDark
          ? "after:bg-[radial-gradient(61.35%_50.07%_at_48.58%_50%,rgb(0,0,0)_0%,rgb(32,32,32)_100%)]"
          : "after:bg-[radial-gradient(61.35%_50.07%_at_48.58%_50%,rgb(255,255,255)_0%,rgb(242,242,242)_100%)]",
        isDark
          ? "after:[box-shadow:inset_0_0_0_0.5px_rgba(134,143,151,0.3),inset_1px_1px_0_-0.5px_rgba(134,143,151,0.5),inset_-1px_-1px_0_-0.5px_rgba(134,143,151,0.5),0_0_8px_rgba(255,255,255,0.1)]"
          : "after:[box-shadow:inset_0_0_0_0.5px_hsl(var(--border)),inset_1px_1px_0_-0.5px_hsl(var(--border)),inset_-1px_-1px_0_-0.5px_hsl(var(--border)),0_0_3px_hsl(var(--ring))]",
        "hover:after:opacity-100",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {isLoading && <Loader2 size={16} className="animate-spin text-white/70" />}
        {children}
      </span>
    </button>
  )
}
