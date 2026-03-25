import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { ensureUserProfile } from "@/lib/auth/session";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createSupabaseServerClient();
  if (!supabase || !code) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (!error) {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      await ensureUserProfile(user);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
