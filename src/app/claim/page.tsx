"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { STAMPS } from "@/config/contract";
import type { StampType } from "@/config/contract";
import {
  getSession, signInWithGoogle, signInWithEmail,
  fetchStamps, hasStampInList, uploadStampPhoto, claimStamp,
} from "@/lib/stamps";
import { checkLocation } from "@/lib/geo";
import type { GeoResult } from "@/lib/geo";

type Step = "loading" | "needLogin" | "alreadyHave" | "gps" | "photo" | "uploading" | "done" | "error";

function ClaimInner() {
  const params = useSearchParams();
  const eventType = (params.get("event") || "seed") as StampType;
  const stamp = STAMPS.find(s => s.type === eventType) ?? STAMPS[0];

  const [step, setStep] = useState<Step>("loading");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [geoResult, setGeoResult] = useState<GeoResult | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const claimTarget = `/claim?event=${eventType}`;

  useEffect(() => {
    getSession().then(async session => {
      if (!session) { setStep("needLogin"); return; }
      const stamps = await fetchStamps();
      if (hasStampInList(stamps, stamp.type)) {
        setStep("alreadyHave");
      } else if (stamp.requiresGPS) {
        setStep("gps");
      } else {
        setStep("photo");
      }
    }).catch(() => setStep("needLogin"));
  }, [stamp.type, stamp.requiresGPS]);

  const handleGPS = async () => {
    setGeoLoading(true);
    const result = await checkLocation();
    setGeoResult(result);
    setGeoLoading(false);
    setStep("photo");
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleClaim = async () => {
    setStep("uploading");
    try {
      let photoPath: string | undefined;
      if (photoFile) {
        const path = await uploadStampPhoto(photoFile);
        photoPath = path ?? undefined;
      }
      await claimStamp(stamp.type, {
        photoPath,
        lat: geoResult?.lat,
        lng: geoResult?.lng,
      });
      setStep("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "取得に失敗しました");
      setStep("error");
    }
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle(claimTarget);
  };

  const handleEmailLogin = async () => {
    if (!emailInput.trim()) return;
    await signInWithEmail(emailInput.trim(), claimTarget);
    setEmailSent(true);
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-6">
          <span className="text-5xl">{stamp.icon}</span>
          <h1 className="font-[Klee_One] text-xl text-brown font-semibold mt-3">{stamp.name}スタンプ</h1>
          <p className="text-xs text-brown-light mt-1">{stamp.description}</p>
        </div>

        {/* ローディング */}
        {step === "loading" && (
          <Card><div className="text-center py-4"><span className="text-3xl animate-pulse">🌻</span></div></Card>
        )}

        {/* ログインが必要 */}
        {step === "needLogin" && !emailSent && (
          <Card>
            <p className="text-sm text-brown-mid mb-5 text-center">スタンプを取得するには<br />ログインが必要です</p>
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3.5 rounded-xl bg-[#24292e] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#1a1e22] transition mb-3"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHubでログイン
            </button>
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brown/10" /></div>
              <div className="relative text-center"><span className="bg-white px-2 text-[11px] text-brown-light">または</span></div>
            </div>
            <input
              type="email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder="メールアドレス"
              className="w-full px-4 py-3 rounded-xl border border-brown/15 text-sm text-brown mb-3 focus:outline-none focus:border-gold"
              onKeyDown={e => e.key === "Enter" && handleEmailLogin()}
            />
            <button
              onClick={handleEmailLogin}
              disabled={!emailInput.trim()}
              className="w-full py-3 rounded-xl bg-brown text-cream text-sm font-semibold hover:bg-brown/90 transition disabled:opacity-40"
            >
              メールでログイン
            </button>
          </Card>
        )}

        {/* メール送信済み */}
        {step === "needLogin" && emailSent && (
          <Card>
            <div className="text-center">
              <div className="text-4xl mb-3">📧</div>
              <p className="text-sm text-brown-mid">
                <strong>{emailInput}</strong><br />にリンクを送りました。<br />メールを確認してください。
              </p>
            </div>
          </Card>
        )}

        {/* 取得済み */}
        {step === "alreadyHave" && (
          <Card>
            <div className="text-center">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-sm text-brown-mid mb-4">このスタンプは取得済みです</p>
              <Link href="/stamp" className="inline-block bg-brown text-cream px-6 py-3 rounded-xl text-sm font-semibold hover:bg-brown/90 transition">
                マイスタンプを見る →
              </Link>
            </div>
          </Card>
        )}

        {/* GPS確認 */}
        {step === "gps" && (
          <Card>
            <p className="text-sm text-brown-mid mb-4 text-center">📍 畑の近くにいることを確認します</p>
            <Btn onClick={handleGPS} disabled={geoLoading}>
              {geoLoading ? "確認中..." : "位置情報を確認する"}
            </Btn>
            <button onClick={() => setStep("photo")} className="block mx-auto mt-3 text-xs text-brown-light underline">
              スキップする
            </button>
          </Card>
        )}

        {/* 写真撮影 */}
        {step === "photo" && (
          <Card>
            {geoResult && !geoResult.ok && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-700 text-center">
                📍 畑から{geoResult.distance?.toFixed(1)}km離れているようです
              </div>
            )}
            <p className="text-sm text-brown-mid mb-4 text-center">📸 ひまわりや畑の写真を撮ろう</p>
            <p className="text-[10px] text-brown-light text-center mb-4">※ 顔が写らない構図を推奨しています</p>

            {photoPreview ? (
              <div className="mb-4">
                <img src={photoPreview} alt="撮影した写真" className="w-full rounded-xl border-2 border-green" />
                <button
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="block mx-auto mt-2 text-xs text-brown-light underline"
                >
                  撮り直す
                </button>
              </div>
            ) : (
              <label className="block w-full border-2 border-dashed border-brown/15 rounded-xl p-8 text-center cursor-pointer hover:bg-gold-pale/30 transition mb-4">
                <span className="text-3xl block mb-2">📷</span>
                <span className="text-xs text-brown-light">タップして撮影 / 選択</span>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
              </label>
            )}

            <Btn onClick={handleClaim} disabled={!photoFile}>スタンプを取得する 🌻</Btn>
            <button onClick={handleClaim} className="block mx-auto mt-2 text-[10px] text-brown-light underline">
              写真なしで取得
            </button>
          </Card>
        )}

        {/* アップロード中 */}
        {step === "uploading" && (
          <Card>
            <div className="text-center py-6">
              <div className="text-4xl mb-3 animate-bounce">🌻</div>
              <p className="text-sm text-brown-mid">記録中...</p>
            </div>
          </Card>
        )}

        {/* 取得完了 */}
        {step === "done" && (
          <Card>
            <div className="text-center">
              <div className="text-6xl mb-3 stamp-pop">{stamp.icon}</div>
              <h2 className="font-[Klee_One] text-lg text-brown font-semibold mb-2">取得しました！</h2>
              <p className="text-sm text-brown-mid mb-6">{stamp.name}スタンプを獲得しました</p>
              <Link href="/stamp" className="inline-block bg-brown text-cream px-6 py-3 rounded-xl text-sm font-semibold hover:bg-brown/90 transition">
                マイスタンプを見る →
              </Link>
            </div>
          </Card>
        )}

        {/* エラー */}
        {step === "error" && (
          <Card>
            <div className="text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-sm text-brown-mid mb-4">{errorMsg}</p>
              <button onClick={() => setStep("photo")} className="text-xs text-brown-light underline mr-4">
                もう一度試す
              </button>
              <Link href="/stamp" className="text-xs text-gold underline">
                マイスタンプへ
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

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl p-6 shadow-sm border border-brown/6">{children}</div>;
}

function Btn({ children, onClick, disabled }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3.5 rounded-xl text-sm font-semibold transition bg-brown text-cream hover:bg-brown/90 disabled:opacity-40"
    >
      {children}
    </button>
  );
}
