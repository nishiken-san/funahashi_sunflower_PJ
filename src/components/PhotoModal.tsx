"use client";

import { useEffect } from "react";

// タップで開く全画面写真モーダル
// 背景クリック・閉じるボタン・Escキーで閉じる
export default function PhotoModal({
  src, alt, caption, onClose,
}: {
  src: string;
  alt?: string;
  caption?: string;
  onClose: () => void;
}) {
  // Escキーで閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // 開いてる間はスクロールロック
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* 閉じるボタン */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white text-xl flex items-center justify-center transition"
        aria-label="閉じる"
      >
        ✕
      </button>

      {/* 写真本体（クリックは伝播させない） */}
      <img
        src={src}
        alt={alt ?? ""}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
      />

      {/* キャプション */}
      {caption && (
        <p className="mt-4 text-white text-sm font-[Klee_One] text-center max-w-md">
          {caption}
        </p>
      )}

      <p className="mt-3 text-white/50 text-[10px]">タップ / クリックで閉じる</p>
    </div>
  );
}
