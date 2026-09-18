"use client";

import { useState } from "react";

const NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    renderIcon: (isSelected, isTransformed) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]">
        <path
          d="m3 9.5 9-7 9 7v10.5a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20V9.5z"
          stroke={isSelected ? (isTransformed ? "#ffffff" : "url(#goldGradient)") : "#ffffff"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="9 22 9 12 15 12 15 22"
          stroke={isSelected ? (isTransformed ? "#ffffff" : "url(#goldGradient)") : "#ffffff"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "info",
    label: "Info",
    renderIcon: (isSelected, isTransformed) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]">
        {/* সার্কেল: ডিফল্ট অবস্থায় হালকা সাদা, অ্যাক্টিভ/হোভারে গোল্ড */}
        <circle
          cx="12"
          cy="12"
          r="9.5"
          stroke={isSelected ? (isTransformed ? "#ffffff" : "url(#goldGradient)") : "rgba(255, 255, 255, 0.4)"}
          strokeWidth="1.6"
        />
        {/* ভেতরের 'i': ফটফটা খাঁটি সাদা */}
        <line
          x1="12"
          y1="11"
          x2="12"
          y2="16.5"
          stroke={isSelected ? (isTransformed ? "#ffffff" : "#ffd866") : "#ffffff"}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle
          cx="12"
          cy="7.5"
          r="1.2"
          fill={isSelected ? (isTransformed ? "#ffffff" : "url(#goldGradient)") : "#ffffff"}
        />
      </svg>
    ),
  },
  {
    id: "more",
    label: "More",
    renderIcon: (isSelected, isTransformed) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]">
        {/* সার্কেল: হালকা সাদা */}
        <circle
          cx="12"
          cy="12"
          r="9.5"
          stroke={isSelected ? (isTransformed ? "#ffffff" : "url(#goldGradient)") : "rgba(255, 255, 255, 0.4)"}
          strokeWidth="1.6"
        />
        {/* ভেতরের ৩টি ডট: ফটফটা খাঁটি সাদা */}
        <circle
          cx="7.5"
          cy="12"
          r="1.2"
          fill={isSelected ? (isTransformed ? "#ffffff" : "url(#goldGradient)") : "#ffffff"}
        />
        <circle
          cx="12"
          cy="12"
          r="1.2"
          fill={isSelected ? (isTransformed ? "#ffffff" : "url(#goldGradient)") : "#ffffff"}
        />
        <circle
          cx="16.5"
          cy="12"
          r="1.2"
          fill={isSelected ? (isTransformed ? "#ffffff" : "url(#goldGradient)") : "#ffffff"}
        />
      </svg>
    ),
  },
];

