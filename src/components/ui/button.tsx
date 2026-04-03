import { ButtonHTMLAttributes, ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "lg";
  children: ReactNode;
};

export function Button({
  asChild = false,
  className,
  variant = "primary",
  size = "default",
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium shadow-[0_14px_30px_rgba(101,85,176,0.12)] transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-[linear-gradient(135deg,#ff7bd5_0%,#a54dff_36%,#2f8fff_100%)] px-5 py-3 text-white hover:brightness-105",
        variant === "secondary" &&
          "border border-white/80 bg-[linear-gradient(135deg,rgba(255,247,255,0.92)_0%,rgba(240,232,255,0.92)_45%,rgba(236,245,255,0.92)_100%)] px-5 py-3 text-ink hover:border-brand/35 hover:bg-white",
        variant === "ghost" &&
          "px-4 py-2 text-ink-muted hover:bg-[rgba(255,255,255,0.64)] hover:text-ink",
        size === "lg" && "px-6 py-3.5 text-base",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
