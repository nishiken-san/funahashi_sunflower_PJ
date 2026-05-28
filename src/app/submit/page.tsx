"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import { BONUS_STAMPS } from "@/config/contract";
import type { StampDef } from "@/config/contract";
import {
  getSession, fetchStamps, hasStampInList,
  uploadStampPhoto, claimStamp,
} from "@/lib/stamps";
import type { StampRecord } from "@/lib/stamps";

export default function SubmitPage() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [stamps, setStamps] = useState<StampRecord[]>([]);
  const [selected, setSelected] = useState<StampDef | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSession().then(async session => {
      if (session) {
        setLoggedIn(true);
        const s = await fetchStamps();
        setStamps(s);
      }
    }).catch(() => null).finally(() => setLoading(false));
  }, []);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      let photoPath: string | undefined;
      if (photoFile) {
        const path = await uploadStampPhoto(photoFile);
        photoPath = path ?? undefined;
      }
      await claimStamp(selected.type, { photoPath });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Nav />
        <div className="pt-28 min-h-screen bg-cream flex items-center justify-center">
          <span className="text-4xl animate-pulse">🌻</span>
        </div>
      </>
    );
  }

  if (!loggedIn) {
    return (
      <>
        <Nav />
        <div className="pt-28 pb-24 bg-cream min-h-screen flex items-center justify-center">
          <div className="max-w-sm mx-auto px-6 text-center">
            <div className="text-4xl mb-4">📸</div>
            <h1 className="font-[Klee_One] text-xl text-brown font-semibold mb-4">写真を投稿する</h1>
            <p className="text-sm text-brown-mid mb-6">投稿するにはログインが必要です</p>
            <Link href="/login?next=/submit" className="inline-block bg-brown text-cream px-6 py-3 rounded-xl text-sm font-semibold hover:bg-brown/90 transition">
              ログインする
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (done && selected) {
    return (
      <>
        <Nav />
        <div className="pt-28 pb-24 bg-cream min-h-screen flex items-center justify-center">
          <div className="max-w-sm mx-auto px-6 text-center">
            <div className="text-6xl mb-4 stamp-pop">{selected.icon}</div>
            <h2 className="font-[Klee_One] text-lg text-brown font-semibold mb-2">投稿しました！</h2>
            <p className="text-sm text-brown-mid mb-6">{selected.name}スタンプを獲得しました</p>
            <Link href="/stamp" className="inline-block bg-brown text-cream px-6 py-3 rounded-xl text-sm font-semibold hover:bg-brown/90 transition">
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

          <p className="font-[Klee_One] text-sm text-brown mb-3">どのスタンプを取得しますか？</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {BONUS_STAMPS.map(s => {
              const owned = hasStampInList(stamps, s.type);
              const active = selected?.type === s.type;
              return (
                <button
                  key={s.type}
                  onClick={() => !owned && setSelected(s)}
                  disabled={owned}
                  className={`p-4 rounded-xl border-2 text-center transition
                    ${owned ? "bg-green-light border-green opacity-60" :
                      active ? "bg-gold-pale border-gold" :
                      "bg-white border-brown/10 hover:border-gold"}`}
                >
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

              {photoPreview ? (
                <div className="mb-4">
                  <img src={photoPreview} alt="投稿写真" className="w-full rounded-xl" />
                  <button
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="block mx-auto mt-2 text-xs text-brown-light underline"
                  >
                    撮り直す
                  </button>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-brown/15 rounded-xl p-8 text-center cursor-pointer hover:bg-gold-pale/30 transition mb-4">
                  <span className="text-3xl block mb-2">📷</span>
                  <span className="text-xs text-brown-light">
                    {selected.type === "home" ? "自宅で育てたひまわりの写真" : "ひまわりの写真を選択"}
                  </span>
                  <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
                </label>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 text-xs text-red-600 text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!photoFile || submitting}
                className="w-full py-3.5 rounded-xl bg-brown text-cream text-sm font-semibold disabled:opacity-40 transition hover:bg-brown/90"
              >
                {submitting ? "投稿中..." : "投稿してスタンプを取得 🌻"}
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
