import { NextResponse } from "next/server";
import { z } from "zod";
import { generatePlanForEvent } from "@/lib/ai/workflows";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  eventId: z.string().uuid(),
  forceRegenerate: z.boolean().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Invalid AI plan payload.",
      },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, message: "You must be signed in." }, { status: 401 });
  }

  try {
    const plan = await generatePlanForEvent(supabase, parsed.data.eventId, {
      forceRegenerate: parsed.data.forceRegenerate ?? false,
    });
    return NextResponse.json({ ok: true, plan });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to generate plan.",
      },
      { status: 400 },
    );
  }
}
