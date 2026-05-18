"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { getProfile, saveProfile, updateAvatar } from "@/lib/stamps";

export default function LoginPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(getProfile());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<"google" | "email">("google");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = getProfile();
    if (p) {
      setProfile(p);
      setName(p.name);
      setEmail(p.email || "");
      setAvatarPreview(p.avatarUrl || null);
    }
  }, []);

  const handleGoogleLogin = () => {
    // TODO: 本番ではFirebase AuthまたはNextAuth.jsでGoogle OAuth実装
    // デモ: 名前入力で代替
    if (!name.trim()) return;
    const p = saveProfile(name.trim(), email || undefined);
    if (avatarPreview) updateAvatar(avatarPreview);
    setProfile(p);
    router.push("/stamp");
  };

  const handleEmailLogin = () => {
    if (!name.trim() || !email.trim()) return;
    const p = saveProfile(name.trim(), email.trim());
    if (avatarPreview) updateAvatar(avatarPreview);
    setProfile(p);
    router.push("/stamp");
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setAvatarPreview(url);
      if (profile) updateAvatar(url);
    };
    reader.readAsDataURL(file);
  };

  // ログイン済み → プロフィール編集画面
  if (profile) {
    return (
      <>
        <Nav />
        <div className="pt-28 pb-24 bg-cream min-h-screen">
          <div className="max-w-sm mx-auto px-6">
            <h1 className="font-[Klee_One] text-xl text-brown font-semibold mb-6 text-center">マイページ</h1>

            {/* アバター */}
            <div className="text-center mb-6">
              <label className="cursor-pointer inline-block">
                <div className="w-20 h-20 rounded-full mx-auto bg-white border-2 border-brown/10 flex items-center justify-center overflow-hidden hover:border-gold transition">
                  {avatarPreview || profile.avatarUrl ? (
                    <img src={avatarPreview || profile.avatarUrl} alt="アバター"
                      className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🌻</span>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                <span className="text-[10px] text-brown-light mt-2 block">タップしてアイコンを変更</span>
              </label>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-brown/6 mb-4">
              <label className="block mb-3">
                <span className="text-xs text-brown-mid font-[Klee_One]">ニックネーム</span>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-brown/15 text-sm text-brown focus:outline-none focus:border-gold" />
              </label>
              <label className="block mb-4">
                <span className="text-xs text-brown-mid font-[Klee_One]">メールアドレス</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="任意"
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-brown/15 text-sm text-brown focus:outline-none focus:border-gold" />
              </label>
              <button onClick={() => {
                if (name.trim()) {
                  saveProfile(name.trim(), email || undefined);
                  if (avatarPreview) updateAvatar(avatarPreview);
                  router.push("/stamp");
                }
              }}
                className="w-full py-3 rounded-xl bg-brown text-cream text-sm font-semibold hover:bg-brown/90 transition">
                保存してマイスタンプへ
              </button>
            </div>

            <p className="text-[10px] text-brown-light text-center">
              ※ アイコンは自分だけに表示されます。公開はされません。
            </p>
          </div>
        </div>
      </>
    );
  }

  // 未ログイン → ログイン画面
  return (
    <>
      <Nav />
      <div className="pt-28 pb-24 bg-cream min-h-screen">
        <div className="max-w-sm mx-auto px-6">

          <div className="text-center mb-6">
            <span className="text-5xl block mb-3">🌻</span>
            <h1 className="font-[Klee_One] text-xl text-brown font-semibold mb-2">ログイン</h1>
            <p className="text-sm text-brown-mid">
              スタンプの取得状況を記録するために<br />アカウントを作成してください
            </p>
          </div>

          {/* タブ切り替え */}
          <div className="flex bg-white rounded-xl p-1 border border-brown/6 mb-5">
            <button onClick={() => setTab("google")}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition ${
                tab === "google" ? "bg-brown text-cream" : "text-brown-mid"}`}>
              Googleで登録
            </button>
            <button onClick={() => setTab("email")}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition ${
                tab === "email" ? "bg-brown text-cream" : "text-brown-mid"}`}>
              メールアドレスで登録
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-brown/6">

            {/* アバター設定（共通） */}
            <div className="text-center mb-5">
              <label className="cursor-pointer inline-block">
                <div className="w-16 h-16 rounded-full mx-auto bg-cream border-2 border-dashed border-brown/15 flex items-center justify-center overflow-hidden hover:border-gold transition">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="アバター" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">📷</span>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                <span className="text-[10px] text-brown-light mt-1.5 block">アイコンを設定（任意）</span>
              </label>
            </div>

            {tab === "google" ? (
              <>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="ニックネーム（例：たけし）"
                  className="w-full px-4 py-3 rounded-xl border border-brown/15 text-sm text-brown mb-3 focus:outline-none focus:border-gold"
                  onKeyDown={e => e.key === "Enter" && handleGoogleLogin()} />
                <button onClick={handleGoogleLogin} disabled={!name.trim()}
                  className="w-full py-3.5 rounded-xl bg-white border border-brown/15 text-sm font-semibold text-brown flex items-center justify-center gap-2 hover:bg-cream transition disabled:opacity-40 mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Googleアカウントで登録
                </button>
                <p className="text-[10px] text-brown-light text-center">
                  ※ デモ版: ニックネームの入力のみで登録できます<br />
                  本番ではGoogleアカウントで認証します
                </p>
              </>
            ) : (
              <>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="ニックネーム（例：たけし）"
                  className="w-full px-4 py-3 rounded-xl border border-brown/15 text-sm text-brown mb-3 focus:outline-none focus:border-gold" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="メールアドレス"
                  className="w-full px-4 py-3 rounded-xl border border-brown/15 text-sm text-brown mb-3 focus:outline-none focus:border-gold"
                  onKeyDown={e => e.key === "Enter" && handleEmailLogin()} />
                <button onClick={handleEmailLogin} disabled={!name.trim() || !email.trim()}
                  className="w-full py-3.5 rounded-xl bg-brown text-cream text-sm font-semibold hover:bg-brown/90 transition disabled:opacity-40 mb-3">
                  メールアドレスで登録
                </button>
                <p className="text-[10px] text-brown-light text-center">
                  Googleアカウントをお持ちでない方はこちら
                </p>
              </>
            )}
          </div>

          <p className="text-[10px] text-brown-light text-center mt-4">
            ※ アイコンは自分だけに表示されます。公開はされません。
          </p>
        </div>
      </div>
    </>
  );
}
