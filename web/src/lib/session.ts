import { STORAGE_NICKNAME, STORAGE_PLAYER_ID, STORAGE_ROOM_ID } from "./constants";

export function saveSession(roomId: string, playerId: string, nickname: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_ROOM_ID, roomId);
  sessionStorage.setItem(STORAGE_PLAYER_ID, playerId);
  sessionStorage.setItem(STORAGE_NICKNAME, nickname);
}

export function readSession(): { roomId: string; playerId: string; nickname: string } | null {
  if (typeof window === "undefined") return null;
  const roomId = sessionStorage.getItem(STORAGE_ROOM_ID);
  const playerId = sessionStorage.getItem(STORAGE_PLAYER_ID);
  const nickname = sessionStorage.getItem(STORAGE_NICKNAME);
  if (!roomId || !playerId || !nickname) return null;
  return { roomId, playerId, nickname };
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_ROOM_ID);
  sessionStorage.removeItem(STORAGE_PLAYER_ID);
  sessionStorage.removeItem(STORAGE_NICKNAME);
}
