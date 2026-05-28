import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabase-server";

// Supabase Auth のOAuth/マジックリンクのコールバック
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/stamp";

  if (code) {
    const supabase = await createServerComponentClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, req.url));
    }
  }

  // エラー時はログインページへ
  return NextResponse.redirect(new URL("/login?error=auth_failed", req.url));
}
