import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  children: ReactNode;
  className?: string;
  variant?: "default" | "success";
};

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.18em]",
        variant === "default" &&
          "bg-[linear-gradient(135deg,rgba(255,244,255,0.92)_0%,rgba(243,234,255,0.92)_56%,rgba(236,246,255,0.9)_100%)] text-ink-muted",
        variant === "success" && "bg-[linear-gradient(135deg,rgba(255,230,255,0.95)_0%,rgba(238,225,255,0.95)_100%)] text-accent",
        className,
      )}
    >
      {children}
    </span>
  );
}
