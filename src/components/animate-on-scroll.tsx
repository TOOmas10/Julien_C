"use client";

import { useRef, useState, useEffect, ReactNode, CSSProperties } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  from?: "bottom" | "left" | "right" | "fade";
  className?: string;
}

export default function AnimateOnScroll({ children, delay = 0, from = "bottom", className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const initial: CSSProperties = {
    opacity: 0,
    transform:
      from === "bottom" ? "translateY(40px)" :
      from === "left" ? "translateX(-40px)" :
      from === "right" ? "translateX(40px)" :
      "none",
  };

  const final: CSSProperties = {
    opacity: 1,
    transform: "translate(0)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...(visible ? final : initial),
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
