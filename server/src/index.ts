import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import {
  backToLobby,
  bindSocket,
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  playerMove,
  restartToWordSetup,
  sanitizeRoom,
  sendChat,
  startWordSetting,
  submitForbiddenWord,
  tickRooms,
} from "./rooms.js";

const PORT = Number(process.env.PORT) || 4000;
/** 콤마로 여러 개: https://a.vercel.app,https://b.vercel.app */
const CLIENT_ORIGIN_RAW = process.env.CLIENT_ORIGIN || "http://localhost:3000";
const ALLOWED_ORIGINS = CLIENT_ORIGIN_RAW.split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

/** CORS 허용: 명시 목록 + 모든 *.vercel.app (프리뷰 URL 포함) */
function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  return /^https:\/\/[^\s/]+\.vercel\.app$/i.test(origin);
}

const app = express();
app.use(
  cors({
    origin(origin, cb) {
      cb(null, isOriginAllowed(origin));
    },
    credentials: false,
  }),
);
app.get("/health", (_req, res) => {
  res.json({ ok: true, name: "BANPOOL" });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin(origin, cb) {
      cb(null, isOriginAllowed(origin));
    },
    methods: ["GET", "POST"],
    credentials: false,
  },
});

const socketRoom = new Map<string, { roomId: string; playerId: string }>();
const pendingRemoval = new Map<string, NodeJS.Timeout>();

function pendingKey(roomId: string, playerId: string): string {
  return `${roomId}::${playerId}`;
}

function cancelPendingRemoval(roomId: string, playerId: string): void {
  const key = pendingKey(roomId, playerId);
  const t = pendingRemoval.get(key);
  if (t) {
    clearTimeout(t);
    pendingRemoval.delete(key);
  }
}

function scheduleDelayedLeave(roomId: string, playerId: string): void {
  const key = pendingKey(roomId, playerId);
  const existing = pendingRemoval.get(key);
  if (existing) clearTimeout(existing);
  const t = setTimeout(() => {
    pendingRemoval.delete(key);
    const updated = leaveRoom(roomId, playerId);
    if (updated) broadcastRoom(roomId);
  }, 45_000);
  pendingRemoval.set(key, t);
}

function broadcastRoom(roomId: string): void {
  const room = getRoom(roomId);
  if (!room) return;
  io.to(roomId).emit("room_state", sanitizeRoom(room));
}

function leaveFromSocketImmediate(socketId: string): void {
  const meta = socketRoom.get(socketId);
  if (!meta) return;
  socketRoom.delete(socketId);
  cancelPendingRemoval(meta.roomId, meta.playerId);
  const updated = leaveRoom(meta.roomId, meta.playerId);
  if (updated) {
    broadcastRoom(meta.roomId);
  }
}

