"use client";

import { motion } from "framer-motion";
import type { CharacterId } from "@/lib/characters";
import { CharacterSprite } from "@/components/CharacterSprite";
import { cn } from "@/lib/cn";

type CharacterCardProps = {
  id: CharacterId;
  label: string;
  selected: boolean;
  onSelect: () => void;
};

export function CharacterCard({ id, label, selected, onSelect }: CharacterCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.06, y: -4 }}
      whileTap={{ scale: 0.94 }}
      className={cn(
        "flex w-[100px] shrink-0 snap-center flex-col items-center gap-1 rounded-3xl border-4 p-2 shadow-bubble transition-colors",
        selected
          ? "border-[#fb7185] bg-gradient-to-b from-[#fff7ed] to-[#ffedd5] ring-4 ring-[#fb7185]/40"
          : "border-white/90 bg-white/70 hover:bg-white",
      )}
    >
      <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-white to-teal-50/80 ring-2 ring-white/90">
        <CharacterSprite id={id} size={72} priority className="max-h-[68px] max-w-[68px]" />
      </div>
      <span className="text-[11px] font-black text-slate-700">{label}</span>
    </motion.button>
  );
}
