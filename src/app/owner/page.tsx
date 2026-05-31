import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/RevealOnScroll";
import Link from "next/link";

/**
 * オーナー制度ページ
 *
 * ※ 現在「オーナー制度」セクションは一時非表示中（誤解防止のため）。
 *   このページに直接URLでアクセスした場合のみ「準備中」を表示する。
 *
 *   元のオーナー説明UIは下の `false &&` ブロックに残してあり、
 *   復活させたい時はそのブロックを表示するように戻すだけでOK。
 */
export default function OwnerPage() {
  return (
    <>
      <Nav />
      <div className="pt-28 pb-24 bg-cream min-h-screen">
        <div className="max-w-md mx-auto px-6">
          <Reveal>
            <div className="bg-white rounded-3xl p-8 text-center border border-brown/6 shadow-sm">
              <div className="text-5xl mb-4 opacity-40">🌻</div>
              <p className="font-[Klee_One] text-xs text-gold tracking-[0.2em] mb-3">COMING SOON</p>
              <h1 className="font-[Shippori_Mincho_B1] font-bold text-2xl text-brown mb-4">
                オーナー制度は<br />現在準備中です
              </h1>
              <p className="text-sm text-brown-mid leading-relaxed mb-6">
                サンフラワープロジェクトのオーナー制度は<br />
                現在準備中です。<br />
                詳細が決まり次第お知らせします。
              </p>
              <div className="bg-cream rounded-2xl p-4 mb-6">
                <p className="text-xs text-brown-mid">
                  まずはイベントに参加して<br />
                  スタンプを集めませんか？
                </p>
              </div>
              <Link
                href="/stamp"
                className="block w-full text-center bg-brown text-cream px-6 py-3 rounded-xl text-sm font-semibold hover:bg-brown/90 transition mb-2"
              >
                スタンプラリーを見る →
              </Link>
              <Link
                href="/"
                className="block text-xs text-brown-light underline"
              >
                トップへ戻る
              </Link>
            </div>
          </Reveal>
        </div>
      </div>

      {/*
        ====================================
        ↓ 元のオーナー制度UI（一時非表示中）
        復活させる時は下の {false && (...)} を外す
        ====================================
      */}
      {false && (
      <div className="pt-28 pb-24 bg-cream">
        <div className="max-w-[1100px] mx-auto px-6">
          <Reveal>
            <p className="font-[Klee_One] text-xs text-gold tracking-[0.2em] mb-3">OWNER SYSTEM</p>
            <h2 className="font-[Shippori_Mincho_B1] font-bold text-3xl md:text-4xl text-brown mb-4">
              オーナー制度
            </h2>
            <p className="text-[15px] text-brown-mid max-w-2xl mb-12">
              「自分のひまわり畑」を持つ。それだけで、畑に足を運ぶ理由が生まれます。
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <Reveal>
              <div className="bg-gradient-to-br from-green-light to-[#d4e8c4] rounded-3xl p-8 border border-green/15 h-full">
                <span className="inline-block font-[Klee_One] text-[11px] font-semibold px-3 py-1 rounded-full bg-green text-white mb-4">
                  現地オーナー
                </span>
                <h3 className="font-[Klee_One] text-xl text-brown mb-3">畑で、隣の人と出会う</h3>
                <p className="text-[13px] text-brown-mid leading-relaxed mb-4">
                  村内の住民や近隣市町村の方向け。自分の区画に種をまき、名札を立て、半年間通える場所を持ちます。
                </p>
                <ul className="space-y-2">
                  {["種まきイベントに参加", "自分の名前入り名札を設置", "隣の区画の人と自然に交流", "収穫祭で搾油体験", "電子スタンプラリーに参加"].map((item) => (
                    <li key={item} className="text-[13px] text-brown-mid flex items-center gap-2">
                      <span className="text-green font-bold text-xs">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div className="bg-gradient-to-br from-gold-pale to-gold-light rounded-3xl p-8 border border-gold/15 h-full">
                <span className="inline-block font-[Klee_One] text-[11px] font-semibold px-3 py-1 rounded-full bg-gold text-brown mb-4">
                  オンラインオーナー
                </span>
                <h3 className="font-[Klee_One] text-xl text-brown mb-3">遠くから、村と繋がる</h3>
                <p className="text-[13px] text-brown-mid leading-relaxed mb-4">
                  県外の方や遠方から応援してくださる方向け。代理で種まきを行い、成長レポートが届きます。
                </p>
                <ul className="space-y-2">
                  {["サイトから申込（3,000〜5,000円）", "成長レポートが定期的に届く", "Zoom畑ツアーに参加", "搾油後のひまわり油を配送", "次年度企画への投票権"].map((item) => (
                    <li key={item} className="text-[13px] text-brown-mid flex items-center gap-2">
                      <span className="text-gold font-bold text-xs">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="bg-brown text-white rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-[200px] h-[200px] rounded-full bg-gold/15 blur-2xl" />
              <h3 className="font-[Shippori_Mincho_B1] font-bold text-2xl mb-3 relative">
                第1期オーナー募集中
              </h3>
              <p className="text-white/60 text-sm mb-6 relative">
                2026年、最初のオーナーとしてこの景色を一緒に作りませんか。
              </p>
              <Link
                href="#"
                className="inline-flex items-center gap-2 bg-gold text-brown px-8 py-3.5 rounded-full font-[Klee_One] font-semibold text-sm shadow-lg hover:-translate-y-0.5 transition-all relative"
              >
                申込フォームへ（準備中）
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
      )}
      <Footer />
    </>
  );
}
