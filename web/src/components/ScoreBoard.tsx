import type { PublicPlayer } from "@/lib/types";
import { cn } from "@/lib/cn";

type ScoreBoardProps = { players: PublicPlayer[]; myId: string };

export function ScoreBoard({ players, myId }: ScoreBoardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return (
    <div className="w-full max-w-[220px] rounded-3xl border-2 border-white bg-white/85 p-3 shadow-bubble backdrop-blur">
      <p className="mb-2 text-center text-xs font-black uppercase tracking-wide text-sky-600">Score</p>
      <ul className="flex flex-col gap-2">
        {sorted.map((p, idx) => (
          <li
            key={p.id}
            className={cn(
              "flex items-center justify-between rounded-2xl border px-2 py-1.5 text-sm",
              p.id === myId ? "border-amber-300 bg-amber-50/80" : "border-slate-100 bg-slate-50/80",
            )}
          >
            <span className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
              <span
                className="h-3 w-3 rounded-full border border-white shadow"
                style={{ backgroundColor: p.avatarColor }}
              />
              <span className="max-w-[90px] truncate font-semibold text-slate-800">{p.nickname}</span>
            </span>
            <span className="font-black text-sky-600">{p.score}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] leading-snug text-slate-500">
        기본 100점 · 금지어/침묵 시 <span className="font-bold text-rose-500">-10</span>
      </p>
    </div>
  );
}
