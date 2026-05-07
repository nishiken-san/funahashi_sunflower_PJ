import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/RevealOnScroll";
import StampCard from "@/components/StampCard";
import { REWARDS, GROWTH_STAGES } from "@/config/contract";

export default function StampPage() {
  return (
    <>
      <Nav />
      <div className="pt-28 pb-24 bg-cream">
        <div className="max-w-[1100px] mx-auto px-6">
          <Reveal>
            <p className="font-[Klee_One] text-xs text-gold tracking-[0.2em] mb-3">STAMP RALLY</p>
            <h2 className="font-[Shippori_Mincho_B1] font-bold text-3xl md:text-4xl text-brown mb-4">
              スタンプラリー
            </h2>
            <p className="text-[15px] text-brown-mid max-w-2xl mb-12">
              イベントに参加するたびにスタンプが集まり、特典がアンロックされます。
              スタンプは半年間のあなたの記録として、ずっと残ります。
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-12 items-start mb-20">
            <Reveal>
              <StampCard />
              <p className="text-center text-xs text-brown-light mt-4">
                ↑ タップしてスタンプ取得を体験できます
              </p>
            </Reveal>

            <div>
              <Reveal>
                <h3 className="font-[Klee_One] text-lg text-brown font-semibold mb-6">特典アンロック</h3>
              </Reveal>
              <div className="space-y-4">
                {REWARDS.map((reward, i) => (
                  <Reveal key={reward.title} delay={i}>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-brown/6">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gold-pale shrink-0">
                        {reward.icon}
                      </div>
                      <div>
                        <h4 className="font-[Klee_One] text-[13px] text-brown">{reward.title}</h4>
                        <p className="text-[11px] text-brown-light">スタンプ {reward.stampsRequired}つで解放</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>

          <Reveal>
            <h3 className="font-[Klee_One] text-lg text-brown font-semibold mb-6">育つスタンプ</h3>
            <p className="text-[13px] text-brown-mid mb-8 max-w-xl">
              種まきスタンプは、実際の畑のひまわりと一緒に成長します。
              委員会メンバーが畑を撮影するたびに、あなたのスタンプも変化していきます。
            </p>
          </Reveal>

          <div className="grid grid-cols-5 gap-4 max-w-xl">
            {GROWTH_STAGES.map((stage, i) => (
              <Reveal key={stage.stage} delay={i}>
                <div className="text-center">
                  <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl mb-2
                    ${i === 0 ? "bg-gold-pale ring-2 ring-gold/30" : "bg-cream-dark"}`}>
                    {stage.icon}
                  </div>
                  <p className="font-[Klee_One] text-[11px] text-brown-mid">{stage.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
