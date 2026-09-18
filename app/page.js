'use client';

import HeroSection from './components/hero/HeroSection';
import MoreSection from './components/MoreSection';

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-slate-950 text-slate-100">
      {/* ১. হিরো সেকশন: ৩৬০° প্যারালাক্স */}
      <HeroSection />

      {/* ২. অপশন ২: অ্যাম্বিয়েন্ট লাইট ব্রিজ (Cinematic Breathing Space) */}
      <div className="relative w-full h-[32vh] bg-slate-960 flex flex-col items-center justify-center overflow-hidden pointer-events-none select-none">
        {/* সেন্টার কস্টিক অরা গ্লো (সিলভার ও শ্যাম্পেন ব্লেন্ড) */}
        <div className="absolute w-[500px] h-[160px] bg-gradient-to-r from-amber-500/10 via-slate-200/15 to-amber-500/10 blur-[90px] rounded-full" />

        {/* সূক্ষ্ম চ্যাপ্টার ডিভাইডার টেক্সট */}
        <div className="relative z-10 flex flex-col items-center gap-2.5 opacity-60 hover:opacity-100 transition-opacity duration-700">
          <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-[#a99f91]">
            — 02 // REVEAL DIMENSION —
          </span>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
      </div>

      {/* ৩. মোর সেকশন: ফুল স্ক্রিন ব্রাশ রিভিল */}
      <MoreSection />
    </main>
  );
}