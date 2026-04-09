import Link from "next/link";
import { ContactEmailKey, ContactContext, buildMailtoHref, getContactEmail } from "@/lib/contact-email";

type ContactLinkProps = {
  emailKey: ContactEmailKey;
  context?: ContactContext;
  label?: string;
  className?: string;
};

export function ContactLink({ emailKey, context, label, className }: ContactLinkProps) {
  return (
    <Link
      href={buildMailtoHref(emailKey, context ? { context } : undefined)}
      className={className}
    >
      {label ?? getContactEmail(emailKey)}
    </Link>
  );
}
