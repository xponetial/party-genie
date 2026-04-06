import type { ReactNode } from "react";
import { CalendarRange, Clock3, CopyPlus, FileClock, Megaphone, RefreshCcw, Rocket, Send, Sparkles, Trash2 } from "lucide-react";
import {
  archiveSocialMediaCampaignAction,
  bulkUpdateSocialMediaCampaignContentStatusAction,
  createSocialMediaCampaignAction,
  createSocialMediaContentItemAction,
  deleteSocialMediaCampaignAction,
  duplicateSocialMediaCampaignAction,
  generateSocialMediaCampaignAction,
  regenerateSocialMediaCampaignAction,
  regenerateSocialMediaContentItemAction,
  updateSocialMediaBrandProfileAction,
  updateSocialMediaCampaignStatusAction,
  updateSocialMediaContentItemAction,
  updateSocialMediaContentStatusAction,
} from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { DashboardMetricCard } from "@/components/dashboard/dashboard-metric-card";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatAdminCurrency, formatAdminDateTime, getAdminSocialMediaData, requireAdminAccess } from "@/lib/admin";

const textAreaClass =
  "min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-brand/50 focus:ring-4 focus:ring-brand/10";

const statusLabel: Record<string, string> = { draft: "Draft", in_review: "In review", approved: "Approved", scheduled: "Scheduled", published: "Published", archived: "Archived" };
const channelLabel: Record<string, string> = { tiktok: "TikTok", pinterest: "Pinterest", instagram: "Instagram", email: "Email", landing_page: "Landing page" };

