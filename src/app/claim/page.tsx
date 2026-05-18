"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { STAMPS, StampDef } from "@/config/contract";
import { getProfile, saveProfile, hasStamp, addStamp } from "@/lib/stamps";
import { checkLocation } from "@/lib/geo";

function ClaimInner() {
  const params = useSearchParams();
  const eventType = params.get("event") || "seed";
  const stamp = STAMPS.find(s => s.type === eventType) || STAMPS[0];

  const [step, setStep] = useState<"login" | "gps" | "photo" | "done" | "already" | "far">("login");
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const profile = getProfile();
    if (profile) {
      setName(profile.name);
      if (hasStamp(stamp.type)) {
        setStep("already");
      } else if (stamp.requiresGPS) {
        setStep("gps");
      } else {
        setStep("photo");
      }
    }
  }, [stamp.type, stamp.requiresGPS]);

  const handleLogin = () => {
    if (!name.trim()) return;
    saveProfile(name.trim());
    if (hasStamp(stamp.type)) {
      setStep("already");
    } else if (stamp.requiresGPS) {
      setStep("gps");
    } else {
      setStep("photo");
    }
  };

  const handleGPS = async () => {
    setLoading(true);
    const result = await checkLocation();
    setLoading(false);
    if (result.ok) {
      setStep("photo");
    } else {
      setDistance(result.distance || 0);
      setStep("far");
    }
  };

  const handleSkipGPS = () => setStep("photo");

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleClaim = () => {
    try {
      addStamp(stamp.type, photo || undefined);
      setStep("done");
    } catch {
      setStep("already");
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* ヘッダー */}
        <div className="text-center mb-6">
          <span className="text-5xl">{stamp.icon}</span>
          <h1 className="font-[Klee_One] text-xl text-brown font-semibold mt-3">
            {stamp.name}スタンプ
          </h1>
          <p className="text-xs text-brown-light mt-1">{stamp.description}</p>
        </div>

        {/* ===== ログイン ===== */}
        {step === "login" && (
          <Card>
            <p className="text-sm text-brown-mid mb-4 text-center">
              スタンプを取得するには<br />お名前を入力してください
            </p>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="ニックネーム（例：たけし）"
              className="w-full px-4 py-3 rounded-xl border border-brown/15 bg-white text-brown text-sm mb-3 focus:outline-none focus:border-gold"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
            <Btn onClick={handleLogin} disabled={!name.trim()}>はじめる</Btn>
            <p className="text-[10px] text-brown-light text-center mt-3">
              次回以降は自動でログインされます
            </p>
          </Card>
        )}

        {/* ===== GPS確認 ===== */}
        {step === "gps" && (
          <Card>
            <p className="text-sm text-brown-mid mb-4 text-center">
              📍 畑の近くにいることを確認します
            </p>
            <Btn onClick={handleGPS} disabled={loading}>
              {loading ? "確認中..." : "位置情報を確認する"}
            </Btn>
            <button onClick={handleSkipGPS} className="block mx-auto mt-3 text-xs text-brown-light underline">
              スキップする
            </button>
          </Card>
        )}

        {/* ===== 範囲外 ===== */}
        {step === "far" && (
          <Card>
            <p className="text-sm text-brown-mid mb-2 text-center">
              畑から{distance?.toFixed(1)}km離れているようです
            </p>
            <p className="text-xs text-brown-light mb-4 text-center">
              現地でQRコードを読み取ってください
            </p>
            <Btn onClick={() => setStep("photo")} variant="ghost">
              それでも取得する
            </Btn>
          </Card>
        )}

        {/* ===== 写真撮影 ===== */}
        {step === "photo" && (
          <Card>
            <p className="text-sm text-brown-mid mb-4 text-center">
              📸 ひまわりや畑の写真を撮ろう
            </p>
            <p className="text-[10px] text-brown-light text-center mb-4">
              ※ 顔が写らない構図を推奨しています
            </p>

            {photo ? (
              <div className="mb-4">
                <img src={photo} alt="撮影した写真" className="w-full rounded-xl border-2 border-green" />
                <button onClick={() => { setPhoto(null); if(fileRef.current) fileRef.current.value = ""; }}
                  className="block mx-auto mt-2 text-xs text-brown-light underline">
                  撮り直す
                </button>
              </div>
            ) : (
              <label className="block w-full border-2 border-dashed border-brown/15 rounded-xl p-8 text-center cursor-pointer hover:bg-gold-pale/30 transition mb-4">
                <span className="text-3xl block mb-2">📷</span>
                <span className="text-xs text-brown-light">タップして撮影 / 選択</span>
                <input ref={fileRef} type="file" accept="image/*" capture="environment"
                  className="hidden" onChange={handlePhoto} />
              </label>
            )}

            <Btn onClick={handleClaim} disabled={!photo}>
              スタンプを取得する 🌻
            </Btn>
            <button onClick={() => { handleClaim(); }}
              className="block mx-auto mt-2 text-[10px] text-brown-light underline">
              写真なしで取得
            </button>
          </Card>
        )}

        {/* ===== 取得完了 ===== */}
        {step === "done" && (
          <Card>
            <div className="text-center">
              <div className="text-6xl mb-3 stamp-pop">{stamp.icon}</div>
              <h2 className="font-[Klee_One] text-lg text-brown font-semibold mb-2">
                取得しました！
              </h2>
              <p className="text-sm text-brown-mid mb-6">
                {stamp.name}スタンプを獲得しました
              </p>
              <Link href="/stamp"
                className="inline-block bg-brown text-cream px-6 py-3 rounded-xl text-sm font-semibold hover:bg-brown/90 transition">
                マイスタンプを見る →
              </Link>
            </div>
          </Card>
        )}

        {/* ===== 取得済み ===== */}
        {step === "already" && (
          <Card>
            <div className="text-center">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-sm text-brown-mid mb-4">
                このスタンプは取得済みです
              </p>
              <Link href="/stamp"
                className="inline-block bg-brown text-cream px-6 py-3 rounded-xl text-sm font-semibold hover:bg-brown/90 transition">
                マイスタンプを見る →
              </Link>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><span className="text-4xl">🌻</span></div>}>
      <ClaimInner />
    </Suspense>
  );
}

// --- UI parts ---
function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl p-6 shadow-sm border border-brown/6">{children}</div>;
}

function Btn({ children, onClick, disabled, variant = "primary" }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; variant?: "primary" | "ghost";
}) {
  const base = "w-full py-3.5 rounded-xl text-sm font-semibold transition";
  const styles = variant === "primary"
    ? `${base} bg-brown text-cream hover:bg-brown/90 disabled:opacity-40`
    : `${base} bg-transparent text-brown-mid border border-brown/15 hover:bg-cream`;
  return <button onClick={onClick} disabled={disabled} className={styles}>{children}</button>;
}
