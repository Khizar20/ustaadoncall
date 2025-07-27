import { useRef, useLayoutEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedPaginationProps {
  total: number;
  perPage?: number;
  current: number;
  onChange: (page: number) => void;
}

export function AnimatedPagination({
  total,
  perPage = 12,
  current,
  onChange,
}: AnimatedPaginationProps) {
  const numPages = Math.ceil(total / perPage);
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorX, setIndicatorX] = useState(0);
  const [indicatorW, setIndicatorW] = useState(0);
  const [indicatorReady, setIndicatorReady] = useState(false);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const links = containerRef.current.querySelectorAll(".pag-link");
    if (!links[current]) return;
    const link = links[current] as HTMLElement;
    const rect = link.getBoundingClientRect();
    const parentRect = containerRef.current.getBoundingClientRect();
    setIndicatorX(rect.left - parentRect.left);
    setIndicatorW(rect.width);
    setIndicatorReady(true);
  }, [current, numPages]);

  return (
    <div ref={containerRef} className="relative flex justify-center items-center py-8 min-h-[64px]">
      {/* Animated Pill Indicator (only if ready and there are pages) */}
      {indicatorReady && numPages > 0 && (
        <motion.div
          className="absolute top-1/2 left-0 h-12 rounded-full z-0 shadow-xl"
          style={{
            translateY: "-50%",
            background: "linear-gradient(90deg,#1DBF73 0%,#19a366 100%)",
            width: indicatorW,
          }}
          animate={{ x: indicatorX, width: indicatorW, scale: [1, 1.12] }}
          transition={{ type: "spring", stiffness: 300, damping: 18, duration: 0.7 }}
        />
      )}
      {/* Pagination Links */}
      <div className="flex gap-2 relative z-10">
        {Array.from({ length: numPages }).map((_, idx) => (
          <motion.button
            key={idx}
            className={`pag-link w-12 h-12 rounded-full text-lg font-bold flex items-center justify-center transition-colors duration-200 relative z-10 ${
              idx === current ? "text-white" : "text-primary border border-primary bg-white"
            }`}
            onClick={() => onChange(idx)}
            whileTap={{ scale: 1.12 }}
            animate={idx === current ? { scale: [1, 1.12] } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, duration: 0.7 }}
            style={{ fontWeight: idx === current ? 700 : 500 }}
          >
            {idx + 1}
          </motion.button>
        ))}
      </div>
    </div>
  );
} 