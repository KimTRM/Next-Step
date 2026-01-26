"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { easePremium } from "@/shared/lib/animations";

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
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const [value, setValue] = useState(0);

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
    if (startOnView && !isInView) return;

    const controls = animate(0, end, {
      duration,
      ease: easePremium,
      onUpdate: (latest) => setValue(latest),
    });

    return () => controls.stop();
  }, [duration, end, isInView, startOnView]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatter(value)}
      {suffix}
    </span>
  );
}
