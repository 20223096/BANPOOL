"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ResultPage } from "@/components/ResultPage";
import { useSyncedRoom } from "@/hooks/useSyncedRoom";
import { getSocket } from "@/lib/socket";
import { clearSession } from "@/lib/session";

type Props = { params: Promise<{ roomId: string }> };

export default function ResultsRoute({ params }: Props) {
  const { roomId: raw } = use(params);
  const roomId = raw.toUpperCase();
  const router = useRouter();
  const { room, playerId } = useSyncedRoom(roomId);

  useEffect(() => {
    if (!room) return;
    if (room.gameStatus === "waiting") router.replace(`/lobby/${room.id}`);
    else if (room.gameStatus === "setting_words") router.replace(`/setup/${room.id}`);
    else if (room.gameStatus === "playing") router.replace(`/game/${room.id}`);
  }, [room, router]);

  if (!room || !playerId) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-lg font-bold text-sky-800">
        결과 불러오는 중…
      </div>
    );
  }

  const isHost = room.hostId === playerId;

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col items-center gap-6 px-4 py-10">
      <header className="text-center text-white drop-shadow">
        <p className="text-sm font-bold text-sky-100">BANPOOL</p>
        <h1 className="text-2xl font-black">결과</h1>
      </header>
      <ResultPage
        players={room.players}
        myId={playerId}
        canControl={isHost}
        onAgain={() => {
          getSocket().emit("restart_game", { roomId: room.id, playerId });
          router.push(`/setup/${room.id}`);
        }}
        onLobby={() => {
          getSocket().emit("back_to_lobby", { roomId: room.id, playerId });
          router.push(`/lobby/${room.id}`);
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
        완전히 나가기
      </button>
    </main>
  );
}
