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

export type ContactIntent = "general" | "bug" | "feature";
export type ContactFormCategory = "general" | "support" | "bug" | "feature" | "info" | "sales";

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

export function getContextLabel(context: ContactContext) {
  switch (context) {
    case "marketing":
      return "Marketing";
    case "pricing":
      return "Pricing";
    case "support":
      return "Support";
    case "dashboard":
      return "Dashboard";
    case "invites":
      return "Invites";
    case "ai":
      return "AI";
    case "admin":
      return "Admin";
  }
}

export function buildDefaultSubject(context: ContactContext, intent: ContactIntent) {
  const contextLabel = getContextLabel(context);

  switch (intent) {
    case "bug":
      return `Bug report: ${contextLabel}`;
    case "feature":
      return `Feature request: ${contextLabel}`;
    case "general":
      return CONTACT_SUBJECTS[context];
  }
}

export function buildDefaultBody(options: {
  context: ContactContext;
  intent: ContactIntent;
  pageLabel?: string;
  pagePath?: string;
  pageUrl?: string;
  timestamp?: string;
}) {
  const { context, intent, pageLabel, pagePath, pageUrl, timestamp } = options;
  const intro = CONTACT_BODY_INTROS[context];
  const lines = [intro, ""];

  if (intent === "bug") {
    lines.push("I want to report a bug.");
  } else if (intent === "feature") {
    lines.push("I want to request a new feature.");
  }

  lines.push("");

  if (pageLabel) {
    lines.push(`Page: ${pageLabel}`);
  }

  if (pagePath) {
    lines.push(`Path: ${pagePath}`);
  }

  if (pageUrl) {
    lines.push(`URL: ${pageUrl}`);
  }

  if (timestamp) {
    lines.push(`Timestamp: ${timestamp}`);
  }

  lines.push("");

  if (intent === "bug") {
    lines.push("What happened:");
    lines.push("");
    lines.push("What I expected:");
  } else if (intent === "feature") {
    lines.push("Feature idea:");
    lines.push("");
    lines.push("Why it would help:");
  }

  return lines.join("\n");
}

export function getFormCategoryFromIntent(intent: ContactIntent) {
  switch (intent) {
    case "bug":
      return "bug" satisfies ContactFormCategory;
    case "feature":
      return "feature" satisfies ContactFormCategory;
    case "general":
      return "support" satisfies ContactFormCategory;
  }
}

export function getEmailKeyForFormCategory(category: ContactFormCategory): ContactEmailKey {
  switch (category) {
    case "general":
      return "hello";
    case "support":
    case "bug":
    case "feature":
      return "support";
    case "info":
      return "info";
    case "sales":
      return "sales";
  }
}

export function buildContactFormHref(options?: {
  category?: ContactFormCategory;
  context?: ContactContext;
  intent?: ContactIntent;
  pageLabel?: string;
  pagePath?: string;
  pageUrl?: string;
}) {
  const params = new URLSearchParams();

  if (options?.category) {
    params.set("category", options.category);
  }

  if (options?.context) {
    params.set("context", options.context);
  }

  if (options?.intent) {
    params.set("intent", options.intent);
  }

  if (options?.pageLabel) {
    params.set("pageLabel", options.pageLabel);
  }

  if (options?.pagePath) {
    params.set("pagePath", options.pagePath);
  }

  if (options?.pageUrl) {
    params.set("pageUrl", options.pageUrl);
  }

  const query = params.toString();
  return query ? `/contact?${query}` : "/contact";
}

export function buildMailtoHref(
  key: ContactEmailKey,
  options?: {
    context?: ContactContext;
    intent?: ContactIntent;
    pageLabel?: string;
    pagePath?: string;
    pageUrl?: string;
    timestamp?: string;
    subject?: string;
    body?: string;
  },
) {
  const email = getContactEmail(key);
  const params = new URLSearchParams();
  const context = options?.context;
  const intent = options?.intent ?? "general";

  if (options?.subject ?? context) {
    params.set("subject", options?.subject ?? buildDefaultSubject(context!, intent));
  }

  if (options?.body ?? context) {
    params.set(
      "body",
      options?.body ??
        buildDefaultBody({
          context: context!,
          intent,
          pageLabel: options?.pageLabel,
          pagePath: options?.pagePath,
          pageUrl: options?.pageUrl,
          timestamp: options?.timestamp,
        }),
    );
  }

  const query = params.toString();
  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
}
