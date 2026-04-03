import { ReactNode } from "react";

export function AppBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.54)_0%,rgba(255,255,255,0.18)_100%)]" />
        <div className="absolute left-[-8rem] top-[-4rem] size-72 rounded-full bg-[rgba(244,133,229,0.22)] blur-3xl" />
        <div className="absolute right-[-5rem] top-16 size-80 rounded-full bg-[rgba(69,173,255,0.18)] blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 size-80 rounded-full bg-[rgba(255,199,71,0.16)] blur-3xl" />
        <div className="absolute bottom-16 right-[18%] size-64 rounded-full bg-[rgba(167,107,255,0.16)] blur-3xl" />
        <div className="absolute left-[14%] top-[26%] size-2 rounded-full bg-white/85 shadow-[0_0_18px_rgba(255,255,255,0.95)]" />
        <div className="absolute left-[18%] top-[18%] size-2 rounded-full bg-warning/80 shadow-[0_0_18px_rgba(255,191,71,0.9)]" />
        <div className="absolute right-[20%] top-[24%] size-2 rounded-full bg-accent/75 shadow-[0_0_18px_rgba(154,66,255,0.9)]" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
