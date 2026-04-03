import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-white/75 bg-[linear-gradient(140deg,rgba(255,246,255,0.96)_0%,rgba(248,233,255,0.92)_32%,rgba(239,245,255,0.92)_72%,rgba(255,250,244,0.94)_100%)] p-6 shadow-party backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
