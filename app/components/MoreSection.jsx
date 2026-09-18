"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

const MOODS = [
  {
    id: "01",
    tag: "Cat",
    subtitle: "EXPLORE MY CAT CURSOR",
    image: "/cat.jpg",
    link: "https://github.com/bipasasen765-netizen/cat-cursor", // <-- পরবর্তীতে এখানে আপনার আসল লিংক বসাবেন
  },
  {
    id: "02",
    tag: "Coco",
    subtitle: "EXPLORE MY COCO AI",
    image: "/coco.jpg",
    link: "https://collage-ai-chat-bot-coco.vercel.app", // <-- পরবর্তীতে এখানে আপনার আসল লিংক বসাবেন
  },
  {
    id: "03",
    tag: "Docy",
    subtitle: "EXPLORE MY PDF CONVERTER",
    image: "/pdf.jpg",
    link: "https://docy-doc.ai.studio/", // <-- পরবর্তীতে এখানে আপনার আসল লিংক বসাবেন
  },
  {
    id: "04",
    tag: "Devoloper",
    subtitle: "VISIT MY INSTA",
    image: "/me.jpg",
    link: "https://www.instagram.com/bipasa_sen_/", // <-- পরবর্তীতে এখানে আপনার আসল লিংক বসাবেন
  },
  {
    id: "05",
    tag: "Tick-Tack-Teo",
    subtitle: "EXPLORE MY GAME",
    image: "/game.jpg",
    link: " https://bipasasen765-netizen.github.io/tic-tac-game-/", // <-- পরবর্তীতে এখানে আপনার আসল লিংক বসাবেন
  },
];

const PAGE_GLITTERS = [
  { top: "8%", left: "15%", size: 2, delay: "0s" },
  { top: "14%", left: "45%", size: 1.5, delay: "1.2s" },
  { top: "22%", left: "82%", size: 2, delay: "0.5s" },
  { top: "28%", left: "8%", size: 1, delay: "2.1s" },
  { top: "35%", left: "38%", size: 2.5, delay: "1.8s" },
  { top: "42%", left: "65%", size: 1.5, delay: "0.8s" },
  { top: "50%", left: "22%", size: 2, delay: "2.4s" },
  { top: "58%", left: "88%", size: 1.5, delay: "1.5s" },
  { top: "65%", left: "4%", size: 2, delay: "0.2s" },
  { top: "72%", left: "48%", size: 2.5, delay: "2.8s" },
  { top: "80%", left: "18%", size: 1.5, delay: "1.1s" },
  { top: "85%", left: "75%", size: 2, delay: "0.7s" },
  { top: "92%", left: "32%", size: 1.5, delay: "2.0s" },
  { top: "18%", left: "28%", size: 1, delay: "1.4s" },
  { top: "48%", left: "94%", size: 2, delay: "2.6s" },
  { top: "78%", left: "58%", size: 1.5, delay: "0.9s" },
  { top: "6%", left: "68%", size: 2, delay: "1.7s" },
  { top: "62%", left: "35%", size: 1, delay: "2.3s" },
  { top: "88%", left: "90%", size: 2, delay: "0.4s" },
  { top: "38%", left: "14%", size: 1.5, delay: "1.9s" },
];

