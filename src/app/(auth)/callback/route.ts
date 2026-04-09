import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sanitizeNextPath } from "@/lib/auth/urls";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const next = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.redirect(
      new URL("/login?message=Missing%20Supabase%20configuration.", request.url),
    );
  }

  const cookiesToSet: Parameters<NextResponse["cookies"]["set"]>[] = [];
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(nextCookies) {
        nextCookies.forEach(({ name, value, options }) => {
          cookiesToSet.push([name, value, options]);
        });
      },
    },
  });

  function redirectWithCookies(pathname: string) {
    const response = NextResponse.redirect(new URL(pathname, request.url));

    cookiesToSet.forEach((args) => {
      response.cookies.set(...args);
    });

    return response;
  }

  if (tokenHash && type === "email") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });

    if (error) {
      return redirectWithCookies(`/login?message=${encodeURIComponent(error.message)}`);
    }

    return redirectWithCookies(next);
  }

  if (!code) {
    return redirectWithCookies("/login?message=Missing%20auth%20code.");
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirectWithCookies(`/login?message=${encodeURIComponent(error.message)}`);
  }

  return redirectWithCookies(next);
}