io.on("connection", (socket) => {
  socket.on("create_room", (payload: { nickname: string }, ack) => {
    const nick = String(payload?.nickname ?? "");
    const { room, player } = createRoom(nick, socket.id);
    socket.join(room.id);
    socketRoom.set(socket.id, { roomId: room.id, playerId: player.id });
    ack?.({ ok: true, roomId: room.id, playerId: player.id, room: sanitizeRoom(room) });
    broadcastRoom(room.id);
  });

  socket.on("join_room", (payload: { roomId: string; nickname: string }, ack) => {
    const roomId = String(payload?.roomId ?? "").toUpperCase();
    const nick = String(payload?.nickname ?? "");
    const result = joinRoom(roomId, nick, socket.id);
    if (!result.ok) {
      ack?.({ ok: false, reason: result.reason });
      return;
    }
    socket.join(result.room.id);
    socketRoom.set(socket.id, { roomId: result.room.id, playerId: result.player.id });
    ack?.({
      ok: true,
      roomId: result.room.id,
      playerId: result.player.id,
      room: sanitizeRoom(result.room),
    });
    broadcastRoom(result.room.id);
  });

  socket.on("sync_room", (payload: { roomId: string; playerId: string }, ack) => {
    const roomId = String(payload?.roomId ?? "");
    const playerId = String(payload?.playerId ?? "");
    const room = getRoom(roomId);
    if (!room || !room.players.some((p) => p.id === playerId)) {
      ack?.({ ok: false });
      return;
    }
    cancelPendingRemoval(roomId, playerId);
    socket.join(roomId);
    bindSocket(roomId, playerId, socket.id);
    socketRoom.set(socket.id, { roomId, playerId });
    ack?.({ ok: true, room: sanitizeRoom(room) });
  });

  socket.on("leave_room", () => {
    leaveFromSocketImmediate(socket.id);
    socket.rooms.forEach((r) => {
      if (r !== socket.id) socket.leave(r);
    });
  });

  socket.on("start_word_setting", (payload: { roomId: string; playerId: string }) => {
    const roomId = String(payload?.roomId ?? "");
    const playerId = String(payload?.playerId ?? "");
    const room = startWordSetting(roomId, playerId);
    if (room) broadcastRoom(roomId);
  });

  socket.on(
    "submit_forbidden_word",
    (payload: { roomId: string; fromPlayerId: string; targetPlayerId: string; word: string }) => {
      const roomId = String(payload?.roomId ?? "");
      const room = submitForbiddenWord(
        roomId,
        String(payload?.fromPlayerId ?? ""),
        String(payload?.targetPlayerId ?? ""),
        String(payload?.word ?? ""),
      );
      if (room) broadcastRoom(roomId);
    },
  );

  socket.on("start_game", () => {});

  socket.on(
    "player_move",
    (payload: { roomId: string; playerId: string; x: number; y: number }) => {
      const roomId = String(payload?.roomId ?? "");
      const room = playerMove(
        roomId,
        String(payload?.playerId ?? ""),
        Number(payload?.x),
        Number(payload?.y),
      );
      if (room) broadcastRoom(roomId);
    },
  );

  socket.on("send_chat", (payload: { roomId: string; playerId: string; message: string }) => {
    const roomId = String(payload?.roomId ?? "");
    const playerId = String(payload?.playerId ?? "");
    const text = String(payload?.message ?? "");
    const result = sendChat(roomId, playerId, text);
    if (!result) return;
    const { entry, hit } = result;
    io.to(roomId).emit("chat_message", { entry });
    if (hit) {
      io.to(roomId).emit("forbidden_word_detected", {
        playerId,
        nickname: entry.nickname,
        match: hit,
      });
    }
    broadcastRoom(roomId);
  });

  socket.on("restart_game", (payload: { roomId: string; playerId: string }) => {
    const roomId = String(payload?.roomId ?? "");
    const playerId = String(payload?.playerId ?? "");
    const room = restartToWordSetup(roomId, playerId);
    if (room) broadcastRoom(roomId);
  });

  socket.on("back_to_lobby", (payload: { roomId: string; playerId: string }) => {
    const roomId = String(payload?.roomId ?? "");
    const playerId = String(payload?.playerId ?? "");
    const room = backToLobby(roomId, playerId);
    if (room) broadcastRoom(roomId);
  });

  socket.on("disconnect", () => {
    const meta = socketRoom.get(socket.id);
    if (!meta) return;
    socketRoom.delete(socket.id);
    scheduleDelayedLeave(meta.roomId, meta.playerId);
  });
});

setInterval(() => {
  const now = Date.now();
  const batches = tickRooms(now);
  for (const { room, events, justEnded } of batches) {
    for (const ev of events) {
      io.to(room.id).emit("inactivity_penalty", {
        playerId: ev.playerId,
        nickname: ev.nickname,
      });
    }
    if (justEnded) {
      io.to(room.id).emit("game_finished", { room: sanitizeRoom(room) });
    }
    broadcastRoom(room.id);
  }
}, 1000);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`BANPOOL listening on 0.0.0.0:${PORT} cors=${ALLOWED_ORIGINS.join("|")}`);
});
