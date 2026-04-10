import { ShellFrame } from "@/components/layout/shell-frame";
import { ContactCard } from "@/components/contact/contact-card";
import { ContactForm } from "@/components/contact/contact-form";
import { CONTACT_FORM_CATEGORY_OPTIONS } from "@/lib/contact-form";
import { ContactContext, ContactFormCategory } from "@/lib/contact-email";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const CONTACT_CONTEXTS: ContactContext[] = [
  "marketing",
  "pricing",
  "support",
  "dashboard",
  "invites",
  "ai",
  "admin",
];

function isContactContext(value?: string): value is ContactContext {
  return !!value && CONTACT_CONTEXTS.includes(value as ContactContext);
}

function isContactFormCategory(value?: string): value is ContactFormCategory {
  return !!value && CONTACT_FORM_CATEGORY_OPTIONS.some((option) => option.value === value);
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    context?: string;
    pageLabel?: string;
    pagePath?: string;
    pageUrl?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle<{ full_name: string | null }>()
    : { data: null };

  return (
    <ShellFrame
      eyebrow="Contact"
      title="Reach the right Party Swami inbox fast."
      description="Use the contact path that best matches what you need so questions, support requests, business conversations, bug reports, and feature requests land in the right place."
    >
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <ContactForm
          initialName={profile?.full_name ?? user?.email ?? ""}
          initialEmail={user?.email ?? ""}
          initialCategory={isContactFormCategory(resolvedSearchParams.category) ? resolvedSearchParams.category : "general"}
          initialContext={isContactContext(resolvedSearchParams.context) ? resolvedSearchParams.context : undefined}
          initialPageLabel={resolvedSearchParams.pageLabel}
          initialPagePath={resolvedSearchParams.pagePath}
          initialPageUrl={resolvedSearchParams.pageUrl}
        />

        <section className="grid content-start gap-4">
          <ContactCard
            title="General"
            description="Use this for broad questions about Party Swami, founder contact, or general product interest."
            emailKey="hello"
            context="marketing"
          />
          <ContactCard
            title="Support"
            description="Use this for account help, RSVP issues, invite troubleshooting, or direct product support."
            emailKey="support"
            context="support"
          />
          <ContactCard
            title="Info"
            description="Use this when a neutral informational contact address reads better than a general hello inbox."
            emailKey="info"
            context="marketing"
          />
          <ContactCard
            title="Sales"
            description="Use this for pricing, partnerships, sponsorships, concierge interest, or business conversations."
            emailKey="sales"
            context="pricing"
          />
        </section>
      </div>
    </ShellFrame>
  );
}
