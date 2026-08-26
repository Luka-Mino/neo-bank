"use client";

import { useEffect, useRef, useState } from "react";

// Counts a number up to `value` when it scrolls into view (once). Ease-out,
// ~1.8s by default — deliberately calm, not a fast spin. Server / no-JS /
// reduced-motion render the final value directly (state starts at `value`, and
// the animation only ever runs from the observer callback). Tabular figures so
// the width is stable while counting.
export function CountUp({
  value,
  prefix = "",
  duration = 1800,
  className = "",
}: {
  value: number;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) return;

    let raf = 0;
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          obs.disconnect();
          const t0 = performance.now();
          const step = (t: number) => {
            const p = Math.min(1, (t - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(value * eased));
            if (p < 1) raf = requestAnimationFrame(step);
          };
          raf = requestAnimationFrame(step);
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={"tabular-nums " + className}>
      {prefix}
      {display.toLocaleString("en-US")}
    </span>
  );
}
