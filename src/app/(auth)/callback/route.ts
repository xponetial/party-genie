import { NextRequest, NextResponse } from "next/server";
import { sanitizeNextPath } from "@/lib/auth/urls";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function isEmailOtpType(value: string | null): value is "email" | "signup" | "invite" | "magiclink" | "recovery" {
  return value === "email" || value === "signup" || value === "invite" || value === "magiclink" || value === "recovery";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const next = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
  const supabase = await createSupabaseServerClient();

  if (tokenHash && isEmailOtpType(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?message=${encodeURIComponent(error.message)}`, request.url),
      );
    }

    return NextResponse.redirect(new URL(next, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?message=Missing%20auth%20code.", request.url));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?message=${encodeURIComponent(error.message)}`, request.url),
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
