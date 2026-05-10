"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ForbiddenWordSetup } from "@/components/ForbiddenWordSetup";
import { useSyncedRoom } from "@/hooks/useSyncedRoom";
import { getSocket } from "@/lib/socket";
import { clearSession } from "@/lib/session";

type Props = { params: Promise<{ roomId: string }> };

export default function SetupPage({ params }: Props) {
  const { roomId: raw } = use(params);
  const roomId = raw.toUpperCase();
  const router = useRouter();
  const { room, playerId } = useSyncedRoom(roomId);

  useEffect(() => {
    if (!room) return;
    if (room.gameStatus === "waiting") router.replace(`/lobby/${room.id}`);
    else if (room.gameStatus === "playing") router.replace(`/game/${room.id}`);
    else if (room.gameStatus === "finished") router.replace(`/results/${room.id}`);
  }, [room, router]);

  if (!room || !playerId) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-lg font-bold text-sky-800">
        설정 화면 연결 중…
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col items-center gap-6 px-4 py-8">
      <header className="text-center text-white drop-shadow">
        <p className="text-sm font-bold text-sky-100">BANPOOL</p>
        <h1 className="text-2xl font-black">금지어 설정</h1>
      </header>
      <ForbiddenWordSetup
        room={room}
        myId={playerId}
        onSubmit={(targetId, word) => {
          getSocket().emit("submit_forbidden_word", {
            roomId: room.id,
            fromPlayerId: playerId,
            targetPlayerId: targetId,
            word,
          });
        }}
      />
      <button
        type="button"
        className="text-sm font-bold text-slate-600 underline"
        onClick={() => {
          getSocket().emit("leave_room");
          clearSession();
          router.push("/");
        }}
      >
        나가기
      </button>
    </main>
  );
}
