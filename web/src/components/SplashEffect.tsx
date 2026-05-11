"use client";

import { motion } from "framer-motion";
import type { CharacterId } from "@/lib/characters";
import { CharacterSprite } from "@/components/CharacterSprite";

type SplashEffectProps = {
  x: number;
  y: number;
  active: boolean;
  characterId: CharacterId;
};

/** 물 입수: 스플래시 + 동심 리플 + 상승 버블 + 왜곡된 반사 */
export function SplashEffect({ x, y, active, characterId }: SplashEffectProps) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" style={{ contain: "layout" }}>
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: x, top: y }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* reflection on surface — squashed, wavy */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-2"
          initial={{ opacity: 0.55, scaleX: 0.85, scaleY: 0.22, skewX: "-6deg" }}
          animate={{ opacity: [0.55, 0.35, 0], scaleX: [0.85, 1.05, 1.2], scaleY: [0.22, 0.12, 0.06], skewX: ["-6deg", "4deg", "0deg"] }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          style={{ transformOrigin: "center top" }}
        >
          <div className="scale-y-[-1] opacity-80 [mask-image:linear-gradient(to_bottom,black_20%,transparent_95%)]">
            <CharacterSprite id={characterId} size={72} priority className="blur-[0.5px]" />
          </div>
        </motion.div>

        {/* upward splash droplets */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={`drop-${i}`}
            className="absolute rounded-full bg-gradient-to-b from-white to-cyan-300 shadow-sm ring-1 ring-white/60"
            style={{
              width: 10 + (i % 3) * 4,
              height: 10 + (i % 3) * 4,
              left: -6 + (i % 3) * 10,
              top: 0,
            }}
            initial={{ opacity: 0, y: 0, x: 0, scale: 0.3 }}
            animate={{
              opacity: [0, 1, 0.9, 0],
              y: [0, -28 - i * 12, -6],
              x: [(i - 2.5) * 14, (i - 2.5) * 22, (i - 2.5) * 8],
              scale: [0.3, 1.1, 0.6],
            }}
            transition={{ duration: 0.65, delay: i * 0.03, ease: "easeOut" }}
          />
        ))}

        {/* ripples */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={`ripple-${i}`}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white/70 bg-cyan-400/10"
            style={{ width: 24, height: 24 }}
            initial={{ scale: 0.2, opacity: 0.85 }}
            animate={{ scale: 3.2 + i * 1.1, opacity: 0 }}
            transition={{ duration: 1.05, delay: i * 0.12, ease: "easeOut" }}
          />
        ))}

        {/* rising bubbles */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute rounded-full border-2 border-white/50 bg-cyan-100/40 shadow-[inset_0_-2px_4px_rgba(6,182,212,0.35)]"
            style={{
              width: 6 + (i % 4) * 2,
              height: 6 + (i % 4) * 2,
              left: -40 + (i * 17) % 80,
              top: 4,
            }}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 0.9, 0.7, 0],
              y: [0, -18 - (i % 5) * 14, -90 - i * 6],
              x: [0, (i % 2 === 0 ? 1 : -1) * (8 + i), (i % 2 === 0 ? 1 : -1) * 4],
              scale: [0.5, 1, 0.85],
            }}
            transition={{ duration: 1.35, delay: 0.08 + i * 0.07, ease: "easeOut" }}
          />
        ))}

        <motion.span
          className="relative z-10 block whitespace-nowrap text-center text-xl font-black text-sky-800 drop-shadow-[0_1px_0_white]"
          initial={{ opacity: 0, y: 6, scale: 0.8 }}
          animate={{ opacity: [0, 1, 1, 0], y: [6, -4, -12, -18], scale: [0.8, 1.05, 1, 0.95] }}
          transition={{ duration: 0.95, ease: "easeOut" }}
        >
          첨벙! 💦
        </motion.span>
      </motion.div>
    </div>
  );
}
