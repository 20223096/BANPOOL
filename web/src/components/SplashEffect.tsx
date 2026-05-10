"use client";

import { motion } from "framer-motion";

type SplashEffectProps = {
  x: number;
  y: number;
  active: boolean;
};

export function SplashEffect({ x, y, active }: SplashEffectProps) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" style={{ contain: "layout" }}>
      <motion.div
        className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
        style={{ left: x, top: y }}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: [0, 1, 0.85, 0], scale: [0.3, 1.25, 1.45, 1.6] }}
        transition={{ duration: 0.85, ease: "easeOut" }}
      >
        <span className="text-2xl font-black text-sky-600 drop-shadow-md">어푸!!! 💦</span>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-4 border-white/80 bg-cyan-200/50"
            style={{ width: 40 + i * 36, height: 40 + i * 36 }}
            initial={{ scale: 0.2, opacity: 0.9 }}
            animate={{ scale: 2.2 + i * 0.4, opacity: 0 }}
            transition={{ duration: 0.75, delay: i * 0.06, ease: "easeOut" }}
          />
        ))}
      </motion.div>
    </div>
  );
}
