"use client";

import { LifeBuoy } from "lucide-react";
import { ContactContext, buildMailtoHref } from "@/lib/contact-email";

export function SupportFab({ context = "support" }: { context?: ContactContext }) {
  return (
    <a
      href={buildMailtoHref("support", { context })}
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-medium text-white shadow-[0_16px_30px_rgba(17,24,39,0.24)] transition hover:bg-brand sm:bottom-6 sm:right-6"
      aria-label="Contact Party Swami support"
    >
      <LifeBuoy className="size-4" />
      Support
    </a>
  );
}
