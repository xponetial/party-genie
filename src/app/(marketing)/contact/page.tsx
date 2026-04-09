import { ShellFrame } from "@/components/layout/shell-frame";
import { ContactCard } from "@/components/contact/contact-card";

export default function ContactPage() {
  return (
    <ShellFrame
      eyebrow="Contact"
      title="Reach the right Party Swami inbox fast."
      description="Use the contact path that best matches what you need so questions, support requests, and business conversations land in the right place."
    >
      <section className="grid gap-4 xl:grid-cols-2">
        <ContactCard
          title="General"
          description="Use this for broad questions about Party Swami, founder contact, or general product interest."
          emailKey="hello"
          context="marketing"
        />
        <ContactCard
          title="Support"
          description="Use this for account help, bug reports, RSVP issues, invite troubleshooting, or product questions."
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
    </ShellFrame>
  );
}
