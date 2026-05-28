// ==================== 診断ページ ====================
// サーバー側で実際の認証・DB状態を表示する
// 管理者クライアントを使用するため RLS を無視して真の状態が見える
// （ただし表示するのは「自分のuser.id」のデータだけ）

import Link from "next/link";
import { createServerComponentClient, createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

interface StampRow {
  id: string;
  type: string;
  year: number;
  photo_path: string | null;
  acquired_at: string;
}

export default async function MePage() {
  let userId: string | null = null;
  let userEmail: string | null = null;
  let userMetadata: Record<string, unknown> = {};
  let provider: string | null = null;
  let profileExists = false;
  let profileName: string | null = null;
  let profileAvatar: string | null = null;
  let stamps: StampRow[] = [];
  let totalAuthUsers = 0;
  let totalProfiles = 0;
  let totalStamps = 0;
  let errorMsg: string | null = null;

  try {
    // セッション側の認証チェック
    const supabase = await createServerComponentClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 管理者クライアントで実データを参照
    const admin = createAdminClient();

    // 全体カウント（運営目線の参考用）
    const [{ count: aCount }, { count: pCount }, { count: sCount }] = await Promise.all([
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin.from("stamps").select("*", { count: "exact", head: true }),
    ]);
    totalProfiles = pCount ?? 0;
    totalStamps = sCount ?? 0;
    totalAuthUsers = aCount ?? 0;

    if (user) {
      userId = user.id;
      userEmail = user.email ?? null;
      userMetadata = (user.user_metadata as Record<string, unknown>) ?? {};
      provider = (user.app_metadata?.provider as string | undefined) ?? null;

      const { data: profile } = await admin
        .from("profiles")
        .select("id, name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (profile) {
        profileExists = true;
        profileName = profile.name;
        profileAvatar = profile.avatar_url;
      }

      const { data: stampsData } = await admin
        .from("stamps")
        .select("id, type, year, photo_path, acquired_at")
        .eq("user_id", user.id)
        .order("acquired_at", { ascending: false });
      stamps = stampsData ?? [];
    }
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : String(e);
  }

  const isLoggedIn = !!userId;

  return (
    <div className="min-h-screen bg-cream py-10 px-5">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-brown font-[Klee_One] mb-2">
          🔍 アカウント診断
        </h1>
        <p className="text-xs text-brown-light mb-6">
          サーバー側から実際の認証状態を確認するページです
        </p>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-bold text-red-700 mb-1">⚠️ エラー</p>
            <p className="text-xs text-red-700 break-all font-mono">{errorMsg}</p>
            <p className="text-xs text-red-700 mt-2">
              ※ Supabaseの設定（SERVICE_ROLE_KEYなど）に問題がある可能性があります
            </p>
          </div>
        )}

        {/* ===== ログイン状態 ===== */}
        <div className={`rounded-2xl p-6 mb-4 border-2 ${
          isLoggedIn ? "bg-green/10 border-green" : "bg-red-50 border-red-200"
        }`}>
          <p className="text-xs text-brown-light mb-1">ログイン状態（サーバー判定）</p>
          <p className={`text-2xl font-bold font-[Klee_One] ${
            isLoggedIn ? "text-green" : "text-red-600"
          }`}>
            {isLoggedIn ? "✅ ログイン中" : "❌ ログインしていません"}
          </p>
          {!isLoggedIn && (
            <p className="text-xs text-brown-mid mt-3">
              ※ もし「ログインしているはず」と思っていたら、それは古いブラウザ状態が残っているだけです。<br />
              下のボタンからログインしてください。
            </p>
          )}
        </div>

        {/* ===== サーバー全体の参考カウント ===== */}
        <div className="bg-white rounded-2xl p-5 mb-4 border border-brown/10">
          <p className="text-xs text-brown-mid font-semibold mb-3 font-[Klee_One]">📊 データベース全体</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-cream rounded-lg py-2">
              <p className="text-[10px] text-brown-light">登録ユーザー</p>
              <p className="text-lg font-bold text-brown">{totalAuthUsers}</p>
            </div>
            <div className="bg-cream rounded-lg py-2">
              <p className="text-[10px] text-brown-light">プロフィール</p>
              <p className="text-lg font-bold text-brown">{totalProfiles}</p>
            </div>
            <div className="bg-cream rounded-lg py-2">
              <p className="text-[10px] text-brown-light">スタンプ</p>
              <p className="text-lg font-bold text-brown">{totalStamps}</p>
            </div>
          </div>
          {totalAuthUsers === 0 && (
            <p className="text-[10px] text-amber-700 mt-3">
              ⚠️ Supabaseに登録ユーザーが0人です。Google OAuthの認証コード交換が失敗している可能性があります。
            </p>
          )}
        </div>

        {isLoggedIn && (
          <>
            {/* ===== ユーザー情報 ===== */}
            <div className="bg-white rounded-2xl p-5 mb-4 border border-brown/10">
              <p className="text-xs text-brown-mid font-semibold mb-3 font-[Klee_One]">
                👤 あなたのアカウント
              </p>
              <dl className="text-xs space-y-2">
                <div>
                  <dt className="text-[11px] text-brown-light">User ID</dt>
                  <dd className="text-brown font-mono text-[11px] break-all">{userId}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-brown-light">メールアドレス</dt>
                  <dd className="text-brown">{userEmail ?? "(なし)"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-brown-light">ログイン方法</dt>
                  <dd className="text-brown">{provider ?? "(不明)"}</dd>
                </div>
                {Object.keys(userMetadata).length > 0 && (
                  <div>
                    <dt className="text-[11px] text-brown-light">Googleから取得した情報</dt>
                    <dd className="text-[10px] text-brown-mid font-mono bg-cream rounded p-2 mt-1 break-all">
                      {JSON.stringify(userMetadata, null, 2)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* ===== プロフィール状態 ===== */}
            <div className={`rounded-2xl p-5 mb-4 border ${
              profileExists ? "bg-white border-brown/10" : "bg-amber-50 border-amber-200"
            }`}>
              <p className="text-xs text-brown-mid font-semibold mb-3 font-[Klee_One]">
                📝 プロフィール {profileExists ? "✅" : "⚠️ 未作成"}
              </p>
              {profileExists ? (
                <dl className="text-xs space-y-2">
                  <div>
                    <dt className="text-[11px] text-brown-light">名前</dt>
                    <dd className="text-brown">{profileName || "(未設定)"}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-brown-light">アバター</dt>
                    <dd className="text-brown break-all text-[11px]">{profileAvatar ?? "(なし)"}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-xs text-amber-800">
                  プロフィールがまだ作成されていません。<br />
                  「マイスタンプを見る」を押すと自動作成されます。
                </p>
              )}
            </div>

            {/* ===== スタンプ ===== */}
            <div className="bg-white rounded-2xl p-5 mb-4 border border-brown/10">
              <p className="text-xs text-brown-mid font-semibold mb-3 font-[Klee_One]">
                🌻 取得スタンプ（{stamps.length} 件）
              </p>
              {stamps.length === 0 ? (
                <p className="text-xs text-brown-light">スタンプはまだありません</p>
              ) : (
                <ul className="text-xs space-y-2">
                  {stamps.map(s => (
                    <li key={s.id} className="flex justify-between border-b border-brown/5 pb-2 last:border-0">
                      <span className="text-brown font-semibold">{s.type}（{s.year}）</span>
                      <span className="text-[10px] text-brown-light">
                        {new Date(s.acquired_at).toLocaleString("ja-JP")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {/* ===== ナビゲーション ===== */}
        <div className="flex flex-col gap-2 mt-6">
          {isLoggedIn ? (
            <>
              <Link href="/stamp" className="block text-center py-3 rounded-xl bg-brown text-cream text-sm font-semibold">
                マイスタンプを見る
              </Link>
              <Link href="/claim?event=seed" className="block text-center py-3 rounded-xl bg-white text-brown border border-brown/15 text-sm font-semibold">
                種まきスタンプを取得
              </Link>
            </>
          ) : (
            <Link href="/login" className="block text-center py-3 rounded-xl bg-brown text-cream text-sm font-semibold">
              ログイン画面へ
            </Link>
          )}
          <Link href="/" className="block text-center py-2 text-[11px] text-brown-light underline">
            トップへ戻る
          </Link>
        </div>

        <p className="text-[10px] text-brown-light text-center mt-6 leading-relaxed">
          このページは管理者権限でDBを直接参照しています。<br />
          自分以外のユーザーのデータは表示されません。
        </p>
      </div>
    </div>
  );
}
