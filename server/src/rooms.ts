import { randomUUID } from "crypto";
import type { ChatEntry, Player, Room } from "./types.js";
import { normalizeCharacterId } from "./characters.js";
import {
  AVATAR_COLORS,
  GAME_DURATION_MS,
  INACTIVITY_MS,
  MAP_H,
  MAP_W,
  PENALTY_ANIM_MS,
  PENALTY_SCORE,
  START_SCORE,
  BALANCE_GAME_TOPICS,
} from "./constants.js";

const rooms = new Map<string, Room>();

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]!;
  }
  if (rooms.has(code)) return generateRoomCode();
  return code;
}

function randomSpawn(): { x: number; y: number } {
  const margin = 40;
  return {
    x: margin + Math.random() * (MAP_W - margin * 2),
    y: margin + Math.random() * (MAP_H - margin * 2),
  };
}

function pickAvatarColor(existing: Player[]): string {
  const used = new Set(existing.map((p) => p.avatarColor));
  for (const c of AVATAR_COLORS) {
    if (!used.has(c)) return c;
  }
  return AVATAR_COLORS[existing.length % AVATAR_COLORS.length]!;
}

function pickTopic(): string {
  return BALANCE_GAME_TOPICS[Math.floor(Math.random() * BALANCE_GAME_TOPICS.length)]!;
}

function clampPosition(x: number, y: number): { x: number; y: number } {
  const pad = 24;
  return {
    x: Math.min(Math.max(x, pad), MAP_W - pad),
    y: Math.min(Math.max(y, pad), MAP_H - pad),
  };
}

function getPlayer(room: Room, playerId: string): Player | undefined {
  return room.players.find((p) => p.id === playerId);
}

function isWordSetupComplete(room: Room): boolean {
  if (room.players.length < 2) return false;
  for (const p of room.players) {
    const row = room.wordAssignments[p.id];
    if (!row) return false;
    for (const other of room.players) {
      if (other.id === p.id) continue;
      const w = row[other.id];
      if (!w || !String(w).trim()) return false;
    }
  }
  return true;
}

function mergeForbiddenWords(room: Room): void {
  for (const p of room.players) {
    p.forbiddenWords = [];
  }
  for (const assigner of room.players) {
    const row = room.wordAssignments[assigner.id];
    if (!row) continue;
    for (const target of room.players) {
      if (target.id === assigner.id) continue;
      const word = row[target.id];
      if (word && word.trim()) {
        target.forbiddenWords.push(word.trim());
      }
    }
  }
}

function ensureHost(room: Room): void {
  if (room.players.length === 0) return;
  const stillThere = room.players.some((p) => p.id === room.hostId);
  if (!stillThere) {
    room.hostId = room.players[0]!.id;
  }
}

export function createRoom(nickname: string, socketId: string, characterRaw?: unknown): {
  room: Room;
  player: Player;
} {
  const roomId = generateRoomCode();
  const playerId = randomUUID();
  const spawn = randomSpawn();
  const character = normalizeCharacterId(characterRaw);
  const player: Player = {
    id: playerId,
    nickname: nickname.trim().slice(0, 16) || "Player",
    avatarColor: pickAvatarColor([]),
    character,
    x: spawn.x,
    y: spawn.y,
    score: START_SCORE,
    forbiddenWords: [],
    lastChatAt: Date.now(),
    isPenalty: false,
    socketId,
  };
  const room: Room = {
    id: roomId,
    hostId: playerId,
    players: [player],
    gameStatus: "waiting",
    currentTopic: null,
    gameEndsAt: null,
    remainingSeconds: 0,
    wordAssignments: {},
    chatLog: [],
    createdAt: Date.now(),
  };
  rooms.set(roomId, room);
  return { room, player };
}

