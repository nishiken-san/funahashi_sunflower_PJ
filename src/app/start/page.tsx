"use client";

// ===== 当日QRコードのランディングページ =====
// 初めて参加する人向け：プロジェクトの説明 → スタンプ取得の流れ → 開始
// ?event=seed のようにスタンプ種別を指定可能（指定なしは「seed」）

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { STAMPS } from "@/config/contract";
import type { StampType } from "@/config/contract";

function StartInner() {
  const params = useSearchParams();
  const eventType = (params.get("event") || "seed") as StampType;
  const stamp = STAMPS.find(s => s.type === eventType) ?? STAMPS[0];

  return (
    <div className="min-h-screen bg-cream pb-20">

      {/* ===== ヘッダー：歓迎メッセージ ===== */}
      <header className="relative bg-gradient-to-br from-gold-pale via-cream to-cream-dark pt-12 pb-10 px-6 overflow-hidden">
        {/* 背景の装飾円 */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-green/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-md mx-auto text-center">
          <img
            src="/lily-celebrate.png"
            alt="レインボーリーリー"
            className="w-40 mx-auto mb-2 drop-shadow-xl animate-[float_4s_ease-in-out_infinite] select-none"
          />
          <p className="font-[Klee_One] text-[11px] text-gold tracking-[0.3em] mb-2">WELCOME</p>
          <h1 className="font-[Shippori_Mincho_B1] text-2xl text-brown font-bold mb-3 leading-tight">
            ようこそ！<br />
            <span className="text-gold">{stamp.name}スタンプ</span>
          </h1>
          <p className="text-sm text-brown-mid leading-relaxed">
            このページではスタンプの取得方法と<br />
            プロジェクトについて説明します
          </p>
          <p className="text-[10px] text-brown-light mt-2">所要時間：1〜2分</p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-10 space-y-8">

        {/* ===== Section 1: プロジェクトとは ===== */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-0.5 bg-gold inline-block" />
            <p className="font-[Klee_One] text-[11px] text-gold tracking-[0.2em]">ABOUT</p>
          </div>
          <h2 className="font-[Shippori_Mincho_B1] text-xl text-brown font-bold mb-3">
            サンフラワープロジェクトとは
          </h2>
          <div className="bg-white rounded-2xl p-5 border border-brown/6 shadow-sm">
            <p className="text-sm text-brown-mid leading-relaxed mb-3">
              <strong className="text-brown">舟橋村</strong>で<strong className="text-gold">立山連峰を背景にひまわり畑</strong>を作るプロジェクトです。
            </p>
            <p className="text-sm text-brown-mid leading-relaxed mb-3">
              5月の種まきから10月の収穫まで、半年間みんなで畑を育てます。
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <FeatureChip icon="🏔️" label="立山連峰" />
              <FeatureChip icon="🌻" label="ひまわり畑" />
              <FeatureChip icon="🚃" label="かぼちゃ電車" />
            </div>
          </div>
        </section>

        {/* ===== Section 2: スタンプとは ===== */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-0.5 bg-gold inline-block" />
            <p className="font-[Klee_One] text-[11px] text-gold tracking-[0.2em]">DIGITAL STAMP</p>
          </div>
          <h2 className="font-[Shippori_Mincho_B1] text-xl text-brown font-bold mb-3">
            スタンプって何？
          </h2>
          <div className="bg-white rounded-2xl p-5 border border-brown/6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-brown/5">
              <div className="w-16 h-16 rounded-2xl bg-gold-pale flex items-center justify-center text-4xl shrink-0">
                {stamp.icon}
              </div>
              <div>
                <p className="font-[Klee_One] text-sm text-brown font-semibold">{stamp.name}スタンプ</p>
                <p className="text-[11px] text-brown-light">{stamp.description}</p>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-brown-mid">
              <li className="flex gap-2.5">
                <span className="text-base shrink-0">📸</span>
                <span>イベントごとに写真を撮ってスタンプを獲得</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-base shrink-0">🌱</span>
                <span>種まきスタンプは畑の成長と一緒に変化</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-base shrink-0">🎁</span>
                <span>集めると特典がアンロック（壁紙・翌年先行オーナー権など）</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-base shrink-0">♾️</span>
                <span>あなたのアカウントに記録され、ずっと残ります</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ===== Section 3: 当日の流れ ===== */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-0.5 bg-gold inline-block" />
            <p className="font-[Klee_One] text-[11px] text-gold tracking-[0.2em]">HOW IT WORKS</p>
          </div>
          <h2 className="font-[Shippori_Mincho_B1] text-xl text-brown font-bold mb-3">
            やることはたった3つ
          </h2>
          <div className="space-y-3">
            <FlowStep
              num={1} icon="👤"
              title="ログインまたは新規登録"
              desc="Googleアカウントなら最速で1タップ。メールアドレスでもOK。"
              detail="※ 来年以降も同じアカウントが使えます"
            />
            {stamp.requiresGPS && (
              <FlowStep
                num={2} icon="📍"
                title="位置情報を許可"
                desc="畑の近くにいることを確認します。"
                detail="※ 位置情報はサーバーには保存されません"
              />
            )}
            <FlowStep
              num={stamp.requiresGPS ? 3 : 2} icon="📸"
              title="写真を撮影"
              desc="目の前のひまわり・畑・景色を撮ってください。"
              detail="※ 顔が写らない構図を推奨"
            />
            <FlowStep
              num={stamp.requiresGPS ? 4 : 3} icon="🎉"
              title="スタンプ獲得！"
              desc="あなただけのスタンプがマイページに記録されます。"
              detail=""
              last
            />
          </div>
        </section>

        {/* ===== Section 4: プライバシー ===== */}
        <section>
          <div className="bg-green/8 border border-green/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🔒</span>
              <h3 className="font-[Klee_One] text-sm text-green font-bold">写真とプライバシーについて</h3>
            </div>
            <ul className="space-y-2 text-xs text-brown-mid">
              <li className="flex gap-2">
                <span className="text-green shrink-0">✓</span>
                <span>撮った写真は<strong className="text-brown">あなただけ</strong>が見られます</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green shrink-0">✓</span>
                <span>他の参加者や運営からも見えません</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green shrink-0">✓</span>
                <span>位置情報はサーバーに保存されません</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green shrink-0">✓</span>
                <span>あとから写真の撮り直しもできます</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ===== Section 5: CTA ===== */}
        <section className="pt-2">
          <Link
            href={`/claim?event=${eventType}`}
            className="block w-full text-center bg-gradient-to-r from-gold to-[#e6b438] text-brown py-5 rounded-2xl font-[Klee_One] font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <span className="block text-[11px] tracking-wider opacity-70 mb-0.5">READY?</span>
            {stamp.icon} {stamp.name}スタンプを取得する →
          </Link>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <Link href="/stamp" className="text-brown-light underline">
              既に登録済の方
            </Link>
            <span className="text-brown-light/40">|</span>
            <Link href="/" className="text-brown-light underline">
              プロジェクトについて詳しく
            </Link>
          </div>
        </section>

        {/* ===== Footer notes ===== */}
        <p className="text-[10px] text-brown-light text-center leading-relaxed pt-4">
          舟橋村サンフラワープロジェクト 2026<br />
          困ったら現地スタッフに声をかけてください 🌻
        </p>

      </main>
    </div>
  );
}

export default function StartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <span className="text-4xl animate-pulse">🌻</span>
        </div>
      }
    >
      <StartInner />
    </Suspense>
  );
}

