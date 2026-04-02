type InviteEmailArgs = {
  eventTitle: string;
  subtitle: string;
  dateText: string;
  locationText: string;
  inviteCopy: string;
  cardImageSrc: string | null;
  guestName: string;
  rsvpUrl: string;
};

export function buildInviteEmailSubject({ eventTitle }: { eventTitle: string }) {
  return `You're invited to ${eventTitle}`;
}

export function buildInviteEmailHtml({
  eventTitle,
  subtitle,
  dateText,
  locationText,
  inviteCopy,
  cardImageSrc,
  guestName,
  rsvpUrl,
}: InviteEmailArgs) {
  const cardImageMarkup = cardImageSrc
    ? `<div style="margin: 0 0 24px;">
          <img src="${cardImageSrc}" alt="${eventTitle} invitation card" style="display: block; width: 100%; max-width: 576px; border-radius: 24px; border: 1px solid #eadfce;" />
        </div>`
    : "";

  return `
    <div style="font-family: Arial, sans-serif; background: #f7f1e8; padding: 32px; color: #302417;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 32px; border: 1px solid #eadfce;">
        <p style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #8a6d57; margin: 0 0 12px;">PartyGenie Invitation</p>
        ${cardImageMarkup}
        <h1 style="font-size: 32px; margin: 0 0 8px;">${eventTitle}</h1>
        <p style="font-size: 15px; color: #6e5744; margin: 0 0 20px;">${subtitle}</p>
        <p style="font-size: 16px; line-height: 1.7; margin: 0 0 24px;">Hi ${guestName},</p>
        <div style="background: linear-gradient(180deg, #fff7ec 0%, #f7ebda 100%); border-radius: 22px; padding: 22px 24px; margin: 0 0 24px; border: 1px solid #eadfce;">
          <p style="margin: 0 0 14px; font-size: 13px; letter-spacing: 0.16em; text-transform: uppercase; color: #8a6d57; font-weight: 700;">Invitation Details</p>
          <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.6;"><strong>When:</strong> ${dateText}</p>
          <p style="margin: 0; font-size: 14px; line-height: 1.6;"><strong>Where:</strong> ${locationText}</p>
        </div>
        <p style="font-size: 16px; line-height: 1.8; margin: 0 0 24px;">${inviteCopy}</p>
        <div style="background: #fff7ec; border-radius: 18px; padding: 18px 20px; margin: 0 0 24px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.7;">
            Please RSVP using your personal link below so the host can finalize seating, food, and celebration details.
          </p>
        </div>
        <a href="${rsvpUrl}" style="display: inline-block; background: #c96b3d; color: #ffffff; text-decoration: none; padding: 14px 22px; border-radius: 999px; font-weight: 600;">
          RSVP now
        </a>
        <p style="margin: 24px 0 0; font-size: 13px; color: #7a6a5a;">If the button doesn't work, open this link directly: ${rsvpUrl}</p>
      </div>
    </div>
  `.trim();
}
