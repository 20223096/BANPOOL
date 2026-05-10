import type { CharacterId } from "./characters";

export type GameStatus = "waiting" | "setting_words" | "playing" | "finished";

export interface PublicPlayer {
  id: string;
  nickname: string;
  avatarColor: string;
  character: CharacterId;
  x: number;
  y: number;
  score: number;
  isPenalty: boolean;
}

export interface ChatEntry {
  id: string;
  playerId: string;
  nickname: string;
  text: string;
  forbiddenMatch?: string;
  createdAt: number;
}

export interface RoomState {
  id: string;
  hostId: string;
  gameStatus: GameStatus;
  currentTopic: string | null;
  remainingSeconds: number;
  chatLog: ChatEntry[];
  wordSetupProgress: Record<string, number>;
  wordSetupRequired: number;
  players: PublicPlayer[];
}
