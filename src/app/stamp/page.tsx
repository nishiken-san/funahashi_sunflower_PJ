"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { STAMPS, BASIC_STAMPS, BONUS_STAMPS, GROWTH_STAGES, REWARDS } from "@/config/contract";
import type { StampDef } from "@/config/contract";
import {
  getSession, fetchProfile, fetchStamps, hasStampInList, getBasicCountFromList,
  getPhotoUrl, signOut, syncGoogleAvatar,
} from "@/lib/stamps";
import type { UserProfile, StampRecord } from "@/lib/stamps";
import PhotoModal from "@/components/PhotoModal";

// ===== 現在の成長ステージを計算 =====
// 月ごとの基準 + ボーナススタンプで段階アップ
function getCurrentGrowthStage(stamps: StampRecord[]): number {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12

  let stage = 0; // 種
  if (month >= 6) stage = 1; // 6月: 芽
  if (month >= 7) stage = 2; // 7月: 葉
  if (month >= 8) stage = 3; // 8月: つぼみ
  if (month >= 9) stage = 4; // 9月以降: 開花

  // ボーナススタンプで成長促進（1個ごとに+1段階）
  const bonusTypes = new Set(BONUS_STAMPS.map(s => s.type));
  const bonusCount = stamps.filter(s => bonusTypes.has(s.type)).length;
  return Math.min(GROWTH_STAGES.length - 1, stage + bonusCount);
}

