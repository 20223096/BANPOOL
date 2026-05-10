"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

type ChatBubbleProps = {
  text: string;
  forbiddenMatch?: string;
  className?: string;
};

export function ChatBubble({ text, forbiddenMatch, className }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={cn(
        "pointer-events-none relative max-w-[200px] rounded-2xl border-2 border-white bg-white/95 px-3 py-2 text-xs font-semibold text-slate-800 shadow-bubble",
        "after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-white",
        className,
      )}
    >
      <Highlighted text={text} match={forbiddenMatch} />
    </motion.div>
  );
}

function Highlighted({ text, match }: { text: string; match?: string }) {
  if (!match) return <span className="break-words leading-snug">{text}</span>;
  const i = text.indexOf(match);
  if (i < 0) return <span className="break-words leading-snug">{text}</span>;
  return (
    <span className="break-words leading-snug">
      {text.slice(0, i)}
      <span className="font-extrabold text-red-500">{match}</span>
      {text.slice(i + match.length)}
    </span>
  );
}
