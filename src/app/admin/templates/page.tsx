import { AdminShell } from "@/components/admin/admin-shell";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { getAdminTemplateMetrics, requireAdminAccess } from "@/lib/admin";

export default async function AdminTemplatesPage() {
  const [{ profile }, categories] = await Promise.all([
    requireAdminAccess(),
    getAdminTemplateMetrics(),
  ]);

  return (
    <AdminShell
      currentSection="/admin/templates"
      title="Template manager"
      description="See which invite categories and individual designs are carrying the most host usage."
      adminName={profile?.full_name}
    >
      <DashboardPanel
        title="Category usage"
        description="This first pass uses the saved invite design metadata to show which templates are actually getting selected."
      >
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.categoryKey} className="rounded-3xl border border-border bg-white/70 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-ink">{category.categoryLabel}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {category.templates.length} template{category.templates.length === 1 ? "" : "s"} in catalog
                  </p>
                </div>
                <span className="rounded-full bg-canvas px-4 py-2 text-sm font-semibold text-ink">
                  {category.totalUsage} selections
                </span>
              </div>

              <div className="mt-4 grid gap-3 xl:grid-cols-2">
                {category.templates.map((template) => (
                  <div key={`${template.packSlug}:${template.templateId}`} className="rounded-2xl bg-canvas p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-ink">{template.style}</p>
                        <p className="mt-1 text-sm text-ink-muted">{template.packSlug}</p>
                      </div>
                      <div className="text-right text-sm text-ink-muted">
                        <p>{template.usageCount} used</p>
                        <p className="mt-1">{template.sentCount} sent</p>
                      </div>
                    </div>
                    <p className="mt-3 break-all text-xs uppercase tracking-[0.18em] text-ink-muted">
                      {template.templateId}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DashboardPanel>
    </AdminShell>
  );
}
