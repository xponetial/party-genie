import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  getAdminMarketplaceData,
  normalizeAdminRange,
  requireAdminAccess,
} from "@/lib/admin";
import { Button } from "@/components/ui/button";

const rangeOptions = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
] as const;

export default async function AdminMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const resolved = await searchParams;
  const rangeDays = normalizeAdminRange(resolved.range);
  const [{ profile }, marketplace] = await Promise.all([
    requireAdminAccess(),
    getAdminMarketplaceData(rangeDays),
  ]);

  return (
    <AdminShell
      currentSection="/admin/marketplace"
      title="Marketplace and shopping"
      description="A clearer view of retailer-intent behavior, recommendation engagement, and shopping category demand."
      adminName={profile?.full_name}
      actions={
        <div className="flex flex-wrap gap-2">
          {rangeOptions.map((option) => (
            <Button
              key={option.value}
              asChild
              variant={rangeDays === Number(option.value) ? "primary" : "secondary"}
            >
              <Link href={option.value === "30" ? "/admin/marketplace" : `/admin/marketplace?range=${option.value}`}>
                {option.label}
              </Link>
            </Button>
          ))}
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {[
          { label: "Shopping clicks", value: String(marketplace.totalClicks) },
          { label: "Replacement actions", value: String(marketplace.totalReplacementActions) },
          { label: "Top categories", value: String(marketplace.topShoppingCategories.length) },
        ].map((item) => (
          <div key={item.label} className="rounded-[2rem] border border-white/75 bg-canvas p-6 shadow-party">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DashboardPanel
          title="Top event types"
          description="The event types currently driving the most retailer-intent behavior."
        >
          <div className="space-y-3">
            {marketplace.topEventTypes.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-canvas px-4 py-3">
                <p className="font-medium text-ink">{item.label}</p>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-ink">{item.count}</span>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Top shopping categories"
          description="The categories hosts are most often receiving in their shopping lists."
        >
          <div className="space-y-3">
            {marketplace.topShoppingCategories.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-canvas px-4 py-3">
                <p className="font-medium text-ink">{item.label}</p>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-ink">{item.count}</span>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Top clicked events"
          description="The live events with the most retailer click-through behavior."
        >
          <div className="space-y-3">
            {marketplace.topClickedEvents.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-canvas px-4 py-3">
                <p className="font-medium text-ink">{item.label}</p>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-ink">{item.count}</span>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>
    </AdminShell>
  );
}
