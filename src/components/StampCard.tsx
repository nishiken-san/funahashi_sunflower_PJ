"use client";
import { useState } from "react";
import { BASIC_STAMPS, BONUS_STAMPS } from "@/config/contract";

export default function StampCard() {
  const all = [...BASIC_STAMPS, ...BONUS_STAMPS];
  const [filled, setFilled] = useState<boolean[]>(all.map(() => false));
  const toggle = (idx: number) => {
    // basic stamps must be filled in order (0-3), bonus are free
    if (idx < 4 && idx > 0 && !filled[idx - 1]) return;
    setFilled(p => { const n = [...p]; n[idx] = !n[idx]; return n; });
  };
  const count = filled.filter(Boolean).length;

  return (
    <div className="bg-brown rounded-[32px] p-4 max-w-[300px] mx-auto shadow-2xl">
      <div className="bg-cream rounded-[20px] p-5">
        <div className="text-center mb-3">
          <h4 className="font-[Klee_One] text-sm text-brown font-semibold">🌻 サンフラワースタンプ</h4>
          <p className="text-[10px] text-brown-light">SUNFLOWER PROJECT 2026</p>
        </div>
        <p className="text-[9px] text-brown-light mb-2 font-[Klee_One]">基本スタンプ</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {BASIC_STAMPS.map((s, i) => (
            <button key={s.type} onClick={() => toggle(i)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all text-center
                ${filled[i] ? "bg-green-light border-2 border-green" :
                  i === filled.slice(0,4).filter(Boolean).length ? "bg-white border-2 border-dashed border-gold cursor-pointer" :
                  "bg-white border-2 border-dashed border-brown/10"}`}>
              <span className={`text-xl mb-0.5 ${filled[i] ? "stamp-pop" : ""}`}>{s.icon}</span>
              <span className="text-[9px] text-brown-mid font-[Klee_One]">{s.name}</span>
            </button>
          ))}
        </div>
        <p className="text-[9px] text-brown-light mb-2 font-[Klee_One]">ボーナス</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {BONUS_STAMPS.map((s, i) => (
            <button key={s.type} onClick={() => toggle(i + 4)}
              className={`py-2 rounded-xl flex flex-col items-center justify-center transition-all
                ${filled[i + 4] ? "bg-gold-pale border-2 border-gold" :
                  "bg-white border-2 border-dashed border-brown/10 cursor-pointer"}`}>
              <span className={`text-lg ${filled[i + 4] ? "stamp-pop" : ""}`}>{s.icon}</span>
              <span className="text-[9px] text-brown-mid font-[Klee_One]">{s.name}</span>
            </button>
          ))}
        </div>
        <div className="bg-brown/8 rounded-full h-1.5 overflow-hidden mb-1">
          <div className="h-full rounded-full bg-gradient-to-r from-gold to-green transition-all"
            style={{ width: `${(count / 6) * 100}%` }} />
        </div>
        <p className="text-center text-[10px] text-brown-light font-[Klee_One]">{count} / 6</p>
      </div>
    </div>
  );
}
