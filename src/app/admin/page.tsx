import Link from "next/link";
import {
  Activity,
  Bot,
  CalendarDays,
  Mail,
  ShoppingCart,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DashboardMetricCard } from "@/components/dashboard/dashboard-metric-card";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  formatAdminDateTime,
  getAdminOverviewMetrics,
  normalizeAdminRange,
  requireAdminAccess,
} from "@/lib/admin";
import { Button } from "@/components/ui/button";

const rangeOptions = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
] as const;

const metricIcons = [Users, CalendarDays, Mail, Activity, ShoppingCart, Bot] as const;

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const resolved = await searchParams;
  const rangeDays = normalizeAdminRange(resolved.range);
  const [{ profile }, overview] = await Promise.all([
    requireAdminAccess(),
    getAdminOverviewMetrics(rangeDays),
  ]);

  return (
    <AdminShell
      currentSection="/admin"
      title="Admin overview"
      description="A live command-center snapshot across users, events, email activity, shopping intent, and AI cost."
      adminName={profile?.full_name}
      actions={
        <div className="flex flex-wrap gap-2">
          {rangeOptions.map((option) => (
            <Button
              key={option.value}
              asChild
              variant={rangeDays === Number(option.value) ? "primary" : "secondary"}
            >
              <Link href={option.value === "30" ? "/admin" : `/admin?range=${option.value}`}>{option.label}</Link>
            </Button>
          ))}
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {overview.metrics.map((metric, index) => (
          <DashboardMetricCard
            key={metric.label}
            detail={metric.detail}
            icon={metricIcons[index]}
            label={metric.label}
            value={metric.value}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <DashboardPanel
          title="Recent system activity"
          description={`The latest product telemetry and audit activity from the last ${rangeDays} days.`}
        >
          <div className="space-y-3">
            {overview.activity.length ? (
              overview.activity.map((item) => (
                <div
                  key={`${item.kind}-${item.id}`}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-[rgba(255,255,255,0.42)] px-4 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.label}</p>
                    <p className="mt-1 text-sm text-ink-muted">{item.detail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">{item.kind}</p>
                    <p className="mt-1 text-sm text-ink-muted">{formatAdminDateTime(item.createdAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-border bg-canvas px-4 py-5 text-sm leading-6 text-ink-muted">
                No admin activity has been captured in this window yet.
              </div>
            )}
          </div>
        </DashboardPanel>

        <div className="grid gap-4">
          <DashboardPanel
            title="Top event types"
            description="The occasion types creating the most host activity in the current window."
          >
            <div className="space-y-3">
              {overview.topEventTypes.length ? (
                overview.topEventTypes.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl bg-canvas px-4 py-3"
                  >
                    <p className="font-medium text-ink">{item.label}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-ink">
                      {item.count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-ink-muted">No event types were created in this range yet.</p>
              )}
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Top invite templates"
            description="The template designs hosts are actually using most often."
          >
            <div className="space-y-3">
              {overview.topTemplates.length ? (
                overview.topTemplates.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl bg-canvas px-4 py-3"
                  >
                    <p className="font-medium text-ink">{item.label}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-ink">
                      {item.count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-ink-muted">No invite template usage is recorded yet.</p>
              )}
            </div>
          </DashboardPanel>
        </div>
      </div>

      <DashboardPanel
        title="Phase 1 admin lanes"
        description="Quick links into the core systems we are standing up first."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { href: "/admin/analytics", label: "Analytics", detail: "Funnels, trends, and activity quality." },
            { href: "/admin/ai", label: "AI Control", detail: "Model cost, failures, and fallback visibility." },
            { href: "/admin/users", label: "Users", detail: "Plans, usage, and account-level operations." },
            { href: "/admin/events", label: "Events", detail: "Live event workspaces across all hosts." },
            { href: "/admin/templates", label: "Templates", detail: "Template usage by category and design." },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-3xl border border-border bg-white/70 p-5 transition hover:border-brand/20 hover:bg-white"
            >
              <p className="text-lg font-semibold text-ink">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{item.detail}</p>
            </Link>
          ))}
        </div>
      </DashboardPanel>
    </AdminShell>
  );
}
