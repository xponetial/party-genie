"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const planTierSchema = z.object({
  userId: z.string().uuid(),
  planTier: z.enum(["free", "pro", "admin"]),
});

const templateControlSchema = z.object({
  packSlug: z.string().min(1),
  templateId: z.string().min(1),
  isActive: z.coerce.boolean(),
});

const featureFlagSchema = z.object({
  key: z.string().min(1),
  enabled: z.coerce.boolean(),
  rolloutPercentage: z.coerce.number().int().min(0).max(100),
});

const adminNoteSchema = z.object({
  scopeType: z.enum(["user", "event"]),
  scopeId: z.string().uuid(),
  note: z.string().trim().min(5).max(2000),
});

const socialMediaBrandProfileSchema = z.object({
  tone: z.string().trim().min(10).max(500),
  audience: z.string().trim().min(10).max(500),
  signaturePhrases: z.string().trim().min(3).max(500),
  ctaStyle: z.string().trim().min(3).max(500),
  postingGoalPerWeek: z.coerce.number().int().min(0).max(100),
  focusMetrics: z.string().trim().min(3).max(500),
});

const socialMediaCampaignSchema = z.object({
  theme: z.string().trim().min(3).max(120),
  audience: z.string().trim().min(3).max(200),
  objective: z.string().trim().min(3).max(200),
  priority: z.enum(["low", "medium", "high"]),
  sourceEventType: z.string().trim().max(120).optional(),
  scheduledWeekOf: z.string().trim().optional(),
  notes: z.string().trim().max(1500).optional(),
});

const socialMediaCampaignStatusSchema = z.object({
  campaignId: z.string().uuid(),
  status: z.enum(["draft", "in_review", "approved", "scheduled", "published"]),
});

const socialMediaContentItemSchema = z.object({
  campaignId: z.string().uuid(),
  channel: z.enum(["tiktok", "pinterest", "instagram", "email", "landing_page"]),
  title: z.string().trim().min(3).max(160),
  formatDetail: z.string().trim().min(3).max(240),
  publishOn: z.string().trim().optional(),
  copy: z.string().trim().min(10).max(4000),
  callToAction: z.string().trim().min(2).max(240),
  hashtags: z.string().trim().max(500).optional(),
  visualDirection: z.string().trim().max(1000).optional(),
});

const socialMediaContentStatusSchema = z.object({
  contentItemId: z.string().uuid(),
  status: z.enum(["draft", "in_review", "approved", "scheduled", "published"]),
});

function revalidateSocialMediaPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/social-media");
}

