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