export function joinRoom(
  roomId: string,
  nickname: string,
  socketId: string,
  characterRaw?: unknown,
): { ok: true; room: Room; player: Player } | { ok: false; reason: string } {
  const key = roomId.toUpperCase();
  const room = rooms.get(key);
  if (!room) return { ok: false, reason: "방을 찾을 수 없어요." };
  if (room.gameStatus !== "waiting") {
    return { ok: false, reason: "이미 진행 중인 방이에요. 새 방을 만들어 주세요." };
  }
  const trimmed = nickname.trim().slice(0, 16) || "Player";
  if (room.players.some((p) => p.nickname === trimmed)) {
    return { ok: false, reason: "같은 닉네임이 이미 있어요." };
  }
  const playerId = randomUUID();
  const spawn = randomSpawn();
  const character = normalizeCharacterId(characterRaw);
  const player: Player = {
    id: playerId,
    nickname: trimmed,
    avatarColor: pickAvatarColor(room.players),
    character,
    x: spawn.x,
    y: spawn.y,
    score: START_SCORE,
    forbiddenWords: [],
    lastChatAt: Date.now(),
    isPenalty: false,
    socketId,
  };
  room.players.push(player);
  return { ok: true, room, player };
}

export function leaveRoom(roomId: string, playerId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.players = room.players.filter((p) => p.id !== playerId);
  if (room.players.length === 0) {
    rooms.delete(roomId);
    return null;
  }
  ensureHost(room);
  return room;
}

export function bindSocket(roomId: string, playerId: string, socketId: string): void {
  const room = rooms.get(roomId);
  if (!room) return;
  const p = getPlayer(room, playerId);
  if (p) p.socketId = socketId;
}

export function startWordSetting(roomId: string, requesterId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room || room.hostId !== requesterId) return null;
  if (room.players.length < 2) return null;
  room.gameStatus = "setting_words";
  room.wordAssignments = {};
  room.chatLog = [];
  room.currentTopic = null;
  room.gameEndsAt = null;
  room.remainingSeconds = 0;
  for (const p of room.players) {
    p.score = START_SCORE;
    p.forbiddenWords = [];
    p.isPenalty = false;
    const s = randomSpawn();
    p.x = s.x;
    p.y = s.y;
  }
  return room;
}

export function submitForbiddenWord(
  roomId: string,
  fromPlayerId: string,
  targetPlayerId: string,
  word: string,
): Room | null {
  const room = rooms.get(roomId);
  if (!room || room.gameStatus !== "setting_words") return null;
  if (fromPlayerId === targetPlayerId) return null;
  const from = getPlayer(room, fromPlayerId);
  const target = getPlayer(room, targetPlayerId);
  if (!from || !target) return null;
  const trimmed = word.trim().slice(0, 32);
  if (!trimmed) return null;
  if (!room.wordAssignments[fromPlayerId]) {
    room.wordAssignments[fromPlayerId] = {};
  }
  room.wordAssignments[fromPlayerId]![targetPlayerId] = trimmed;
  if (isWordSetupComplete(room)) {
    mergeForbiddenWords(room);
    startPlaying(room);
  }
  return room;
}

function startPlaying(room: Room): void {
  room.gameStatus = "playing";
  room.currentTopic = pickTopic();
  const now = Date.now();
  room.gameEndsAt = now + GAME_DURATION_MS;
  room.remainingSeconds = Math.ceil(GAME_DURATION_MS / 1000);
  for (const p of room.players) {
    p.lastChatAt = now;
    p.isPenalty = false;
  }
}

export function playerMove(
  roomId: string,
  playerId: string,
  x: number,
  y: number,
): Room | null {
  const room = rooms.get(roomId);
  if (!room || room.gameStatus !== "playing") return null;
  const p = getPlayer(room, playerId);
  if (!p || p.isPenalty) return null;
  const c = clampPosition(x, y);
  p.x = c.x;
  p.y = c.y;
  return room;
}

function findForbiddenMatch(message: string, words: string[]): string | undefined {
  for (const w of words) {
    if (message.includes(w)) return w;
  }
  return undefined;
}

export function sendChat(
  roomId: string,
  playerId: string,
  text: string,
): { room: Room; entry: ChatEntry; hit?: string } | null {
  const room = rooms.get(roomId);
  if (!room || room.gameStatus !== "playing") return null;
  const p = getPlayer(room, playerId);
  if (!p) return null;
  const trimmed = text.trim().slice(0, 200);
  if (!trimmed) return null;
  const now = Date.now();
  p.lastChatAt = now;
  const id = randomUUID();
  const match = findForbiddenMatch(trimmed, p.forbiddenWords);
  const entry: ChatEntry = {
    id,
    playerId,
    nickname: p.nickname,
    text: trimmed,
    forbiddenMatch: match,
    createdAt: now,
  };
  room.chatLog.push(entry);
  if (room.chatLog.length > 80) room.chatLog.splice(0, room.chatLog.length - 80);
  if (match) {
    applyScorePenalty(p, room);
  }
  return { room, entry, hit: match };
}

