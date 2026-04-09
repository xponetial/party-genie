import { APP_NAME } from "@/lib/constants";
import { ContactLink } from "@/components/contact/contact-link";

export function SiteFooter({ className = "" }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`rounded-[1.5rem] border border-white/70 bg-white/45 px-5 py-4 text-sm text-ink-muted backdrop-blur ${className}`.trim()}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p>&copy; {year} {APP_NAME}. All rights reserved.</p>
          <p>AI-powered party planning, invitations, guests, shopping, and task flow.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <ContactLink emailKey="hello" context="marketing" className="transition hover:text-ink" />
          <ContactLink emailKey="support" context="support" className="transition hover:text-ink" />
          <ContactLink emailKey="sales" context="pricing" className="transition hover:text-ink" />
        </div>
      </div>
    </footer>
  );
}