export default function DynamicNav({ isTransformed }) {
  const [activeTab, setActiveTab] = useState("null");
  const [hoveredTab, setHoveredTab] = useState(null);

  return (
    <aside className="absolute left-6 sm:left-10 top-0 bottom-0 z-40 flex flex-col justify-between py-10 pointer-events-none select-none">
      
      {/* গ্লো অ্যানিমেশন ও মেটালিক লাইট সোয়াইপ */} 
      <style>{`
        @keyframes goldSheen {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
        @keyframes goldPulseGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(255,215,80,0.8)) drop-shadow(0 0 16px rgba(212,140,20,0.4)); }
          50% { filter: drop-shadow(0 0 14px rgba(255,235,140,1)) drop-shadow(0 0 25px rgba(247,192,50,0.7)); }
        }
        .shimmer-beam {
          animation: goldSheen 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .gold-sparkle-glow {
          animation: goldPulseGlow 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* মেটালিক গোল্ড গ্র্যাডিয়েন্ট ডেফিনিশন */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff9e6" />
            <stop offset="35%" stopColor="#ffd866" />
            <stop offset="70%" stopColor="#f3be34" />
            <stop offset="100%" stopColor="#a36e14" />
          </linearGradient>
          {/* <defs> ট্যাগের ভেতরে goldGradient-এর নিচে এটি পেস্ট করুন: */}
<linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" stopColor="#ffffff" />
  <stop offset="25%" stopColor="#f1f5f9" />
  <stop offset="50%" stopColor="#94a3b8" />
  <stop offset="75%" stopColor="#e2e8f0" />
  <stop offset="100%" stopColor="#ffffff" />
</linearGradient>
        </defs>
      </svg>

      {/* ১. টপ লোগো (স্টার / পদ্মফুল) */}
      <div className="pointer-events-auto flex items-center gap-3 ml-7">
        {!isTransformed ? (
          <div className="transition-all duration-500 ease-out transform hover:rotate-90 cursor-pointer gold-sparkle-glow">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffd866" className="w-6 h-6">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" strokeWidth="1.5" />
            </svg>
          </div>
        ) : (
          <div className="transition-all duration-500 ease-out transform hover:scale-110 cursor-pointer">
           <svg
  viewBox="0 0 512 512"
  className="w-7 h-7 drop-shadow-[0_0_12px_rgba(255,215,80,0.85)]"
>
  <path
    fill="url(#silverGradient)"
    d="M508.662,257.73c-7.712-8.374-17.751-14.315-28.908-18.126c-11.058-3.722-23.423-5.396-36.424-5.396 c-7.068,0-14.405,0.466-21.848,1.486c1.86-10.683,2.881-21.742,2.881-32.891c0-19.799-3.15-40.064-10.316-60.231l-2.415-6.774 l-7.158,0.555c-30.295,2.595-58.82,12.634-84.104,27.602c-12.364-26.769-39.46-59.864-64.36-73.894 c-24.909,14.03-52.014,47.124-64.378,73.894c-25.283-14.968-53.808-25.007-84.103-27.602l-7.158-0.555l-2.416,6.774 c-7.158,20.167-10.316,40.432-10.316,60.231c0,11.149,1.02,22.208,2.881,32.891c-7.443-1.02-14.78-1.486-21.84-1.486 c-13.009,0-25.374,1.673-36.432,5.396c-11.157,3.811-21.196,9.752-28.908,18.126L0,261.346l1.117,4.84 c13.565,58.918,41.632,98.688,78.898,122.854c37.265,24.248,82.806,32.898,131.595,32.898c12.92,0,26.117-0.652,39.403-1.771 c0.343,0.082,4.612,0.058,4.995,0.082c0.358-0.024,4.636,0,4.978-0.082c13.286,1.118,26.484,1.771,39.403,1.771 c48.798,0,94.33-8.65,131.604-32.898c37.257-24.166,65.324-63.937,78.888-122.854l1.118-4.84L508.662,257.73z M342.487,261.534 c-0.93-27.325-5.754-55.025-14.96-80.211c21.75-13.189,45.908-22.296,71.372-25.554c4.742,15.8,6.88,31.512,6.88,47.034 c0,12.356-1.396,24.526-3.812,36.424c-1.485,6.97-3.346,13.851-5.484,20.633c-5.672,17.465-13.565,34.205-22.95,49.442 c-14.217,23.236-31.691,43.206-48.977,58.085c10.782-23.978,16.821-53.718,17.841-84.756c0.187-3.534,0.278-7.06,0.278-10.594 C342.675,268.602,342.584,265.067,342.487,261.534z M113.101,155.769c25.463,3.257,49.622,12.365,71.372,25.554 c-9.206,25.186-14.029,52.886-14.96,80.211c-0.098,3.533-0.188,7.068-0.188,10.503c0,3.534,0.09,7.06,0.278,10.594 c1.02,31.038,7.06,60.778,17.849,84.756c-17.294-14.878-34.767-34.849-48.985-58.085c-9.385-15.237-17.278-31.977-22.95-49.442 c-2.138-6.782-3.999-13.663-5.484-20.633c-2.416-11.899-3.812-24.068-3.812-36.424C106.221,187.281,108.36,171.57,113.101,155.769z M90.151,373.419c-31.887-20.804-56.42-53.898-69.708-106.401c4.832-4.179,10.774-7.443,17.744-9.76 c8.741-2.971,19.065-4.456,30.491-4.456c8.276,0,17.098,0.742,26.207,2.415c9.663,36.156,28.434,68.768,49.908,94.967 c15.89,19.244,33.168,35.046,50.086,46.202c3.901,2.596,7.811,4.922,11.622,6.881C161.891,402.702,121.932,394.239,90.151,373.419z M284.312,392.198c-0.277,0.18-0.555,0.466-0.832,0.654c-5.762,4.366-11.899,7.149-18.592,8.358 c-0.457,0.098-0.832,0.098-1.298,0.196h-0.367c-0.376,0.089-0.841,0.089-1.306,0.18c0,0,0,0-0.098,0 c-0.628,0.048-5.158,0.082-5.811,0.114c-0.654-0.032-5.191-0.066-5.828-0.114c-0.089,0-0.089,0-0.089,0 c-0.474-0.09-0.939-0.09-1.315-0.18h-0.367c-0.466-0.098-0.832-0.098-1.298-0.196c-6.692-1.208-12.822-3.992-18.592-8.358 c-0.278-0.188-0.547-0.474-0.832-0.654c-11.899-9.385-22.118-26.108-29.088-47.303c-4.929-14.87-8.178-31.879-9.663-49.818 c-0.653-7.524-1.029-15.148-1.029-22.949v-0.09c0-27.137,4.098-55.016,12.455-80.023c1.396-4.179,2.889-8.178,4.464-12.079 c0.833-1.951,1.673-3.901,2.604-5.852c10.308-23.137,29.609-47.964,48.577-60.134c18.95,12.169,38.252,36.996,48.56,60.134 c0.93,1.951,1.771,3.901,2.603,5.852c1.584,3.901,3.069,7.9,4.464,12.079c8.357,25.007,12.455,52.886,12.455,80.023v0.09 c0,7.802-0.376,15.425-1.029,22.949c-1.485,17.939-4.733,34.948-9.662,49.818C306.43,366.09,296.211,382.813,284.312,392.198z M421.849,373.419c-31.78,20.82-71.74,29.283-116.35,29.847c3.82-1.959,7.721-4.285,11.622-6.881 c16.919-11.156,34.197-26.957,50.086-46.202c21.474-26.199,40.245-58.812,49.908-94.967c9.108-1.673,17.93-2.415,26.214-2.415 c11.426,0,21.742,1.485,30.483,4.456c6.97,2.317,12.911,5.582,17.743,9.76C478.269,319.521,453.735,352.615,421.849,373.419z"
  />
</svg>
            
          </div>
        )}
      </div>

      {/* ২. উল্লম্ব নেভবার এলাকা (হালকা ডার্ক গ্লাস ব্যাকগ্রাউন্ড কন্টেইনার) */}
      <div className="pointer-events-auto flex flex-col items-center gap-5 px-3 py-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
        {NAV_ITEMS.map((item) => {
          const isSelected = (hoveredTab || activeTab) === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              onMouseEnter={() => setHoveredTab(item.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className="relative flex flex-col items-center justify-center w-14 cursor-pointer group focus:outline-none"
            >
              {/* আইকন */}
              <div
                className={`transition-transform duration-300 transform group-hover:scale-105 ${
                  isSelected && !isTransformed ? "gold-sparkle-glow" : ""
                }`}
              >
                {item.renderIcon(isSelected, isTransformed)}
              </div>

              {/* টেক্সট লেবেল */}
              <span
                className={`font-serif tracking-widest text-[11px] mt-1 transition-all duration-300 ${
                  isSelected
                    ? isTransformed
                      ? "text-white font-medium drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                      : "bg-gradient-to-b from-[#fffbe6] via-[#ffd65c] to-[#a86e12] bg-clip-text text-transparent font-bold drop-shadow-[0_0_10px_rgba(255,215,80,0.6)]"
                    : "text-white/80 group-hover:text-white"
                }`}
              >
                {item.label}
              </span>

              {/* খাঁটি মেটালিক গোল্ডেন আন্ডারলাইন */}
              <div
                className={`relative mt-1.5 h-[2px] w-7 rounded-full overflow-hidden transition-all duration-300 ${
                  isSelected
                    ? isTransformed
                      ? "bg-white opacity-100 scale-x-100 shadow-[0_0_8px_#ffffff]"
                      : "opacity-100 scale-x-100 bg-gradient-to-r from-[#946214] via-[#fff4ba] via-[#f7c848] to-[#946214] shadow-[0_0_10px_#ffd700,0_0_18px_rgba(247,192,50,0.8),0_0_2px_#fff]"
                    : "opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 bg-gradient-to-r from-[#946214] via-[#ffd700] to-[#946214]"
                }`}
              >
                {/* আন্ডারলাইনের ভেতরের আলোর ঝলকানি (সোয়াইপ) */}
                {isSelected && !isTransformed && (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/95 to-transparent shimmer-beam pointer-events-none" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ৩. বটম লেফট ব্র্যান্ড ট্যাগ */}
      <div className="font-mono text-[9px] tracking-[0.25em] text-[#70685c] uppercase leading-relaxed pointer-events-auto">
        {!isTransformed ? (
          <>
            CREATOR<br />BIPASA<br />SEN
          </>
        ) : (
          <>
            FOREVER<br />WITH<br />ZAYNE
          </>
        )}
      </div>
    </aside>
  );
}