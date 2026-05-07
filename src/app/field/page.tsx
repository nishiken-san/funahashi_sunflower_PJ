import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/RevealOnScroll";

export default function FieldPage() {
  return (
    <>
      <Nav />
      <div className="pt-28 pb-24 bg-cream">
        <div className="max-w-[1100px] mx-auto px-6">
          <Reveal>
            <p className="font-[Klee_One] text-xs text-gold tracking-[0.2em] mb-3">FIELD MAP</p>
            <h2 className="font-[Shippori_Mincho_B1] font-bold text-3xl md:text-4xl text-brown mb-4">
              畑マップ
            </h2>
            <p className="text-[15px] text-brown-mid max-w-2xl mb-12">
              区画ごとのオーナー情報やひまわりの成長状況をここで確認できます。
            </p>
          </Reveal>

          <Reveal>
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-brown/6 min-h-[400px] flex flex-col items-center justify-center text-center">
              <span className="text-6xl mb-6 opacity-30">🌻</span>
              <h3 className="font-[Klee_One] text-lg text-brown mb-2">準備中</h3>
              <p className="text-[13px] text-brown-light max-w-sm leading-relaxed">
                種まきイベント後、ここに畑の区画マップが表示されます。
                オーナーの方は自分の区画のひまわりの成長を確認できるようになります。
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-xs">
                {["定点観測写真", "成長ステージ", "区画検索"].map((label) => (
                  <div key={label} className="bg-cream rounded-xl p-3 text-center">
                    <p className="text-[10px] text-brown-light">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
      <Footer />
    </>
  );
}
