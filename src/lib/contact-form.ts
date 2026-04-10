import {
  ContactContext,
  ContactFormCategory,
  ContactIntent,
  buildDefaultBody,
  buildDefaultSubject,
  getEmailKeyForFormCategory,
} from "@/lib/contact-email";

export const CONTACT_FORM_CATEGORY_OPTIONS: Array<{
  value: ContactFormCategory;
  label: string;
  description: string;
}> = [
  {
    value: "general",
    label: "General question",
    description: "Founder contact, broad product questions, or general Party Swami interest.",
  },
  {
    value: "support",
    label: "Support request",
    description: "Account help, RSVP issues, invite troubleshooting, or product questions.",
  },
  {
    value: "bug",
    label: "Report a bug",
    description: "Something is broken, confusing, or not working the way it should.",
  },
  {
    value: "feature",
    label: "Request a feature",
    description: "Share a product idea that would make Party Swami more useful.",
  },
  {
    value: "info",
    label: "Info inquiry",
    description: "Use the informational alias when that reads better than a general hello inbox.",
  },
  {
    value: "sales",
    label: "Sales or partnership",
    description: "Pricing, partnerships, sponsorships, concierge interest, or business conversations.",
  },
];

export function getIntentForFormCategory(category: ContactFormCategory): ContactIntent {
  switch (category) {
    case "bug":
      return "bug";
    case "feature":
      return "feature";
    case "general":
    case "support":
    case "info":
    case "sales":
      return "general";
  }
}

export function buildContactFormDefaults(options?: {
  category?: ContactFormCategory;
  context?: ContactContext;
  pageLabel?: string;
  pagePath?: string;
  pageUrl?: string;
}) {
  const category = options?.category ?? "general";
  const context = options?.context ?? (category === "sales" ? "pricing" : "marketing");
  const intent = getIntentForFormCategory(category);

  return {
    category,
    context,
    intent,
    emailKey: getEmailKeyForFormCategory(category),
    subject: buildDefaultSubject(context, intent),
    message: buildDefaultBody({
      context,
      intent,
      pageLabel: options?.pageLabel,
      pagePath: options?.pagePath,
      pageUrl: options?.pageUrl,
    }),
  };
}
