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
import GPSPermissionHelp from "@/components/GPSPermissionHelp";

// ステップの流れ：当日はQR読み取り→intro→login→photo→done
type Step =
  | "loading"
  | "intro"           // QR読み込み直後の歓迎・説明（未ログイン時）
  | "needLogin"       // ログインフォーム
  | "alreadyHave"     // 取得済み（撮り直し可）
  | "gps"             // 位置情報確認
  | "photo"           // 撮影
  | "uploading"       // アップロード中
  | "done"            // 完了
  | "error";          // エラー

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
  // 撮り直しモード：すでに取得済みの場合に写真だけ差し替える
  const [isRetake, setIsRetake] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const claimTarget = `/claim?event=${eventType}`;

  useEffect(() => {
    getSession().then(async session => {
      if (!session) { setStep("intro"); return; } // 未ログイン → 説明から
      const stamps = await fetchStamps();
      if (hasStampInList(stamps, stamp.type)) {
        setStep("alreadyHave");
      } else if (stamp.requiresGPS) {
        setStep("gps");
      } else {
        setStep("photo");
      }
    }).catch(() => setStep("intro"));
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
        retake: isRetake,
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

  // ステップ番号を進行状況バーで表示
  const currentStepNum =
    step === "intro" || step === "needLogin" ? 1 :
    step === "gps" || step === "photo" || step === "uploading" ? 2 :
    step === "done" ? 3 : 0;
  const showStepBar = ["intro", "needLogin", "gps", "photo", "uploading", "done"].includes(step);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-4">
          <span className="text-5xl">{stamp.icon}</span>
          <h1 className="font-[Klee_One] text-xl text-brown font-semibold mt-3">{stamp.name}スタンプ</h1>
          <p className="text-xs text-brown-light mt-1">{stamp.description}</p>
        </div>

        {/* ===== 進行状況バー（3ステップ） ===== */}
        {showStepBar && (
          <div className="mb-5">
            <div className="flex items-center justify-center gap-1.5">
              <StepDot num={1} label="ログイン" active={currentStepNum >= 1} current={currentStepNum === 1} />
              <StepLine active={currentStepNum >= 2} />
              <StepDot num={2} label="写真" active={currentStepNum >= 2} current={currentStepNum === 2} />
              <StepLine active={currentStepNum >= 3} />
              <StepDot num={3} label="完了" active={currentStepNum >= 3} current={currentStepNum === 3} />
            </div>
          </div>
        )}

        {/* ローディング */}
        {step === "loading" && (
          <Card><div className="text-center py-4"><span className="text-3xl animate-pulse">🌻</span></div></Card>
        )}

        {/* ===== Intro: QR読み込み直後の歓迎・案内 ===== */}
        {step === "intro" && (
          <Card>
            <div className="text-center">
              <p className="text-sm text-brown font-[Klee_One] font-semibold mb-3">
                ようこそ！🌻
              </p>
              <p className="text-xs text-brown-mid leading-relaxed mb-4">
                <strong>{stamp.name}スタンプ</strong>を取得します。<br />
                所要時間：約1分
              </p>

              {/* 流れの説明 */}
              <div className="bg-cream/60 rounded-xl p-3 mb-4 text-left">
                <p className="text-[11px] text-brown font-semibold mb-2 text-center">📋 これからの流れ</p>
                <ol className="space-y-1.5 text-[11px] text-brown-mid">
                  <li className="flex gap-2"><span className="text-gold font-bold">1.</span>ログインまたは新規登録</li>
                  {stamp.requiresGPS && (
                    <li className="flex gap-2"><span className="text-gold font-bold">2.</span>位置情報の確認</li>
                  )}
                  <li className="flex gap-2"><span className="text-gold font-bold">{stamp.requiresGPS ? "3" : "2"}.</span>ひまわりや畑の写真を撮影</li>
                  <li className="flex gap-2"><span className="text-gold font-bold">{stamp.requiresGPS ? "4" : "3"}.</span>スタンプを獲得 🎉</li>
                </ol>
              </div>

              <button
                onClick={() => setStep("needLogin")}
                className="w-full py-3.5 rounded-xl bg-brown text-cream text-sm font-semibold hover:bg-brown/90 transition shadow-md"
              >
                はじめる →
              </button>
              <p className="text-[10px] text-brown-light mt-3">
                ログイン情報は来年も使えます<br />
                （※スタンプはアカウントに紐づきます）
              </p>
            </div>
          </Card>
        )}

        {/* ログインが必要 */}
        {step === "needLogin" && !emailSent && (
          <Card>
            <p className="text-sm text-brown-mid mb-5 text-center">
              スタンプを取得するために<br />ログインしましょう
            </p>
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3.5 rounded-xl bg-white text-brown text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition mb-3 border border-brown/15"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Googleでログイン（最速）
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
            <button
              onClick={() => setStep("intro")}
              className="block mx-auto mt-3 text-[10px] text-brown-light underline"
            >
              ← 戻る
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
              <p className="text-[10px] text-brown-light mt-3">
                ※ 受信できない場合は迷惑メールフォルダもご確認ください
              </p>
            </div>
          </Card>
        )}

        {/* 取得済み（撮り直し可能） */}
        {step === "alreadyHave" && (
          <Card>
            <div className="text-center">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-sm text-brown-mid mb-2">
                このスタンプはすでに取得済みです
              </p>
              <p className="text-[11px] text-brown-light mb-5">
                写真を撮り直すこともできます
              </p>
              <Link
                href="/stamp"
                className="block w-full text-center bg-brown text-cream px-6 py-3 rounded-xl text-sm font-semibold hover:bg-brown/90 transition mb-2"
              >
                マイスタンプを見る →
              </Link>
              <button
                onClick={() => {
                  setIsRetake(true);
                  setStep(stamp.requiresGPS ? "gps" : "photo");
                }}
                className="block w-full text-center bg-white text-brown px-6 py-3 rounded-xl text-sm font-semibold hover:bg-cream transition border border-brown/15"
              >
                📷 写真を撮り直す
              </button>
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
            <GPSPermissionHelp />
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
            {isRetake && (
              <div className="bg-gold-pale/40 border border-gold/30 rounded-xl p-3 mb-4 text-xs text-brown text-center">
                🔄 撮り直しモードです（取得日は変わりません）
              </div>
            )}
            <p className="text-sm text-brown-mid mb-3 text-center">📸 ひまわりや畑の写真を撮ろう</p>
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

            <Btn onClick={handleClaim} disabled={!photoFile}>
              {isRetake ? "写真を更新する 📷" : "スタンプを取得する 🌻"}
            </Btn>
            {!isRetake && (
              <button onClick={handleClaim} className="block mx-auto mt-2 text-[10px] text-brown-light underline">
                写真なしで取得
              </button>
            )}
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
              <div className="relative -mt-10 mb-3">
                <img
                  src="/lily-celebrate.png"
                  alt="おめでとう！"
                  className="w-56 mx-auto stamp-pop drop-shadow-xl select-none"
                />
                <div className="absolute top-2 right-1/4 w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-3xl ring-4 ring-gold/40 stamp-pop">
                  {stamp.icon}
                </div>
              </div>
              <h2 className="font-[Klee_One] text-xl text-brown font-bold mb-1">
                {isRetake ? "更新しました！" : "取得しました！"}
              </h2>
              <p className="text-sm text-brown-mid mb-1">
                <span className="font-semibold text-green">{stamp.name}</span>
                {isRetake ? " スタンプの写真を更新しました" : " スタンプを獲得しました"}
              </p>
              <p className="text-[11px] text-brown-light mb-6">リーリーも喜んでます 🎉</p>
              <Link href="/stamp" className="inline-block bg-brown text-cream px-7 py-3 rounded-xl text-sm font-semibold hover:bg-brown/90 transition shadow-md">
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
              <p className="text-sm text-brown-mid mb-2">スタンプの取得に失敗しました</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-left">
                <p className="text-[11px] text-red-700 font-mono break-all">{errorMsg}</p>
              </div>
              <p className="text-[11px] text-brown-light mb-4 leading-relaxed">
                ※ 認証情報に問題がある場合は<Link href="/me" className="text-gold underline">診断ページ</Link>で状態を確認できます
              </p>
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

// 進行状況バーの点
function StepDot({ num, label, active, current }: {
  num: number; label: string; active: boolean; current: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition ${
        current
          ? "bg-gold text-brown ring-4 ring-gold/30 scale-110"
          : active
            ? "bg-green text-white"
            : "bg-brown/10 text-brown-light"
      }`}>
        {active && !current ? "✓" : num}
      </div>
      <span className={`text-[9px] mt-1 font-[Klee_One] ${
        current ? "text-brown font-semibold" : active ? "text-green" : "text-brown-light"
      }`}>
        {label}
      </span>
    </div>
  );
}

function StepLine({ active }: { active: boolean }) {
  return (
    <div className={`w-8 h-0.5 mt-[-14px] transition ${active ? "bg-green" : "bg-brown/15"}`} />
  );
}
