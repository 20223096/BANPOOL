import { useMemo, useState } from "react";
import type { RoomState } from "@/lib/types";
import { CharacterSprite } from "@/components/CharacterSprite";
import { cn } from "@/lib/cn";

type ForbiddenWordSetupProps = {
  room: RoomState;
  myId: string;
  onSubmit: (targetId: string, word: string) => void;
};

export function ForbiddenWordSetup({ room, myId, onSubmit }: ForbiddenWordSetupProps) {
  const targets = useMemo(
    () => room.players.filter((p) => p.id !== myId),
    [room.players, myId],
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const required = room.wordSetupRequired;
  const myDone = room.wordSetupProgress[myId] ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 rounded-[2rem] border-4 border-white bg-white/85 p-6 shadow-soft backdrop-blur">
      <header className="text-center">
        <h2 className="text-xl font-black text-slate-800">금지어 정하기</h2>
        <p className="mt-1 text-sm text-slate-600">
          다른 사람이 말하기 어려운 단어를 골라주세요.{" "}
          <span className="font-bold">본인 금지어는 볼 수 없어요.</span>
        </p>
        <p className="mt-2 text-xs font-bold text-sky-600">
          내 진행: {myDone}/{required}
        </p>
      </header>
      <ul className="flex flex-col gap-3">
        {targets.map((p) => {
          const key = p.id;
          const val = drafts[key] ?? "";
          return (
            <li
              key={key}
              className="flex flex-col gap-2 rounded-2xl border-2 border-sky-100 bg-sky-50/50 p-3"
            >
              <div className="flex items-center gap-2">
                <CharacterSprite id={p.character} size={40} priority className="h-10 w-10 rounded-xl object-contain ring-2 ring-white shadow-sm" />
                <p className="text-sm font-bold text-slate-800">
                  <span className="text-sky-600">{p.nickname}</span>님의 금지어
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-xl border-2 border-white bg-white px-3 py-2 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-200"
                  placeholder="예: 라면, ENFP, 카톡…"
                  value={val}
                  onChange={(e) => setDrafts((d) => ({ ...d, [key]: e.target.value }))}
                />
                <button
                  type="button"
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-black text-white shadow",
                    val.trim()
                      ? "bg-gradient-to-r from-violet-400 to-fuchsia-400"
                      : "cursor-not-allowed bg-slate-300",
                  )}
                  disabled={!val.trim()}
                  onClick={() => {
                    const w = val.trim();
                    if (!w) return;
                    onSubmit(key, w);
                    setDrafts((d) => ({ ...d, [key]: "" }));
                  }}
                >
                  저장
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-center text-xs text-slate-500">모두 입력을 마치면 자동으로 수영장으로 이동해요.</p>
    </div>
  );
}
