import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DashboardMetricCard } from "@/components/dashboard/dashboard-metric-card";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  formatAdminCurrency,
  getAdminRevenueMetrics,
  normalizeAdminRange,
  requireAdminAccess,
} from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { PiggyBank, Rocket, ShoppingCart, Users, Mail, Activity } from "lucide-react";

const rangeOptions = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
] as const;

const metricIcons = [Users, PiggyBank, Rocket, Mail, Activity, ShoppingCart] as const;

export default async function AdminRevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const resolved = await searchParams;
  const rangeDays = normalizeAdminRange(resolved.range);
  const [{ profile }, revenue] = await Promise.all([
    requireAdminAccess(),
    getAdminRevenueMetrics(rangeDays),
  ]);

  const metrics = [
    { label: "Total users", value: String(revenue.totals.users), detail: "All accounts in the system" },
    {
      label: "Projected MRR",
      value: formatAdminCurrency(revenue.totals.projectedMrrUsd),
      detail: "Estimated from current plan tiers until Stripe is fully live",
    },
    {
      label: "Activated users",
      value: String(revenue.totals.activatedUsers),
      detail: `Users who moved into event creation in the last ${rangeDays} days`,
    },
    {
      label: "Invite send rate",
      value: `${revenue.totals.inviteSendRate}%`,
      detail: "How often created events progress into invite delivery",
    },
    {
      label: "RSVP rate",
      value: `${revenue.totals.rsvpRate}%`,
      detail: "Guest response movement relative to invite sends",
    },
    {
      label: "Shopping CTR",
      value: `${revenue.totals.shoppingCtr}%`,
      detail: "Retailer handoff engagement relative to invite activity",
    },
  ];

  const growthMax = Math.max(
    1,
    ...revenue.growthBuckets.flatMap((bucket) => [
      bucket.signups,
      bucket.activations,
      bucket.invites,
      bucket.rsvps,
      bucket.clicks,
    ]),
  );

  return (
    <AdminShell
      currentSection="/admin/revenue"
      title="Revenue and growth"
      description="A business-facing view of user growth, activation quality, engagement, and projected monetization."
      adminName={profile?.full_name}
      actions={
        <div className="flex flex-wrap gap-2">
          {rangeOptions.map((option) => (
            <Button
              key={option.value}
              asChild
              variant={rangeDays === Number(option.value) ? "primary" : "secondary"}
            >
              <Link href={option.value === "30" ? "/admin/revenue" : `/admin/revenue?range=${option.value}`}>
                {option.label}
              </Link>
            </Button>
          ))}
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {metrics.map((metric, index) => (
          <DashboardMetricCard
            key={metric.label}
            detail={metric.detail}
            icon={metricIcons[index]}
            label={metric.label}
            value={metric.value}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <DashboardPanel
          title="Plan mix"
          description="Projected monetization based on current plan tiers."
        >
          <div className="space-y-3">
            {revenue.byPlan.map((plan) => (
              <div key={plan.tier} className="rounded-2xl border border-border bg-white/70 px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{plan.tier}</p>
                    <p className="mt-1 text-sm text-ink-muted">{plan.users} users</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-ink">{formatAdminCurrency(plan.projectedRevenueUsd)}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-muted">Projected monthly</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Growth pulse"
          description="Use this to understand how signups are translating into activation and downstream engagement."
        >
          <div className="space-y-4">
            {revenue.growthBuckets.map((bucket) => (
              <div key={bucket.bucket} className="rounded-2xl border border-border bg-white/70 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{bucket.bucket}</p>
                  <span className="text-xs uppercase tracking-[0.16em] text-ink-muted">Daily view</span>
                </div>
                <div className="mt-4 grid gap-3 xl:grid-cols-5">
                  {[
                    { label: "Signups", value: bucket.signups },
                    { label: "Activations", value: bucket.activations },
                    { label: "Invites", value: bucket.invites },
                    { label: "RSVPs", value: bucket.rsvps },
                    { label: "Clicks", value: bucket.clicks },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl bg-canvas px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">{item.label}</p>
                        <p className="text-sm font-semibold text-ink">{item.value}</p>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white">
                        <div
                          className="h-2 rounded-full bg-[linear-gradient(135deg,#ff7bd5_0%,#a54dff_36%,#2f8fff_100%)]"
                          style={{ width: `${Math.max(10, Math.round((item.value / growthMax) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>

      <DashboardPanel
        title="Next business moves"
        description="Suggested places to act once the business view is telling a clear story."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { href: "/admin/flags", label: "Experiment flags", detail: "Use flags to roll out onboarding or email changes carefully." },
            { href: "/admin/templates", label: "Template performance", detail: "Tune which designs stay live as usage patterns shift." },
            { href: "/admin/support", label: "Support queue", detail: "Look for users or events that need human intervention." },
            { href: "/admin/integrations", label: "Integration health", detail: "Confirm billing, email, and data systems are truly production-ready." },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-3xl border border-border bg-white/70 p-5 transition hover:border-brand/25 hover:bg-white"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-semibold text-ink">{item.label}</p>
                <ArrowRight className="size-4 text-brand transition group-hover:translate-x-0.5" />
              </div>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{item.detail}</p>
            </Link>
          ))}
        </div>
      </DashboardPanel>
    </AdminShell>
  );
}
