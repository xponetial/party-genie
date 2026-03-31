import { SupabaseClient } from "@supabase/supabase-js";
import { buildInviteCopy, buildPartyPlan, buildShoppingList } from "@/lib/ai/party-genie";

type EventRecord = {
  id: string;
  title: string;
  event_type: string;
  event_date: string | null;
  location: string | null;
  guest_target: number | null;
  budget: number | null;
  theme: string | null;
};

type ShoppingListRecord = {
  id: string;
  retailer: "amazon" | "walmart" | "mixed" | null;
};

async function loadEventSeed(supabase: SupabaseClient, eventId: string) {
  const [{ data: event, error: eventError }, { count: guestCount }] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, event_type, event_date, location, guest_target, budget, theme")
      .eq("id", eventId)
      .single<EventRecord>(),
    supabase
      .from("guests")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId),
  ]);

  if (eventError || !event) {
    throw new Error(eventError?.message ?? "Event not found.");
  }

  return {
    ...event,
    guest_target: event.guest_target ?? guestCount ?? null,
  };
}

async function ensureInvite(supabase: SupabaseClient, eventId: string, inviteCopy: string) {
  const { data: invite } = await supabase
    .from("invites")
    .select("id")
    .eq("event_id", eventId)
    .maybeSingle<{ id: string }>();

  if (invite) {
    await supabase
      .from("invites")
      .update({ invite_copy: inviteCopy })
      .eq("id", invite.id);
    return invite.id;
  }

  const { data: createdInvite, error } = await supabase
    .from("invites")
    .insert({ event_id: eventId, invite_copy: inviteCopy, is_public: false })
    .select("id")
    .single<{ id: string }>();

  if (error || !createdInvite) {
    throw new Error(error?.message ?? "Unable to create invite.");
  }

  return createdInvite.id;
}

async function ensureShoppingList(supabase: SupabaseClient, eventId: string) {
  const { data: existing } = await supabase
    .from("shopping_lists")
    .select("id, retailer")
    .eq("event_id", eventId)
    .maybeSingle<ShoppingListRecord>();

  if (existing) {
    return existing;
  }

  const { data: created, error } = await supabase
    .from("shopping_lists")
    .insert({
      event_id: eventId,
      retailer: "mixed",
      estimated_total: 0,
    })
    .select("id, retailer")
    .single<ShoppingListRecord>();

  if (error || !created) {
    throw new Error(error?.message ?? "Unable to create shopping list.");
  }

  return created;
}

