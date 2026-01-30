"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type CountUpProps = {
  end: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  format?: (value: number) => string;
  startOnView?: boolean;
};

export function CountUp({
  end,
  duration = 1.1,
  className,
  suffix = "",
  prefix = "",
  format,
  startOnView = true,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);

  const formatter = useMemo(() => {
    if (format) return format;

    return (v: number) => {
      if (end >= 1000) {
        const k = Math.round(v / 1000);
        return `${k}K`;
      }
      return `${Math.round(v)}`;
    };
  }, [end, format]);

  useEffect(() => {
    if (!startOnView || hasStarted) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [startOnView, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const durationMs = duration * 1000;
    const start = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * end);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [hasStarted, duration, end]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatter(value)}
      {suffix}
    </span>
  );
}
