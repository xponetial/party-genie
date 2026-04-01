"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function InviteSendButton({ eventId }: { eventId: string }) {
  const [pending, setPending] = useState(false);
  const [sendMode, setSendMode] = useState<"pending_only" | "all">("pending_only");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/invites/send", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ eventId, sendMode }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.ok) {
        setError(payload?.message ?? "Unable to send invites right now.");
        return;
      }

      setMessage(
        `${sendMode === "all" ? "Resent" : "Sent"} ${payload.summary.sentCount} invite${payload.summary.sentCount === 1 ? "" : "s"}${payload.summary.skippedCount ? `, skipped ${payload.summary.skippedCount}` : ""}.`,
      );
      window.location.reload();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.2em] text-ink-muted" htmlFor="send-mode">
          Send mode
        </label>
        <select
          id="send-mode"
          value={sendMode}
          onChange={(event) => setSendMode(event.target.value as "pending_only" | "all")}
          className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
        >
          <option value="pending_only">Send only to guests not yet contacted</option>
          <option value="all">Resend to all emailable guests</option>
        </select>
      </div>
      <Button className="w-full" disabled={pending} onClick={handleClick} type="button">
        {pending
          ? sendMode === "all"
            ? "Resending invites..."
            : "Sending invites..."
          : sendMode === "all"
            ? "Resend invite emails"
            : "Send pending invites"}
      </Button>
      {message ? <p className="text-xs text-accent">{message}</p> : null}
      {error ? <p className="text-xs text-brand">{error}</p> : null}
    </div>
  );
}
