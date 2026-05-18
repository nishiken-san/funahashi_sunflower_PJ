"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import { BONUS_STAMPS, StampDef } from "@/config/contract";
import { getProfile, saveProfile, hasStamp, addStamp } from "@/lib/stamps";

export default function SubmitPage() {
  const [profile, setProfile] = useState(getProfile());
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<StampDef | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogin = () => {
    if (!name.trim()) return;
    const p = saveProfile(name.trim());
    setProfile(p);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!selected || !photo) return;
    try {
      addStamp(selected.type, photo);
      setDone(true);
    } catch {
      alert("このスタンプは取得済みです");
    }
  };

  // ログイン前
  if (!profile) {
    return (
      <>
        <Nav />
        <div className="pt-28 pb-24 bg-cream min-h-screen">
          <div className="max-w-sm mx-auto px-6">
            <h1 className="font-[Klee_One] text-xl text-brown font-semibold mb-6 text-center">写真を投稿する</h1>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-brown/6">
              <p className="text-sm text-brown-mid mb-4 text-center">お名前を入力してください</p>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="ニックネーム" onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 rounded-xl border border-brown/15 bg-white text-brown text-sm mb-3 focus:outline-none focus:border-gold" />
              <button onClick={handleLogin} disabled={!name.trim()}
                className="w-full py-3 rounded-xl bg-brown text-cream text-sm font-semibold disabled:opacity-40">
                はじめる
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 完了
  if (done && selected) {
    return (
      <>
        <Nav />
        <div className="pt-28 pb-24 bg-cream min-h-screen flex items-center justify-center">
          <div className="max-w-sm mx-auto px-6 text-center">
            <div className="text-6xl mb-4 stamp-pop">{selected.icon}</div>
            <h2 className="font-[Klee_One] text-lg text-brown font-semibold mb-2">投稿しました！</h2>
            <p className="text-sm text-brown-mid mb-6">{selected.name}スタンプを獲得しました</p>
            <Link href="/stamp"
              className="inline-block bg-brown text-cream px-6 py-3 rounded-xl text-sm font-semibold">
              マイスタンプを見る →
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className="pt-28 pb-24 bg-cream min-h-screen">
        <div className="max-w-lg mx-auto px-6">
          <h1 className="font-[Klee_One] text-xl text-brown font-semibold mb-2">写真を投稿する</h1>
          <p className="text-sm text-brown-mid mb-8">写真を投稿してボーナススタンプを取得できます</p>

          {/* スタンプ選択 */}
          <p className="font-[Klee_One] text-sm text-brown mb-3">どのスタンプを取得しますか？</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {BONUS_STAMPS.map(s => {
              const owned = hasStamp(s.type);
              const active = selected?.type === s.type;
              return (
                <button key={s.type} onClick={() => !owned && setSelected(s)} disabled={owned}
                  className={`p-4 rounded-xl border-2 text-center transition
                    ${owned ? "bg-green-light border-green opacity-60" :
                      active ? "bg-gold-pale border-gold" :
                      "bg-white border-brown/10 hover:border-gold"}`}>
                  <span className="text-2xl block mb-1">{s.icon}</span>
                  <span className="text-xs font-semibold text-brown">{s.name}</span>
                  {owned && <span className="block text-[10px] text-green mt-1">取得済み ✓</span>}
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-brown/6">
              <h3 className="font-[Klee_One] text-sm text-brown mb-1">{selected.name}</h3>
              <p className="text-xs text-brown-light mb-4">{selected.description}</p>

              {/* 写真 */}
              {photo ? (
                <div className="mb-4">
                  <img src={photo} alt="投稿写真" className="w-full rounded-xl" />
                  <button onClick={() => { setPhoto(null); if(fileRef.current) fileRef.current.value=""; }}
                    className="block mx-auto mt-2 text-xs text-brown-light underline">撮り直す</button>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-brown/15 rounded-xl p-8 text-center cursor-pointer hover:bg-gold-pale/30 transition mb-4">
                  <span className="text-3xl block mb-2">📷</span>
                  <span className="text-xs text-brown-light">
                    {selected.type === "home" ? "自宅で育てたひまわりの写真" : "ひまわりの写真を選択"}
                  </span>
                  <input ref={fileRef} type="file" accept="image/*" capture="environment"
                    className="hidden" onChange={handlePhoto} />
                </label>
              )}

              <button onClick={handleSubmit} disabled={!photo}
                className="w-full py-3.5 rounded-xl bg-brown text-cream text-sm font-semibold disabled:opacity-40 transition hover:bg-brown/90">
                投稿してスタンプを取得 🌻
              </button>
              <p className="text-[10px] text-brown-light text-center mt-3">
                ※ 顔が写らない構図を推奨しています
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