function Badge({ status }: { status: string }) {
  const className =
    status === "published" ? "bg-accent-soft text-accent" :
    status === "approved" ? "bg-[rgba(23,184,255,0.14)] text-brand" :
    status === "scheduled" ? "bg-[rgba(255,191,71,0.22)] text-ink" :
    status === "archived" ? "bg-white text-ink-muted" :
    "bg-canvas text-ink-muted";
  return <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${className}`}>{statusLabel[status] ?? status}</span>;
}

function Surface({ children }: { children: ReactNode }) {
  return <div className="rounded-3xl border border-border bg-white/70 p-5">{children}</div>;
}

export default async function AdminSocialMediaPage() {
  const [{ profile }, social] = await Promise.all([requireAdminAccess(), getAdminSocialMediaData()]);
  const activeCampaigns = social.campaigns.filter((campaign) => campaign.status !== "archived");
  const activeItems = social.contentItems.filter((item) => item.status !== "archived");
  const archivedCampaigns = social.campaigns.filter((campaign) => campaign.status === "archived");

  return (
    <AdminShell
      currentSection="/admin/social-media"
      title="Social media AI studio"
      description="Generate campaigns from a theme, edit drafts, manage assets, schedule content, and run the review workflow from one admin surface."
      adminName={profile?.full_name}
    >
      <div className="grid gap-4 xl:grid-cols-4">
        <DashboardMetricCard detail="Active campaigns." icon={Megaphone} label="Campaigns" value={String(social.metrics.campaigns)} />
        <DashboardMetricCard detail="Drafts across active campaigns." icon={FileClock} label="Content items" value={String(social.metrics.contentItems)} />
        <DashboardMetricCard detail="Waiting for review." icon={Clock3} label="Approval queue" value={String(social.metrics.approvalQueue)} />
        <DashboardMetricCard detail="Archived campaigns." icon={Trash2} label="Archived" value={String(social.metrics.archivedCampaigns)} />
        <DashboardMetricCard detail="Scheduled on the calendar." icon={CalendarRange} label="Scheduled" value={String(social.metrics.scheduledItems)} />
        <DashboardMetricCard detail="Ready or already out." icon={Send} label="Published" value={String(social.metrics.publishedItems)} />
        <DashboardMetricCard detail="Tracked AI social requests." icon={Sparkles} label="AI requests" value={String(social.analytics.aiGenerations.requests)} />
        <DashboardMetricCard detail="Current weekly target." icon={Rocket} label="Posts/week goal" value={String(social.metrics.postingGoalPerWeek)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardPanel title="Brand voice" description="The tone system all generated social drafts should follow.">
          <form action={updateSocialMediaBrandProfileAction} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2"><Label htmlFor="tone">Tone</Label><textarea className={textAreaClass} defaultValue={social.brandProfile.tone} id="tone" name="tone" required /></div>
              <div className="grid gap-2"><Label htmlFor="audience">Audience</Label><textarea className={textAreaClass} defaultValue={social.brandProfile.audience} id="audience" name="audience" required /></div>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_180px]">
              <div className="grid gap-2"><Label htmlFor="signaturePhrases">Signature phrases</Label><Input defaultValue={social.brandProfile.signaturePhrases} id="signaturePhrases" name="signaturePhrases" required /></div>
              <div className="grid gap-2"><Label htmlFor="ctaStyle">CTA style</Label><Input defaultValue={social.brandProfile.ctaStyle} id="ctaStyle" name="ctaStyle" required /></div>
              <div className="grid gap-2"><Label htmlFor="postingGoalPerWeek">Posts/week goal</Label><Input defaultValue={social.brandProfile.postingGoalPerWeek} id="postingGoalPerWeek" max={100} min={0} name="postingGoalPerWeek" required type="number" /></div>
            </div>
            <div className="grid gap-2"><Label htmlFor="focusMetrics">Focus metrics</Label><Input defaultValue={social.brandProfile.focusMetrics} id="focusMetrics" name="focusMetrics" required /></div>
            <div className="flex flex-col gap-3 rounded-3xl bg-canvas px-4 py-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-ink-muted">{social.brandProfile.updatedByName ?? social.brandProfile.updatedByEmail ?? "Not recorded yet"} / {formatAdminDateTime(social.brandProfile.updatedAt)}</p>
              <SubmitButton pendingLabel="Saving voice..." variant="secondary">Save brand voice</SubmitButton>
            </div>
          </form>
        </DashboardPanel>

        <div className="grid gap-4">
          <DashboardPanel title="Generate from theme" description="Use AI to create a campaign plus channel drafts in one step.">
            <form action={generateSocialMediaCampaignAction} className="grid gap-4">
              <div className="grid gap-2"><Label htmlFor="generate-theme">Party theme</Label><Input id="generate-theme" name="theme" placeholder="Backyard birthday brunch with cheerful spring colors" required /></div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2"><Label htmlFor="audienceHint">Audience hint</Label><Input id="audienceHint" name="audienceHint" placeholder="Parents planning low-stress birthdays" /></div>
                <div className="grid gap-2"><Label htmlFor="objectiveHint">Objective hint</Label><Input id="objectiveHint" name="objectiveHint" placeholder="Drive saves and affiliate clicks" /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2"><Label htmlFor="generate-sourceEventType">Source event type</Label><Input id="generate-sourceEventType" name="sourceEventType" placeholder="birthday" /></div>
                <div className="grid gap-2"><Label htmlFor="generate-scheduledWeekOf">Week of</Label><Input id="generate-scheduledWeekOf" name="scheduledWeekOf" type="date" /></div>
              </div>
              <SubmitButton pendingLabel="Generating campaign..."><Sparkles className="size-4" />Generate campaign from theme</SubmitButton>
            </form>
          </DashboardPanel>

          <DashboardPanel title="Manual campaign" description="Create a campaign by hand when you want tighter control before drafting.">
            <form action={createSocialMediaCampaignAction} className="grid gap-4">
              <div className="grid gap-2"><Label htmlFor="manual-theme">Party theme</Label><Input id="manual-theme" name="theme" placeholder="Summer pool party for busy moms" required /></div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2"><Label htmlFor="campaign-audience">Audience</Label><Input id="campaign-audience" name="audience" placeholder="Parents planning easy weekend parties" required /></div>
                <div className="grid gap-2"><Label htmlFor="objective">Objective</Label><Input id="objective" name="objective" placeholder="Drive saves and shopping clicks" required /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2"><Label htmlFor="priority">Priority</Label><select className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand/50 focus:ring-4 focus:ring-brand/10" defaultValue="medium" id="priority" name="priority"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                <div className="grid gap-2"><Label htmlFor="manual-sourceEventType">Source event type</Label><Input id="manual-sourceEventType" name="sourceEventType" placeholder="birthday" /></div>
                <div className="grid gap-2"><Label htmlFor="manual-scheduledWeekOf">Week of</Label><Input id="manual-scheduledWeekOf" name="scheduledWeekOf" type="date" /></div>
              </div>
              <div className="grid gap-2"><Label htmlFor="notes">Notes</Label><textarea className={textAreaClass} id="notes" name="notes" placeholder="Include affiliate-ready tableware roundups and a quick invite CTA." /></div>
              <SubmitButton pendingLabel="Creating campaign...">Create campaign</SubmitButton>
            </form>
          </DashboardPanel>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardPanel title="Social analytics" description="Production mix, AI usage, and upcoming calendar items.">
          <div className="grid gap-3 md:grid-cols-2">
            <Surface>
              <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">AI generation</p>
              <p className="mt-3 text-sm text-ink-muted">Cost: <span className="font-semibold text-ink">{formatAdminCurrency(social.analytics.aiGenerations.estimatedCostUsd)}</span></p>
              <p className="mt-2 text-sm text-ink-muted">Avg latency: <span className="font-semibold text-ink">{social.analytics.aiGenerations.averageLatencyMs} ms</span></p>
              <p className="mt-2 text-sm text-ink-muted">Fallbacks: <span className="font-semibold text-ink">{social.analytics.aiGenerations.fallbackCount}</span></p>
            </Surface>
            <Surface>
              <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">Status mix</p>
              <div className="mt-3 space-y-2">{social.analytics.byStatus.map((item) => <div key={item.label} className="flex items-center justify-between text-sm"><span className="text-ink-muted">{statusLabel[item.label] ?? item.label}</span><span className="font-semibold text-ink">{item.count}</span></div>)}</div>
            </Surface>
            <Surface>
              <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">Channel coverage</p>
              <div className="mt-3 grid gap-2 md:grid-cols-3">{social.analytics.byChannel.map((item) => <div key={item.label} className="rounded-2xl bg-canvas px-3 py-3"><p className="text-xs uppercase tracking-[0.14em] text-ink-muted">{channelLabel[item.label] ?? item.label}</p><p className="mt-2 text-xl font-semibold text-ink">{item.count}</p></div>)}</div>
            </Surface>
            <Surface>
              <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">Calendar</p>
              <div className="mt-3 space-y-2">
                {social.calendar.length ? social.calendar.slice(0, 6).map((item) => (
                  <div key={item.id} className="rounded-2xl bg-canvas px-3 py-3">
                    <p className="font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 text-sm text-ink-muted">{item.publishOn} / {channelLabel[item.channel]}</p>
                  </div>
                )) : <p className="text-sm text-ink-muted">No scheduled items yet.</p>}
              </div>
            </Surface>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Content creator" description="Add a manual draft with asset-studio fields.">
          {activeCampaigns.length ? (
            <form action={createSocialMediaContentItemAction} className="grid gap-4">
              <div className="grid gap-2"><Label htmlFor="campaignId">Campaign</Label><select className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand/50 focus:ring-4 focus:ring-brand/10" id="campaignId" name="campaignId">{activeCampaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.theme}</option>)}</select></div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2"><Label htmlFor="channel">Channel</Label><select className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand/50 focus:ring-4 focus:ring-brand/10" defaultValue="instagram" id="channel" name="channel"><option value="tiktok">TikTok</option><option value="pinterest">Pinterest</option><option value="instagram">Instagram</option><option value="email">Email</option><option value="landing_page">Landing page</option></select></div>
                <div className="grid gap-2"><Label htmlFor="publishOn">Publish date</Label><Input id="publishOn" name="publishOn" type="date" /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2"><Label htmlFor="title">Title</Label><Input id="title" name="title" placeholder="3 backyard brunch ideas hosts can steal" required /></div>
                <div className="grid gap-2"><Label htmlFor="formatDetail">Format detail</Label><Input id="formatDetail" name="formatDetail" placeholder="Carousel, 5 slides, save-focused CTA" required /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2"><Label htmlFor="callToAction">CTA</Label><Input id="callToAction" name="callToAction" placeholder="Save this for your next party" required /></div>
                <div className="grid gap-2"><Label htmlFor="hashtags">Hashtags</Label><Input id="hashtags" name="hashtags" placeholder="#partyideas #hostingtips #partygenie" /></div>
              </div>
              <div className="grid gap-2"><Label htmlFor="visualDirection">Visual direction</Label><textarea className={textAreaClass} id="visualDirection" name="visualDirection" /></div>
              <div className="grid gap-2"><Label htmlFor="imagePrompt">Image prompt</Label><textarea className={textAreaClass} id="imagePrompt" name="imagePrompt" /></div>
              <div className="grid gap-2"><Label htmlFor="assetNotes">Asset notes</Label><textarea className={textAreaClass} id="assetNotes" name="assetNotes" /></div>
              <div className="grid gap-2"><Label htmlFor="referenceLinks">Reference links</Label><textarea className={textAreaClass} id="referenceLinks" name="referenceLinks" /></div>
              <div className="grid gap-2"><Label htmlFor="copy">Draft copy</Label><textarea className={`${textAreaClass} min-h-40`} id="copy" name="copy" required /></div>
              <SubmitButton pendingLabel="Saving draft...">Add content item</SubmitButton>
            </form>
          ) : <div className="rounded-3xl border border-border bg-canvas px-4 py-5 text-sm leading-6 text-ink-muted">Create a campaign first, then attach channel drafts here.</div>}
        </DashboardPanel>
      </div>

      <DashboardPanel title="Active campaigns" description="Regenerate, duplicate, archive, bulk-approve, bulk-schedule, or delete campaigns directly from the queue.">
        <div className="space-y-3">
          {activeCampaigns.length ? activeCampaigns.map((campaign) => (
            <Surface key={campaign.id}>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2"><p className="text-lg font-semibold text-ink">{campaign.theme}</p><Badge status={campaign.status} /><span className="rounded-full bg-canvas px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-ink-muted">{campaign.priority} priority</span></div>
                  <p className="mt-2 text-sm text-ink-muted">{campaign.audience} / {campaign.objective}</p>
                  <p className="mt-2 text-sm text-ink-muted">{campaign.scheduledWeekOf ? `Week of ${campaign.scheduledWeekOf} / ` : ""}{campaign.contentCount} content item{campaign.contentCount === 1 ? "" : "s"}</p>
                  {campaign.notes ? <p className="mt-2 text-sm leading-6 text-ink-muted">{campaign.notes}</p> : null}
                  {campaign.generationSummary ? <p className="mt-2 text-sm leading-6 text-ink">{campaign.generationSummary}</p> : null}
                </div>
                <div className="grid gap-2 rounded-3xl bg-canvas p-4 sm:grid-cols-2">
                  <form action={updateSocialMediaCampaignStatusAction}><input name="campaignId" type="hidden" value={campaign.id} /><input name="status" type="hidden" value="in_review" /><SubmitButton className="w-full justify-center" pendingLabel="Saving..." variant="secondary">Move to review</SubmitButton></form>
                  <form action={regenerateSocialMediaCampaignAction}><input name="campaignId" type="hidden" value={campaign.id} /><SubmitButton className="w-full justify-center" pendingLabel="Regenerating..." variant="secondary"><RefreshCcw className="size-4" />Regenerate</SubmitButton></form>
                  <form action={duplicateSocialMediaCampaignAction}><input name="campaignId" type="hidden" value={campaign.id} /><SubmitButton className="w-full justify-center" pendingLabel="Duplicating..." variant="secondary"><CopyPlus className="size-4" />Duplicate</SubmitButton></form>
                  <form action={bulkUpdateSocialMediaCampaignContentStatusAction}><input name="campaignId" type="hidden" value={campaign.id} /><input name="status" type="hidden" value="approved" /><SubmitButton className="w-full justify-center" pendingLabel="Approving..." variant="secondary">Approve all</SubmitButton></form>
                  <form action={bulkUpdateSocialMediaCampaignContentStatusAction}><input name="campaignId" type="hidden" value={campaign.id} /><input name="status" type="hidden" value="scheduled" /><SubmitButton className="w-full justify-center" pendingLabel="Scheduling..." variant="secondary">Schedule all</SubmitButton></form>
                  <form action={archiveSocialMediaCampaignAction}><input name="campaignId" type="hidden" value={campaign.id} /><SubmitButton className="w-full justify-center rounded-2xl border border-border bg-white text-ink shadow-none hover:bg-white" pendingLabel="Archiving..." variant="ghost">Archive</SubmitButton></form>
                  <form action={deleteSocialMediaCampaignAction} className="sm:col-span-2"><input name="campaignId" type="hidden" value={campaign.id} /><SubmitButton className="w-full justify-center rounded-2xl border border-[rgba(214,72,112,0.25)] bg-[rgba(255,255,255,0.9)] text-[#b42345] shadow-none hover:bg-[rgba(255,240,245,1)]" pendingLabel="Deleting..." variant="ghost">Delete campaign</SubmitButton></form>
                </div>
              </div>
            </Surface>
          )) : <div className="rounded-3xl border border-border bg-canvas px-4 py-5 text-sm leading-6 text-ink-muted">No active campaigns yet.</div>}
        </div>
      </DashboardPanel>

      <DashboardPanel title="Content queue" description="Every draft supports editing, asset fields, status updates, and single-item regeneration.">
        <div className="space-y-3">
          {activeItems.length ? activeItems.map((item) => (
            <details key={item.id} className="rounded-3xl border border-border bg-white/70 p-5">
              <summary className="cursor-pointer list-none">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-ink">{item.title}</p><Badge status={item.status} /><span className="rounded-full bg-canvas px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-ink-muted">{channelLabel[item.channel]}</span></div>
                    <p className="mt-2 text-sm text-ink-muted">{item.campaignTheme} / {item.formatDetail}</p>
                    <p className="mt-2 text-sm text-ink-muted">{item.publishOn ? `Publish on ${item.publishOn} / ` : ""}{formatAdminDateTime(item.updatedAt)}</p>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink-muted">{item.copy}</p>
                  </div>
                  <form action={updateSocialMediaContentStatusAction} className="grid gap-3 rounded-3xl bg-canvas p-4 sm:grid-cols-[1fr_auto]">
                    <input name="contentItemId" type="hidden" value={item.id} />
                    <select className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand/50 focus:ring-4 focus:ring-brand/10" defaultValue={item.status} name="status">
                      <option value="draft">Draft</option><option value="in_review">In review</option><option value="approved">Approved</option><option value="scheduled">Scheduled</option><option value="published">Published</option><option value="archived">Archived</option>
                    </select>
                    <SubmitButton pendingLabel="Saving..." variant="secondary">Update</SubmitButton>
                  </form>
                </div>
              </summary>

              <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_auto]">
                <form action={updateSocialMediaContentItemAction} className="grid gap-4">
                  <input name="contentItemId" type="hidden" value={item.id} />
                  <input name="status" type="hidden" value={item.status} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2"><Label htmlFor={`title-${item.id}`}>Title</Label><Input defaultValue={item.title} id={`title-${item.id}`} name="title" required /></div>
                    <div className="grid gap-2"><Label htmlFor={`format-${item.id}`}>Format detail</Label><Input defaultValue={item.formatDetail} id={`format-${item.id}`} name="formatDetail" required /></div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2"><Label htmlFor={`publish-${item.id}`}>Publish date</Label><Input defaultValue={item.publishOn ?? ""} id={`publish-${item.id}`} name="publishOn" type="date" /></div>
                    <div className="grid gap-2"><Label htmlFor={`cta-${item.id}`}>CTA</Label><Input defaultValue={item.callToAction} id={`cta-${item.id}`} name="callToAction" required /></div>
                  </div>
                  <div className="grid gap-2"><Label htmlFor={`hashtags-${item.id}`}>Hashtags</Label><Input defaultValue={item.hashtags} id={`hashtags-${item.id}`} name="hashtags" /></div>
                  <div className="grid gap-2"><Label htmlFor={`copy-${item.id}`}>Draft copy</Label><textarea className={`${textAreaClass} min-h-40`} defaultValue={item.copy} id={`copy-${item.id}`} name="copy" required /></div>
                  <div className="grid gap-2"><Label htmlFor={`visual-${item.id}`}>Visual direction</Label><textarea className={textAreaClass} defaultValue={item.visualDirection} id={`visual-${item.id}`} name="visualDirection" /></div>
                  <div className="grid gap-2"><Label htmlFor={`image-${item.id}`}>Image prompt</Label><textarea className={textAreaClass} defaultValue={item.imagePrompt} id={`image-${item.id}`} name="imagePrompt" /></div>
                  <div className="grid gap-2"><Label htmlFor={`asset-${item.id}`}>Asset notes</Label><textarea className={textAreaClass} defaultValue={item.assetNotes} id={`asset-${item.id}`} name="assetNotes" /></div>
                  <div className="grid gap-2"><Label htmlFor={`links-${item.id}`}>Reference links</Label><textarea className={textAreaClass} defaultValue={item.referenceLinks} id={`links-${item.id}`} name="referenceLinks" /></div>
                  <SubmitButton pendingLabel="Saving item..." variant="secondary">Save edits</SubmitButton>
                </form>
                <form action={regenerateSocialMediaContentItemAction}><input name="contentItemId" type="hidden" value={item.id} /><SubmitButton className="w-full justify-center" pendingLabel="Regenerating..." variant="secondary"><RefreshCcw className="size-4" />Regenerate draft</SubmitButton></form>
              </div>
            </details>
          )) : <div className="rounded-3xl border border-border bg-canvas px-4 py-5 text-sm leading-6 text-ink-muted">No social drafts yet.</div>}
        </div>
      </DashboardPanel>

      {archivedCampaigns.length ? (
        <DashboardPanel title="Archived campaigns" description="Archived work stays visible for reference without cluttering the active queue.">
          <div className="space-y-3">{archivedCampaigns.map((campaign) => <div key={campaign.id} className="rounded-2xl bg-canvas px-4 py-4"><p className="font-semibold text-ink">{campaign.theme}</p><p className="mt-1 text-sm text-ink-muted">{campaign.audience} / {campaign.objective}</p></div>)}</div>
        </DashboardPanel>
      ) : null}
    </AdminShell>
  );
}
