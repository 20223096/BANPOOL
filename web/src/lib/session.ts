import { STORAGE_CHARACTER, STORAGE_NICKNAME, STORAGE_PLAYER_ID, STORAGE_ROOM_ID } from "./constants";
import type { CharacterId } from "./characters";
import { isCharacterId } from "./characters";

export function saveSession(
  roomId: string,
  playerId: string,
  nickname: string,
  character: CharacterId = "bear",
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_ROOM_ID, roomId);
  sessionStorage.setItem(STORAGE_PLAYER_ID, playerId);
  sessionStorage.setItem(STORAGE_NICKNAME, nickname);
  sessionStorage.setItem(STORAGE_CHARACTER, character);
}

export function readSession(): {
  roomId: string;
  playerId: string;
  nickname: string;
  character: CharacterId;
} | null {
  if (typeof window === "undefined") return null;
  const roomId = sessionStorage.getItem(STORAGE_ROOM_ID);
  const playerId = sessionStorage.getItem(STORAGE_PLAYER_ID);
  const nickname = sessionStorage.getItem(STORAGE_NICKNAME);
  const ch = sessionStorage.getItem(STORAGE_CHARACTER);
  if (!roomId || !playerId || !nickname) return null;
  const character = ch && isCharacterId(ch) ? ch : "bear";
  return { roomId, playerId, nickname, character };
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_ROOM_ID);
  sessionStorage.removeItem(STORAGE_PLAYER_ID);
  sessionStorage.removeItem(STORAGE_NICKNAME);
  sessionStorage.removeItem(STORAGE_CHARACTER);
}
