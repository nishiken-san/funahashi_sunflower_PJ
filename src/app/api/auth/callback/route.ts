import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// Supabase Auth の OAuth / マジックリンク コールバック
// 重要: response.cookies.set() でセッションCookieを直接セットする必要がある。
// cookies()経由でsetしても NextResponse.redirect() のレスポンスには乗らない。
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/stamp";

  console.log("[auth/callback] start", {
    hasCode: !!code,
    origin,
    next,
    errorParam,
    errorDescription,
    cookieNames: req.cookies.getAll().map(c => c.name),
  });

  // OAuth プロバイダがエラーで戻ってきた場合
  if (errorParam) {
    console.error("[auth/callback] OAuth provider error:", errorParam, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=oauth&desc=${encodeURIComponent(errorDescription ?? errorParam)}`
    );
  }

  // オープンリダイレクト対策: /始まりのパスのみ許可
  const safeNext = next.startsWith("/") ? next : "/stamp";

  if (code) {
    // リダイレクトレスポンスを先に作成し、CookieをそのResponseに直接セット
    const response = NextResponse.redirect(`${origin}${safeNext}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log("[auth/callback] success", {
        userId: data.user?.id,
        email: data.user?.email,
        provider: data.user?.app_metadata?.provider,
        redirectTo: `${origin}${safeNext}`,
      });
      return response;
    }

    console.error("[auth/callback] exchangeCodeForSession error:", error.message, error);
    return NextResponse.redirect(
      `${origin}/login?error=exchange&desc=${encodeURIComponent(error.message)}`
    );
  }

  console.warn("[auth/callback] no code in URL");
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
