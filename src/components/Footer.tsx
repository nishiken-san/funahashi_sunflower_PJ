import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-cream text-center py-10 px-6">
      <div className="font-[Klee_One] font-semibold text-[15px] text-brown mb-2 flex items-center justify-center gap-2">
        🌻 サンフラワープロジェクト
      </div>
      <p className="text-[11px] text-brown-light mb-4">
        舟橋村サンフラワープロジェクト委員会 © 2026
      </p>
      <div className="flex gap-4 justify-center flex-wrap">
        <Link href="#" className="text-xs text-brown-mid hover:text-gold transition">LINE オープンチャット</Link>
        <Link href="#" className="text-xs text-brown-mid hover:text-gold transition">お問い合わせ</Link>
      </div>
    </footer>
  );
}
