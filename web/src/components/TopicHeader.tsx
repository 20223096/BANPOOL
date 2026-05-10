"use client";

import { motion } from "framer-motion";
import { GameTimer } from "@/components/GameTimer";

type TopicHeaderProps = {
  topic: string;
  seconds: number;
  roundLabel?: string;
};

export function TopicHeader({ topic, seconds, roundLabel = "ROUND 1" }: TopicHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex flex-col gap-3 border-b-4 border-white/60 bg-gradient-to-r from-[#ccfbf1]/95 via-[#e0f2fe]/95 to-[#fef9c3]/95 px-3 py-3 shadow-md backdrop-blur-md md:flex-row md:items-center md:justify-between md:gap-4 md:px-6">
      <motion.div
        className="flex items-center justify-center gap-2 md:justify-start"
        initial={false}
      >
        <span className="rounded-full bg-gradient-to-r from-[#fb7185] to-[#f472b6] px-4 py-1.5 text-xs font-black text-white shadow-md ring-2 ring-white">
          {roundLabel}
        </span>
        <GameTimer seconds={seconds} />
      </motion.div>
      <div className="min-w-0 flex-1 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-700/90">연애 밸런스 주제</p>
        <motion.p
          layout
          className="mx-auto mt-1 max-w-3xl text-sm font-black leading-snug text-slate-800 md:text-base"
        >
          {topic}
        </motion.p>
      </div>
      <div className="hidden w-[120px] md:block" aria-hidden />
    </header>
  );
}
