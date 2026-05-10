import type { GameStatus } from "./gameTypes.js";
import type { CharacterId } from "./characters.js";

export type { GameStatus };

export interface Player {
  id: string;
  nickname: string;
  avatarColor: string;
  character: CharacterId;
  x: number;
  y: number;
  score: number;
  forbiddenWords: string[];
  lastChatAt: number;
  isPenalty: boolean;
  socketId: string;
}

export type WordAssignments = Record<string, Record<string, string>>;

export interface ChatEntry {
  id: string;
  playerId: string;
  nickname: string;
  text: string;
  forbiddenMatch?: string;
  createdAt: number;
}

export interface Room {
  id: string;
  hostId: string;
  players: Player[];
  gameStatus: GameStatus;
  currentTopic: string | null;
  gameEndsAt: number | null;
  remainingSeconds: number;
  wordAssignments: WordAssignments;
  chatLog: ChatEntry[];
  createdAt: number;
}
