"use client";

import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";

/* eslint-disable @next/next/no-img-element */

export default function Home() {
  return (
    <div className="h-screen bg-slate-100 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-[1400px] h-[calc(100vh-2rem)] bg-white rounded-[3rem] shadow-2xl flex overflow-hidden p-6 gap-6 border border-slate-200">
        {/* === LEFT SIDEBAR === */}
        <Sidebar />

        {/* === MAIN CONTENT === */}
        <main className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {/* Header */}
          <header className="flex justify-between items-center mb-8 pt-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-black">Good morning, Agent</h1>
              <p className="text-slate-500 font-medium">
                Let&apos;s make today a productive and successful day! 🔥
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full w-64 focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                  placeholder="Search..."
                  type="text"
                />
              </div>
              <button className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full">
                <span className="material-symbols-rounded text-slate-600">
                  notifications
                </span>
              </button>
            </div>
          </header>

          {/* Topics */}
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4">Topics</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Topic 1 */}
              <div className="p-6 border-2 border-slate-100 rounded-3xl flex items-center gap-6 group hover:border-primary transition-colors cursor-pointer">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-rounded text-3xl">title</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      alt="Teacher"
                      className="w-6 h-6 rounded-full bg-slate-200"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgoLP77tAgCbojYzIgyptQ7UcK5Sae3cZ_93qHUgGVRBz4_fNF-yZ8SDhtp2yzO4Bxv88TJzD6X-akXGpuHkVcY2r2Qv9fbyZYzt-ph_Jh6ioOezTmzN4b7WVTG7EvBng6KZODHVLyuow5CSceWVAqcsCUl7arXBGp8XeZ0EJNNNrPdQEXanRkrenNZ7M0qZrSygJ6hVxnxR0ezlbKSg58OGuVGv2bSoCRUTVVSQXKTrV1zlCHxuD02JjCFkmhUQuKtTB2ww2lj0"
                    />
                    <span className="text-xs font-medium text-slate-400">Teacher: Mikel Nelson</span>
                  </div>
                  <h3 className="font-bold text-lg">Typography basics</h3>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs font-semibold text-slate-400">40 min</span>
                    <span className="text-xs font-semibold text-slate-400">5 assignments</span>
                  </div>
                </div>
              </div>
              {/* Topic 2 */}
              <div className="p-6 border-2 border-slate-100 rounded-3xl flex items-center gap-6 group hover:border-primary transition-colors cursor-pointer">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-rounded text-3xl text-secondary">color_lens</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      alt="Teacher"
                      className="w-6 h-6 rounded-full bg-slate-200"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQ24C7t3BDR23wD1kXk_rCwRX64b-HFwBKlZQooLag56qiBcj_xz0krHBTUHzEMXt0uABIjPlRmHSFOp-ioXl0bd2hQ5I1V2eRngGlGBe_DLs9582f17Gsja7UegTQ_3TxX2agpvOf9BIzfMKE0IQkTvTAb2I4yFmOAJ0pN68OkGOX7qFmZGmIeGYpAkj3CkqlZuIgau1k5jXtvATqVwPM-RsiqTFNIh4k0Z5COu0HZ8QxZS2u3PLpD32bmlyoO39zyQZGkaW07qo"
                    />
                    <span className="text-xs font-medium text-slate-400">Teacher: Kristian Tailor</span>
                  </div>
                  <h3 className="font-bold text-lg">Color circle</h3>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs font-semibold text-slate-400">25 min</span>
                    <span className="text-xs font-semibold text-slate-400">5 assignments</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* My work environment banner */}
          <section className="mb-6">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex items-center justify-between">
              <div className="relative z-10">
                <div className="flex gap-4 text-xs font-medium text-slate-300 mb-2">
                  <span>14 Layers</span>
                  <span>23 Files</span>
                  <span>2 Projects</span>
                </div>
                <h2 className="text-4xl font-bold mb-6">My work environment</h2>
                <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-primary transition-all">
                  Open
                </button>
              </div>
              {/* Bar chart */}
              <div className="flex items-end gap-2 relative z-10">
                <div className="w-4 h-12 bg-slate-600 rounded-full" />
                <div className="w-4 h-20 bg-slate-600 rounded-full" />
                <div className="w-4 h-24 bg-secondary rounded-full relative">
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-slate-600 px-2 py-1 rounded text-white whitespace-nowrap">
                    +2,5 h
                  </span>
                </div>
                <div className="w-4 h-16 bg-slate-600 rounded-full" />
                <div className="w-4 h-12 bg-slate-600 rounded-full" />
              </div>
              {/* Decorative circles */}
              <div className="absolute right-0 top-0 h-full w-1/3 flex items-center justify-end pr-8 pointer-events-none">
                <div className="relative w-48 h-48">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary rounded-full opacity-90" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-300 rounded-full opacity-80" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary rounded-full" />
                </div>
              </div>
            </div>
          </section>

          {/* Bottom grid: 5/12 + 7/12 */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left column */}
            <div className="col-span-5 space-y-4">
              {/* Passed tests */}
              <div className="bg-primary/20 p-6 rounded-[2rem] relative overflow-hidden group">
                <div className="flex justify-between items-start mb-10">
                  <h3 className="font-bold text-lg">
                    Passed tests <span className="text-slate-400 font-normal">6</span>
                  </h3>
                  <span className="material-symbols-rounded text-slate-600">calendar_today</span>
                </div>
                <div className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-rounded text-white text-sm">filter_vintage</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold">What is identity?</p>
                  </div>
                  <div className="w-2 h-2 bg-slate-800 rounded-full" />
                </div>
              </div>

              {/* Upcoming tests */}
              <div className="bg-slate-100 p-6 rounded-[2rem]">
                <div className="flex justify-between items-start mb-10">
                  <h3 className="font-bold text-lg">
                    Upcoming tests <span className="text-slate-400 font-normal">2</span>
                  </h3>
                  <span className="material-symbols-rounded text-slate-400">calendar_today</span>
                </div>
                <div className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-rounded text-white text-sm">grid_view</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-black">Figma. Tools</p>
                    <p className="text-[10px] text-slate-400">UX/UI design • 12 July</p>
                  </div>
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                </div>
              </div>

              {/* Go Premium */}
              <div className="bg-slate-100 p-6 rounded-[2rem] flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-xl mb-1">GO PREMIUM</h3>
                  <p className="text-xs text-slate-500">Open up new opportunities</p>
                </div>
                <button className="px-6 py-2 bg-white font-bold rounded-full text-sm flex items-center gap-2 border border-slate-200">
                  Upgrade <span>🚀</span>
                </button>
              </div>
            </div>

            {/* Right column */}
            <div className="col-span-7 space-y-6">
              {/* Vector in design article */}
              <div className="border-2 border-slate-100 rounded-[2rem] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-primary -translate-x-1/2" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">Vector in design</h4>
                    <a
                      className="text-[10px] font-medium text-slate-400 flex items-center gap-1 hover:text-primary"
                      href="#"
                    >
                      <span className="material-symbols-rounded text-xs">link</span> Video link
                    </a>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">1.15 min</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Vector artwork is art that&apos;s made up of vector graphics. These graphics are{" "}
                  <span className="text-secondary font-bold">points, lines, curves</span> and{" "}
                  <span className="text-secondary font-bold">shapes</span> that are based on
                  mathematical formulas. When you scale a vector image file, it isn&apos;t{" "}
                  <span className="text-secondary font-bold">low resolution</span> and there&apos;s
                  no loss of quality, so it can be sized to however large or small...
                </p>
                <div className="flex justify-between items-center mb-6">
                  <button className="text-xs font-bold hover:underline">Read more ↗</button>
                  <button className="text-xs font-bold text-slate-400">Add to bookmarks</button>
                </div>
                <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block mb-1 uppercase tracking-wider">
                      Recommended for viewing
                    </span>
                    <h5 className="font-bold">Easy animation on figma</h5>
                  </div>
                  <button className="bg-secondary text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-orange-500 transition-colors">
                    Watch now{" "}
                    <span className="material-symbols-rounded text-sm">play_arrow</span>
                  </button>
                </div>
              </div>

              {/* Progress / audio player */}
              <div className="bg-slate-100 p-6 rounded-[2rem]">
                <div className="h-2 bg-slate-200 rounded-full mb-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 h-full w-2/3 bg-primary" />
                  <div className="absolute left-[66%] -translate-x-1/2 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-primary" />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 bg-white rounded-full p-2 pr-8 border border-slate-200">
                    <div className="w-10 h-10 bg-primary rounded-full" />
                    <span className="text-slate-400 text-lg">......→</span>
                    <div className="w-10 h-10 bg-primary/40 rounded-full border border-primary/20" />
                  </div>
                  <div className="flex-1 flex items-center gap-4">
                    <img
                      alt="Emma"
                      className="w-12 h-12 rounded-full border-2 border-primary"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFEPKEHUtCZXTPemlY2D68NvHM5pa-y4xJ6GAQZ1kAnXcY6TL1FEVwuqQ60c3q5g-2sMGGkKn4sQoAIAkdUvaJkW2O1YwWU0rqm6dbJRTUPtT6RptPL9T8Jfvs4cM_SW1102hL19w5QqopjBpbBVqq5NHiNPUZf1L23gsGaZXYYIaoj9ywJRyuHEM63G1llA3u7xApx5CGBIeS1Bn-ckDyijxSarZKnlVcwQSy578LY7-4PRUSmoPLowQpQAwPHR-GXLZbmarquUA"
                    />
                    <div className="flex gap-1 h-8 items-center">
                      <div className="w-1 h-3 bg-slate-300 rounded-full" />
                      <div className="w-1 h-6 bg-slate-300 rounded-full" />
                      <div className="w-1 h-4 bg-slate-400 rounded-full" />
                      <div className="w-1 h-8 bg-slate-500 rounded-full" />
                      <div className="w-1 h-5 bg-slate-400 rounded-full" />
                      <div className="w-1 h-3 bg-slate-300 rounded-full" />
                      <div className="w-1 h-6 bg-slate-300 rounded-full" />
                      <div className="w-1 h-4 bg-slate-400 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* === RIGHT SIDEBAR === */}
        <RightSidebar />
      </div>
    </div>
  );
}
