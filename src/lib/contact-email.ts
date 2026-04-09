export const CONTACT_EMAILS = {
  hello: "hello@partyswami.com",
  support: "support@partyswami.com",
  admin: "admin@partyswami.com",
  info: "info@partyswami.com",
  sales: "sales@partyswami.com",
} as const;

export type ContactEmailKey = keyof typeof CONTACT_EMAILS;

export type ContactContext =
  | "marketing"
  | "pricing"
  | "support"
  | "dashboard"
  | "invites"
  | "ai"
  | "admin";

const CONTACT_SUBJECTS: Record<ContactContext, string> = {
  marketing: "Party Swami inquiry",
  pricing: "Party Swami pricing inquiry",
  support: "Party Swami support request",
  dashboard: "Party Swami dashboard help",
  invites: "Party Swami invite help",
  ai: "Party Swami AI planning help",
  admin: "Party Swami admin operations",
};

const CONTACT_BODY_INTROS: Record<ContactContext, string> = {
  marketing: "Hi Party Swami team,",
  pricing: "Hi Party Swami team, I have a pricing or partnership question.",
  support: "Hi Party Swami support, I need help with the product.",
  dashboard: "Hi Party Swami support, I need help with the dashboard.",
  invites: "Hi Party Swami support, I need help with invites or RSVPs.",
  ai: "Hi Party Swami support, I need help with AI planning or recommendations.",
  admin: "Hi Party Swami admin, I need help with an admin or operations issue.",
};

export function getContactEmail(key: ContactEmailKey) {
  return CONTACT_EMAILS[key];
}

export function buildMailtoHref(
  key: ContactEmailKey,
  options?: {
    context?: ContactContext;
    subject?: string;
    body?: string;
  },
) {
  const email = getContactEmail(key);
  const params = new URLSearchParams();

  if (options?.subject ?? options?.context) {
    params.set("subject", options?.subject ?? CONTACT_SUBJECTS[options!.context!]);
  }

  if (options?.body ?? options?.context) {
    params.set("body", options?.body ?? CONTACT_BODY_INTROS[options!.context!]);
  }

  const query = params.toString();
  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
}