export default function MoreSection() {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const baseImgRef = useRef(null);
  const isLoaded = useRef(false);
  const containerRef = useRef(null);

  const pointsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const prevPointRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // স্ক্রোল ট্র্যাকিং: হিরো সেকশন থেকে নিচে নামলে প্রতিবার রি-অ্যানিমেট হবে
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // ১. বেস ইমেজ ক্যানভাসে শার্প রেন্ডার
  const drawBaseImage = (ctx) => {
    const canvas = canvasRef.current;
    if (!canvas || !baseImgRef.current) return;

    const img = baseImgRef.current;
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1.0;

    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);

    const shiftX = (canvas.width - img.width * ratio) / 2;
    const shiftY = (canvas.height - img.height * ratio) / 2;

    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      shiftX,
      shiftY,
      img.width * ratio,
      img.height * ratio
    );
  };

  // ২. তুলির ব্রাশ স্ট্যাম্প
  const drawBrushStamp = (ctx, x, y, angle, size, alpha) => {
    const dpr = window.devicePixelRatio || 1;
    const scaledX = x * dpr;
    const scaledY = y * dpr;
    const scaledSize = size * dpr;

    ctx.save();
    ctx.translate(scaledX, scaledY);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;

    const bristlesCount = 8;
    for (let i = 0; i < bristlesCount; i++) {
      const offsetX = (Math.random() - 0.5) * (scaledSize * 0.35);
      const offsetY = ((i - bristlesCount / 2) / bristlesCount) * (scaledSize * 0.85);
      const bristleW = scaledSize * (0.6 + Math.random() * 0.4);
      const bristleH = (scaledSize / bristlesCount) * (1.2 + Math.random() * 0.6);

      ctx.beginPath();
      ctx.ellipse(offsetX, offsetY, bristleW / 2, bristleH / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#000000";
      ctx.fill();
    }
    ctx.restore();
  };

  // ৩. মাউস মুভমেন্ট ট্র্যাকিং ও অটো-হিলিং
  const updateAndRender = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isLoaded.current) return;
    const ctx = canvas.getContext("2d");

    if (isHoveredRef.current) {
      pointsRef.current.push({
        x: mousePosRef.current.x,
        y: mousePosRef.current.y,
        angle: prevPointRef.current?.angle || 0,
        size: 80,
        alpha: 1.0,
      });
    }

    drawBaseImage(ctx);
    ctx.globalCompositeOperation = "destination-out";

    for (let i = pointsRef.current.length - 1; i >= 0; i--) {
      const pt = pointsRef.current[i];
      drawBrushStamp(ctx, pt.x, pt.y, pt.angle, pt.size, pt.alpha);
      pt.alpha -= 0.045;

      if (pt.alpha <= 0) {
        pointsRef.current.splice(i, 1);
      }
    }

    if (pointsRef.current.length > 0 || isHoveredRef.current) {
      animFrameIdRef.current = requestAnimationFrame(updateAndRender);
    } else {
      animFrameIdRef.current = null;
      drawBaseImage(ctx);
    }
  };

  const startAnimation = () => {
    if (!animFrameIdRef.current) {
      animFrameIdRef.current = requestAnimationFrame(updateAndRender);
    }
  };

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    mousePosRef.current = { x: currentX, y: currentY };
    isHoveredRef.current = true;

    if (prevPointRef.current) {
      const dx = currentX - prevPointRef.current.x;
      const dy = currentY - prevPointRef.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist >= 5) {
        const angle = Math.atan2(dy, dx);
        const steps = Math.max(1, Math.floor(dist / 8));

        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          pointsRef.current.push({
            x: prevPointRef.current.x + dx * t,
            y: prevPointRef.current.y + dy * t,
            angle: angle,
            size: Math.max(50, Math.min(95, 95 - dist * 0.6)),
            alpha: 1.0,
          });
        }
        prevPointRef.current = { x: currentX, y: currentY, angle };
      }
    } else {
      prevPointRef.current = { x: currentX, y: currentY, angle: 0 };
    }

    startAnimation();
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (isLoaded.current) {
      drawBaseImage(ctx);
    }
  };

  useEffect(() => {
    const img = new Image();
    img.src = "/reveal-base.jpg";
    img.onload = () => {
      baseImgRef.current = img;
      isLoaded.current = true;
      resizeCanvas();
    };

    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : MOODS.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < MOODS.length - 1 ? prev + 1 : 0));
  };

  return (
    <section
      ref={sectionRef}
      id="more"
      className="relative w-full h-screen min-h-[750px] bg-[#050505] text-white flex flex-col justify-between px-8 sm:px-14 py-8 select-none border-t border-white/5 overflow-hidden [perspective:1200px]"
    >
      <style>{`
        @keyframes softPulse {
          0%, 100% { opacity: 0.1; transform: scale(0.8); }
          50% { opacity: 0.55; transform: scale(1.3); }
        }
        .glitter-twinkle { animation: softPulse 3.5s ease-in-out infinite; }
      `}</style>

      {/* ================= ১. সিলভার-গ্রে লিকুইড অ্যানিমেটেড শেডার গ্রেডিয়েন্ট ================= */}
      <div 
        style={{
          opacity: isVisible ? 0.12 : 0,
          transform: isVisible ? "scale(1)" : "scale(1.15)",
          transition: "opacity 1.5s ease-out, transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="absolute inset-x-12 inset-y-16 pointer-events-none z-0"
      >
        <ShaderGradientCanvas
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <ShaderGradient
            type="waterPlane"
            animate="on"
            uSpeed={0.25}
            uStrength={2.8}
            uDensity={1.2}
            uFrequency={3.5}
            color1="#050505"
            color2="#94a3b8"
            color3="#1e293b"
            cDistance={8.6}
            cPolarAngle={95}
            lightType="3d"
            brightness={0.85}
            grain="on"
            grainBlending={0.12}
          />
        </ShaderGradientCanvas>
      </div>

      {/* ================= ২. গোল্ডেন গ্লিটার ডাস্ট ================= */}
      <div 
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 1.8s ease-out 0.2s",
        }}
        className="absolute inset-0 pointer-events-none z-[1]"
      >
        {PAGE_GLITTERS.map((g, idx) => (
          <div
            key={idx}
            style={{
              top: g.top,
              left: g.left,
              width: `${g.size}px`,
              height: `${g.size}px`,
              animationDelay: g.delay,
            }}
            className="glitter-twinkle absolute rounded-full bg-amber-300/60 shadow-[0_0_6px_rgba(251,191,36,0.35)]"
          />
        ))}
      </div>

      {/* ================= ৩. টপ হেডার অংশ ================= */}
      <div className="z-20 w-full relative shrink-0 pt-4 sm:pt-6">
        <div className="flex items-start justify-between">
          
          {/* বামপাশের হেডার টেক্সট */}
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0) translateZ(0)" : "translateY(-40px) translateZ(-60px)",
              transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-zinc-400">
                Explore
              </span>
              <div 
                style={{
                  width: isVisible ? "32px" : "0px",
                  transition: "width 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.25s",
                }}
                className="h-[1px] bg-zinc-600" 
              />
            </div>
            <h2 className="text-4xl sm:text-5xl font-serif text-white tracking-tight mt-1.5">
              Wellcome to my library
            </h2>
            <p className="text-[10px] sm:text-xs font-mono tracking-[0.2em] text-zinc-400 uppercase mt-3.5">
                Explore  creations. Learning. Achieving.
            </p>
          </div>

          {/* ডানপাশের সাব-হেডার */}
          <div 
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateX(0)" : "translateX(35px)",
              transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
            }}
            className="text-right hidden sm:block pt-1"
          >
            <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-amber-100/70 leading-relaxed">
              A CALMER MIND <br /> A BRIGHTER YOU
            </p>
            <div 
              style={{
                width: isVisible ? "24px" : "0px",
                transition: "width 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.35s",
              }}
              className="h-[1.5px] bg-amber-200/40 ml-auto mt-2" 
            />
          </div>
        </div>
      </div>

      {/* ================= ৪. মূল মাঝের সেকশন (স্লাইডার + ওভাল ফ্রেম) ================= */}
      <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-20 my-auto py-2">
        
        {/* বামপাশে: নেটফ্লিক্স স্লাইডার + প্রগ্রেস বার */}
        <div 
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible 
              ? "translateX(0) translateZ(0) rotateY(0deg)" 
              : "translateX(-80px) translateZ(-80px) rotateY(12deg)",
            transition: "opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
          }}
          className="lg:col-span-6 relative flex flex-col items-center [transform-style:preserve-3d]"
        >
          <div className="relative w-full flex items-center">
            <button
              onClick={handlePrev}
              aria-label="Previous Slide"
              className="absolute -left-3 sm:-left-5 z-30 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 hover:border-amber-400/80 flex items-center justify-center text-zinc-300 hover:text-amber-200 hover:scale-105 shadow-[0_4px_20px_rgba(0,0,0,0.8)] transition-all cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="w-full overflow-hidden px-4 py-4">
              <div
                className="flex items-center gap-5 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{
                  transform: `translateX(calc(-${currentIndex * 185}px + 40px))`,
                }}
              >
                {MOODS.map((item, idx) => {
                  const isSelected = currentIndex === idx;
                  const distance = Math.abs(currentIndex - idx);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setCurrentIndex(idx)}
                      style={{
                        opacity: isVisible 
                          ? (isSelected ? 1 : Math.max(0.12, 0.65 - distance * 0.28))
                          : 0,
                        transform: isVisible 
                          ? (isSelected ? "scale(1.05)" : "scale(0.92)")
                          : "scale(0.7) translateY(40px)",
                        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.35 + idx * 0.07}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.35 + idx * 0.07}s`,
                      }}
                      className={`relative flex-shrink-0 origin-bottom w-[170px] sm:w-[190px] h-[260px] sm:h-[290px] rounded-2xl overflow-hidden cursor-pointer bg-zinc-950 ${
                        isSelected
                          ? "ring-2 ring-amber-400/90 shadow-[0_0_30px_rgba(251,191,36,0.25)]"
                          : "ring-1 ring-white/10 hover:ring-white/20"
                      }`}
                    >
                      <img
                        src={item.image}
                        alt={item.tag}
                        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                      <div className="absolute bottom-4 left-4 right-4 text-left">
                        {/* লিঙ্কযুক্ত হেডলাইন (Underline ছাড়া ও নতুন ট্যাবে ওপেন) */}
                        <h4 className="text-base font-serif font-medium text-white">
                          <a
                            href={item.link || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="no-underline text-white hover:text-amber-300 transition-colors duration-200 inline-block"
                          >
                            {item.tag}
                          </a>
                        </h4>

                        <p className="text-[8px] font-mono tracking-wider text-zinc-400 uppercase mt-1 leading-tight line-clamp-2">
                          {item.subtitle}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-500">
                            {item.id}
                          </span>
                          {isSelected && (
                            <div className="w-8 h-[1.5px] bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleNext}
              aria-label="Next Slide"
              className="absolute -right-3 sm:-right-5 z-30 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 hover:border-amber-400/80 flex items-center justify-center text-zinc-300 hover:text-amber-200 hover:scale-105 shadow-[0_4px_20px_rgba(0,0,0,0.8)] transition-all cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#050505] to-transparent pointer-events-none z-10" />
          </div>

          {/* প্রগ্রেস বার: স্লাইডারের কার্ডগুলোর ঠিক নিচে */}
          <div 
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.65s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.65s",
            }}
            className="w-full flex items-center justify-start gap-2 pl-6 mt-4"
          >
            {MOODS.map((_, i) => (
              <div
                key={i}
                className={`h-[2px] rounded-full transition-all duration-300 ${
                  currentIndex === i
                    ? "w-10 bg-amber-400 shadow-[0_0_8px_#f59e0b]"
                    : "w-6 bg-zinc-700/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ডানপাশে: ওভাল ফ্রেম + কার্সার রিভিল এলাকা */}
        <div 
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible 
              ? "translateX(0) translateZ(0) rotateY(0deg) scale(1)" 
              : "translateX(80px) translateZ(-100px) rotateY(-14deg) scale(0.85)",
            transition: "opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.35s, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.35s",
          }}
          className="lg:col-span-6 flex justify-center lg:justify-end [transform-style:preserve-3d]"
        >
          <div className="relative w-full max-w-[540px] h-[440px] sm:h-[480px] flex items-center justify-center p-2">
            
            {/* ফ্রেমের পেছনের গ্লিটার্স */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute inset-8 bg-amber-500/[0.05] blur-[85px] rounded-full" />
              <div className="glitter-twinkle absolute top-8 left-2/8 w-[1.5px] h-[1.5px] rounded-full bg-amber-300/60 shadow-[0_0_6px_rgba(251,191,36,0.35)]" style={{ animationDelay: "0.2s" }} />
              <div className="glitter-twinkle absolute top-8 left-8/10 w-[1.5px] h-[1.5px] rounded-full bg-amber-300/60 shadow-[0_0_6px_rgba(251,191,36,0.35)]" style={{ animationDelay: "1.1s" }} />
              <div className="glitter-twinkle absolute top-3 left-4/10 w-[1.5px] h-[1.5px] rounded-full bg-amber-300/60 shadow-[0_0_6px_rgba(251,191,36,0.35)]" style={{ animationDelay: "0.6s" }} />
              <div className="glitter-twinkle absolute top-6 right-1/4 w-[2px] h-[2px] rounded-full bg-amber-300/60 shadow-[0_0_6px_rgba(251,191,36,0.35)]" style={{ animationDelay: "1.7s" }} />
              <div className="glitter-twinkle absolute top-10 left-1/4 w-[1px] h-[1px] rounded-full bg-amber-300/50 shadow-[0_0_4px_rgba(251,191,36,0.3)]" style={{ animationDelay: "2.3s" }} />

              <div className="glitter-twinkle absolute top-1/3 left-4 w-[2px] h-[2px] rounded-full bg-amber-300/60 shadow-[0_0_6px_rgba(251,191,36,0.35)]" style={{ animationDelay: "0.8s" }} />
              <div className="glitter-twinkle absolute top-1/2 left-2 w-[1.5px] h-[1.5px] rounded-full bg-amber-300/60 shadow-[0_0_6px_rgba(251,191,36,0.35)]" style={{ animationDelay: "1.4s" }} />
              <div className="glitter-twinkle absolute bottom-1/3 left-5 w-[1px] h-[1px] rounded-full bg-amber-300/50 shadow-[0_0_4px_rgba(251,191,36,0.3)]" style={{ animationDelay: "2.0s" }} />

              <div className="glitter-twinkle absolute top-1/4 right-6 w-[1.5px] h-[1.5px] rounded-full bg-amber-300/60 shadow-[0_0_6px_rgba(251,191,36,0.35)]" style={{ animationDelay: "0.4s" }} />
              <div className="glitter-twinkle absolute top-1/2 right-2 w-[2px] h-[2px] rounded-full bg-amber-300/60 shadow-[0_0_6px_rgba(251,191,36,0.35)]" style={{ animationDelay: "1.9s" }} />
              <div className="glitter-twinkle absolute bottom-1/3 right-4 w-[1px] h-[1px] rounded-full bg-amber-300/50 shadow-[0_0_4px_rgba(251,191,36,0.3)]" style={{ animationDelay: "2.5s" }} />

              <div className="glitter-twinkle absolute bottom-5 left-1/4 w-[2px] h-[2px] rounded-full bg-amber-300/60 shadow-[0_0_6px_rgba(251,191,36,0.35)]" style={{ animationDelay: "1.0s" }} />
              <div className="glitter-twinkle absolute bottom-3 left-1/2 -translate-x-1/2 w-[1.5px] h-[1.5px] rounded-full bg-amber-300/60 shadow-[0_0_6px_rgba(251,191,36,0.35)]" style={{ animationDelay: "0.3s" }} />
              <div className="glitter-twinkle absolute bottom-6 right-1/4 w-[2px] h-[2px] rounded-full bg-amber-300/60 shadow-[0_0_6px_rgba(251,191,36,0.35)]" style={{ animationDelay: "1.5s" }} />
              <div className="glitter-twinkle absolute bottom-10 right-1/3 w-[1px] h-[1px] rounded-full bg-amber-300/50 shadow-[0_0_4px_rgba(251,191,36,0.3)]" style={{ animationDelay: "2.2s" }} />
            </div>

            {/* ছবির মূল ওভাল কনটেইনার */}
            <div
              ref={containerRef}
              onPointerMove={handlePointerMove}
              onPointerEnter={() => {
                isHoveredRef.current = true;
                startAnimation();
              }}
              onPointerLeave={() => {
                isHoveredRef.current = false;
                prevPointRef.current = null;
              }}
              className="relative w-[95%] h-[80%] overflow-hidden select-none cursor-crosshair group"
              style={{
                borderRadius: "44% 56% 52% 48% / 58% 54% 46% 42%",
              }}
            >
              <img
                src="/reveal-hidden.jpg"
                alt="Hidden Sovereign"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none scale-106"
              />

              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-auto touch-none scale-105"
              />
            </div>

            {/* আর্টিস্টিক ওভাল ফ্রেম (SVG) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              viewBox="0 0 500 480"
            >
              <defs>
                <filter id="distressed-oval-frame" x="-20%" y="-20%" width="140%" height="140%">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.04 0.08"
                    numOctaves="5"
                    result="noise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="100"
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                </filter>
              </defs>

              <path
                d="M 0 0 L 500 0 L 500 480 L 0 480 Z M 250 35 C 135 35, 55 110, 55 240 C 55 370, 135 445, 250 445 C 365 445, 445 370, 445 240 C 445 110, 365 35, 250 35 Z"
                fill="#050505"
                fillRule="evenodd"
                filter="url(#distressed-oval-frame)"
              />

              <path
                d="M 95 405 Q 250 468 405 410"
                fill="none"
                stroke="#050505"
                strokeWidth="36"
                strokeLinecap="round"
                filter="url(#distressed-oval-frame)"
              />
              <path
                d="M 75 375 Q 230 455 390 420"
                fill="none"
                stroke="#050505"
                strokeWidth="22"
                strokeDasharray="25 12 45 8"
                filter="url(#distressed-oval-frame)"
              />

              <ellipse
                cx="250"
                cy="240"
                rx="198"
                ry="208"
                fill="none"
                stroke="rgba(217, 160, 43, 0.45)"
                strokeWidth="4.5"
                strokeDasharray="14 26 8 32 40 20"
                filter="url(#distressed-oval-frame)"
              />
            </svg>

            {/* কার্সার প্রম্পট */}
            <div 
              style={{
                opacity: isVisible ? 0.85 : 0,
                transform: isVisible ? "translate(-50%, 0)" : "translate(-50%, 20px)",
                transition: "opacity 0.9s ease-out 0.85s, transform 0.9s ease-out 0.85s",
              }}
              className="absolute bottom-6 left-1/2 pointer-events-none z-30 flex flex-col items-center gap-2 text-center group-hover:opacity-20 transition-opacity duration-300"
            >
              <div className="w-5 h-7 border-[1.5px] border-zinc-300/80 rounded-full flex justify-center pt-1.5 backdrop-blur-sm">
                <div className="w-1 h-2 bg-zinc-300 rounded-full animate-bounce" />
              </div>
              <span className="text-[9px] font-mono tracking-[0.25em] text-zinc-300 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                Move your cursor <br /> to reveal
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* ================= ৫. বটম অংশ ================= */}
      <div 
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(25px)",
          transition: "opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.75s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.75s",
        }}
        className="flex items-center justify-end z-20 w-full pt-2 border-t border-white/5 relative shrink-0"
      >
        <div className="text-right">
          <span className="font-serif italic text-amber-200/60 text-lg tracking-wider block">
            Feel Explore Be You 
          </span>
          <p className="text-[8px] font-mono tracking-[0.25em] text-zinc-600 uppercase mt-0.5">
            Some moods make better versions of you.
          </p>
        </div>
      </div>
    </section>
  );
}