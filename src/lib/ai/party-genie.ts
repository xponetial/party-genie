type EventSeed = {
  title: string;
  event_type: string;
  event_date: string | null;
  location: string | null;
  guest_target: number | null;
  budget: number | null;
  theme: string | null;
};

type GeneratedShoppingItem = {
  category: string;
  name: string;
  quantity: number;
  estimated_price: number | null;
  external_url: string | null;
};

export type GeneratedPartyPlan = {
  theme: string;
  inviteCopy: string;
  menu: string[];
  shoppingCategories: Array<{
    category: string;
    items: Array<{
      name: string;
      quantity: number;
    }>;
  }>;
  shoppingItems: GeneratedShoppingItem[];
  tasks: Array<{
    title: string;
    due_label: string;
    phase: string;
  }>;
  timeline: Array<{
    label: string;
    detail: string;
    sort_order: number;
  }>;
  rawResponse: {
    provider: string;
    generatedAt: string;
    summary: string;
  };
};

function getGuestCount(event: EventSeed) {
  return event.guest_target ?? 12;
}

function getTheme(event: EventSeed) {
  return event.theme?.trim() || `${event.event_type} celebration`;
}

function getEventMoment(event: EventSeed) {
  if (!event.event_date) {
    return "an upcoming gathering";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(event.event_date));
}

function getMenuSuggestions(event: EventSeed) {
  const type = event.event_type.toLowerCase();

  if (type.includes("brunch")) {
    return ["Seasonal fruit board", "Mini quiches", "Sparkling citrus mocktail"];
  }

  if (type.includes("birthday")) {
    return ["Signature welcome drink", "Crowd-pleasing small bites", "Celebration cake"];
  }

  if (type.includes("dinner")) {
    return ["Cheese and crudite starter", "Family-style main course", "Mini dessert trio"];
  }

  return ["Welcome snack board", "Main shared spread", "Dessert station"];
}

function getShoppingItems(event: EventSeed): GeneratedShoppingItem[] {
  const guestCount = getGuestCount(event);
  const type = event.event_type.toLowerCase();

  const baseItems: GeneratedShoppingItem[] = [
    {
      category: "Decor",
      name: "Candles or table accents",
      quantity: Math.max(2, Math.ceil(guestCount / 6)),
      estimated_price: 12,
      external_url: null,
    },
    {
      category: "Hosting",
      name: "Disposable napkins or linens",
      quantity: Math.max(1, Math.ceil(guestCount / 12)),
      estimated_price: 10,
      external_url: null,
    },
    {
      category: "Beverages",
      name: "Sparkling water and mixers",
      quantity: Math.max(2, Math.ceil(guestCount / 8)),
      estimated_price: 8,
      external_url: null,
    },
  ];

  if (type.includes("dinner")) {
    baseItems.push(
      {
        category: "Food",
        name: "Main course ingredients",
        quantity: 1,
        estimated_price: 45,
        external_url: null,
      },
      {
        category: "Food",
        name: "Dessert ingredients",
        quantity: 1,
        estimated_price: 18,
        external_url: null,
      },
    );
  } else if (type.includes("birthday")) {
    baseItems.push(
      {
        category: "Food",
        name: "Birthday cake or cupcakes",
        quantity: 1,
        estimated_price: 30,
        external_url: null,
      },
      {
        category: "Decor",
        name: "Balloons or backdrop kit",
        quantity: 1,
        estimated_price: 25,
        external_url: null,
      },
    );
  } else {
    baseItems.push({
      category: "Food",
      name: "Shareable appetizers",
      quantity: Math.max(2, Math.ceil(guestCount / 8)),
      estimated_price: 16,
      external_url: null,
    });
  }

  return baseItems;
}

function toShoppingCategories(items: GeneratedShoppingItem[]) {
  const grouped = new Map<string, Array<{ name: string; quantity: number }>>();

  for (const item of items) {
    const current = grouped.get(item.category) ?? [];
    current.push({ name: item.name, quantity: item.quantity });
    grouped.set(item.category, current);
  }

  return Array.from(grouped.entries()).map(([category, groupedItems]) => ({
    category,
    items: groupedItems,
  }));
}

export function buildPartyPlan(event: EventSeed): GeneratedPartyPlan {
  const theme = getTheme(event);
  const guestCount = getGuestCount(event);
  const eventMoment = getEventMoment(event);
  const menu = getMenuSuggestions(event);
  const shoppingItems = getShoppingItems(event);

  return {
    theme,
    inviteCopy: `You're invited to ${event.title} on ${eventMoment}. Expect a ${theme.toLowerCase()} with thoughtful details, great food, and an easy RSVP flow for ${guestCount} guests.`,
    menu,
    shoppingCategories: toShoppingCategories(shoppingItems),
    shoppingItems,
    tasks: [
      { title: "Review and personalize the AI invite copy", due_label: "Today", phase: "pre-event" },
      { title: "Finalize the shopping list and retailer handoff", due_label: "This week", phase: "pre-event" },
      { title: "Send reminders to pending guests", due_label: "Event week", phase: "event-week" },
      { title: "Prep the hosting setup checklist", due_label: "Day before", phase: "event-week" },
    ],
    timeline: [
      { label: "Planning kickoff", detail: "Confirm the vibe, guest count, and host priorities.", sort_order: 1 },
      { label: "Shopping and prep", detail: "Order supplies, prep food, and organize decor.", sort_order: 2 },
      { label: "Guest follow-up", detail: "Check remaining RSVPs and final attendance count.", sort_order: 3 },
      { label: "Event day", detail: "Set the space, cue music, and follow the host checklist.", sort_order: 4 },
    ],
    rawResponse: {
      provider: "party-genie-structured-fallback",
      generatedAt: new Date().toISOString(),
      summary: `Generated a ${theme.toLowerCase()} plan for ${guestCount} guests.`,
    },
  };
}

export function buildInviteCopy(event: EventSeed) {
  const theme = getTheme(event);
  const eventMoment = getEventMoment(event);

  return `Join us for ${event.title} on ${eventMoment}. We're planning a ${theme.toLowerCase()} with a warm welcome, great food, and a relaxed flow from arrival to dessert. Please RSVP so we can finalize the setup.`;
}

export function buildShoppingList(event: EventSeed) {
  const shoppingItems = getShoppingItems(event);

  return {
    shoppingItems,
    shoppingCategories: toShoppingCategories(shoppingItems),
  };
}
