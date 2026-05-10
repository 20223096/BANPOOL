"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CharacterId } from "@/lib/characters";
import { CharacterSprite } from "@/components/CharacterSprite";
import { SplashEffect } from "@/components/SplashEffect";

export type DivePenaltyPayload = {
  key: number;
  characterId: CharacterId;
  from: { x: number; y: number };
  to: { x: number; y: number };
};

/** 다이빙대 위에 올라선 뒤 잠시 멈춤 → 물로 낙하 → 스플래시 */
type Phase = "idle" | "beep" | "approach" | "board" | "fall" | "splash";

const BEEP_MS = 720;
const APPROACH_MS = 1200;
const ON_BOARD_MS = 900;
const FALL_MS = 900;
const SPLASH_MS = 1100;

export function DiveAnimation({
  payload,
  onDone,
}: {
  payload: DivePenaltyPayload | null;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [splash, setSplash] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!payload) {
      setPhase("idle");
      setSplash(null);
      return;
    }
    setPhase("beep");
    setSplash(null);

    const t1 = window.setTimeout(() => setPhase("approach"), BEEP_MS);
    const t2 = window.setTimeout(() => setPhase("board"), BEEP_MS + APPROACH_MS);
    const t3 = window.setTimeout(() => setPhase("fall"), BEEP_MS + APPROACH_MS + ON_BOARD_MS);
    const t4 = window.setTimeout(() => {
      setPhase("splash");
      const poolY = payload.to.y + 128;
      setSplash({ x: payload.to.x, y: poolY });
    }, BEEP_MS + APPROACH_MS + ON_BOARD_MS + FALL_MS);
    const t5 = window.setTimeout(() => {
      setPhase("idle");
      setSplash(null);
      onDone();
    }, BEEP_MS + APPROACH_MS + ON_BOARD_MS + FALL_MS + SPLASH_MS);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      window.clearTimeout(t5);
    };
  }, [payload, onDone]);

  if (!payload) return null;

  const boardY = payload.to.y - 36;
  const poolY = payload.to.y + 132;

  const showCharacter =
    phase === "beep" || phase === "approach" || phase === "board" || phase === "fall";

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      <AnimatePresence>
        {phase === "beep" ? (
          <motion.div
            key="beep"
            className="absolute left-1/2 top-[14%] z-50 -translate-x-1/2"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: [0.2, 1.12, 1], opacity: 1 }}
            exit={{ scale: 1.15, opacity: 0 }}
            transition={{ duration: 0.42 }}
          >
            <span className="rounded-3xl bg-rose-500 px-8 py-4 text-3xl font-black text-white shadow-[0_8px_0_rgb(190,18,60)] ring-4 ring-white">
              삐빅!
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showCharacter ? (
          <motion.div
            key={payload.key}
            className="absolute z-40 -translate-x-1/2 -translate-y-1/2"
            initial={false}
            animate={
              phase === "beep"
                ? {
                    left: payload.from.x,
                    top: payload.from.y,
                    scale: [1, 1.07, 1],
                    rotate: [0, -4, 0],
                    opacity: 1,
                  }
                : phase === "approach"
                  ? {
                      left: payload.to.x,
                      top: boardY,
                      scale: 1.08,
                      rotate: -10,
                      opacity: 1,
                    }
                  : phase === "board"
                    ? {
                        left: payload.to.x,
                        top: boardY,
                        scale: [1.08, 1.14, 1.1, 1.08],
                        rotate: [-10, -6, -8, -10],
                        opacity: 1,
                      }
                    : {
                        left: payload.to.x,
                        top: poolY,
                        scale: 0.78,
                        rotate: 22,
                        opacity: 0.28,
                      }
            }
            transition={
              phase === "beep"
                ? { duration: 0.65, ease: "easeInOut" }
                : phase === "approach"
                  ? { duration: 1.12, ease: [0.22, 1, 0.36, 1] }
                  : phase === "board"
                    ? { duration: 0.88, ease: "easeInOut" }
                    : { duration: 0.88, ease: [0.55, 0, 0.85, 0.4] }
            }
          >
            {phase === "approach" ? (
              <motion.span
                className="absolute -right-12 -top-1 whitespace-nowrap text-base font-black text-sky-900 drop-shadow-[0_1px_0_white]"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: [0, 1, 0.85, 0], x: [0, 32, 36] }}
                transition={{ duration: 0.75, ease: "easeOut" }}
              >
                다이빙대로 쓔윽—
              </motion.span>
            ) : null}
            {phase === "fall" ? (
              <motion.span
                className="absolute -left-10 top-8 whitespace-nowrap text-sm font-black text-cyan-900 drop-shadow-[0_1px_0_white]"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.55 }}
              >
                슉…
              </motion.span>
            ) : null}
            <CharacterSprite id={payload.characterId} size={84} priority className="relative z-10" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {splash ? <SplashEffect x={splash.x} y={splash.y} active={phase === "splash"} /> : null}
    </div>
  );
}
