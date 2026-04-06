export const APP_NAME = "AI Party Genie";

export const EVENT_STATUSES = ["draft", "planning", "ready", "completed"] as const;

export const ANALYTICS_EVENTS = [
  "account_created",
  "event_created",
  "ai_plan_generated",
  "invite_sent",
  "rsvp_received",
  "shopping_link_clicked",
  "shopping_pick_replaced",
  "task_completed",
] as const;
