import {
  type EventDetails,
  type InviteDetails,
} from "@/lib/events";
import { InviteTemplateStudio } from "@/components/invite/invite-template-studio";
import { Card } from "@/components/ui/card";
import type { InviteTemplateCategory } from "@/lib/invite-template-types";

export function InvitePreviewCard({
  event,
  invite,
  templateCategories,
}: {
  event: EventDetails;
  invite: InviteDetails | null;
  templateCategories: InviteTemplateCategory[];
}) {
  return (
    <div className="grid gap-4">
      {invite ? (
        <InviteTemplateStudio categories={templateCategories} event={event} invite={invite} />
      ) : (
        <Card>
          <p className="text-sm text-ink-muted">No invite record was found for this event yet.</p>
        </Card>
      )}
    </div>
  );
}