export async function updateAdminUserPlanTierAction(formData: FormData) {
  await requireAdminAccess();
  const parsed = planTierSchema.safeParse({
    userId: formData.get("userId"),
    planTier: formData.get("planTier"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid plan tier update.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ plan_tier: parsed.data.planTier })
    .eq("id", parsed.data.userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${parsed.data.userId}`);
  revalidatePath("/dashboard");
}

export async function updateTemplateControlAction(formData: FormData) {
  await requireAdminAccess();
  const parsed = templateControlSchema.safeParse({
    packSlug: formData.get("packSlug"),
    templateId: formData.get("templateId"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid template control update.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("template_admin_controls").upsert(
    {
      pack_slug: parsed.data.packSlug,
      template_id: parsed.data.templateId,
      is_active: parsed.data.isActive,
    },
    { onConflict: "pack_slug,template_id" },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/templates");
  revalidatePath("/events/new");
  revalidatePath("/dashboard");
}

export async function updateFeatureFlagAction(formData: FormData) {
  await requireAdminAccess();
  const parsed = featureFlagSchema.safeParse({
    key: formData.get("key"),
    enabled: formData.get("enabled"),
    rolloutPercentage: formData.get("rolloutPercentage"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid feature flag update.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("feature_flags")
    .update({
      enabled: parsed.data.enabled,
      rollout_percentage: parsed.data.rolloutPercentage,
    })
    .eq("key", parsed.data.key);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/flags");
}

export async function createAdminNoteAction(formData: FormData) {
  const admin = await requireAdminAccess();
  const parsed = adminNoteSchema.safeParse({
    scopeType: formData.get("scopeType"),
    scopeId: formData.get("scopeId"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid admin note.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("admin_notes").insert({
    scope_type: parsed.data.scopeType,
    scope_id: parsed.data.scopeId,
    note: parsed.data.note,
    created_by: admin.userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (parsed.data.scopeType === "user") {
    revalidatePath(`/admin/users/${parsed.data.scopeId}`);
  } else {
    revalidatePath(`/admin/events/${parsed.data.scopeId}`);
  }

  revalidatePath("/admin/support");
}

export async function updateSocialMediaBrandProfileAction(formData: FormData) {
  const admin = await requireAdminAccess();
  const parsed = socialMediaBrandProfileSchema.safeParse({
    tone: formData.get("tone"),
    audience: formData.get("audience"),
    signaturePhrases: formData.get("signaturePhrases"),
    ctaStyle: formData.get("ctaStyle"),
    postingGoalPerWeek: formData.get("postingGoalPerWeek"),
    focusMetrics: formData.get("focusMetrics"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid brand voice settings.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("social_media_brand_profiles").upsert(
    {
      scope: "default",
      tone: parsed.data.tone,
      audience: parsed.data.audience,
      signature_phrases: parsed.data.signaturePhrases,
      cta_style: parsed.data.ctaStyle,
      posting_goal_per_week: parsed.data.postingGoalPerWeek,
      focus_metrics: parsed.data.focusMetrics,
      updated_by: admin.userId,
    },
    { onConflict: "scope" },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidateSocialMediaPaths();
}

export async function createSocialMediaCampaignAction(formData: FormData) {
  const admin = await requireAdminAccess();
  const parsed = socialMediaCampaignSchema.safeParse({
    theme: formData.get("theme"),
    audience: formData.get("audience"),
    objective: formData.get("objective"),
    priority: formData.get("priority"),
    sourceEventType: formData.get("sourceEventType") || undefined,
    scheduledWeekOf: formData.get("scheduledWeekOf") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid social campaign.");
  }

  const supabase = createSupabaseAdminClient();
  const scheduledWeekOf = parsed.data.scheduledWeekOf?.trim() || null;
  const status = scheduledWeekOf ? "scheduled" : "draft";
  const { error } = await supabase.from("social_media_campaigns").insert({
    theme: parsed.data.theme,
    audience: parsed.data.audience,
    objective: parsed.data.objective,
    priority: parsed.data.priority,
    source_event_type: parsed.data.sourceEventType?.trim() || null,
    scheduled_week_of: scheduledWeekOf,
    notes: parsed.data.notes?.trim() || "",
    status,
    created_by: admin.userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidateSocialMediaPaths();
}

export async function updateSocialMediaCampaignStatusAction(formData: FormData) {
  await requireAdminAccess();
  const parsed = socialMediaCampaignStatusSchema.safeParse({
    campaignId: formData.get("campaignId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid campaign status.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("social_media_campaigns")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.campaignId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateSocialMediaPaths();
}

export async function createSocialMediaContentItemAction(formData: FormData) {
  await requireAdminAccess();
  const parsed = socialMediaContentItemSchema.safeParse({
    campaignId: formData.get("campaignId"),
    channel: formData.get("channel"),
    title: formData.get("title"),
    formatDetail: formData.get("formatDetail"),
    publishOn: formData.get("publishOn") || undefined,
    copy: formData.get("copy"),
    callToAction: formData.get("callToAction"),
    hashtags: formData.get("hashtags") || undefined,
    visualDirection: formData.get("visualDirection") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid content draft.");
  }

  const supabase = createSupabaseAdminClient();
  const publishOn = parsed.data.publishOn?.trim() || null;
  const status = publishOn ? "scheduled" : "draft";
  const { error } = await supabase.from("social_media_content_items").insert({
    campaign_id: parsed.data.campaignId,
    channel: parsed.data.channel,
    title: parsed.data.title,
    format_detail: parsed.data.formatDetail,
    publish_on: publishOn,
    status,
    copy: parsed.data.copy,
    call_to_action: parsed.data.callToAction,
    hashtags: parsed.data.hashtags?.trim() || "",
    visual_direction: parsed.data.visualDirection?.trim() || "",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidateSocialMediaPaths();
}

export async function updateSocialMediaContentStatusAction(formData: FormData) {
  await requireAdminAccess();
  const parsed = socialMediaContentStatusSchema.safeParse({
    contentItemId: formData.get("contentItemId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid content status.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("social_media_content_items")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.contentItemId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateSocialMediaPaths();
}
