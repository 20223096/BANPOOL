"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { ChatBox } from "@/components/ChatBox";
import { GameTimer } from "@/components/GameTimer";
import { PenaltyAnimation } from "@/components/PenaltyAnimation";
import { PoolMap } from "@/components/PoolMap";
import { ScoreBoard } from "@/components/ScoreBoard";
import { SpeechBubble } from "@/components/SpeechBubble";
import { TopicBanner } from "@/components/TopicBanner";
import { useSyncedRoom } from "@/hooks/useSyncedRoom";
import { getSocket } from "@/lib/socket";
import { clearSession } from "@/lib/session";
import type { ChatEntry } from "@/lib/types";

type Props = { params: Promise<{ roomId: string }> };

type Bubble = { text: string; forbiddenMatch?: string; until: number };
type PenaltyPhase = "none" | "buzz" | "fly" | "splash";

export default function GamePage({ params }: Props) {
  const { roomId: raw } = use(params);
  const roomId = raw.toUpperCase();
  const router = useRouter();
  const { room, playerId } = useSyncedRoom(roomId);
  const roomRef = useRef(room);
  roomRef.current = room;

  const [bubbles, setBubbles] = useState<Record<string, Bubble>>({});
  const [penaltyPhase, setPenaltyPhase] = useState<Record<string, PenaltyPhase>>({});
  const [toasts, setToasts] = useState<string[]>([]);

  useEffect(() => {
    if (!room) return;
    if (room.gameStatus === "waiting") router.replace(`/lobby/${room.id}`);
    else if (room.gameStatus === "setting_words") router.replace(`/setup/${room.id}`);
    else if (room.gameStatus === "finished") router.replace(`/results/${room.id}`);
  }, [room, router]);

  useEffect(() => {
    const socket = getSocket();
    const runPenalty = (pid: string, nickname: string, reason: "forbidden" | "inactive") => {
      setPenaltyPhase((m) => ({ ...m, [pid]: "buzz" }));
      setTimeout(() => setPenaltyPhase((m) => ({ ...m, [pid]: "fly" })), 380);
      setTimeout(() => setPenaltyPhase((m) => ({ ...m, [pid]: "splash" })), 900);
      setTimeout(() => setPenaltyPhase((m) => ({ ...m, [pid]: "none" })), 2000);
      const msg =
        reason === "forbidden"
          ? `[${nickname}]님이 금지어를 말했습니다! -10점`
          : `[${nickname}]님이 1분 동안 말하지 않았습니다! -10점`;
      setToasts((t) => [...t.slice(-4), msg]);
    };

    const onChat = (payload: { entry: ChatEntry }) => {
      const { entry } = payload;
      setBubbles((b) => ({
        ...b,
        [entry.playerId]: {
          text: entry.text,
          forbiddenMatch: entry.forbiddenMatch,
          until: Date.now() + 5200,
        },
      }));
    };
    const onForbidden = (p: { playerId: string; nickname: string }) => {
      runPenalty(p.playerId, p.nickname, "forbidden");
    };
    const onInactive = (p: { playerId: string; nickname: string }) => {
      runPenalty(p.playerId, p.nickname, "inactive");
    };

    socket.on("chat_message", onChat);
    socket.on("forbidden_word_detected", onForbidden);
    socket.on("inactivity_penalty", onInactive);
    return () => {
      socket.off("chat_message", onChat);
      socket.off("forbidden_word_detected", onForbidden);
      socket.off("inactivity_penalty", onInactive);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      setBubbles((b) => {
        const next = { ...b };
        for (const k of Object.keys(next)) {
          if (next[k]!.until < now) delete next[k];
        }
        return next;
      });
    }, 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!playerId) return;
    const socket = getSocket();
    const keys = new Set<string>();
    const onDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        e.preventDefault();
        keys.add(k);
      }
    };
    const onUp = (e: KeyboardEvent) => {
      keys.delete(e.key.toLowerCase());
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    let raf = 0;
    let lastEmit = 0;
    const speed = 3.6;
    const loop = () => {
      const r = roomRef.current;
      if (r?.gameStatus === "playing" && playerId) {
        const me = r.players.find((p) => p.id === playerId);
        if (me && !me.isPenalty) {
          let { x, y } = me;
          if (keys.has("w") || keys.has("arrowup")) y -= speed;
          if (keys.has("s") || keys.has("arrowdown")) y += speed;
          if (keys.has("a") || keys.has("arrowleft")) x -= speed;
          if (keys.has("d") || keys.has("arrowright")) x += speed;
          const now = performance.now();
          if (now - lastEmit > 75) {
            lastEmit = now;
            socket.emit("player_move", { roomId: r.id, playerId, x, y });
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [playerId, roomId]);

  if (!room || !playerId || !room.currentTopic) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-lg font-bold text-sky-800">
        게임장 입장 중…
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-4 px-3 py-4 lg:flex-row lg:px-6">
      <section className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <TopicBanner topic={room.currentTopic} />
          <GameTimer seconds={room.remainingSeconds} />
        </div>
        <div className="relative">
          <PoolMap>
            {room.players.map((p) => {
              const bubble = bubbles[p.id];
              const phase = penaltyPhase[p.id] ?? "none";
              const active = phase !== "none";
              return (
                <div
                  key={p.id}
                  className="absolute z-10"
                  style={{ left: p.x, top: p.y, transform: "translate(-50%, -50%)" }}
                >
                  {bubble ? (
                    <div className="absolute -top-16 left-1/2 z-20 w-max -translate-x-1/2">
                      <SpeechBubble text={bubble.text} forbiddenMatch={bubble.forbiddenMatch} />
                    </div>
                  ) : null}
                  <PenaltyAnimation active={active} phase={phase}>
                    <Avatar nickname={p.nickname} color={p.avatarColor} isMe={p.id === playerId} />
                  </PenaltyAnimation>
                </div>
              );
            })}
          </PoolMap>
        </div>
        <ChatBox
          myId={playerId}
          log={room.chatLog}
          onSend={(text) => {
            getSocket().emit("send_chat", { roomId: room.id, playerId, message: text });
          }}
        />
        <div className="flex justify-between gap-2">
          <button
            type="button"
            className="rounded-2xl border-2 border-white bg-white/70 px-4 py-2 text-sm font-bold text-slate-600"
            onClick={() => {
              getSocket().emit("leave_room");
              clearSession();
              router.push("/");
            }}
          >
            나가기
          </button>
          <p className="text-xs font-medium text-slate-600">
            이동: WASD 또는 방향키 · 맵 중심에서 대화를 이어가 보세요!
          </p>
        </div>
      </section>
      <aside className="flex w-full flex-col gap-3 lg:w-64">
        <ScoreBoard players={room.players} myId={playerId} />
        <div className="rounded-3xl border-2 border-white bg-white/80 p-3 text-xs font-semibold text-slate-600 shadow-bubble">
          <p className="mb-1 font-black text-sky-700">알림</p>
          <ul className="space-y-1">
            {toasts.length === 0 ? <li className="text-slate-400">조용해요…</li> : null}
            {toasts.map((t, i) => (
              <li key={`${i}-${t}`} className="rounded-xl bg-rose-50 px-2 py-1 text-rose-700">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}
