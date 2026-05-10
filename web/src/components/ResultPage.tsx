import type { PublicPlayer } from "@/lib/types";
import { cn } from "@/lib/cn";

type ResultPageProps = {
  players: PublicPlayer[];
  myId: string;
  canControl: boolean;
  onAgain: () => void;
  onLobby: () => void;
};

export function ResultPage({ players, myId, canControl, onAgain, onLobby }: ResultPageProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-[2rem] border-4 border-white bg-gradient-to-b from-white to-sky-50 p-6 text-center shadow-soft">
      <div>
        <p className="text-sm font-bold text-sky-600">게임 종료</p>
        <h2 className="mt-1 text-3xl font-black text-slate-900">우승자</h2>
        {winner ? (
          <div className="mt-4 rounded-3xl bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-200 p-4 shadow-lg ring-4 ring-white">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-900/70">1st</p>
            <p className="text-2xl font-black text-amber-950">{winner.nickname}</p>
            <p className="text-sm font-bold text-amber-900">{winner.score}점</p>
          </div>
        ) : null}
      </div>
      <ol className="flex flex-col gap-2 text-left">
        {sorted.map((p, i) => (
          <li
            key={p.id}
            className={cn(
              "flex items-center justify-between rounded-2xl border px-3 py-2",
              i === 0 ? "border-amber-300 bg-amber-50" : "border-slate-100 bg-white/80",
              p.id === myId && "ring-2 ring-sky-300",
            )}
          >
            <span className="flex items-center gap-2 font-semibold text-slate-800">
              <span className="text-slate-400">#{i + 1}</span>
              <span
                className="h-3 w-3 rounded-full border border-white"
                style={{ backgroundColor: p.avatarColor }}
              />
              {p.nickname}
              {p.id === myId ? <span className="text-[10px] font-bold text-sky-600">(나)</span> : null}
            </span>
            <span className="font-black text-sky-600">{p.score}</span>
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={!canControl}
          onClick={onAgain}
          className="rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 py-3 text-lg font-black text-white shadow-lg hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          다시하기 (금지어 설정)
        </button>
        <button
          type="button"
          disabled={!canControl}
          onClick={onLobby}
          className="rounded-2xl border-2 border-slate-200 py-2 text-sm font-bold text-slate-600 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          대기방으로
        </button>
        {!canControl ? (
          <p className="text-center text-xs font-semibold text-slate-500">호스트만 다음 단계로 진행할 수 있어요.</p>
        ) : null}
      </div>
    </div>
  );
}
