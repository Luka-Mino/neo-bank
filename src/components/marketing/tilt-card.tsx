"use client";

// Pointer-reactive 3D tilt — the landing hero's signature moment. The card
// follows the cursor within ±9°, springs back on leave, and sits perfectly
// still for reduced-motion users and touch devices (no gimmicks where they
// can't be controlled).

import { useCallback, useEffect, useRef, useState } from "react";

export function TiltCard({ children }: { children: React.ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const update = () => setEnabled(fine.matches && motionOk.matches);
    update();
    fine.addEventListener("change", update);
    motionOk.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      motionOk.removeEventListener("change", update);
    };
  }, []);

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.transform = `rotateX(${(-py * 9).toFixed(2)}deg) rotateY(${(px * 11).toFixed(2)}deg) translateZ(0)`;
      el.style.setProperty("--sheen-x", `${((px + 0.5) * 100).toFixed(1)}%`);
    });
  }, []);

  const onLeave = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.transform = "rotateX(0deg) rotateY(0deg)";
  }, []);

  return (
    <div
      style={{ perspective: "1100px" }}
      onPointerMove={enabled ? onMove : undefined}
      onPointerLeave={enabled ? onLeave : undefined}
    >
      <div
        ref={frameRef}
        className="tilt-frame relative transition-transform duration-300 ease-out will-change-transform"
      >
        {children}
        {/* moving light sheen, driven by --sheen-x from the pointer */}
        {enabled && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-40"
            style={{
              background:
                "linear-gradient(105deg, transparent calc(var(--sheen-x, 50%) - 18%), rgba(255,255,255,0.14) var(--sheen-x, 50%), transparent calc(var(--sheen-x, 50%) + 18%))",
            }}
          />
        )}
      </div>
    </div>
  );
}
