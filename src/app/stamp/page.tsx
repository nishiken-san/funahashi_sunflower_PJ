"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { BASIC_STAMPS, BONUS_STAMPS, GROWTH_STAGES, REWARDS } from "@/config/contract";
import type { StampDef } from "@/config/contract";
import {
  fetchProfile, fetchStamps, hasStampInList, getBasicCountFromList,
  getPhotoUrl, signOut, syncGoogleAvatar,
} from "@/lib/stamps";
import type { UserProfile, StampRecord } from "@/lib/stamps";

export default function StampPage() {
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);
  const [stamps, setStamps] = useState<StampRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    syncGoogleAvatar()
      .catch(() => null)
      .finally(() => {
        Promise.all([fetchProfile(), fetchStamps()])
          .then(([p, s]) => { setProfile(p); setStamps(s); })
          .catch(() => setProfile(null))
          .finally(() => setMounted(true));
      });
  }, []);

  if (!mounted) return null;

  const basicCount = getBasicCountFromList(stamps);
  const totalCount = stamps.length;
  const isComplete = basicCount >= 4;

  // ===== 未ログイン → プレビュー =====
  if (!profile) {
    return (
      <>
        <Nav />
        <div className="pt-28 pb-24 bg-cream min-h-screen">
          <div className="max-w-md mx-auto px-6">
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
        <div className="max-w-md mx-auto px-6">

          {/* オーナーカード */}
          <div className="bg-gradient-to-br from-cream-dark to-[#ede0c0] rounded-2xl p-5 mb-5 relative shadow-sm border border-brown/6">
            <div className="flex items-center gap-3">
              <Link href="/login" className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-brown/10 hover:border-gold transition shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🌻</span>
                )}
              </Link>
              <div>
                <h2 className="font-[Klee_One] text-base text-brown font-semibold">
                  {profile.name || "名前未設定"}
                </h2>
                <p className="text-[11px] text-brown-light">第1期オーナー（2026）</p>
              </div>
            </div>
            {!profile.name && (
              <Link href="/login" className="absolute top-4 right-4 text-[10px] bg-gold text-brown px-2.5 py-1 rounded-full font-semibold">
                名前を設定する
              </Link>
            )}
            {isComplete && profile.name && (
              <div className="absolute top-4 right-4 bg-gold text-brown text-[10px] font-semibold px-2.5 py-1 rounded-full">
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
          <div className="grid grid-cols-2 gap-3 mb-6">
            {BONUS_STAMPS.map(s => (
              <StampSlot key={s.type} stamp={s} record={stamps.find(r => r.type === s.type)} />
            ))}
          </div>

          {/* 種まき成長ステージ */}
          {hasStampInList(stamps, "seed") && (
            <div className="bg-white rounded-2xl p-5 mb-6 border border-brown/6">
              <h3 className="font-[Klee_One] text-sm text-brown font-semibold mb-4">🌱 種まきスタンプの成長</h3>
              <div className="flex justify-between">
                {GROWTH_STAGES.map((g, i) => (
                  <div key={g.stage} className="text-center flex-1">
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-lg mb-1 ${i === 0 ? "bg-gold-pale ring-2 ring-gold/30" : "bg-cream-dark"}`}>
                      {g.icon}
                    </div>
                    <span className="text-[10px] text-brown-light">{g.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-brown-light text-center mt-3">畑のひまわりの成長に合わせて変化します</p>
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
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 ${unlocked ? "bg-gold-pale" : "bg-brown/5"}`}>
                      {r.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-brown font-semibold truncate">{r.title}</p>
                      <p className="text-[10px] text-brown-light">
                        {unlocked
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
                { href: "/field", icon: "🗺️", label: "畑マップ", sub: "区画と成長を確認" },
                { href: "/submit", icon: "📸", label: "写真を投稿", sub: "ボーナススタンプ取得" },
                { href: "/field", icon: "🌐", label: "バーチャル畑", sub: "準備中", subColor: "text-gold" },
                { href: "/owner", icon: "🌻", label: "オーナー情報", sub: "制度と申込" },
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

// スタンプスロット（写真URLは遅延ロード）
function StampSlot({ stamp, record }: { stamp: StampDef; record?: StampRecord }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (record?.photo_path) {
      getPhotoUrl(record.photo_path).then(url => setPhotoUrl(url || null)).catch(() => null);
    }
  }, [record?.photo_path]);

  const acquired = !!record;
  return (
    <div className={`rounded-2xl p-4 text-center border-2 transition ${acquired ? "bg-green-light border-green" : "bg-white border-dashed border-brown/12"}`}>
      {acquired && photoUrl ? (
        <img src={photoUrl} alt={stamp.name} className="w-12 h-12 rounded-lg object-cover mx-auto mb-2 border border-white shadow-sm" />
      ) : (
        <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center text-2xl mb-2 ${acquired ? "bg-white shadow-sm" : "bg-brown/5"}`}>
          {stamp.icon}
        </div>
      )}
      <p className={`font-[Klee_One] text-xs font-semibold ${acquired ? "text-green" : "text-brown-mid"}`}>
        {stamp.name}
      </p>
      {acquired ? (
        <p className="text-[10px] text-green mt-0.5">
          {new Date(record!.acquired_at).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })} 取得
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
