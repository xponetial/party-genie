import { addGuestAction, deleteGuestAction, updateGuestAction } from "@/app/events/actions";
import { type GuestDetails, type InviteDetails } from "@/lib/events";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

export function GuestListCard({
  eventId,
  guests,
  invite,
}: {
  eventId: string;
  guests: GuestDetails[];
  invite: InviteDetails | null;
}) {
  const confirmedSeats = guests
    .filter((guest) => guest.status === "confirmed")
    .reduce((sum, guest) => sum + 1 + guest.plus_one_count, 0);
  const respondedCount = guests.filter((guest) => guest.status !== "pending").length;
  const rsvpRate = guests.length ? Math.round((respondedCount / guests.length) * 100) : 0;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">Guest management</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Add guests directly into Supabase and keep RSVP tracking live on the event.
            </p>
          </div>
        </div>

        <form action={addGuestAction} className="mt-6 grid gap-4 rounded-[1.75rem] bg-canvas p-5 md:grid-cols-2">
          <input type="hidden" name="eventId" value={eventId} />
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="guest-name">Guest name</Label>
            <Input id="guest-name" name="name" placeholder="Jordan Lee" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest-email">Email</Label>
            <Input id="guest-email" name="email" type="email" placeholder="guest@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest-phone">Phone</Label>
            <Input id="guest-phone" name="phone" placeholder="555-123-4567" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest-plus-one">Plus-ones</Label>
            <Input id="guest-plus-one" name="plusOneCount" type="number" min="0" defaultValue="0" />
          </div>
          <div className="md:col-span-2">
            <SubmitButton pendingLabel="Adding guest...">Add guest</SubmitButton>
          </div>
        </form>

        <div className="mt-6 grid gap-4">
          {guests.length ? (
            guests.map((guest) => (
              <div key={guest.id} className="rounded-[1.5rem] border border-border bg-white/80 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-ink">{guest.name}</p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {guest.email ?? guest.phone ?? "No contact info yet"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-ink-muted">
                    <span className="rounded-full bg-canvas px-3 py-2">{guest.status}</span>
                    <span className="rounded-full bg-canvas px-3 py-2">
                      Plus-ones: {guest.plus_one_count}
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-3xl bg-canvas px-4 py-3 text-sm text-ink-muted">
                  {invite?.is_public ? (
                    <span className="break-all text-brand">
                      {`/rsvp/${invite.public_slug}?guest=${guest.rsvp_token}`}
                    </span>
                  ) : (
                    "Enable public invite first to generate a live RSVP link."
                  )}
                </div>

                <form action={updateGuestAction} className="mt-4 grid gap-4 md:grid-cols-2">
                  <input type="hidden" name="eventId" value={eventId} />
                  <input type="hidden" name="guestId" value={guest.id} />
                  <div className="space-y-2">
                    <Label htmlFor={`guest-name-${guest.id}`}>Name</Label>
                    <Input id={`guest-name-${guest.id}`} name="name" defaultValue={guest.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`guest-status-${guest.id}`}>Status</Label>
                    <select
                      id={`guest-status-${guest.id}`}
                      name="status"
                      defaultValue={guest.status}
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`guest-email-${guest.id}`}>Email</Label>
                    <Input id={`guest-email-${guest.id}`} name="email" type="email" defaultValue={guest.email ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`guest-phone-${guest.id}`}>Phone</Label>
                    <Input id={`guest-phone-${guest.id}`} name="phone" defaultValue={guest.phone ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`guest-plus-one-${guest.id}`}>Plus-ones</Label>
                    <Input
                      id={`guest-plus-one-${guest.id}`}
                      name="plusOneCount"
                      type="number"
                      min="0"
                      defaultValue={String(guest.plus_one_count)}
                    />
                  </div>
                  <div className="flex flex-wrap items-end gap-3">
                    <SubmitButton pendingLabel="Saving guest..." variant="secondary">
                      Save guest
                    </SubmitButton>
                  </div>
                </form>

                <form action={deleteGuestAction} className="mt-3">
                  <input type="hidden" name="eventId" value={eventId} />
                  <input type="hidden" name="guestId" value={guest.id} />
                  <SubmitButton pendingLabel="Removing guest..." variant="ghost">
                    Remove guest
                  </SubmitButton>
                </form>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-border bg-white/80 p-6 text-center text-ink-muted">
              No guests yet.
            </div>
          )}
        </div>
      </Card>

      <Card className="bg-[#fffaf2]">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Guest analytics</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-white/85 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">RSVP rate</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{rsvpRate}%</p>
          </div>
          <div className="rounded-3xl bg-white/85 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Confirmed seats</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{confirmedSeats}</p>
          </div>
          <div className="rounded-3xl bg-white/85 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Recent replies</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{respondedCount}</p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {[
            "Guests added here are immediately visible on the event overview and invite screen.",
            "RLS still restricts all rows to the signed-in event owner.",
            "When the invite is public, each guest gets a live RSVP link tied to their token.",
          ].map((item) => (
            <div key={item} className="rounded-3xl border border-border bg-white/85 p-4 text-sm leading-6 text-ink-muted">
              {item}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
