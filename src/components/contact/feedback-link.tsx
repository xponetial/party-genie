"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ContactContext,
  ContactIntent,
  buildContactFormHref,
  getFormCategoryFromIntent,
} from "@/lib/contact-email";

type FeedbackLinkProps = {
  intent: Extract<ContactIntent, "bug" | "feature">;
  context?: ContactContext;
  label: string;
  pageLabel?: string;
  className?: string;
};

export function FeedbackLink({
  intent,
  context,
  label,
  pageLabel,
  className,
}: FeedbackLinkProps) {
  const pathname = usePathname();
  const pageUrl =
    typeof window === "undefined" ? undefined : `${window.location.origin}${window.location.pathname}${window.location.search}`;

  return (
    <Link
      href={buildContactFormHref({
        category: getFormCategoryFromIntent(intent),
        context,
        intent,
        pageLabel,
        pagePath: pathname,
        pageUrl,
      })}
      className={className}
    >
      {label}
    </Link>
  );
}
