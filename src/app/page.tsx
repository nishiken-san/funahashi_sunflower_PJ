import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/RevealOnScroll";
import StampCard from "@/components/StampCard";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Nav />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, rgba(42,31,16,0.35) 0%, rgba(42,31,16,0.20) 40%, rgba(42,31,16,0.50) 100%),
              url('/hero-bg.png') center/cover no-repeat`,
            backgroundColor: "#5a4a30",
          }}
        />
        <div className="relative z-10 px-6 py-32 max-w-[800px]">
          <span className="inline-block font-[Klee_One] text-xs tracking-[0.25em] text-white/60 mb-6 px-5 py-1.5 border border-white/20 rounded-full">
            SUNFLOWER PROJECT 2026
          </span>
          <h1 className="font-[Shippori_Mincho_B1] font-bold text-4xl md:text-6xl text-white leading-tight mb-4 drop-shadow-lg">
            あなたと立山と<br />ひまわりと
          </h1>
          <p className="font-[Klee_One] text-lg md:text-2xl text-white/85 mb-10 drop-shadow">
            〜あなたとこの景色を作りませんか〜
          </p>
          <Link
            href="#reality"
            className="inline-flex items-center gap-2 bg-gold text-brown px-9 py-4 rounded-full font-[Klee_One] font-semibold text-[15px] shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
          >
            この景色を本物にする ↓
          </Link>
        </div>

        {/* AI生成ラベル */}
        <div className="absolute bottom-8 right-8 z-10">
          <span className="text-[10px] text-white/40 font-[Klee_One] bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
            ※ この画像はAIによって生成されたイメージです
          </span>
        </div>
      </section>

      {/* ===== AI→REAL BRIDGE ===== */}
      <section id="reality" className="py-20 bg-brown text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,160,23,0.12),transparent_70%)]" />
        <div className="max-w-[800px] mx-auto px-6 relative">
          <Reveal>
            <p className="font-[Klee_One] text-sm text-gold/80 mb-6">
              いま見ていただいたこの景色は、AIが描いたものです。
            </p>
            <h2 className="font-[Shippori_Mincho_B1] font-bold text-2xl md:text-4xl text-white leading-relaxed mb-6">
              でも、この景色を<br />
              <span className="text-gold">本物にできるのは、</span><br />
              あなたです。
            </h2>
          </Reveal>
          <Reveal delay={1}>
            <p className="text-white/60 text-[15px] leading-relaxed max-w-lg mx-auto mb-4">
              立山連峰を背に、かぼちゃ電車が走り、一面のひまわりが揺れる。<br />
              舟橋村には、この3つが揃う場所が本当にあります。
            </p>
            <p className="text-white/60 text-[15px] leading-relaxed max-w-lg mx-auto mb-8">
              あとは、ひまわりを植える人がいるだけ。<br />
              あなたが種をまけば、この景色は現実になります。<br />
              そしてその畑で、お茶でもしながらゆっくり話しませんか。
            </p>
          </Reveal>
          <Reveal delay={2}>
            <Link
              href="#purpose"
              className="inline-flex items-center gap-2 bg-gold text-brown px-8 py-3.5 rounded-full font-[Klee_One] font-semibold text-sm shadow-lg hover:-translate-y-0.5 transition-all"
            >
              プロジェクトを知る ↓
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===== PURPOSE ===== */}
      <section id="purpose" className="py-24 bg-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <Reveal>
            <p className="font-[Klee_One] text-xs text-gold tracking-[0.2em] mb-3">OUR PURPOSE</p>
            <h2 className="font-[Shippori_Mincho_B1] font-bold text-3xl md:text-4xl text-brown mb-4">このプロジェクトの想い</h2>
          </Reveal>

          <Reveal>
            <div className="bg-cream rounded-3xl p-8 md:p-10 border-l-4 border-gold mb-10 relative overflow-hidden">
              {/* リーリー（歩いてるバージョン）がそっと寄り添う */}
              <img
                src="/lily-walk.png"
                alt=""
                className="hidden md:block absolute -right-6 -bottom-8 w-32 opacity-30 select-none pointer-events-none"
                aria-hidden
              />
              <p className="relative font-[Klee_One] text-lg md:text-xl text-brown leading-relaxed">
                舟橋村に暮らすすべての人が、<br />
                年齢も出身も関係なく、<br />
                顔を合わせて一緒に何かをする場を作ること。
              </p>
            </div>
          </Reveal>

          <Reveal>
            <p className="text-[15px] text-brown-mid max-w-2xl mb-12 leading-relaxed">
              舟橋村には、300年以上この地に暮らす家と、新しく移り住んできた家が共に生活しています。
              小さな村だからこそ距離は近い。でも、交流のきっかけや場はまだ足りていません。
              ひまわりプロジェクトは、その「きっかけ」を作るための取り組みです。
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "🌻", title: "全員が同じスタートライン", body: "ひまわり油を搾るプロは村にいません。長く住んでいる人も、新しく来た人も、同じ初心者として一緒に始められます。" },
              { icon: "🏔️", title: "ここにしかない景色", body: "立山連峰、富山鉄道のかぼちゃ電車、そしてひまわり畑。この3つが揃った風景は、舟橋村でしか見られません。" },
              { icon: "🤝", title: "半年間、会い続ける理由", body: "種まきから収穫まで半年間。畑に行けば誰かに会える。定期的に顔を合わせる関係が自然に生まれます。" },
              { icon: "👶", title: "子どもたちの「やってみたい」", body: "種をまいて、育てて、油にして、売る。教科書にはない学びを畑で体験します。" },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i % 2 === 0 ? 0 : 1}>
                <div className="p-7 rounded-2xl border border-brown/8 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] mb-3.5 bg-gold-pale">
                    {card.icon}
                  </div>
                  <h3 className="font-[Klee_One] text-base text-brown mb-2">{card.title}</h3>
                  <p className="text-[13px] text-brown-mid leading-relaxed">{card.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== THEMES ===== */}
      <section id="themes" className="py-24 bg-cream">
        <div className="max-w-[1100px] mx-auto px-6">
          <Reveal>
            <p className="font-[Klee_One] text-xs text-gold tracking-[0.2em] mb-3">THREE THEMES</p>
            <h2 className="font-[Shippori_Mincho_B1] font-bold text-3xl md:text-4xl text-brown mb-12">3つのテーマ</h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: "01", icon: "🏔️", title: "みんなで景色を作る", body: "立山・電車・ひまわり。この村にしかない景色を、住民全員で育てる。見る側ではなく、作る側になる。" },
              { num: "02", icon: "💬", title: "隣の人と話してみる", body: "畑で隣り合い、一緒にピザを作り、お茶をする。交流は仕組みから始まり、やがて日常に変わる。" },
              { num: "03", icon: "✨", title: "新しいことを始める", body: "デジタルスタンプ、オンライン参加。小さな村だから試せる、やさしい実験。日本一わくわくする挑戦を。" },
            ].map((theme, i) => (
              <Reveal key={theme.num} delay={i}>
                <div className="bg-white rounded-3xl p-9 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all h-full">
                  <span className="absolute top-4 right-5 font-[Shippori_Mincho_B1] text-5xl font-bold text-gold-light">
                    {theme.num}
                  </span>
                  <div className="w-13 h-13 rounded-full flex items-center justify-center text-2xl mb-4 bg-gold-pale">
                    {theme.icon}
                  </div>
                  <h3 className="font-[Klee_One] text-lg text-brown mb-2.5">{theme.title}</h3>
                  <p className="text-[13px] text-brown-mid leading-relaxed">{theme.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TIMELINE ===== */}
      <section id="timeline" className="py-24 bg-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <Reveal>
            <p className="font-[Klee_One] text-xs text-gold tracking-[0.2em] mb-3">SCHEDULE</p>
            <h2 className="font-[Shippori_Mincho_B1] font-bold text-3xl md:text-4xl text-brown mb-4">半年間のながれ</h2>
            <p className="text-[15px] text-brown-mid mb-12">種まきから収穫まで、ひまわりと一緒に過ごす半年間。</p>
          </Reveal>

          <Reveal>
            <div className="relative pl-12">
              <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-gold/30" />
              {[
                { month: "5月", title: "準備期間", desc: "サイト公開と畑の準備。委員会メンバーの紹介や畑の準備風景を共有します。", active: true },
                { month: "6月", title: "第一回 種まきイベント", desc: "みんなで畑に集合。名札を作り、区画に種をまき、公園でひまわり油のピザを一緒に作って食べます。", active: true },
                { month: "7〜8月", title: "成長見守り・開花", desc: "委員会メンバーが定期的に畑を撮影し、成長の様子を共有。開花時には写真教室を開催。" },
                { month: "9〜10月", title: "収穫・搾油", desc: "収穫祭を開催。搾油体験や料理教室で、自分たちが育てたひまわりの実りを味わいます。" },
                { month: "11月〜", title: "振り返り・次年度へ", desc: "一年を振り返り、次年度の企画を考える。参加者みんなの物語は、ここから始まります。" },
              ].map((item) => (
                <div key={item.month} className="relative pb-10 last:pb-0">
                  <div className={`absolute -left-[39px] top-1 w-[18px] h-[18px] rounded-full border-[3px] border-gold z-10 ${item.active ? "bg-gold" : "bg-cream"}`} />
                  <p className="font-[Klee_One] text-[13px] text-gold font-semibold mb-1">{item.month}</p>
                  <p className="font-[Klee_One] text-[17px] text-brown font-semibold mb-1.5">{item.title}</p>
                  <p className="text-[13px] text-brown-mid">{item.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== STAMP PREVIEW ===== */}
      <section className="py-24 bg-gradient-to-br from-cream to-cream-dark relative overflow-hidden">
        {/* セクション背景にリーリーをぼんやり（歩いてるバージョン） */}
        <img
          src="/lily-walk.png"
          alt=""
          className="hidden md:block absolute -right-12 top-12 w-48 opacity-10 pointer-events-none select-none"
          aria-hidden
        />
        <div className="max-w-[1100px] mx-auto px-6 relative">
          <Reveal>
            <div className="flex items-center gap-3 mb-3">
              <p className="font-[Klee_One] text-xs text-gold tracking-[0.2em]">DIGITAL STAMP RALLY</p>
              <img src="/lily.png" alt="" className="w-8 h-8 select-none" aria-hidden />
            </div>
            <h2 className="font-[Shippori_Mincho_B1] font-bold text-3xl md:text-4xl text-brown mb-4">スタンプラリー</h2>
            <p className="text-[15px] text-brown-mid mb-12 max-w-xl">
              イベントに参加するたびにスタンプが集まります。集めたスタンプは特典の「鍵」に。
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Reveal>
              <StampCard />
            </Reveal>

            <div className="space-y-5">
              {[
                { icon: "📸", title: "自分だけのスタンプ", body: "イベント当日に撮った写真がスタンプに組み込まれ、世界にひとつだけのデザインになります。" },
                { icon: "🌱", title: "育つスタンプ", body: "種まきスタンプは畑のひまわりと一緒に変化。種→芽→葉→つぼみ→開花の5段階で成長します。" },
                { icon: "🔑", title: "スタンプが「鍵」になる", body: "スタンプ数に応じて特典がアンロック。畑ライブカメラ、記念壁紙など、いろいろな特典が待っています。" },
                { icon: "♾️", title: "ずっと残る記録", body: "参加の記録は消えません。10年後にも振り返れる、あなたの半年間の物語。" },
              ].map((feat, i) => (
                <Reveal key={feat.title} delay={i}>
                  <div className="flex gap-4 items-start p-5 rounded-2xl bg-white hover:shadow-md transition">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 bg-gold-pale">{feat.icon}</div>
                    <div>
                      <h4 className="font-[Klee_One] text-sm text-brown mb-1">{feat.title}</h4>
                      <p className="text-xs text-brown-mid leading-relaxed">{feat.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
              <Reveal delay={3}>
                <Link href="/stamp" className="inline-flex items-center gap-2 text-sm text-gold font-semibold hover:underline mt-2">
                  スタンプの詳細を見る →
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FESTIVAL / EVENT ===== */}
      <section className="py-24 bg-white" id="event">
        <div className="max-w-[1100px] mx-auto px-6">
          <Reveal>
            <p className="font-[Klee_One] text-xs text-gold tracking-[0.2em] mb-3">SUNFLOWER FESTIVAL</p>
            <h2 className="font-[Shippori_Mincho_B1] font-bold text-3xl md:text-4xl text-brown mb-4">
              ひまわり祭り、やりませんか。
            </h2>
            <p className="text-[15px] text-brown-mid max-w-2xl mb-12 leading-relaxed">
              種まきも、開花も、収穫も——ただのイベントじゃつまらない。<br />
              みんなが集まって、食べて、笑って、景色を作る「祭り」にしたい。<br />
              そしてこの祭りは、日本中から遊びに来れるようにしたい。
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Reveal>
              <div className="bg-cream rounded-3xl p-8 h-full">
                <div className="text-3xl mb-4">🌱</div>
                <h3 className="font-[Klee_One] text-lg text-brown mb-3">種まき祭り（6月）</h3>
                <p className="text-[13px] text-brown-mid leading-relaxed mb-4">
                  第一回。みんなで畑に入って種をまき、その足で公園に行ってひまわり油のピザを焼く。
                  畑の隣では地元のおばあちゃんが野菜を売っていて、子どもたちはかかしを作っている。
                  DAOワゴンが村を走り、スマホをかざすとスタンプが光る。
                </p>
                <p className="text-[13px] text-green font-semibold">参加者募集中</p>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div className="bg-cream rounded-3xl p-8 h-full">
                <div className="text-3xl mb-4">🌻</div>
                <h3 className="font-[Klee_One] text-lg text-brown mb-3">開花祭り（8月）</h3>
                <p className="text-[13px] text-brown-mid leading-relaxed mb-4">
                  満開のひまわり畑の前で、かぼちゃ電車が走る。プロカメラマンの写真教室、
                  バーチャルひまわり迷路、夕暮れのライトアップ。
                  この日のためにみんなが育てた景色が、ここに完成する。
                </p>
                <p className="text-[13px] text-brown-light">企画中</p>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="bg-gradient-to-br from-[#1a1832] to-[#2a1f3d] rounded-3xl p-8 md:p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(212,160,23,0.15),transparent_70%)]" />
              <div className="relative">
                <p className="text-xs text-gold/70 tracking-[0.15em] mb-3">WEB3 COMMUNITY × VILLAGE</p>
                <h3 className="font-[Shippori_Mincho_B1] font-bold text-xl md:text-2xl mb-4">
                  NFTコミュニティのみなさん、<br />
                  日本一小さな村に遊びに来ませんか。
                </h3>
                <p className="text-white/60 text-[13px] leading-relaxed max-w-lg mb-6">
                  CNP、NinjaDAO——日本のNFTコミュニティが大切にしてきた「応援」と「地方創生」。
                  その想いを、舟橋村で形にしませんか。
                  日本一小さな村で、NFTを使って住民の交流を生み出すこのプロジェクト。
                  コミュニティの力を借りて、もっと面白くしたい。
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-white/10 rounded-xl px-4 py-2.5 text-xs text-white/70">
                    🎪 祭りにブース出展
                  </div>
                  <div className="bg-white/10 rounded-xl px-4 py-2.5 text-xs text-white/70">
                    🎨 コラボNFT企画
                  </div>
                  <div className="bg-white/10 rounded-xl px-4 py-2.5 text-xs text-white/70">
                    🚃 聖地巡礼ツアー
                  </div>
                  <div className="bg-white/10 rounded-xl px-4 py-2.5 text-xs text-white/70">
                    🛠 一緒にプロダクトを作る
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== CTA（オーナー制度版・一時非表示） ===== */}
      {false && (
      <section className="bg-brown text-white text-center py-20 px-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-[250px] h-[250px] rounded-full bg-green/10 blur-3xl" />
        <div className="relative inline-block mb-6">
          <img
            src="/lily.png"
            alt="レインボーリーリー"
            className="w-24 mx-auto drop-shadow-2xl animate-[float_4s_ease-in-out_infinite] select-none"
          />
        </div>
        <Reveal>
          <h2 className="font-[Shippori_Mincho_B1] font-bold text-3xl md:text-4xl mb-4 relative">
            この景色に、<br />あなたも加わりませんか。
          </h2>
        </Reveal>
        <Reveal delay={1}>
          <p className="text-white/60 mb-8 relative">第1期オーナー募集中。現地参加もオンライン参加も。</p>
        </Reveal>
        <Reveal delay={2}>
          <Link
            href="/owner"
            className="inline-flex items-center gap-2 bg-gold text-brown px-10 py-4 rounded-full font-[Klee_One] font-semibold text-[15px] shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all relative"
          >
            オーナーになる
          </Link>
        </Reveal>
      </section>
      )}

      {/* ===== CTA（スタンプラリーへの誘導・現在表示中） ===== */}
      <section className="bg-brown text-white text-center py-20 px-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-[250px] h-[250px] rounded-full bg-green/10 blur-3xl" />

        <div className="relative inline-block mb-6">
          <img
            src="/lily.png"
            alt="レインボーリーリー"
            className="w-24 mx-auto drop-shadow-2xl animate-[float_4s_ease-in-out_infinite] select-none"
          />
        </div>

        <Reveal>
          <h2 className="font-[Shippori_Mincho_B1] font-bold text-3xl md:text-4xl mb-4 relative">
            この景色に、<br />あなたも加わりませんか。
          </h2>
        </Reveal>
        <Reveal delay={1}>
          <p className="text-white/60 mb-8 relative">イベントに参加して、みんなで畑を育てよう。</p>
        </Reveal>
        <Reveal delay={2}>
          <Link
            href="/stamp"
            className="inline-flex items-center gap-2 bg-gold text-brown px-10 py-4 rounded-full font-[Klee_One] font-semibold text-[15px] shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all relative"
          >
            スタンプラリーを見る
          </Link>
        </Reveal>
      </section>

      <Footer />
    </>
  );
}
