"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import {
  getSession, signInWithGoogle, signInWithEmail, signOut,
  fetchProfile, updateProfile, uploadAvatar,
} from "@/lib/stamps";
import type { UserProfile } from "@/lib/stamps";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/stamp";

  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);
  const [tab, setTab] = useState<"google" | "email">("google");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSession().then(session => {
      if (!session) { setProfile(null); return; }
      fetchProfile().then(p => {
        setProfile(p);
        if (p) { setName(p.name); setAvatarPreview(p.avatar_url || null); }
      }).catch(() => setProfile(null));
    });
  }, []);

  // ローディング中
  if (profile === undefined) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <span className="text-4xl animate-pulse">🌻</span>
      </div>
    );
  }

  // ===== ログイン済み → プロフィール編集 =====
  if (profile) {
    const handleSave = async () => {
      if (!name.trim()) return;
      setSaving(true);
      await updateProfile({ name: name.trim() }).catch(() => null);
      router.push("/stamp");
    };

    const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setAvatarPreview(URL.createObjectURL(file));
      await uploadAvatar(file);
    };

    return (
      <>
        <Nav />
        <div className="pt-28 pb-24 bg-cream min-h-screen">
          <div className="max-w-sm mx-auto px-6">
            <h1 className="font-[Klee_One] text-xl text-brown font-semibold mb-6 text-center">マイページ</h1>

            <div className="text-center mb-6">
              <label className="cursor-pointer inline-block">
                <div className="w-20 h-20 rounded-full mx-auto bg-white border-2 border-brown/10 flex items-center justify-center overflow-hidden hover:border-gold transition">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="アバター" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🌻</span>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                <span className="text-[10px] text-brown-light mt-2 block">タップしてアイコンを変更</span>
              </label>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-brown/6 mb-4">
              <label className="block mb-4">
                <span className="text-xs text-brown-mid font-[Klee_One]">ニックネーム</span>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="例：たけし"
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-brown/15 text-sm text-brown focus:outline-none focus:border-gold"
                />
              </label>
              <button
                onClick={handleSave}
                disabled={!name.trim() || saving}
                className="w-full py-3 rounded-xl bg-brown text-cream text-sm font-semibold hover:bg-brown/90 transition disabled:opacity-40"
              >
                {saving ? "保存中..." : "保存してマイスタンプへ"}
              </button>
            </div>

            <button
              onClick={async () => { await signOut(); window.location.href = "/"; }}
              className="block mx-auto text-xs text-brown-light underline"
            >
              ログアウト
            </button>
          </div>
        </div>
      </>
    );
  }

  // ===== メール送信完了画面 =====
  if (emailSent) {
    return (
      <>
        <Nav />
        <div className="pt-28 pb-24 bg-cream min-h-screen flex items-center justify-center">
          <div className="max-w-sm mx-auto px-6 text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="font-[Klee_One] text-xl text-brown font-semibold mb-3">メールを送りました</h2>
            <p className="text-sm text-brown-mid mb-2">
              <strong>{email}</strong> に<br />ログインリンクを送りました。
            </p>
            <p className="text-sm text-brown-mid mb-6">
              メールのリンクをタップしてログインしてください。
            </p>
            <button onClick={() => setEmailSent(false)} className="text-xs text-brown-light underline">
              別のメールアドレスを使う
            </button>
          </div>
        </div>
      </>
    );
  }

  // ===== 未ログイン → ログイン画面 =====
  const handleGoogleLogin = async () => {
    setError(null);
    try { await signInWithGoogle(next); }
    catch { setError("Googleログインに失敗しました"); }
  };

  const handleEmailLogin = async () => {
    if (!email.trim()) return;
    setError(null);
    try {
      await signInWithEmail(email.trim(), next);
      setEmailSent(true);
    } catch {
      setError("メールの送信に失敗しました。アドレスを確認してください。");
    }
  };

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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-xs text-red-600 text-center">
              {error}
            </div>
          )}

          <div className="flex bg-white rounded-xl p-1 border border-brown/6 mb-5">
            <button
              onClick={() => setTab("google")}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition ${tab === "google" ? "bg-brown text-cream" : "text-brown-mid"}`}
            >
              Googleで登録
            </button>
            <button
              onClick={() => setTab("email")}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition ${tab === "email" ? "bg-brown text-cream" : "text-brown-mid"}`}
            >
              メールで登録
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-brown/6">
            {tab === "google" ? (
              <>
                <p className="text-sm text-brown-mid text-center mb-5">
                  Googleアカウントでかんたん登録
                </p>
                <button
                  onClick={handleGoogleLogin}
                  className="w-full py-3.5 rounded-xl bg-white text-brown border border-brown/15 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Googleアカウントで登録
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-brown-mid text-center mb-4">
                  メールアドレスにログインリンクを送ります
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="メールアドレス"
                  className="w-full px-4 py-3 rounded-xl border border-brown/15 text-sm text-brown mb-3 focus:outline-none focus:border-gold"
                  onKeyDown={e => e.key === "Enter" && handleEmailLogin()}
                />
                <button
                  onClick={handleEmailLogin}
                  disabled={!email.trim()}
                  className="w-full py-3.5 rounded-xl bg-brown text-cream text-sm font-semibold hover:bg-brown/90 transition disabled:opacity-40"
                >
                  ログインリンクを送る
                </button>
              </>
            )}
          </div>

          <p className="text-[10px] text-brown-light text-center mt-4">
            ※ ニックネームはログイン後に設定できます
          </p>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><span className="text-4xl">🌻</span></div>}>
      <LoginInner />
    </Suspense>
  );
}