function applyScorePenalty(player: Player, room: Room): void {
  player.score = Math.max(0, player.score - PENALTY_SCORE);
  player.isPenalty = true;
  const pid = player.id;
  setTimeout(() => {
    const r = rooms.get(room.id);
    if (!r) return;
    const pl = getPlayer(r, pid);
    if (!pl) return;
    pl.isPenalty = false;
    const s = randomSpawn();
    pl.x = s.x;
    pl.y = s.y;
  }, PENALTY_ANIM_MS);
}

export interface PenaltyEvent {
  type: "inactivity";
  playerId: string;
  nickname: string;
}

export function tickRooms(now: number): { room: Room; events: PenaltyEvent[]; justEnded: boolean }[] {
  const out: { room: Room; events: PenaltyEvent[]; justEnded: boolean }[] = [];
  for (const room of rooms.values()) {
    if (room.gameStatus !== "playing" || !room.gameEndsAt) continue;
    const events: PenaltyEvent[] = [];
    if (now >= room.gameEndsAt) {
      room.gameStatus = "finished";
      room.remainingSeconds = 0;
      out.push({ room, events, justEnded: true });
      continue;
    }
    room.remainingSeconds = Math.max(0, Math.ceil((room.gameEndsAt - now) / 1000));
    for (const p of room.players) {
      if (p.isPenalty) continue;
      if (now - p.lastChatAt >= INACTIVITY_MS) {
        applyScorePenalty(p, room);
        p.lastChatAt = now;
        events.push({ type: "inactivity", playerId: p.id, nickname: p.nickname });
      }
    }
    out.push({ room, events, justEnded: false });
  }
  return out;
}

export function restartToWordSetup(roomId: string, requesterId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room || room.hostId !== requesterId) return null;
  if (room.gameStatus !== "finished" && room.gameStatus !== "playing") {
    return null;
  }
  room.gameStatus = "setting_words";
  room.wordAssignments = {};
  room.chatLog = [];
  room.currentTopic = null;
  room.gameEndsAt = null;
  room.remainingSeconds = 0;
  for (const p of room.players) {
    p.score = START_SCORE;
    p.forbiddenWords = [];
    p.isPenalty = false;
    const s = randomSpawn();
    p.x = s.x;
    p.y = s.y;
    p.lastChatAt = Date.now();
  }
  return room;
}

export function backToLobby(roomId: string, requesterId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room || room.hostId !== requesterId) return null;
  room.gameStatus = "waiting";
  room.wordAssignments = {};
  room.chatLog = [];
  room.currentTopic = null;
  room.gameEndsAt = null;
  room.remainingSeconds = 0;
  for (const p of room.players) {
    p.score = START_SCORE;
    p.forbiddenWords = [];
    p.isPenalty = false;
    const s = randomSpawn();
    p.x = s.x;
    p.y = s.y;
  }
  return room;
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function sanitizeRoom(room: Room) {
  const required = Math.max(0, room.players.length - 1);
  const wordSetupProgress: Record<string, number> = {};
  for (const p of room.players) {
    const row = room.wordAssignments[p.id];
    wordSetupProgress[p.id] = row ? Object.keys(row).length : 0;
  }
  return {
    id: room.id,
    hostId: room.hostId,
    gameStatus: room.gameStatus,
    currentTopic: room.currentTopic,
    remainingSeconds: room.remainingSeconds,
    chatLog: room.chatLog,
    wordSetupProgress,
    wordSetupRequired: required,
    players: room.players.map((p) => ({
      id: p.id,
      nickname: p.nickname,
      avatarColor: p.avatarColor,
      character: normalizeCharacterId(p.character),
      x: p.x,
      y: p.y,
      score: p.score,
      isPenalty: p.isPenalty,
    })),
  };
}
