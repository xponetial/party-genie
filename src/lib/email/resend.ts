import { Resend } from "resend";

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
}

export function getResendFromEmail() {
  return process.env.RESEND_FROM_EMAIL?.trim() || "Party Swami <noreply@email.partyswami.com>";
}

export function getInviteFromEmail() {
  return getResendFromEmail();
}
