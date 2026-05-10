import { useState } from "react";
import type { ChatEntry } from "@/lib/types";
import { cn } from "@/lib/cn";

type ChatBoxProps = {
  onSend: (text: string) => void;
  log: ChatEntry[];
  disabled?: boolean;
  myId: string;
};

export function ChatBox({ onSend, log, disabled, myId }: ChatBoxProps) {
  const [draft, setDraft] = useState("");

  function submit() {
    const t = draft.trim();
    if (!t || disabled) return;
    onSend(t);
    setDraft("");
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded-3xl border-2 border-white bg-white/90 p-3 shadow-bubble">
      <div className="max-h-28 overflow-y-auto rounded-2xl bg-slate-50/80 p-2 text-xs">
        {log.length === 0 ? (
          <p className="text-center text-slate-400">대화를 시작해 주제에 말해봐요!</p>
        ) : (
          log.slice(-24).map((e) => (
            <div key={e.id} className={cn("mb-1", e.playerId === myId && "text-sky-700")}>
              <span className="font-bold">{e.nickname}</span>
              <span className="text-slate-500">: </span>
              <LogLine text={e.text} match={e.forbiddenMatch} />
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-2xl border-2 border-sky-100 bg-white px-3 py-2 text-sm outline-none ring-sky-300 focus:border-sky-300 focus:ring-2"
          placeholder="주제에 맞게 채팅! (1분 침묵은 벌칙)"
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
        <button
          type="button"
          onClick={submit}
          disabled={disabled}
          className="rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-400 px-4 py-2 text-sm font-black text-white shadow-md transition hover:brightness-105 disabled:opacity-40"
        >
          전송
        </button>
      </div>
    </div>
  );
}

function LogLine({ text, match }: { text: string; match?: string }) {
  if (!match) return <span>{text}</span>;
  const i = text.indexOf(match);
  if (i < 0) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, i)}
      <span className="font-extrabold text-red-500">{match}</span>
      {text.slice(i + match.length)}
    </span>
  );
}
