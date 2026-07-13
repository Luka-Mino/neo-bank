"use client";

// The hero's signature interactive object. Two modes:
//  • hover — the card tilts toward the cursor with a light sheen (subtle,
//    ambient, desktop pointer only)
//  • drag  — grab and spin: pointer-drag rotates the card in 3D on both
//    axes, and releasing lets it ease back to rest
// Reduced-motion and touch/coarse pointers get a still card (no gimmicks
// where they can't be controlled well).

import { useCallback, useEffect, useRef, useState } from "react";

export function TiltCard({ children }: { children: React.ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);
  const dragging = useRef(false);
  const rot = useRef({ x: 0, y: 0 });
  const last = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  const apply = useCallback((sheenX: number | null) => {
    const el = frameRef.current;
    if (!el) return;
    el.style.transform = `rotateX(${rot.current.x.toFixed(2)}deg) rotateY(${rot.current.y.toFixed(2)}deg)`;
    if (sheenX !== null) el.style.setProperty("--sheen-x", `${sheenX.toFixed(1)}%`);
  }, []);

  // Hover tilt (only when not mid-drag)
  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (dragging.current) return;
      const el = frameRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        rot.current = { x: -py * 9, y: px * 11 };
        apply((px + 0.5) * 100);
      });
    },
    [apply]
  );

  const onLeave = useCallback(() => {
    if (dragging.current) return;
    cancelAnimationFrame(raf.current);
    rot.current = { x: 0, y: 0 };
    apply(50);
  }, [apply]);

  const onDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    setIsDragging(true);
    last.current = { x: e.clientX, y: e.clientY };
    frameRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const onDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        // Drag horizontally → spin around Y; vertically → around X.
        rot.current = {
          x: Math.max(-70, Math.min(70, rot.current.x - dy * 0.5)),
          y: rot.current.y + dx * 0.6,
        };
        apply(null);
      });
    },
    [apply]
  );

  const onUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    // Ease back to rest; the CSS transition on the frame handles the motion.
    cancelAnimationFrame(raf.current);
    rot.current = { x: 0, y: 0 };
    apply(50);
  }, [apply]);

  if (!enabled) {
    return <div>{children}</div>;
  }

  return (
    <div style={{ perspective: "1100px" }}>
      <div
        ref={frameRef}
        onPointerMove={(e) => {
          onMove(e);
          onDrag(e);
        }}
        onPointerLeave={onLeave}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className={
          "tilt-frame relative will-change-transform " +
          (isDragging
            ? "cursor-grabbing transition-none"
            : "cursor-grab transition-transform duration-500 ease-out")
        }
        style={{ touchAction: "none" }}
      >
        {children}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-40"
          style={{
            background:
              "linear-gradient(105deg, transparent calc(var(--sheen-x, 50%) - 18%), rgba(255,255,255,0.14) var(--sheen-x, 50%), transparent calc(var(--sheen-x, 50%) + 18%))",
          }}
        />
      </div>
      {/* Affordance hint */}
      <p className="mt-3 text-center text-[11px] text-white/30">
        Drag to spin
      </p>
    </div>
  );
}
