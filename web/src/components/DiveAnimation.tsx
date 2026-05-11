"use client";

import { useEffect, useMemo, useState } from "react";
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

/** 삐빅 → 플라잉 체어로 이동 → 체어 위에서 휴식 → 뒤로 포물선 낙하 → 물 장면 */
type Phase = "idle" | "beep" | "approach" | "board" | "fall" | "splash";

const BEEP_MS = 680;
const APPROACH_MS = 1280;
const ON_BOARD_MS = 1750;
const FALL_MS = 1480;
const SPLASH_MS = 1400;

export function DiveAnimation({
  payload,
  onDone,
}: {
  payload: DivePenaltyPayload | null;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [splash, setSplash] = useState<{ x: number; y: number } | null>(null);

  const arc = useMemo(() => {
    if (!payload) return null;
    const boardY = payload.to.y - 36;
    const poolY = payload.to.y + 132;
    const startX = payload.to.x;
    const back = 168;
    const endX = startX - back;
    const apexY = boardY - 62;
    const midX = (startX + endX) / 2 - 12;
    return { boardY, poolY, startX, endX, apexY, midX };
  }, [payload]);

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
      const poolY = payload.to.y + 132;
      setSplash({ x: payload.to.x - 168, y: poolY });
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

  if (!payload || !arc) return null;

  const { boardY, poolY, startX, endX, apexY, midX } = arc;

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
                      left: startX,
                      top: boardY,
                      scale: 1.08,
                      rotate: -8,
                      opacity: 1,
                    }
                  : phase === "board"
                    ? {
                        left: startX,
                        top: boardY,
                        scale: [1.08, 1.12, 1.09, 1.08],
                        rotate: [-8, -5, -7, -8],
                        opacity: 1,
                      }
                    : {
                        left: [startX, midX, endX],
                        top: [boardY, apexY, poolY],
                        scale: [1.08, 1.02, 0.82],
                        rotate: [-8, -18, 28],
                        opacity: [1, 1, 0.35],
                      }
            }
            transition={
              phase === "beep"
                ? { duration: 0.65, ease: "easeInOut" }
                : phase === "approach"
                  ? { duration: 1.22, ease: [0.2, 0.9, 0.2, 1] }
                  : phase === "board"
                    ? { duration: 0.95, ease: "easeInOut" }
                    : {
                        duration: FALL_MS / 1000,
                        times: [0, 0.48, 1],
                        ease: [0.25, 0.1, 0.25, 1],
                      }
            }
          >
            {phase === "approach" ? (
              <motion.span
                className="absolute -right-14 -top-1 whitespace-nowrap text-base font-black text-sky-900 drop-shadow-[0_1px_0_white]"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: [0, 1, 0.85, 0], x: [0, 28, 34] }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                플라잉 체어로 쓔윽—
              </motion.span>
            ) : null}
            {phase === "fall" ? (
              <motion.span
                className="absolute -left-12 top-6 whitespace-nowrap text-sm font-black text-cyan-900 drop-shadow-[0_1px_0_white]"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.75, 0] }}
                transition={{ duration: 0.95, ease: "easeOut" }}
              >
                슝…
              </motion.span>
            ) : null}

            <div className="relative">
              <CharacterSprite id={payload.characterId} size={84} priority className="relative z-10" />
              {/* water reflection while moving toward pool */}
              {(phase === "approach" || phase === "board" || phase === "fall") && (
                <div
                  className="pointer-events-none absolute left-1/2 top-[88%] z-0 -translate-x-1/2 scale-y-[-1] opacity-[0.22] blur-[0.35px]"
                  style={{ maskImage: "linear-gradient(to bottom, black 15%, transparent 75%)" }}
                >
                  <CharacterSprite id={payload.characterId} size={84} priority className="saturate-50" />
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {splash ? (
        <SplashEffect
          x={splash.x}
          y={splash.y}
          active={phase === "splash"}
          characterId={payload.characterId}
        />
      ) : null}
    </div>
  );
}
