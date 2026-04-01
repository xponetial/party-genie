import { NextResponse } from "next/server";
import { getAiUsageForUser } from "@/lib/ai/usage";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, message: "You must be signed in." }, { status: 401 });
  }

  const usage = await getAiUsageForUser(supabase, user.id);

  return NextResponse.json({
    ok: true,
    usage,
  });
}
