export type SafeArea =
  | "upper_center"
  | "top_center"
  | "middle_center"
  | "center"
  | "lower_center"
  | "bottom_center";

export type OverlayRecommendation = {
  text_colors: [string, string];
  font_style: string;
};

export type InviteTemplate = {
  templateId: string;
  style: string;
  assetPath: string;
  categoryLabel: string;
  categoryKey: string;
  packSlug: string;
  packLabel: string;
  orientation: "vertical";
  textSafeAreas: {
    title: SafeArea;
    details: SafeArea;
    cta: SafeArea;
  };
  overlay: OverlayRecommendation;
};

export type InviteTemplateCategory = {
  key: string;
  label: string;
  templates: InviteTemplate[];
};

export function flattenInviteTemplates(categories: InviteTemplateCategory[]) {
  return categories.flatMap((category) => category.templates);
}

export function findInviteTemplate(
  categories: InviteTemplateCategory[],
  {
    templateId,
    packSlug,
  }: {
    templateId: string;
    packSlug?: string | null;
  },
) {
  return flattenInviteTemplates(categories).find((template) =>
    packSlug
      ? template.templateId === templateId && template.packSlug === packSlug
      : template.templateId === templateId,
  );
}
