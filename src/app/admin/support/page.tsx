import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { Button } from "@/components/ui/button";
import { formatAdminDateTime, getAdminSupportData, requireAdminAccess } from "@/lib/admin";

export default async function AdminSupportPage() {
  const [{ profile }, support] = await Promise.all([
    requireAdminAccess(),
    getAdminSupportData(),
  ]);

  return (
    <AdminShell
      currentSection="/admin/support"
      title="Support workflows"
      description="A support-oriented view of admin notes, risky users, and risky events that may need intervention."
      adminName={profile?.full_name}
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {[
          { label: "Recent notes", value: String(support.noteCount) },
          { label: "Users needing review", value: String(support.riskyUsers.length) },
          { label: "Events needing review", value: String(support.riskyEvents.length) },
        ].map((item) => (
          <div key={item.label} className="rounded-[2rem] border border-white/75 bg-canvas p-6 shadow-party">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <DashboardPanel
          title="Recent admin notes"
          description="Internal notes from event and user detail pages."
        >
          <div className="space-y-3">
            {support.recentNotes.length ? (
              support.recentNotes.map((note) => (
                <div key={note.id} className="rounded-2xl border border-border bg-white/70 px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-canvas px-3 py-1 text-xs uppercase tracking-[0.16em] text-ink-muted">
                          {note.scopeType}
                        </span>
                        <p className="text-sm font-semibold text-ink">{note.scopeId}</p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-ink-muted">{note.note}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-ink-muted">
                        {note.createdByName ?? note.createdByEmail ?? "Admin operator"}
                      </p>
                    </div>
                    <p className="text-sm text-ink-muted">{formatAdminDateTime(note.createdAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl bg-canvas px-4 py-5 text-sm text-ink-muted">
                No admin notes have been added yet.
              </div>
            )}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Support operating model"
          description="Use these pages as the default support motion before we build a fuller ticketing system."
        >
          <div className="space-y-3">
            {[
              "Start with risky users when AI failures or support costs are climbing.",
              "Open risky events when invite delivery, RSVP flow, or shopping behavior looks off.",
              "Capture context in notes so future admins do not have to reconstruct the same issue.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-border bg-white/70 px-4 py-4 text-sm leading-6 text-ink-muted">
                {item}
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardPanel
          title="Users needing attention"
          description="Accounts with recent AI failures that likely need investigation or communication."
        >
          <div className="space-y-3">
            {support.riskyUsers.length ? (
              support.riskyUsers.map((entry) => (
                <div key={entry.user.id} className="rounded-2xl border border-border bg-white/70 px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink">{entry.user.fullName ?? entry.user.email ?? entry.user.id}</p>
                      <p className="mt-1 text-sm text-ink-muted">
                        {entry.user.email ?? "No email"} | {entry.failureCount} AI failures
                      </p>
                    </div>
                    <Button asChild variant="secondary">
                      <Link href={`/admin/users/${entry.user.id}`}>
                        Open user
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl bg-canvas px-4 py-5 text-sm text-ink-muted">
                No user accounts are currently bubbling up into the support view.
              </div>
            )}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Events needing attention"
          description="Event workspaces with AI failures or substantial delivery activity that may need a closer look."
        >
          <div className="space-y-3">
            {support.riskyEvents.length ? (
              support.riskyEvents.map((entry) => (
                <div key={entry.event.id} className="rounded-2xl border border-border bg-white/70 px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink">{entry.event.title}</p>
                      <p className="mt-1 text-sm text-ink-muted">
                        {entry.aiFailureCount} AI failures | {entry.deliveryCount} tracked sends
                      </p>
                    </div>
                    <Button asChild variant="secondary">
                      <Link href={`/admin/events/${entry.event.id}`}>
                        Open event
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl bg-canvas px-4 py-5 text-sm text-ink-muted">
                No events are currently bubbling up into the support view.
              </div>
            )}
          </div>
        </DashboardPanel>
      </div>
    </AdminShell>
  );
}
