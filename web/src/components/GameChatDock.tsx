"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type GameChatDockProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export function GameChatDock({ onSend, disabled }: GameChatDockProps) {
  const [draft, setDraft] = useState("");

  function submit() {
    const t = draft.trim();
    if (!t || disabled) return;
    onSend(t);
    setDraft("");
  }

  return (
    <motion.div
      layout
      className="fixed bottom-0 left-0 right-0 z-50 border-t-4 border-white/80 bg-gradient-to-r from-[#cffafe]/95 via-white/95 to-[#fef3c7]/95 px-3 py-3 shadow-[0_-8px_32px_rgba(6,182,212,0.2)] backdrop-blur-lg md:px-8"
    >
      <div className="mx-auto flex max-w-4xl items-end gap-2">
        <div className="mb-0.5 hidden text-2xl sm:block" aria-hidden>
          💬
        </div>
        <input
          className="min-h-[48px] flex-1 rounded-2xl border-4 border-teal-100 bg-white px-4 py-3 text-base font-semibold text-slate-800 shadow-inner outline-none ring-teal-200 focus:border-teal-300 focus:ring-4"
          placeholder="주제에 맞게 대화해요! (1분 침묵은 DIVE)"
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={submit}
          disabled={disabled}
          className="rounded-2xl bg-gradient-to-r from-[#2dd4bf] to-[#06b6d4] px-5 py-3 text-sm font-black text-white shadow-lg disabled:opacity-40"
        >
          전송
        </motion.button>
      </div>
    </motion.div>
  );
}
