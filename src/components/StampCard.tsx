"use client";
import { useState } from "react";
import { STAMPS } from "@/config/contract";

export default function StampCard({ interactive = true }: { interactive?: boolean }) {
  const [filled, setFilled] = useState<boolean[]>([false, false, false, false]);

  const toggle = (idx: number) => {
    if (!interactive) return;
    if (idx > 0 && !filled[idx - 1]) return; // must fill in order
    setFilled(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const count = filled.filter(Boolean).length;

  return (
    <div className="bg-brown rounded-[32px] p-4 max-w-[300px] mx-auto shadow-2xl">
      <div className="bg-cream rounded-[20px] p-5 min-h-[380px]">
        <div className="text-center mb-4">
          <h4 className="font-[Klee_One] text-sm text-brown font-semibold">🌻 サンフラワースタンプ</h4>
          <p className="text-[10px] text-brown-light">SUNFLOWER PROJECT 2026</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {STAMPS.map((stamp, i) => (
            <button
              key={stamp.id}
              onClick={() => toggle(i)}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300
                ${filled[i]
                  ? "bg-green-light border-2 border-solid border-green"
                  : i === count && interactive
                    ? "bg-white border-2 border-dashed border-gold cursor-pointer hover:bg-gold-pale"
                    : "bg-white border-2 border-dashed border-brown/10"
                }`}
            >
              <span className={`text-[28px] mb-1 ${filled[i] ? "stamp-pop" : ""}`}>{stamp.icon}</span>
              <span className={`font-[Klee_One] text-[10px] ${filled[i] ? "text-green font-semibold" : "text-brown-mid"}`}>
                {stamp.name}
              </span>
            </button>
          ))}
        </div>

        <div className="bg-brown/8 rounded-full h-1.5 overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold to-green transition-all duration-500"
            style={{ width: `${(count / 4) * 100}%` }}
          />
        </div>
        <p className="text-center text-[11px] text-brown-light font-[Klee_One]">
          {count} / 4 スタンプ
        </p>

        {interactive && (
          <p className="text-center text-[10px] text-brown-light mt-3">
            {count < 4 ? "タップしてスタンプ取得を体験" : "🎉 コンプリート！"}
          </p>
        )}
      </div>
    </div>
  );
}
