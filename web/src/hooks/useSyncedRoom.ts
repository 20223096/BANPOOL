"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { readSession } from "@/lib/session";
import type { RoomState } from "@/lib/types";

export function useSyncedRoom(roomId: string): {
  room: RoomState | null;
  playerId: string | null;
} {
  const router = useRouter();
  const [room, setRoom] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const s = readSession();
    if (!s || s.roomId !== roomId) {
      router.replace("/");
      return;
    }
    setPlayerId(s.playerId);
    const socket = getSocket();

    const onState = (r: RoomState) => setRoom(r);
    socket.on("room_state", onState);

    socket.emit("sync_room", { roomId, playerId: s.playerId }, (res: unknown) => {
      const r = res as { ok?: boolean; room?: RoomState };
      if (r?.ok && r.room) setRoom(r.room);
      else router.replace("/");
    });

    return () => {
      socket.off("room_state", onState);
    };
  }, [roomId, router]);

  return { room, playerId };
}
