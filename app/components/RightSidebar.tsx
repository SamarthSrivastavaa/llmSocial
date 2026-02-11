"use client";

/* eslint-disable @next/next/no-img-element */

export function RightSidebar() {
  return (
    <aside className="w-80 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] flex flex-col overflow-hidden text-black shrink-0">
      {/* Profile top */}
      <div className="h-1/3 relative p-6 flex flex-col items-center justify-end">
        {/* Background decorative circles */}
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute top-4 right-4 w-20 h-20 bg-secondary rounded-full opacity-60" />
          <div className="absolute top-10 left-4 w-16 h-16 bg-slate-300 rounded-full opacity-40" />
          <div className="absolute -bottom-10 right-4 w-24 h-24 bg-primary rounded-full opacity-60" />
        </div>

        {/* Avatar */}
        <div className="relative mb-4">
          <img
            alt="Alica Garcia"
            className="w-24 h-24 rounded-full border-4 border-white z-10 relative object-cover bg-slate-200"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7TIppq1KRym627pWOeGAldnU6OdC9HgLTJpbsJEHj5zw-iq-8j6TbjX2uCuqP0dFe7vWwzeN0ygyVRc2S-Q5MW-CwLlJcZXXlKFWRc7ZSkuqih9OZqWBikyDbqcOhVyMWN8KRxZIvaWQlrooRv-_VWr8T8eRWXkUpXxwrKzO2vMdgEuLr0ne8Hdq8yKsHbvAzihI6W7TdDipCeC7IFloyXTigNMm0RIdsujPa7hOBamDDEqvqsJJ-hCS2clUQV9fK62g6ZbdYLHk"
          />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-4 border-slate-50">
            <span className="material-symbols-rounded text-black text-[14px] font-bold">check</span>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-extrabold">Alica Garcia</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Course: UX/UI Design
          </p>
        </div>
      </div>

      {/* Chat section */}
      <div className="flex-1 px-6 py-4 flex flex-col">
        {/* Chat header */}
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-sm font-bold">Chat</h4>
          <div className="flex -space-x-3">
            <img
              alt="chat user"
              className="w-8 h-8 rounded-full border-2 border-slate-50"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDW819-kctpKifrcpE3Tqimp6rs3IXzCEAIt9DCccc7D1J225xAdq1M_oQWsN2bwiIFPvxn_LnFw5wnP3XtqmtZ_F3iY7zlgXV55mKCGfNfn4scmwSLhivX4o732141U4Lxot1xyy5-YovXdAHRQyfEaTmIiUW_CMjLG-E82PD_ctbJXf3toKPOYPqa9KZQyxtiX6mTA_WwSXW4XqDg6bWvTntE2RJAK3YHxBE7_xNaD_hayAmC8ecsw9sX2g7YlHWaOrIBaLPHePI"
            />
            <img
              alt="chat user"
              className="w-8 h-8 rounded-full border-2 border-slate-50"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAl8l1SAax_IMcIwcXVJBiJk8qRSrefhp_mFkw8PLzfMjRMRxO1AgvQVW7IqrJGgmcqDMijCFPxUD0neIHI2FNui4gaBO9C5_JZhDOLraCG46i-rH7EQo3TFbD6Mey8i2Xq8blwC9gvncnBpzrDuEsK93TAPuqFMWSkuSnYeZUn03tMgsg3Lfvx6URy2_WIyNGgqAJHFP_dZwiM13Pd_dLRdfUvzFfafrz4xI5-EDgBrdDuN3vMQlgRz7kLX_GIIXpxe9UvicVHOPc"
            />
            <img
              alt="chat user"
              className="w-8 h-8 rounded-full border-2 border-slate-50"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7rKp0SxaaUwnmyyGv1C4Hp1Coh9a3aCj3B-rBqyjbNN1VEIZioJy1dXyG4Jy9y3Qhvb2dYK_nRFswCTlz2k51WIsiXfy7uek1E27GysqX2Nz-Xber-kLZbVAmvDavGdcefIaY7RllQu3I1x0vvxeTgzBy6rpaqkgdsbB1UirQ4bHdU0f-YLByC6SSiHitpwf1t3bLdwGt77aUVSkwfZjKTNObFp2hH-9T6FbB2Q3bZ_ZaIDNq8z_veHXI0wrFJlmconJqxrbX47U"
            />
          </div>
        </div>

        {/* Emma Wilson online */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <img
              alt="Emma Wilson"
              className="w-10 h-10 rounded-full"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvIGlh033DIF8VewjTmKNWg10cWpKEFBEMuNqUTLqEXZFfcUArq2g9GdPlpJ_iSYPWzNT2lgcYoKmr5yNRHI8FK9_Qk8WcvML1zbw7k8U5HxO3yfciU1XA4u0lzVFT39j6HHowqrrH9KYCZrG_x6Dxvv5hmrvDvEK4kSfL2sSG5MwCpMxxC--zC96rjZnmqvVIpwRk0QZqpKRC2kceb53LTC5NzphDmzZ9sH4QFnbijUEVaThfG3y1kwnisOI8CQaAqMfiIJR6uRc"
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-50" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Online</p>
            <h5 className="text-sm font-bold">Emma Wilson</h5>
          </div>
          <button className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="material-symbols-rounded text-sm text-slate-600">videocam</span>
          </button>
        </div>

        {/* Chat messages */}
        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar mb-4">
          <div className="flex flex-col items-end">
            <div className="bg-slate-200 px-4 py-2 rounded-2xl rounded-tr-none text-xs text-slate-600">
              I corrected my mistakes. Look.
            </div>
            <span className="text-[8px] text-slate-400 mt-1">9:44 a.m. Today</span>
          </div>

          <div className="flex gap-3">
            <img
              alt="Emma"
              className="w-8 h-8 rounded-full shrink-0"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzFhN1qiS9soQISYIncuMIIUIZW3MAYHH27aX6ekVNuZ0rgq_2NGWcjFTRcsuGEHPzGq5oHOZq5a5_3LmMeU9QxFnzZHUovsxKc1NeVByMv02MqYNpXiuJ_wycH0U0EtfBpJ0353jgd1v-VkoEmcksxlKhWtZ4575wCwNI_FWquWr4HqyjEyaQhxOj54fh2jKQ1fVUFndwokKYAYQR1RRDhsAiJxFB0R1u1LSVp3zSNZBesMsxjtqhI1OQFt0rfxZ13aDqhc39Y4w"
            />
            <div>
              <div className="bg-primary/20 text-black px-4 py-3 rounded-2xl rounded-tl-none text-xs leading-relaxed font-medium">
                Alica, I sent you <span className="font-bold underline">new tasks.</span> When you
                do, go to Video lesson number 6.
                <div className="mt-2 flex items-center justify-center w-6 h-6 bg-primary rounded-full">
                  <span className="text-[10px]">👏</span>
                </div>
              </div>
              <span className="text-[8px] text-slate-400 mt-1 block">10:32 a.m. Monday</span>
            </div>
          </div>
        </div>

        {/* Chat input */}
        <div className="bg-white rounded-full flex items-center px-4 py-2 gap-3 border border-slate-200 mb-6">
          <span className="material-symbols-rounded text-slate-400 text-sm">edit</span>
          <input
            className="bg-transparent border-none focus:ring-0 focus:outline-none text-[10px] flex-1 text-black placeholder:text-slate-400"
            placeholder="Write a message"
            type="text"
          />
          <span className="material-symbols-rounded text-slate-400 text-sm">mic</span>
        </div>

        {/* CTA */}
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-1 bg-primary rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <div className="relative bg-primary hover:bg-[#d9ff96] text-black h-16 rounded-[2.5rem] flex items-center px-6 gap-4 transition-colors">
            <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center">
              <span className="material-symbols-rounded">flare</span>
            </div>
            <span className="font-extrabold text-sm flex-1">Create new illustration</span>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
              <span className="material-symbols-rounded text-sm">priority_high</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