// ----- 内部コンポーネント -----

function FeatureChip({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="bg-cream rounded-xl py-2 text-center">
      <div className="text-xl mb-0.5">{icon}</div>
      <p className="text-[10px] text-brown-mid font-[Klee_One] font-semibold">{label}</p>
    </div>
  );
}

function FlowStep({
  num, icon, title, desc, detail, last = false,
}: {
  num: number; icon: string; title: string; desc: string; detail: string; last?: boolean;
}) {
  return (
    <div className="relative">
      <div className="bg-white rounded-2xl p-4 border border-brown/6 shadow-sm flex gap-3">
        {/* ステップ番号 + アイコン */}
        <div className="shrink-0 relative">
          <div className="w-12 h-12 rounded-full bg-gold-pale flex items-center justify-center text-2xl">
            {icon}
          </div>
          <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-gold text-brown text-[11px] font-bold flex items-center justify-center shadow">
            {num}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-[Klee_One] text-sm text-brown font-semibold mb-1">{title}</p>
          <p className="text-[11px] text-brown-mid leading-relaxed">{desc}</p>
          {detail && (
            <p className="text-[10px] text-brown-light mt-1 leading-relaxed">{detail}</p>
          )}
        </div>
      </div>
      {/* 矢印（最後以外） */}
      {!last && (
        <div className="flex justify-center py-1">
          <span className="text-brown-light text-base">↓</span>
        </div>
      )}
    </div>
  );
}
