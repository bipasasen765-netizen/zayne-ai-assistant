"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import DynamicNav from "./DynamicNav";
import HeroOverlayUI from "./HeroOverlayUI";

const TOTAL_FRAMES = 150;
const STOP_FRAME = 150;

export default function HeroSection() {
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const idleVideoRef = useRef(null);

  const isVideoActive = useRef(false);

  const [images, setImages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const [isTransformed, setIsTransformed] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentFrame = useRef(1);

  // ১. মেমোরিতে ১৫০টি ফ্রেম প্রি-লোড
  useEffect(() => {
    const loadedImgArray = [];
    let loadedCount = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/frames/${i}.jpg`;
      img.onload = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
        if (loadedCount === TOTAL_FRAMES) {
          setLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) setLoaded(true);
      };
      loadedImgArray.push(img);
    }
    setImages(loadedImgArray);
  }, []);

  // ২. হাই-রেজোলিউশন ক্যানভাস রেন্ডারার
  const renderFrame = (frameNum) => {
    const canvas = canvasRef.current;
    if (!canvas || !images[frameNum - 1]) return;
    const ctx = canvas.getContext("2d");
    const img = images[frameNum - 1];

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);

    const shiftX = (canvas.width - img.width * ratio) / 2;
    const shiftY = (canvas.height - img.height * ratio) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

  // ৩. ফ্রেম অনুযায়ী ডিগ্রি ও ভিডিও লজিক
  const updateTexts = (frame) => {
    const angle = Math.round(((frame - 1) / (TOTAL_FRAMES - 1)) * 360);
    setRotationAngle(angle);

    setIsTransformed(frame >= 100);

    if (frame >= 148) {
      if (!isVideoActive.current && idleVideoRef.current) {
        isVideoActive.current = true;
        gsap.killTweensOf(idleVideoRef.current);
        gsap.to(idleVideoRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
          onStart: () => {
            idleVideoRef.current?.play().catch(() => {});
          },
        });
      }
    } else if (frame <= 142) {
      if (isVideoActive.current && idleVideoRef.current) {
        isVideoActive.current = false;
        gsap.killTweensOf(idleVideoRef.current);
        gsap.to(idleVideoRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
          overwrite: "auto",
          onComplete: () => {
            if (idleVideoRef.current) idleVideoRef.current.pause();
          },
        });
      }
    }
  };

  const setFrameByOffset = (offset) => {
    let nextFrame = currentFrame.current + offset;
    let clampedFrame = Math.max(1, Math.min(nextFrame, STOP_FRAME));

    if (clampedFrame === currentFrame.current) return;

    currentFrame.current = clampedFrame;
    renderFrame(clampedFrame);
    updateTexts(clampedFrame);
  };

  // ৪. উপর-নিচ স্ক্রোল প্যারালাক্স (Scroll-driven Scrubbing)
  useEffect(() => {
    if (!loaded) return;

    let ticking = false;

    const handleWindowScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const container = heroRef.current;
          if (!container) {
            ticking = false;
            return;
          }

          const rect = container.getBoundingClientRect();
          const totalScrollable = container.offsetHeight - window.innerHeight;

          if (totalScrollable > 0) {
            // স্ক্রোলের অগ্রগতি (০ থেকে ১)
            const progress = Math.min(1, Math.max(0, -rect.top / totalScrollable));

            // প্রগ্রেস অনুযায়ী ১ থেকে ১৫০ ফ্রেম স্ক্রাব হবে
            const targetFrame = Math.min(
              STOP_FRAME,
              Math.max(1, Math.round(progress * (STOP_FRAME - 1)) + 1)
            );

            if (targetFrame !== currentFrame.current) {
              currentFrame.current = targetFrame;
              renderFrame(targetFrame);
              updateTexts(targetFrame);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    handleWindowScroll();

    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, [loaded]);

  // ৫. সাইড সোয়াইপ হ্যান্ডলার (ডানে-বামে ট্র্যাকপ্যাড ড্র্যাগ)
  useEffect(() => {
    const heroElement = heroRef.current;
    if (!heroElement) return;

    let accumulatedDelta = 0;
    let resetTimer = null;

    const onNativeWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        accumulatedDelta += e.deltaX;

        if (Math.abs(accumulatedDelta) >= 4) {
          const step = accumulatedDelta > 0 ? 1 : -1;
          setFrameByOffset(step);
          accumulatedDelta = 0;
        }

        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          accumulatedDelta = 0;
        }, 80);
      }
    };

    heroElement.addEventListener("wheel", onNativeWheel, { passive: false });
    return () => {
      heroElement.removeEventListener("wheel", onNativeWheel);
      clearTimeout(resetTimer);
    };
  }, [loaded]);

  // ৬. মাউস ক্লিক ড্র্যাগ হ্যান্ডলার
  const handlePointerDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - startX.current;

    if (Math.abs(deltaX) >= 4) {
      const step = Math.sign(deltaX) * -1;
      setFrameByOffset(step);
      startX.current = e.clientX;
    }
  };

  const handlePointerUp = (e) => {
    isDragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  // ৭. ইনিশিয়াল ড্র ও রিসাইজ
  useEffect(() => {
    if (loaded) {
      renderFrame(currentFrame.current);
      updateTexts(currentFrame.current);
      const handleResize = () => renderFrame(currentFrame.current);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [loaded]);

  return (
    <div ref={heroRef} className="relative w-full h-[220vh] bg-slate-950">
      <div
        className="sticky top-0 w-full h-screen overflow-hidden select-none cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <DynamicNav isTransformed={isTransformed} />
        <HeroOverlayUI isTransformed={isTransformed} rotationAngle={rotationAngle} />

        {/* ব্যাকগ্রাউন্ড ক্যানভাস */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* আইডল ভিডিও */}
        <video
          ref={idleVideoRef}
          src="/idle_loop.mp4"
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-0 z-[5]"
        />

        {/* বটম সফট ফেড শ্যাডো */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent pointer-events-none z-10" />

        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white z-50">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-mono tracking-widest text-slate-400">
              LOADING 360° ASSETS ({loadProgress}%)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}