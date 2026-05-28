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
              GitHubで登録
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
                  GitHubアカウントでかんたん登録
                </p>
                <button
                  onClick={handleGoogleLogin}
                  className="w-full py-3.5 rounded-xl bg-[#24292e] text-white border border-[#24292e] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#1a1e22] transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  GitHubアカウントで登録
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
