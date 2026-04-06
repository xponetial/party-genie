import path from "node:path";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const SOCIAL_MEDIA_ASSET_BUCKET = "social-media-assets";

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function extensionForMimeType(mimeType: string, originalName: string) {
  const originalExtension = path.extname(originalName).toLowerCase();
  if (originalExtension) {
    return originalExtension;
  }

  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/gif") return ".gif";
  return ".jpg";
}

export async function uploadSocialMediaAsset({
  campaignId,
  contentItemId,
  file,
}: {
  campaignId: string;
  contentItemId: string;
  file: File;
}) {
  const supabase = createSupabaseAdminClient();
  const arrayBuffer = await file.arrayBuffer();
  const extension = extensionForMimeType(file.type, file.name);
  const baseName = sanitizeFileName(path.basename(file.name, path.extname(file.name)) || "asset");
  const fileName = `${baseName}${extension}`;
  const filePath = `${campaignId}/${contentItemId}/${fileName}`;

  const { error } = await supabase.storage
    .from(SOCIAL_MEDIA_ASSET_BUCKET)
    .upload(filePath, Buffer.from(arrayBuffer), {
      cacheControl: "3600",
      contentType: file.type || undefined,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload social asset: ${error.message}`);
  }

  const { data } = supabase.storage.from(SOCIAL_MEDIA_ASSET_BUCKET).getPublicUrl(filePath);

  return {
    fileName,
    filePath,
    publicUrl: `${data.publicUrl}?v=${Date.now()}`,
  };
}