export default function StampPage() {
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);
  const [stamps, setStamps] = useState<StampRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // セッション確認を最初に行う
        const session = await getSession();
        if (!session) {
          setProfile(null);
          return;
        }
        // Googleアバター同期（失敗しても続行）
        await syncGoogleAvatar().catch(() => null);
        // プロフィールとスタンプを独立して取得（片方が失敗しても両方表示）
        const [p, s] = await Promise.all([
          fetchProfile().catch(() => null),
          fetchStamps().catch(() => []),
        ]);
        setProfile(p);
        setStamps(s ?? []);
      } catch {
        setProfile(null);
      } finally {
        setMounted(true);
      }
    };
    init();
  }, []);

  // ローディング中はスピナー表示（null返却だと何も見えない）
  if (!mounted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <span className="text-4xl animate-pulse">🌻</span>
      </div>
    );
  }

  const basicCount = getBasicCountFromList(stamps);
  const totalCount = stamps.length;
  const isComplete = basicCount >= 4;
  const photoStamps = stamps.filter(s => s.photo_path);
  const ninketStamp = BONUS_STAMPS.find(s => s.type === "ninket");
  const ninketRecord = stamps.find(s => s.type === "ninket");

  // ===== 未ログイン → プレビュー =====
  if (!profile) {
    return (
      <>
        <Nav />
        <div className="pt-28 pb-24 bg-cream min-h-screen">
          <div className="max-w-md md:max-w-2xl mx-auto px-6">
            <h1 className="font-[Klee_One] text-xl text-brown font-semibold mb-2 text-center">スタンプラリー</h1>
            <p className="text-sm text-brown-mid mb-6 text-center">イベントに参加してスタンプを集めよう</p>

            <div className="bg-white rounded-2xl p-4 border border-brown/6 mb-5 text-center">
              <p className="text-xs text-brown-light font-[Klee_One] mb-1">参加状況</p>
              <p className="text-2xl font-bold text-brown font-[Klee_One]">🌻 準備中</p>
              <p className="text-[10px] text-brown-light mt-1">イベント開始後、参加者数が表示されます</p>
            </div>

            <h3 className="font-[Klee_One] text-sm text-brown font-semibold mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-gold inline-block" /> 基本スタンプ
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {BASIC_STAMPS.map(s => (
                <div key={s.type} className="rounded-2xl p-4 text-center border-2 border-dashed border-brown/12 bg-white">
                  <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-2xl mb-2 bg-brown/5">{s.icon}</div>
                  <p className="font-[Klee_One] text-xs text-brown-mid font-semibold">{s.name}</p>
                  <p className="text-[10px] text-brown-light mt-0.5">{s.month}</p>
                </div>
              ))}
            </div>

            <h3 className="font-[Klee_One] text-sm text-brown font-semibold mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-green inline-block" /> ボーナススタンプ
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {BONUS_STAMPS.map(s => (
                <div key={s.type} className="rounded-2xl p-4 text-center border-2 border-dashed border-brown/12 bg-white">
                  <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-2xl mb-2 bg-brown/5">{s.icon}</div>
                  <p className="font-[Klee_One] text-xs text-brown-mid font-semibold">{s.name}</p>
                  <p className="text-[10px] text-brown-light mt-0.5">{s.month}</p>
                  <span className="inline-block mt-1 text-[9px] text-gold bg-gold-pale px-1.5 py-0.5 rounded-full">ボーナス</span>
                </div>
              ))}
            </div>

            <Link
              href="/login"
              className="block w-full text-center py-3.5 rounded-xl bg-brown text-cream text-sm font-semibold hover:bg-brown/90 transition mb-4"
            >
              ログインしてスタンプを集める
            </Link>

            <div className="bg-white rounded-2xl p-5 border border-brown/6">
              <p className="font-[Klee_One] text-sm text-brown mb-3">スタンプの取得方法</p>
              <div className="space-y-2.5 text-xs text-brown-mid">
                <div className="flex gap-3 items-start"><span className="text-base mt-0.5">📱</span><span>イベント会場のQRコードをスマホで読み取る</span></div>
                <div className="flex gap-3 items-start"><span className="text-base mt-0.5">📸</span><span>ひまわりや畑の写真を撮る（顔以外）</span></div>
                <div className="flex gap-3 items-start"><span className="text-base mt-0.5">🌻</span><span>スタンプ取得！マイページに記録されます</span></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ===== ログイン済み =====
  return (
    <>
      <Nav />
      <div className="pt-28 pb-16 bg-cream min-h-screen">
        <div className="max-w-md md:max-w-2xl mx-auto px-6">

          {/* オーナーカード */}
          <div className="bg-gradient-to-br from-cream-dark via-[#ede0c0] to-gold-pale rounded-2xl p-5 mb-5 relative shadow-sm border border-brown/6 overflow-hidden">
            {/* 背景のリーリー（薄く） */}
            <img
              src="/lily.png"
              alt=""
              className="absolute -right-4 -bottom-6 w-24 h-24 opacity-15 pointer-events-none select-none"
              aria-hidden
            />
            <div className="relative flex items-center gap-3">
              <Link href="/login" className="w-14 h-14 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-brown/10 hover:border-gold transition shrink-0 shadow-sm">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🌻</span>
                )}
              </Link>
              <div>
                {/* オーナー制度に関する表記は一時非表示 */}
                <p className="text-[10px] text-gold font-[Klee_One] font-semibold tracking-wider">PARTICIPANT 2026</p>
                <h2 className="font-[Klee_One] text-lg text-brown font-semibold leading-tight">
                  {profile.name || "名前未設定"}
                </h2>
                <p className="text-[11px] text-brown-light">サンフラワープロジェクト参加者</p>
              </div>
            </div>
            {!profile.name && (
              <Link href="/login" className="absolute top-4 right-4 text-[10px] bg-gold text-brown px-2.5 py-1 rounded-full font-semibold shadow-sm hover:shadow z-10">
                名前を設定する
              </Link>
            )}
            {isComplete && profile.name && (
              <div className="absolute top-4 right-4 bg-gold text-brown text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm z-10">
                🎉 コンプリート
              </div>
            )}
          </div>

          {/* 基本スタンプ */}
          <h3 className="font-[Klee_One] text-sm text-brown font-semibold mb-3 flex items-center gap-2">
            <span className="w-5 h-0.5 bg-gold inline-block" /> 基本スタンプ
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {BASIC_STAMPS.map(s => (
              <StampSlot key={s.type} stamp={s} record={stamps.find(r => r.type === s.type)} />
            ))}
          </div>
          <div className="mb-6">
            <div className="bg-brown/8 rounded-full h-2 overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-green transition-all duration-500"
                style={{ width: `${(basicCount / 4) * 100}%` }}
              />
            </div>
            <p className="text-xs text-brown-light font-[Klee_One] text-right">{basicCount} / 4</p>
          </div>

          {/* ボーナススタンプ */}
          <h3 className="font-[Klee_One] text-sm text-brown font-semibold mb-3 flex items-center gap-2">
            <span className="w-5 h-0.5 bg-green inline-block" /> ボーナススタンプ
          </h3>
          <div className={`grid grid-cols-2 gap-3 ${ninketRecord ? "mb-3" : "mb-6"}`}>
            {BONUS_STAMPS.map(s => (
              <StampSlot key={s.type} stamp={s} record={stamps.find(r => r.type === s.type)} />
            ))}
          </div>
          {ninketStamp && ninketRecord && (
            <div className="bg-green/10 border border-green/20 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm shrink-0">
                {ninketStamp.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-[Klee_One] text-xs text-green font-semibold">
                  {ninketStamp.name}スタンプ取得済み
                </p>
                <p className="text-[10px] text-brown-light">
                  {new Date(ninketRecord.acquired_at).toLocaleDateString("ja-JP", {
                    year: "numeric", month: "long", day: "numeric",
                  })} にブース来場を記録しました
                </p>
              </div>
              <span className="text-[10px] text-green bg-white px-2 py-1 rounded-full shrink-0">取得済</span>
            </div>
          )}

          {/* ===== フォトアルバム ===== */}
          {photoStamps.length > 0 && (
            <div className="bg-white rounded-2xl p-5 mb-6 border border-brown/6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-[Klee_One] text-sm text-brown font-semibold flex items-center gap-2">
                  <span className="w-5 h-0.5 bg-gold inline-block" /> フォトアルバム
                </h3>
                <span className="text-[11px] text-brown-light">{photoStamps.length}枚</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {photoStamps.map(s => (
                  <AlbumPhoto key={s.id} record={s} />
                ))}
              </div>
            </div>
          )}

          {/* ===== スタンプ履歴 ===== */}
          <div className="bg-white rounded-2xl p-5 mb-6 border border-brown/6">
            <h3 className="font-[Klee_One] text-sm text-brown font-semibold mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-brown/20 inline-block" /> 取得履歴
            </h3>
            {stamps.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-brown-light">まだスタンプがありません</p>
                <p className="text-[10px] text-brown-light mt-1">イベントに参加してスタンプを集めましょう</p>
              </div>
            ) : (
              <div className="space-y-0">
                {[...stamps]
                  .sort((a, b) => new Date(b.acquired_at).getTime() - new Date(a.acquired_at).getTime())
                  .map((s, i, arr) => {
                    const def = STAMPS.find(d => d.type === s.type);
                    return (
                      <div
                        key={s.id}
                        className={`flex items-center gap-3 py-3 ${i < arr.length - 1 ? "border-b border-brown/6" : ""}`}
                      >
                        <div className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-lg shrink-0">
                          {def?.icon ?? "🌻"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-brown font-semibold font-[Klee_One]">
                            {def?.name ?? s.type}スタンプ
                          </p>
                          <p className="text-[10px] text-brown-light">
                            {new Date(s.acquired_at).toLocaleDateString("ja-JP", {
                              year: "numeric", month: "long", day: "numeric",
                            })} 取得
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {s.photo_path && (
                            <span className="text-[10px] text-brown-light bg-brown/5 px-1.5 py-0.5 rounded-full">📷</span>
                          )}
                          <span className="text-[10px] text-green bg-green/10 px-1.5 py-0.5 rounded-full">取得済</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* 種まき成長ステージ（現在の段階のみ大きく表示） */}
          {hasStampInList(stamps, "seed") && (() => {
            const currentStage = getCurrentGrowthStage(stamps);
            const stage = GROWTH_STAGES[currentStage];
            const passedStages = GROWTH_STAGES.slice(0, currentStage);
            return (
              <div className="bg-gradient-to-br from-green-light/40 to-cream rounded-2xl p-6 mb-6 border border-green/20 text-center">
                <h3 className="font-[Klee_One] text-sm text-brown font-semibold mb-4">
                  🌱 あなたのひまわり
                </h3>
                {/* 現在の段階：大きく表示 */}
                <div className="inline-block bg-white rounded-full w-28 h-28 flex items-center justify-center shadow-md mb-3 border-4 border-gold/30">
                  <span className="text-6xl">{stage.icon}</span>
                </div>
                <p className="font-[Klee_One] text-base text-green font-bold mb-1">
                  「{stage.label}」のステージ
                </p>
                <p className="text-[11px] text-brown-light mb-3">
                  畑のひまわりの成長に合わせて変化します
                </p>
                {/* 通過した段階のミニ表示（あれば） */}
                {passedStages.length > 0 && (
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className="text-[10px] text-brown-light mr-1">これまで:</span>
                    {passedStages.map((g, i) => (
                      <span key={i} className="text-base opacity-60">{g.icon}</span>
                    ))}
                    <span className="text-base text-brown-light">→</span>
                    <span className="text-base">{stage.icon}</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 特典 */}
          <div className="bg-white rounded-2xl p-5 mb-6 border border-brown/6">
            <h3 className="font-[Klee_One] text-sm text-brown font-semibold mb-3">特典アンロック</h3>
            <div className="space-y-3">
              {REWARDS.map(r => {
                const unlocked = totalCount >= r.stampsRequired;
                const isComingSoon = r.comingSoon === true;
                return (
                  <div key={r.title} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 ${
                      isComingSoon ? "bg-brown/5 opacity-60" :
                      unlocked ? "bg-gold-pale" : "bg-brown/5"
                    }`}>
                      {r.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${isComingSoon ? "text-brown-light" : "text-brown"}`}>
                        {r.title}
                        {isComingSoon && (
                          <span className="ml-2 inline-block text-[9px] text-gold bg-gold-pale px-1.5 py-0.5 rounded-full align-middle">準備中</span>
                        )}
                      </p>
                      <p className="text-[10px] text-brown-light">
                        {isComingSoon
                          ? <span className="text-gold-light italic">※ 近日提供予定</span>
                          : unlocked
                            ? <span className="text-green font-semibold">✓ アンロック済み</span>
                            : `スタンプ${r.stampsRequired}つで解放`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* メニュー */}
          <div className="mb-6">
            <h3 className="font-[Klee_One] text-sm text-brown font-semibold mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-brown/20 inline-block" /> メニュー
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/field", icon: "🗺️", label: "畑マップ", sub: "準備中", subColor: "text-gold" },
                { href: "/submit", icon: "📸", label: "写真を投稿", sub: "ボーナススタンプ取得" },
                { href: "/field", icon: "📹", label: "畑ライブカメラ", sub: "準備中", subColor: "text-gold" },
                { href: "/me", icon: "🔍", label: "アカウント診断", sub: "認証状態を確認" },
                // ↓ オーナー制度に関わるため一時非表示
                // { href: "/owner", icon: "🌻", label: "オーナー情報", sub: "制度と申込" },
              ].map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="bg-white rounded-2xl p-4 border border-brown/6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <span className="text-2xl block mb-1.5">{item.icon}</span>
                  <span className="font-[Klee_One] text-xs text-brown font-semibold">{item.label}</span>
                  <span className={`block text-[10px] mt-0.5 ${item.subColor ?? "text-brown-light"}`}>{item.sub}</span>
                </Link>
              ))}
            </div>
          </div>

          <button
            onClick={async () => { await signOut(); window.location.href = "/"; }}
            className="block mx-auto text-[10px] text-brown-light underline mt-4"
          >
            ログアウト
          </button>

        </div>
      </div>
      <Footer />
    </>
  );
}

// ===== スタンプスロット =====
// 取得済み: 写真があれば大きく表示、なければアイコン大きめ表示
// 未取得: 小さめのグレーアイコン
function StampSlot({ stamp, record }: { stamp: StampDef; record?: StampRecord }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (record?.photo_path) {
      getPhotoUrl(record.photo_path).then(url => setPhotoUrl(url || null)).catch(() => null);
    }
  }, [record?.photo_path]);

  const acquired = !!record;

  // 取得済み（写真あり）: 写真を大きく主役にする ＆ タップで拡大
  if (acquired && photoUrl) {
    const acquiredAt = new Date(record!.acquired_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
    return (
      <>
        <div className="rounded-2xl overflow-hidden border-2 border-green shadow-sm bg-white">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="block w-full relative aspect-square cursor-zoom-in group"
            aria-label={`${stamp.name}の写真を拡大表示`}
          >
            <img
              src={photoUrl}
              alt={stamp.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* 拡大ヒント（ホバー時） */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="bg-white/90 text-brown text-xs px-3 py-1.5 rounded-full font-semibold">🔍 拡大</span>
            </div>
            {/* スタンプアイコンを右上にバッジ */}
            <div className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-xl ring-2 ring-green pointer-events-none">
              {stamp.icon}
            </div>
            {/* 取得済みリボン */}
            <div className="absolute top-2 left-2 bg-green text-white text-[9px] font-[Klee_One] font-semibold px-2 py-0.5 rounded-full shadow pointer-events-none">
              ✓ 取得済
            </div>
          </button>
          <div className="px-3 py-2 bg-green/5">
            <p className="font-[Klee_One] text-xs font-semibold text-green text-center">{stamp.name}</p>
            <p className="text-[10px] text-green/70 text-center mt-0.5">
              {new Date(record!.acquired_at).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}取得
            </p>
          </div>
        </div>
        {modalOpen && (
          <PhotoModal
            src={photoUrl}
            alt={stamp.name}
            caption={`${stamp.name}スタンプ・${acquiredAt}`}
            onClose={() => setModalOpen(false)}
          />
        )}
      </>
    );
  }

  // 取得済み（写真なし）: アイコン大きめ
  if (acquired) {
    return (
      <div className="rounded-2xl overflow-hidden border-2 border-green bg-green-light">
        <div className="aspect-square flex items-center justify-center bg-white relative">
          <span className="text-6xl">{stamp.icon}</span>
          <div className="absolute top-2 left-2 bg-green text-white text-[9px] font-[Klee_One] font-semibold px-2 py-0.5 rounded-full shadow">
            ✓ 取得済
          </div>
        </div>
        <div className="px-3 py-2 bg-green/5">
          <p className="font-[Klee_One] text-xs font-semibold text-green text-center">{stamp.name}</p>
          <p className="text-[10px] text-green/70 text-center mt-0.5">
            {new Date(record!.acquired_at).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}取得
          </p>
        </div>
      </div>
    );
  }

  // 未取得: 小さめのグレーアイコン
  return (
    <div className="rounded-2xl p-4 text-center border-2 border-dashed border-brown/15 bg-white aspect-square flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-2xl mb-2 bg-brown/5 opacity-60">
        {stamp.icon}
      </div>
      <p className="font-[Klee_One] text-xs font-semibold text-brown-mid">{stamp.name}</p>
      <p className="text-[10px] text-brown-light mt-0.5">{stamp.month}</p>
      {stamp.isBonus && (
        <span className="inline-block mt-1 text-[9px] text-gold bg-gold-pale px-1.5 py-0.5 rounded-full">ボーナス</span>
      )}
    </div>
  );
}

// ===== フォトアルバムのサムネイル =====
// 2カラム表示で大きめ、タップで全画面拡大
function AlbumPhoto({ record }: { record: StampRecord }) {
  const [url, setUrl] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const def = STAMPS.find(d => d.type === record.type);

  useEffect(() => {
    if (record.photo_path) {
      getPhotoUrl(record.photo_path).then(u => setUrl(u || null)).catch(() => null);
    }
  }, [record.photo_path]);

  const acquiredAt = new Date(record.acquired_at).toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <>
      <button
        type="button"
        onClick={() => url && setModalOpen(true)}
        disabled={!url}
        className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-cream-dark to-cream shadow-sm border border-brown/10 group block w-full cursor-zoom-in disabled:cursor-default"
        aria-label={`${def?.name ?? ""}の写真を拡大表示`}
      >
        {url ? (
          <img
            src={url}
            alt={def?.name ?? ""}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-40">
            {def?.icon ?? "🌻"}
          </div>
        )}
        {/* ホバー時拡大アイコン */}
        {url && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-white/90 text-brown text-xs px-3 py-1.5 rounded-full font-semibold shadow">🔍 拡大</span>
          </div>
        )}
        {/* スタンプアイコンバッジ */}
        <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/95 backdrop-blur shadow-md flex items-center justify-center text-base">
          {def?.icon ?? "🌻"}
        </div>
        {/* スタンプ名と日付を下部にオーバーレイ */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-3 py-2.5 text-left">
          <p className="text-xs text-white font-[Klee_One] font-semibold leading-tight drop-shadow">
            {def?.name}
          </p>
          <p className="text-[10px] text-white/85 mt-0.5 drop-shadow">
            {new Date(record.acquired_at).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
          </p>
        </div>
      </button>
      {modalOpen && url && (
        <PhotoModal
          src={url}
          alt={def?.name ?? ""}
          caption={`${def?.name}スタンプ・${acquiredAt}`}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
