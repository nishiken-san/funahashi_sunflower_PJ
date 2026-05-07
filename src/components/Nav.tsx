"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const base = scrolled
    ? "fixed top-0 left-0 right-0 z-50 px-6 py-3 bg-cream/95 backdrop-blur-md shadow-sm transition-all duration-300"
    : "fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300";

  const textColor = scrolled ? "text-brown" : "text-white";
  const linkStyle = scrolled
    ? "text-xs font-medium px-3 py-1.5 rounded-full border border-brown/10 text-brown-mid hover:bg-gold-pale transition"
    : "text-xs font-medium px-3 py-1.5 rounded-full border border-white/15 text-white/80 hover:bg-white/10 transition";

  return (
    <nav className={base}>
      <div className="max-w-[1100px] mx-auto flex items-center justify-between">
        <Link href="/" className={`font-[Klee_One] font-semibold text-[15px] flex items-center gap-2 ${textColor}`}>
          <span className="text-xl">🌻</span>
          サンフラワープロジェクト
        </Link>
        <div className="hidden md:flex gap-1.5">
          <Link href="/#purpose" className={linkStyle}>想い</Link>
          <Link href="/#themes" className={linkStyle}>テーマ</Link>
          <Link href="/#timeline" className={linkStyle}>ながれ</Link>
          <Link href="/stamp" className={linkStyle}>スタンプ</Link>
          <Link href="/#event" className={linkStyle}>祭り</Link>
          <Link href="/field" className={linkStyle}>畑マップ</Link>
          <Link href="/owner" className={linkStyle}>オーナー</Link>
        </div>
      </div>
    </nav>
  );
}