async function syncShoppingItems(
  supabase: SupabaseClient,
  shoppingListId: string,
  generatedItems: Array<{
    category: string;
    name: string;
    quantity: number;
    estimated_price: number | null;
    external_url: string | null;
  }>,
) {
  const { data: existingItemsData } = await supabase
    .from("shopping_items")
    .select("id, category, name")
    .eq("shopping_list_id", shoppingListId)
    .returns<Array<{ id: string; category: string; name: string }>>();
  const existingItems = existingItemsData ?? [];

  const existingKeys = new Set(
    existingItems.map((item) => `${item.category.toLowerCase()}::${item.name.toLowerCase()}`),
  );

  const missingItems = generatedItems.filter(
    (item) => !existingKeys.has(`${item.category.toLowerCase()}::${item.name.toLowerCase()}`),
  );

  if (missingItems.length) {
    const { error } = await supabase.from("shopping_items").insert(
      missingItems.map((item, index) => ({
        shopping_list_id: shoppingListId,
        category: item.category,
        name: item.name,
        quantity: item.quantity,
        estimated_price: item.estimated_price,
        external_url: item.external_url,
        sort_order: index,
      })),
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  const { data: currentItemsData } = await supabase
    .from("shopping_items")
    .select("estimated_price, quantity")
    .eq("shopping_list_id", shoppingListId)
    .returns<Array<{ estimated_price: number | null; quantity: number }>>();
  const currentItems = currentItemsData ?? [];

  const estimatedTotal = currentItems.reduce(
    (sum, item) => sum + (item.estimated_price ?? 0) * item.quantity,
    0,
  );

  await supabase
    .from("shopping_lists")
    .update({ estimated_total: estimatedTotal })
    .eq("id", shoppingListId);

  return {
    addedCount: missingItems.length,
    estimatedTotal,
  };
}

async function syncTasks(
  supabase: SupabaseClient,
  eventId: string,
  generatedTasks: Array<{ title: string; due_label: string; phase: string }>,
) {
  const { data: existingTasksData } = await supabase
    .from("tasks")
    .select("title")
    .eq("event_id", eventId)
    .returns<Array<{ title: string }>>();
  const existingTasks = existingTasksData ?? [];

  const existingTitles = new Set(existingTasks.map((task) => task.title.toLowerCase()));
  const missingTasks = generatedTasks.filter((task) => !existingTitles.has(task.title.toLowerCase()));

  if (missingTasks.length) {
    const { error } = await supabase.from("tasks").insert(
      missingTasks.map((task) => ({
        event_id: eventId,
        title: task.title,
        due_label: task.due_label,
        phase: task.phase,
      })),
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  return missingTasks.length;
}

async function syncTimeline(
  supabase: SupabaseClient,
  eventId: string,
  generatedTimeline: Array<{ label: string; detail: string; sort_order: number }>,
) {
  const { data: existingItemsData } = await supabase
    .from("timeline_items")
    .select("label")
    .eq("event_id", eventId)
    .returns<Array<{ label: string }>>();
  const existingItems = existingItemsData ?? [];

  const existingLabels = new Set(existingItems.map((item) => item.label.toLowerCase()));
  const missingItems = generatedTimeline.filter(
    (item) => !existingLabels.has(item.label.toLowerCase()),
  );

  if (missingItems.length) {
    const { error } = await supabase.from("timeline_items").insert(
      missingItems.map((item) => ({
        event_id: eventId,
        label: item.label,
        detail: item.detail,
        sort_order: item.sort_order,
      })),
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  return missingItems.length;
}

export async function generatePlanForEvent(supabase: SupabaseClient, eventId: string) {
  const event = await loadEventSeed(supabase, eventId);
  const generated = buildPartyPlan(event);

  await ensureInvite(supabase, eventId, generated.inviteCopy);

  const shoppingList = await ensureShoppingList(supabase, eventId);
  const shoppingSummary = await syncShoppingItems(supabase, shoppingList.id, generated.shoppingItems);
  const tasksAdded = await syncTasks(supabase, eventId, generated.tasks);
  const timelineAdded = await syncTimeline(supabase, eventId, generated.timeline);

  const { error: planError } = await supabase.from("party_plans").upsert(
    {
      event_id: eventId,
      theme: generated.theme,
      invite_copy: generated.inviteCopy,
      menu: generated.menu,
      shopping_categories: generated.shoppingCategories,
      tasks: generated.tasks,
      timeline: generated.timeline.map(({ label, detail }) => ({ label, detail })),
      raw_response: generated.rawResponse,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "event_id" },
  );

  if (planError) {
    throw new Error(planError.message);
  }

  return {
    theme: generated.theme,
    inviteCopy: generated.inviteCopy,
    menu: generated.menu,
    shoppingCategories: generated.shoppingCategories,
    tasks: generated.tasks,
    timeline: generated.timeline,
    synced: {
      shoppingItemsAdded: shoppingSummary.addedCount,
      tasksAdded,
      timelineAdded,
      estimatedTotal: shoppingSummary.estimatedTotal,
    },
  };
}

export async function generateInviteCopyForEvent(supabase: SupabaseClient, eventId: string) {
  const event = await loadEventSeed(supabase, eventId);
  const inviteCopy = buildInviteCopy(event);

  await ensureInvite(supabase, eventId, inviteCopy);

  await supabase
    .from("party_plans")
    .upsert(
      {
        event_id: eventId,
        theme: getThemeFromEvent(event),
        invite_copy: inviteCopy,
        generated_at: new Date().toISOString(),
        raw_response: {
          provider: "party-genie-structured-fallback",
          generatedAt: new Date().toISOString(),
          summary: "Generated invite copy only.",
        },
      },
      { onConflict: "event_id" },
    );

  return { inviteCopy };
}

function getThemeFromEvent(event: EventRecord) {
  return event.theme?.trim() || `${event.event_type} celebration`;
}

export async function generateShoppingListForEvent(supabase: SupabaseClient, eventId: string) {
  const event = await loadEventSeed(supabase, eventId);
  const shoppingList = await ensureShoppingList(supabase, eventId);
  const generated = buildShoppingList(event);
  const shoppingSummary = await syncShoppingItems(supabase, shoppingList.id, generated.shoppingItems);

  await supabase
    .from("party_plans")
    .upsert(
      {
        event_id: eventId,
        theme: getThemeFromEvent(event),
        shopping_categories: generated.shoppingCategories,
        generated_at: new Date().toISOString(),
        raw_response: {
          provider: "party-genie-structured-fallback",
          generatedAt: new Date().toISOString(),
          summary: "Generated shopping list only.",
        },
      },
      { onConflict: "event_id" },
    );

  return {
    shoppingCategories: generated.shoppingCategories,
    addedCount: shoppingSummary.addedCount,
    estimatedTotal: shoppingSummary.estimatedTotal,
  };
}
