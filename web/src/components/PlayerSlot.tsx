"use client";

import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PublicPlayer } from "@/lib/types";
import { CharacterSprite } from "@/components/CharacterSprite";
import { ChatBubble } from "@/components/ChatBubble";
import { cn } from "@/lib/cn";

export type PlayerSlotProps = {
  player: PublicPlayer;
  slotIndex: number;
  isMe: boolean;
  isRecentSpeaker: boolean;
  isHiddenForPenalty: boolean;
  shake: boolean;
  bubble?: { text: string; forbiddenMatch?: string } | null;
  scoreDelta?: number | null;
};

export const PlayerSlot = forwardRef<HTMLDivElement, PlayerSlotProps>(function PlayerSlot(
  { player, slotIndex, isMe, isRecentSpeaker, isHiddenForPenalty, shake, bubble, scoreDelta },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative flex w-[118px] shrink-0 snap-center flex-col items-center gap-1 rounded-3xl border-4 p-2 shadow-bubble md:w-[130px]",
        isRecentSpeaker && "border-[#fbbf24] bg-gradient-to-b from-yellow-50 to-amber-50 ring-4 ring-amber-200/70",
        !isRecentSpeaker && "border-white/90 bg-white/88",
        isMe && "ring-2 ring-sky-400",
        isHiddenForPenalty && "opacity-[0.15] grayscale",
      )}
      animate={shake ? { x: [0, -6, 6, -5, 5, 0] } : { x: 0 }}
      transition={{ duration: 0.32 }}
      whileHover={{ scale: 1.04, y: -3 }}
    >
      <span className="rounded-full bg-teal-500/15 px-2 py-0.5 text-[10px] font-black text-teal-800">
        {slotIndex + 1}P
      </span>
      <div className="relative flex min-h-[100px] w-full flex-col items-center pt-1">
        <AnimatePresence mode="popLayout">
          {bubble ? (
            <motion.div
              key={bubble.text + String(bubble.forbiddenMatch)}
              className="absolute -top-1 left-1/2 z-20 w-max max-w-[200px] -translate-x-1/2 -translate-y-full"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <ChatBubble text={bubble.text} forbiddenMatch={bubble.forbiddenMatch} />
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-white to-cyan-50 ring-4 ring-white shadow-inner">
          <CharacterSprite id={player.character} size={76} priority className="max-h-[72px] max-w-[72px]" />
          <AnimatePresence>
            {scoreDelta ? (
              <motion.span
                key={scoreDelta}
                className="absolute -right-2 -top-2 z-10 whitespace-nowrap text-lg font-black text-rose-500 drop-shadow-[0_2px_0_white]"
                initial={{ opacity: 0, y: 10, scale: 0.6 }}
                animate={{ opacity: 1, y: -28, scale: 1.1 }}
                exit={{ opacity: 0, y: -48 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                {scoreDelta}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
      <span className="max-w-full truncate px-1 text-center text-[11px] font-black text-slate-800">{player.nickname}</span>
      <motion.span
        layout
        className="rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 px-2.5 py-0.5 text-xs font-black tabular-nums text-teal-800 ring-2 ring-teal-100/80"
      >
        {player.score}점
      </motion.span>
    </motion.div>
  );
});
