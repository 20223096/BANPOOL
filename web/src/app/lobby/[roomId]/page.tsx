"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoomLobby } from "@/components/RoomLobby";
import { useSyncedRoom } from "@/hooks/useSyncedRoom";
import { getSocket } from "@/lib/socket";
import { clearSession } from "@/lib/session";

type Props = { params: Promise<{ roomId: string }> };

export default function LobbyPage({ params }: Props) {
  const { roomId: raw } = use(params);
  const roomId = raw.toUpperCase();
  const router = useRouter();
  const { room, playerId } = useSyncedRoom(roomId);

  useEffect(() => {
    if (!room) return;
    if (room.gameStatus === "setting_words") router.replace(`/setup/${room.id}`);
    else if (room.gameStatus === "playing") router.replace(`/game/${room.id}`);
    else if (room.gameStatus === "finished") router.replace(`/results/${room.id}`);
  }, [room, router]);

  if (!room || !playerId) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-lg font-bold text-sky-800">
        대기실 연결 중…
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col items-center gap-6 px-4 py-8">
      <h1 className="text-2xl font-black text-white drop-shadow">대기방</h1>
      <RoomLobby
        room={room}
        myId={playerId}
        onStart={() => {
          getSocket().emit("start_word_setting", { roomId: room.id, playerId });
        }}
        onLeave={() => {
          getSocket().emit("leave_room");
          clearSession();
          router.push("/");
        }}
      />
    </main>
  );
}
