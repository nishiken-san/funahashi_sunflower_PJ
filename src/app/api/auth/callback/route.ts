import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// Supabase Auth の OAuth / マジックリンク コールバック
// 重要: response.cookies.set() でセッションCookieを直接セットする必要がある。
// cookies()経由でsetしても NextResponse.redirect() のレスポンスには乗らない。
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/stamp";

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
          // リクエストの既存Cookieを読み取る
          getAll() {
            return req.cookies.getAll();
          },
          // セッションCookieをリダイレクトレスポンスに直接書き込む
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response; // Set-Cookie ヘッダー付きでリダイレクト
    }

    console.error("[auth/callback] exchangeCodeForSession error:", error.message);
  }

  // codeなし or エラー → ログインページへ
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
