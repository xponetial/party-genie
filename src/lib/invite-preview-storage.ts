import { createInviteCardImagePng, type PublicInviteImageRecord } from "@/lib/invite-card-image";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const INVITE_PREVIEW_BUCKET = "invite-previews";

export function getInvitePreviewPath(eventId: string, inviteId: string) {
  return `${eventId}/${inviteId}.png`;
}

export async function uploadInvitePreviewImage({
  eventId,
  inviteId,
  invite,
}: {
  eventId: string;
  inviteId: string;
  invite: PublicInviteImageRecord;
}) {
  const supabase = createSupabaseAdminClient();
  const filePath = getInvitePreviewPath(eventId, inviteId);
  const png = await createInviteCardImagePng(invite);

  const { error: uploadError } = await supabase.storage
    .from(INVITE_PREVIEW_BUCKET)
    .upload(filePath, png, {
      cacheControl: "60",
      contentType: "image/png",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload invite preview image: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(INVITE_PREVIEW_BUCKET).getPublicUrl(filePath);

  return {
    filePath,
    publicUrl: `${data.publicUrl}?v=${Date.now()}`,
  };
}
