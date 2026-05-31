"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchProfile } from "@/lib/stamps";

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // ホーム以外のページは常に「スクロール済み」スタイル（cream背景）にする
  // → cream背景のページで白文字が見えない問題を回避
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    fetchProfile().then(profile => {
      if (profile) {
        setUserName(profile.name);
        setAvatarUrl(profile.avatar_url || null);
      }
    }).catch(() => {});
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const myPageHref = userName ? "/stamp" : "/login";

  // メニュー開閉時にスクロールロック
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // ホーム以外は scrolled=true 扱いにする
  const effectiveScrolled = !isHome || scrolled;

  const base = effectiveScrolled
    ? "fixed top-0 left-0 right-0 z-50 px-6 py-3 bg-cream/95 backdrop-blur-md shadow-sm transition-all duration-300"
    : "fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300";

  const textColor = effectiveScrolled ? "text-brown" : "text-white";
  const linkStyle = effectiveScrolled
    ? "text-xs font-medium px-3 py-1.5 rounded-full border border-brown/10 text-brown-mid hover:bg-gold-pale transition"
    : "text-xs font-medium px-3 py-1.5 rounded-full border border-white/15 text-white/80 hover:bg-white/10 transition";

  // ※ "/owner" は一時的に非表示中（オーナー制度の項目）
  const navLinks = [
    { href: "/#purpose", label: "想い" },
    { href: "/#themes", label: "テーマ" },
    { href: "/#timeline", label: "ながれ" },
    { href: "/stamp", label: "スタンプ" },
    { href: "/#event", label: "祭り" },
    { href: "/field", label: "畑マップ" },
    // { href: "/owner", label: "オーナー" },  // 一時非表示
  ];

  return (
    <>
      <nav className={base}>
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <Link href="/" className={`font-[Klee_One] font-semibold text-[15px] flex items-center gap-2 ${textColor}`}>
            <span className="text-xl">🌻</span>
            <span className="hidden sm:inline">サンフラワープロジェクト</span>
          </Link>

          {/* PC: ナビリンク */}
          <div className="hidden md:flex gap-1.5">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className={linkStyle}>{l.label}</Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* マイページボタン（PC・モバイル共通） */}
            <Link href={myPageHref}
              className={`text-xs font-semibold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
                effectiveScrolled
                  ? "bg-brown text-cream hover:bg-brown/80"
                  : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm"
              }`}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : null}
              {userName ? userName : "ログイン"}
            </Link>

            {/* モバイル: ハンバーガー */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden text-xl w-9 h-9 flex items-center justify-center rounded-full transition ${
                effectiveScrolled ? "text-brown hover:bg-brown/5" : "text-white hover:bg-white/10"
              }`}
              aria-label="メニュー">
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </nav>

      {/* モバイルメニューオーバーレイ */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-cream/98 backdrop-blur-sm pt-20 px-6 md:hidden"
          onClick={() => setMenuOpen(false)}>
          <div className="max-w-sm mx-auto space-y-1" onClick={e => e.stopPropagation()}>
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="block py-3 px-4 text-base text-brown font-[Klee_One] rounded-xl hover:bg-gold-pale transition">
                {l.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-brown/10 mt-3">
              <Link href="/submit" onClick={() => setMenuOpen(false)}
                className="block py-3 px-4 text-base text-brown font-[Klee_One] rounded-xl hover:bg-gold-pale transition">
                📸 写真を投稿する
              </Link>
              <Link href={myPageHref} onClick={() => setMenuOpen(false)}
                className="block py-3 px-4 text-base text-gold font-[Klee_One] font-semibold rounded-xl hover:bg-gold-pale transition">
                🌻 {userName ? `${userName}のマイページ` : "ログイン / 新規登録"}
              </Link>
              <Link href="/me" onClick={() => setMenuOpen(false)}
                className="block py-3 px-4 text-sm text-brown-light font-[Klee_One] rounded-xl hover:bg-gold-pale transition">
                🔍 アカウント診断
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
