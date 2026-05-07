"use client";
import { useEffect, useRef, ReactNode } from "react";

export default function Reveal({ children, delay = 0, className = "" }: {
  children: ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); io.unobserve(el); }},
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const delayClass = delay === 1 ? "reveal-d1" : delay === 2 ? "reveal-d2" : delay === 3 ? "reveal-d3" : "";

  return <div ref={ref} className={`reveal ${delayClass} ${className}`}>{children}</div>;
}
