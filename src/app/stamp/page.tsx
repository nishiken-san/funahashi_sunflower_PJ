"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { BASIC_STAMPS, BONUS_STAMPS, GROWTH_STAGES, REWARDS, StampDef } from "@/config/contract";
import { getProfile, getStamps, hasStamp, getBasicCount, getTotalCount, resetAll, StampRecord } from "@/lib/stamps";

export default function StampPage() {
  const [profile, setProfile] = useState<ReturnType<typeof getProfile>>(null);
  const [stamps, setStamps] = useState<StampRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProfile(getProfile());
    setStamps(getStamps());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const basicCount = getBasicCount();
  const totalCount = getTotalCount();
  const isComplete = basicCount >= 4;

  // 未ログイン → プレビュー表示（台紙は見える、取得はできない）
  if (!profile) {
    return (
      <>
        <Nav />
        <div className="pt-28 pb-24 bg-cream min-h-screen">
          <div className="max-w-md mx-auto px-6">
            <h1 className="font-[Klee_One] text-xl text-brown font-semibold mb-2 text-center">スタンプラリー</h1>
            <p className="text-sm text-brown-mid mb-6 text-center">
              イベントに参加してスタンプを集めよう
            </p>

            {/* 参加状況バナー */}
            <div className="bg-white rounded-2xl p-4 border border-brown/6 mb-5 text-center">
              <p className="text-xs text-brown-light font-[Klee_One] mb-1">参加状況</p>
              <p className="text-2xl font-bold text-brown font-[Klee_One]">🌻 準備中</p>
              <p className="text-[10px] text-brown-light mt-1">イベント開始後、参加者数が表示されます</p>
            </div>

            {/* スタンプ台紙プレビュー */}
            <h3 className="font-[Klee_One] text-sm text-brown font-semibold mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-gold inline-block"></span>
              基本スタンプ
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {BASIC_STAMPS.map(s => (
                <div key={s.type} className="rounded-2xl p-4 text-center border-2 border-dashed border-brown/12 bg-white">
                  <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-2xl mb-2 bg-brown/5">
                    {s.icon}
                  </div>
                  <p className="font-[Klee_One] text-xs text-brown-mid font-semibold">{s.name}</p>
                  <p className="text-[10px] text-brown-light mt-0.5">{s.month}</p>
                </div>
              ))}
            </div>

            <h3 className="font-[Klee_One] text-sm text-brown font-semibold mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-green inline-block"></span>
              ボーナススタンプ
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {BONUS_STAMPS.map(s => (
                <div key={s.type} className="rounded-2xl p-4 text-center border-2 border-dashed border-brown/12 bg-white">
                  <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-2xl mb-2 bg-brown/5">
                    {s.icon}
                  </div>
                  <p className="font-[Klee_One] text-xs text-brown-mid font-semibold">{s.name}</p>
                  <p className="text-[10px] text-brown-light mt-0.5">{s.month}</p>
                  <span className="inline-block mt-1 text-[9px] text-gold bg-gold-pale px-1.5 py-0.5 rounded-full">ボーナス</span>
                </div>
              ))}
            </div>

            {/* ログインCTA */}
            <Link href="/login"
              className="block w-full text-center py-3.5 rounded-xl bg-brown text-cream text-sm font-semibold hover:bg-brown/90 transition mb-4">
              ログインしてスタンプを集める
            </Link>

            {/* 取得方法 */}
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

  return (
    <>
      <Nav />
      <div className="pt-28 pb-16 bg-cream min-h-screen">
        <div className="max-w-md mx-auto px-6">

          {/* オーナーカード */}
          <div className="bg-gradient-to-br from-cream-dark to-[#ede0c0] rounded-2xl p-5 mb-5 relative shadow-sm border border-brown/6">
            <div className="flex items-center gap-3">
              <Link href="/login" className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-brown/10 hover:border-gold transition shrink-0">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🌻</span>
                )}
              </Link>
              <div>
                <h2 className="font-[Klee_One] text-base text-brown font-semibold">{profile.name}</h2>
                <p className="text-[11px] text-brown-light">第1期オーナー（2026）</p>
              </div>
            </div>
            {isComplete && (
              <div className="absolute top-4 right-4 bg-gold text-brown text-[10px] font-semibold px-2.5 py-1 rounded-full">
                🎉 コンプリート
              </div>
            )}
          </div>

          {/* 基本スタンプ */}
          <h3 className="font-[Klee_One] text-sm text-brown font-semibold mb-3 flex items-center gap-2">
            <span className="w-5 h-0.5 bg-gold inline-block"></span>
            基本スタンプ
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {BASIC_STAMPS.map(s => <StampSlot key={s.type} stamp={s} record={stamps.find(r => r.type === s.type)} />)}
          </div>
          <div className="mb-6">
            <div className="bg-brown/8 rounded-full h-2 overflow-hidden mb-1.5">
              <div className="h-full rounded-full bg-gradient-to-r from-gold to-green transition-all duration-500"
                style={{ width: `${(basicCount / 4) * 100}%` }} />
            </div>
            <p className="text-xs text-brown-light font-[Klee_One] text-right">{basicCount} / 4</p>
          </div>

          {/* ボーナススタンプ */}
          <h3 className="font-[Klee_One] text-sm text-brown font-semibold mb-3 flex items-center gap-2">
            <span className="w-5 h-0.5 bg-green inline-block"></span>
            ボーナススタンプ
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {BONUS_STAMPS.map(s => <StampSlot key={s.type} stamp={s} record={stamps.find(r => r.type === s.type)} />)}
          </div>

          {/* 成長ステージ */}
          {hasStamp("seed") && (
            <div className="bg-white rounded-2xl p-5 mb-6 border border-brown/6">
              <h3 className="font-[Klee_One] text-sm text-brown font-semibold mb-4">🌱 種まきスタンプの成長</h3>
              <div className="flex justify-between">
                {GROWTH_STAGES.map((g, i) => (
                  <div key={g.stage} className="text-center flex-1">
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-lg mb-1
                      ${i === 0 ? "bg-gold-pale ring-2 ring-gold/30" : "bg-cream-dark"}`}>
                      {g.icon}
                    </div>
                    <span className="text-[10px] text-brown-light">{g.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-brown-light text-center mt-3">
                畑のひまわりの成長に合わせて変化します
              </p>
            </div>
          )}

          {/* 特典 */}
          <div className="bg-white rounded-2xl p-5 mb-6 border border-brown/6">
            <h3 className="font-[Klee_One] text-sm text-brown font-semibold mb-3">特典アンロック</h3>
            <div className="space-y-3">
              {REWARDS.map(r => {
                const unlocked = totalCount >= r.stampsRequired;
                return (
                  <div key={r.title} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0
                      ${unlocked ? "bg-gold-pale" : "bg-brown/5"}`}>
                      {r.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-brown font-semibold truncate">{r.title}</p>
                      <p className="text-[10px] text-brown-light">
                        {unlocked ? <span className="text-green font-semibold">✓ アンロック済み</span> : `スタンプ${r.stampsRequired}つで解放`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 機能メニュー */}
          <div className="mb-6">
            <h3 className="font-[Klee_One] text-sm text-brown font-semibold mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-brown/20 inline-block"></span>
              メニュー
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/field"
                className="bg-white rounded-2xl p-4 border border-brown/6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                <span className="text-2xl block mb-1.5">🗺️</span>
                <span className="font-[Klee_One] text-xs text-brown font-semibold">畑マップ</span>
                <span className="block text-[10px] text-brown-light mt-0.5">区画と成長を確認</span>
              </Link>
              <Link href="/submit"
                className="bg-white rounded-2xl p-4 border border-brown/6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                <span className="text-2xl block mb-1.5">📸</span>
                <span className="font-[Klee_One] text-xs text-brown font-semibold">写真を投稿</span>
                <span className="block text-[10px] text-brown-light mt-0.5">ボーナススタンプ取得</span>
              </Link>
              <Link href="/field"
                className="bg-white rounded-2xl p-4 border border-brown/6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                <span className="text-2xl block mb-1.5">🌐</span>
                <span className="font-[Klee_One] text-xs text-brown font-semibold">バーチャル畑</span>
                <span className="block text-[10px] text-gold mt-0.5">準備中</span>
              </Link>
              <Link href="/owner"
                className="bg-white rounded-2xl p-4 border border-brown/6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                <span className="text-2xl block mb-1.5">🌻</span>
                <span className="font-[Klee_One] text-xs text-brown font-semibold">オーナー情報</span>
                <span className="block text-[10px] text-brown-light mt-0.5">制度と申込</span>
              </Link>
            </div>
          </div>

          {/* デバッグ用リセット */}
          <button onClick={() => { resetAll(); window.location.reload(); }}
            className="block mx-auto text-[10px] text-brown-light underline mt-4">
            データをリセット（テスト用）
          </button>

        </div>
      </div>
      <Footer />
    </>
  );
}

// --- スタンプスロット ---
function StampSlot({ stamp, record }: { stamp: StampDef; record?: StampRecord }) {
  const acquired = !!record;
  return (
    <div className={`rounded-2xl p-4 text-center border-2 transition
      ${acquired ? "bg-green-light border-green" : "bg-white border-dashed border-brown/12"}`}>
      {acquired && record?.photoUrl ? (
        <img src={record.photoUrl} alt={stamp.name}
          className="w-12 h-12 rounded-lg object-cover mx-auto mb-2 border border-white shadow-sm" />
      ) : (
        <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center text-2xl mb-2
          ${acquired ? "bg-white shadow-sm" : "bg-brown/5"}`}>
          {stamp.icon}
        </div>
      )}
      <p className={`font-[Klee_One] text-xs font-semibold ${acquired ? "text-green" : "text-brown-mid"}`}>
        {stamp.name}
      </p>
      {acquired ? (
        <p className="text-[10px] text-green mt-0.5">
          {new Date(record!.acquiredAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })} 取得
        </p>
      ) : (
        <p className="text-[10px] text-brown-light mt-0.5">{stamp.month}</p>
      )}
      {stamp.isBonus && !acquired && (
        <span className="inline-block mt-1 text-[9px] text-gold bg-gold-pale px-1.5 py-0.5 rounded-full">ボーナス</span>
      )}
    </div>
  );
}
