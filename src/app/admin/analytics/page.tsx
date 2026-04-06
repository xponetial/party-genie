import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  getAdminAnalyticsMetrics,
  normalizeAdminRange,
  requireAdminAccess,
} from "@/lib/admin";
import { Button } from "@/components/ui/button";

const rangeOptions = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
] as const;

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const resolved = await searchParams;
  const rangeDays = normalizeAdminRange(resolved.range);
  const [{ profile }, analytics] = await Promise.all([
    requireAdminAccess(),
    getAdminAnalyticsMetrics(rangeDays),
  ]);

  const trendMax = Math.max(
    1,
    ...analytics.trendBuckets.flatMap((bucket) => Object.values(bucket.counts)),
  );

  return (
    <AdminShell
      currentSection="/admin/analytics"
      title="Analytics dashboard"
      description="Track the host funnel from account creation through event setup, invite delivery, RSVP response, and shopping intent."
      adminName={profile?.full_name}
      actions={
        <div className="flex flex-wrap gap-2">
          {rangeOptions.map((option) => (
            <Button
              key={option.value}
              asChild
              variant={rangeDays === Number(option.value) ? "primary" : "secondary"}
            >
              <Link href={option.value === "30" ? "/admin/analytics" : `/admin/analytics?range=${option.value}`}>
                {option.label}
              </Link>
            </Button>
          ))}
        </div>
      }
    >
      <DashboardPanel
        title="Conversion funnel"
        description={`This shows how much movement we are getting through the core host journey over the last ${rangeDays} days.`}
      >
        <div className="grid gap-4 xl:grid-cols-5">
          {analytics.funnel.map((step, index) => (
            <div key={step.label} className="rounded-3xl bg-canvas p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">{step.label}</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-ink">{step.value}</p>
              <p className="mt-3 text-sm text-ink-muted">
                {step.conversionFromPrevious == null
                  ? "Top-of-funnel baseline"
                  : `${step.conversionFromPrevious}% of the previous step`}
              </p>
              {index < analytics.funnel.length - 1 ? (
                <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-muted">
                  <ArrowRight className="size-3.5" />
                  Next stage
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </DashboardPanel>

      <DashboardPanel
        title="Trend view"
        description="Daily counts for the core product events we are using to understand adoption and conversion."
      >
        <div className="space-y-4">
          {analytics.trendBuckets.map((bucket) => (
            <div key={bucket.bucket} className="rounded-3xl border border-border bg-white/65 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-ink">{bucket.bucket}</p>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-muted">
                  <TrendingUp className="size-3.5" />
                  Daily signal
                </div>
              </div>
              <div className="mt-4 grid gap-3 xl:grid-cols-5">
                {Object.entries(bucket.counts).map(([name, count]) => (
                  <div key={name} className="rounded-2xl bg-canvas px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">
                        {name.replaceAll("_", " ")}
                      </p>
                      <p className="text-sm font-semibold text-ink">{count}</p>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white">
                      <div
                        className="h-2 rounded-full bg-[linear-gradient(135deg,#ff7bd5_0%,#a54dff_36%,#2f8fff_100%)]"
                        style={{ width: `${Math.max(8, Math.round((count / trendMax) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DashboardPanel>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardPanel
          title="Top event types"
          description="The occasions most responsible for current admin-side activity."
        >
          <div className="space-y-3">
            {analytics.topEventTypes.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-canvas px-4 py-3">
                <p className="font-medium text-ink">{item.label}</p>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-ink">{item.count}</span>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Top template usage"
          description="The invite templates hosts are choosing most often in the same time window."
        >
          <div className="space-y-3">
            {analytics.topTemplates.map((item) => (
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
