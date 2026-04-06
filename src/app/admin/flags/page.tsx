import { updateFeatureFlagAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatAdminDateTime, getAdminFeatureFlags, requireAdminAccess } from "@/lib/admin";

export default async function AdminFlagsPage() {
  const [{ profile }, flags] = await Promise.all([
    requireAdminAccess(),
    getAdminFeatureFlags(),
  ]);

  return (
    <AdminShell
      currentSection="/admin/flags"
      title="Feature flags"
      description="Control rollouts and experiments without changing host-facing code paths blindly."
      adminName={profile?.full_name}
    >
      <DashboardPanel
        title="Flag control center"
        description="Use gradual rollout percentages where you want a soft launch, and disable features entirely when needed."
      >
        <div className="space-y-4">
          {flags.map((flag) => (
            <div key={flag.key} className="rounded-3xl border border-border bg-white/70 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-ink">{flag.label}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.16em] ${
                        flag.enabled ? "bg-accent-soft text-accent" : "bg-brand/10 text-brand"
                      }`}
                    >
                      {flag.enabled ? "enabled" : "disabled"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">{flag.description}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-ink-muted">
                    Last updated {formatAdminDateTime(flag.updatedAt)}
                  </p>
                </div>

                <form action={updateFeatureFlagAction} className="grid gap-3 rounded-3xl bg-canvas p-4 sm:grid-cols-[auto_auto]">
                  <input name="key" type="hidden" value={flag.key} />
                  <input name="enabled" type="hidden" value={flag.enabled ? "false" : "true"} />
                  <input
                    name="rolloutPercentage"
                    type="hidden"
                    value={flag.enabled ? String(flag.rolloutPercentage) : "100"}
                  />
                  <SubmitButton pendingLabel="Updating..." variant={flag.enabled ? "ghost" : "secondary"}>
                    {flag.enabled ? "Disable flag" : "Enable flag"}
                  </SubmitButton>
                </form>
              </div>

              <form action={updateFeatureFlagAction} className="mt-4 rounded-3xl bg-canvas p-4">
                <input name="key" type="hidden" value={flag.key} />
                <input name="enabled" type="hidden" value={String(flag.enabled)} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="text-sm font-medium text-ink" htmlFor={`${flag.key}-rollout`}>
                    Rollout percentage
                  </label>
                  <input
                    className="w-28 rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none"
                    defaultValue={flag.rolloutPercentage}
                    id={`${flag.key}-rollout`}
                    max={100}
                    min={0}
                    name="rolloutPercentage"
                    type="number"
                  />
                  <SubmitButton pendingLabel="Saving rollout..." variant="secondary">
                    Save rollout
                  </SubmitButton>
                </div>
              </form>
            </div>
          ))}
        </div>
      </DashboardPanel>
    </AdminShell>
  );
}
