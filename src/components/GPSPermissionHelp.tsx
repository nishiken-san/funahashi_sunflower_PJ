"use client";

import { useState } from "react";

// 位置情報の許可方法を案内するアコーディオン
// スタンプ取得画面で「許可されない/わからない」ユーザーへの説明用
export default function GPSPermissionHelp() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        type="button"
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gold-pale/40 hover:bg-gold-pale/60 transition text-left"
      >
        <span className="text-xs text-brown font-semibold font-[Klee_One]">
          📍 位置情報の許可方法
        </span>
        <span className="text-xs text-brown-mid">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-2 bg-white rounded-xl border border-brown/10 overflow-hidden">
          {/* 共通メッセージ */}
          <div className="px-4 py-3 bg-gold-pale/30 border-b border-brown/5">
            <p className="text-[11px] text-brown leading-relaxed">
              スタンプ取得時に「位置情報の使用を許可しますか？」と聞かれたら<br />
              <strong className="text-green">「許可」</strong>をタップしてください。
            </p>
          </div>

          {/* iOS Safari */}
          <Section
            icon="📱"
            title="iPhone（Safari）"
            steps={[
              "ダイアログが出たら「許可」をタップ",
              "出ない場合：設定アプリ → Safari → 位置情報 → 「確認」を選択",
              "ブロックされた場合：設定 → プライバシーとセキュリティ → 位置情報サービス → Safari →「Webサイトの使用中のみ許可」",
            ]}
          />

          {/* Android Chrome */}
          <Section
            icon="📱"
            title="Android（Chrome）"
            steps={[
              "ダイアログが出たら「許可」をタップ",
              "ブロック済みの場合：URLバー左の鍵マーク 🔒 → 権限 → 位置情報 →「許可」",
              "それでもダメな場合：設定 → アプリ → Chrome → 権限 → 位置情報 → 「許可」",
            ]}
          />

          {/* PC */}
          <Section
            icon="💻"
            title="パソコン（Chrome / Edge）"
            steps={[
              "URLバー左の鍵マーク 🔒 をクリック",
              "「位置情報」をクリック",
              "「許可」を選択 → ページを再読み込み",
            ]}
            isLast
          />

          {/* プライバシー説明 */}
          <div className="px-4 py-3 bg-cream/50 border-t border-brown/5">
            <p className="text-[10px] text-brown-light leading-relaxed">
              🔒 <strong>位置情報の使い方</strong><br />
              畑の近くにいることを確認するためだけに使用します。<br />
              緯度・経度はサーバーに送信されますが、地図上に表示したり<br />
              他の人に公開することはありません。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  icon, title, steps, isLast = false,
}: { icon: string; title: string; steps: string[]; isLast?: boolean }) {
  return (
    <div className={`px-4 py-3 ${!isLast ? "border-b border-brown/5" : ""}`}>
      <p className="text-xs text-brown font-semibold mb-2">
        {icon} {title}
      </p>
      <ol className="space-y-1.5">
        {steps.map((step, i) => (
          <li key={i} className="text-[11px] text-brown-mid leading-relaxed flex gap-2">
            <span className="text-gold font-semibold shrink-0">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
