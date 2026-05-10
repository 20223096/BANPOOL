import type { RoomState } from "@/lib/types";
import { CharacterSprite } from "@/components/CharacterSprite";
import { cn } from "@/lib/cn";

type RoomLobbyProps = {
  room: RoomState;
  myId: string;
  onStart: () => void;
  onLeave: () => void;
};

export function RoomLobby({ room, myId, onStart, onLeave }: RoomLobbyProps) {
  const isHost = room.hostId === myId;
  const canStart = room.players.length >= 2;
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 rounded-[2rem] border-4 border-white bg-white/80 p-6 shadow-soft backdrop-blur">
      <header className="text-center">
        <p className="text-sm font-bold text-sky-600">방 코드</p>
        <p className="font-mono text-4xl font-black tracking-[0.25em] text-slate-800">{room.id}</p>
        <p className="mt-2 text-xs text-slate-500">친구에게 코드를 공유해 같이 들어오게 하세요.</p>
      </header>
      <section>
        <p className="mb-3 text-sm font-bold text-slate-700">참가자 {room.players.length}명</p>
        <ul className="flex flex-wrap justify-center gap-3">
          {room.players.map((p) => (
            <li key={p.id} className="flex flex-col items-center gap-1">
              <div className="relative">
                <CharacterSprite id={p.character} size={56} className="h-14 w-14 rounded-2xl ring-4 ring-white shadow-bubble" />
                {p.id === myId ? (
                  <span className="absolute -right-1 -top-1 rounded-full bg-amber-300 px-1.5 py-0.5 text-[9px] font-bold text-amber-950 shadow">
                    ME
                  </span>
                ) : null}
              </div>
              <span className="max-w-[100px] truncate rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-sm">
                {p.nickname}
              </span>
              {p.id === room.hostId ? (
                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                  HOST
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
      <div className="flex flex-col gap-2">
        {isHost ? (
          <button
            type="button"
            disabled={!canStart}
            onClick={onStart}
            className={cn(
              "rounded-2xl py-3 text-lg font-black text-white shadow-lg transition",
              canStart
                ? "bg-gradient-to-r from-pink-400 to-rose-400 hover:brightness-105"
                : "cursor-not-allowed bg-slate-300",
            )}
          >
            {canStart ? "금지어 설정 시작" : "최소 2명 필요"}
          </button>
        ) : (
          <p className="rounded-2xl bg-sky-50 py-3 text-center text-sm font-semibold text-sky-700">
            호스트가 시작할 때까지 잠깐만요…
          </p>
        )}
        <button
          type="button"
          onClick={onLeave}
          className="rounded-2xl border-2 border-slate-200 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          나가기
        </button>
      </div>
    </div>
  );
}
