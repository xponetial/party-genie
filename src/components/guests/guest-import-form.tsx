"use client";

import { useActionState, useEffect, useRef } from "react";
import { importGuestsAction, type GuestImportActionState } from "@/app/events/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: GuestImportActionState = {};

export function GuestImportForm({ eventId }: { eventId: string }) {
  const [state, formAction] = useActionState(importGuestsAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]"
      encType="multipart/form-data"
    >
      <input type="hidden" name="eventId" value={eventId} />
      <div className="space-y-2">
        <Label htmlFor="guest-csv">Upload completed guest CSV</Label>
        <Input id="guest-csv" name="guestCsv" type="file" accept=".csv,text/csv" required />
        {state.error ? (
          <p
            className="rounded-2xl border border-brand/20 bg-brand/10 px-4 py-3 text-sm text-brand"
            aria-live="polite"
          >
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p
            className="rounded-2xl border border-accent/20 bg-accent-soft px-4 py-3 text-sm text-accent"
            aria-live="polite"
          >
            {state.success}
          </p>
        ) : null}
      </div>
      <div className="flex items-end">
        <SubmitButton pendingLabel="Importing guests...">Import guest list</SubmitButton>
      </div>
    </form>
  );
}
