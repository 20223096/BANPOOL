"use client";

import { motion, LayoutGroup } from "framer-motion";
import type { PublicPlayer } from "@/lib/types";
import { CharacterSprite } from "@/components/CharacterSprite";
import { cn } from "@/lib/cn";

type RankingBoardProps = {
  players: PublicPlayer[];
  myId: string;
};

export function RankingBoard({ players, myId }: RankingBoardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return (
    <div className="w-full rounded-3xl border-4 border-white/90 bg-gradient-to-b from-white/95 to-[#ecfeff] p-3 shadow-bubble backdrop-blur-sm">
      <p className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">
        Live 랭킹
      </p>
      <LayoutGroup>
        <ul className="flex flex-col gap-2">
          {sorted.map((p, idx) => (
            <motion.li
              layout
              key={p.id}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className={cn(
                "flex items-center justify-between rounded-2xl border-2 px-2.5 py-2 text-sm shadow-sm",
                idx === 0 && "border-[#fbbf24] bg-gradient-to-r from-amber-50 to-yellow-50",
                idx === 1 && "border-slate-200 bg-white/90",
                idx > 1 && "border-teal-100/80 bg-white/80",
                p.id === myId && "ring-2 ring-sky-400",
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="w-5 text-center text-xs font-black text-slate-400">{idx + 1}</span>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-white">
                  <CharacterSprite id={p.character} size={28} className="max-h-[26px] max-w-[26px]" />
                </div>
                <span className="truncate font-bold text-slate-800">{p.nickname}</span>
                {p.id === myId ? (
                  <span className="shrink-0 text-[9px] font-black text-sky-600">ME</span>
                ) : null}
              </span>
              <motion.span
                layout
                className="shrink-0 font-black tabular-nums text-teal-600"
                key={p.score}
                initial={{ scale: 1.25, color: "#f43f5e" }}
                animate={{ scale: 1, color: "#0d9488" }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
              >
                {p.score}
              </motion.span>
            </motion.li>
          ))}
        </ul>
      </LayoutGroup>
    </div>
  );
}
