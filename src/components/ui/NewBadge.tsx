"use client"

import React from "react"
import { Sparkles, Gift, Star } from "lucide-react"
import clsx from "clsx"

interface NewBadgeProps {
  label?: string
  icon?: "sparkles" | "gift" | "star" | "none"
  className?: string
}

const NewBadge: React.FC<NewBadgeProps> = ({
  label = "New",
  icon = "sparkles",
  className,
}) => {
  const Icon =
    icon === "gift"
      ? Gift
      : icon === "star"
      ? Star
      : icon === "none"
      ? null
      : Sparkles

  return (
    <span
      className={clsx(
        // layout
        "ml-1 inline-flex items-center gap-1 align-top",
        // size & typography
        "px-1.5 py-0.5 text-[10px] leading-none font-medium",
        // visual style: subtle gradient, soft ring, small shadow
        "rounded-full ring-1 ring-primary/20 shadow-sm",
        "bg-gradient-to-r from-primary/15 to-primary/5 text-primary/85",
        // interaction: gentle hover pulse (respects reduced motion)
        "transition-transform duration-200 motion-safe:group-hover:animate-soft-pulse",
        className
      )}
      aria-label={`${label} feature`}
    >
      {Icon ? <Icon className="h-3 w-3 opacity-90" aria-hidden="true" /> : null}
      {label}
      <span className="sr-only">New feature</span>
    </span>
  )
}

export default NewBadge