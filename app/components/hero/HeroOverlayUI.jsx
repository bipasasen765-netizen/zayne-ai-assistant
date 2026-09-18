"use client";

import { ArrowRight } from "lucide-react";

export default function HeroOverlayUI({ isTransformed, rotationAngle = 0 }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  const clampedAngle = Math.min(360, Math.max(0, rotationAngle));
  const strokeDashoffset = circumference - (clampedAngle / 360) * circumference;

  // প্যারেন্টের ৩60° ড্র্যাগ ইভেন্ট আটকে সরাসরি নতুন ট্যাবে ওপেন করার হ্যান্ডলার
  const handleOpenInNewTab = (e) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      window.open("/chatbot", "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none">
      {/* ================= বাঁপাশের মূল টেক্সট বক্স ================= */}
      <div className="absolute left-34 sm:left-36 top-[30%] -translate-y-1/2 max-w-xl transition-all duration-700">
        {!isTransformed ? (
          <div className="animate-fadeIn">
            <span className="text-[10px] font-mono uppercase tracking-[0.10em] text-[#a0927e] block mb-1.5 pl-3">
              A QUIETER MIND
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif tracking-tight leading-[1.12] mb-3 bg-gradient-to-b from-[#f8f4ed] via-[#ebdcc6] to-[#cfbeaa] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(235,220,198,0.2)]">
              A Brighter <br />
              <span className="relative inline-block pb-3">
                Tomorrow
                <span className="absolute bottom-0 left-0 w-20 h-[1.5px] bg-gradient-to-r from-[#fff7db] via-[#d9b76e] via-50% to-[#9c7a3c] shadow-[0_0_8px_rgba(217,183,110,0.55)]" />
              </span>
            </h1>
          </div>
        ) : (
          <div className="animate-fadeIn relative top-10 left-0">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#a99f91] block mb-2 pl-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
              YOUR QUESTIONS
            </span>

            <h1 className="text-4xl sm:text-5xl font-serif tracking-tight leading-[1.12] mb-6 bg-gradient-to-b from-[#ffffff] via-[#ede6dc] to-[#c7beaf] bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(0,0,0,0.75)]">
              A Smarter <br />
              <span className="relative inline-block pb-3">
                Tomorrow
                <span className="absolute bottom-0 left-0 w-20 h-[1.5px] bg-gradient-to-r from-[#ffffff] via-[#dcd2be] via-50% to-[#7a7060] shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
              </span>
            </h1>

            {/* Zayne Button: pointer-events-auto এবং stopPropagation যুক্ত */}
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()} // ৩60 ড্র্যাগিং ইভেন্টকে ক্লিক আটকে দেওয়া থেকে আটকাবে
              onClick={handleOpenInNewTab}
              className="group relative pointer-events-auto inline-flex items-center gap-2.5 px-5 py-2 rounded-full overflow-hidden transition-all duration-500 cursor-pointer
              bg-white/[0.06] backdrop-blur-2xl border border-white/40 border-t-white/90 border-b-white/20
              shadow-[inset_0_2.5px_2px_rgba(255,255,255,0.95),inset_0_-3px_6px_rgba(255,255,255,0.45),0_8px_20px_rgba(0,0,0,0.65)]
              hover:border-white hover:scale-[1.04] active:scale-[0.97]
              hover:shadow-[0_0_30px_rgba(255,255,255,0.85),0_0_12px_rgba(226,232,240,0.7)]"
            >
              <span className="absolute top-[1.5px] left-2 right-2 h-[46%] rounded-full bg-gradient-to-b from-white via-white/45 to-transparent pointer-events-none opacity-90" />
              <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-gradient-to-b from-white/35 via-slate-100/15 to-slate-400/25 transition-opacity duration-500 pointer-events-none" />
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

              <span className="relative z-10 text-sm font-medium tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                Zayne
              </span>
              <ArrowRight 
                size={15} 
                className="relative z-10 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] transition-transform duration-300 group-hover:translate-x-1" 
              />
            </button>

            <div className="text-[10px] font-mono tracking-[0.25em] text-[#8e8577] mt-4 uppercase pl-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              EXPLORE · MY · PROJECT
            </div>
          </div>
        )}
      </div>

      {/* ================= ডানপাশের ৩৬০° ডায়নামিক রোটেশন উইজেট ================= */}
      <div className="absolute right-8 sm:right-14 top-[58%] flex flex-col items-center gap-2 pointer-events-auto">
        <div className="relative w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm bg-black/25">
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="url(#silverGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.85)]"
            />
          </svg>

          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ transform: `rotate(${rotationAngle}deg)` }}
          >
            <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#ffffff,0_0_6px_#94a3b8]" />
          </div>

          <span className="text-xs font-mono text-[#dcd2c1] opacity-36 relative z-10">
            {clampedAngle}°
          </span>
        </div>

        <span className="text-[9px] font-mono tracking-[0.2em] text-[#938879] uppercase mt-1">
          DRAG TO EXPLORE
        </span>
      </div>

      {isTransformed && (
        <div className="absolute top-8 right-8 sm:right-14 text-right font-mono text-[9px] tracking-[0.25em] text-[#a99f91] uppercase leading-relaxed">
          TRADITION
          <br />
          MEETS
          <br />
          INTELLIGENCE
        </div>
      )}
    </div>
  );
}