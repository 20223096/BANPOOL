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

type Phase = "idle" | "beep" | "fly" | "fall" | "splash";

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
    const t1 = window.setTimeout(() => setPhase("fly"), 400);
    const t2 = window.setTimeout(() => setPhase("fall"), 980);
    const t3 = window.setTimeout(() => {
      setPhase("splash");
      setSplash({ x: payload.to.x, y: payload.to.y + 108 });
    }, 1180);
    const t4 = window.setTimeout(() => {
      setPhase("idle");
      setSplash(null);
      onDone();
    }, 2100);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [payload, onDone]);

  if (!payload) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      <AnimatePresence>
        {phase === "beep" ? (
          <motion.div
            key="beep"
            className="absolute left-1/2 top-[18%] z-50 -translate-x-1/2"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: [0.2, 1.15, 1], opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="rounded-3xl bg-rose-500 px-8 py-4 text-3xl font-black text-white shadow-[0_8px_0_rgb(190,18,60)] ring-4 ring-white">
              삐빅!
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "fly" || phase === "fall" ? (
          <motion.div
            key={payload.key}
            className="absolute z-40 -translate-x-1/2 -translate-y-1/2"
            initial={{ left: payload.from.x, top: payload.from.y, rotate: 0, scale: 1 }}
            animate={
              phase === "fly"
                ? {
                    left: payload.to.x,
                    top: payload.to.y - 8,
                    rotate: [-6, -14, -10],
                    scale: 1.08,
                  }
                : {
                    left: payload.to.x,
                    top: payload.to.y + 128,
                    rotate: 24,
                    scale: 0.72,
                    opacity: 0.25,
                  }
            }
            transition={
              phase === "fly"
                ? { duration: 0.52, ease: [0.17, 0.84, 0.44, 1] }
                : { duration: 0.42, ease: "easeIn" }
            }
          >
            <motion.span
              className="absolute -right-10 -top-2 whitespace-nowrap text-sm font-black text-sky-900 drop-shadow-[0_1px_0_white]"
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: [0, 1, 0], x: [0, 28] }}
              transition={{ duration: 0.45, delay: 0.05 }}
            >
              쓕—!
            </motion.span>
            <CharacterSprite id={payload.characterId} size={76} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {splash ? <SplashEffect x={splash.x} y={splash.y} active={phase === "splash"} /> : null}
    </div>
  );
}
