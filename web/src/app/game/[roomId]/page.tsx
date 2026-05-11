"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { DiveAnimation, type DivePenaltyPayload } from "@/components/DiveAnimation";
import { GameChatDock } from "@/components/GameChatDock";
import { PlayerSlot } from "@/components/PlayerSlot";
import { PoolBackground } from "@/components/PoolBackground";
import { RankingBoard } from "@/components/RankingBoard";
import { TopicHeader } from "@/components/TopicHeader";
import { useSyncedRoom } from "@/hooks/useSyncedRoom";
import { getSocket } from "@/lib/socket";
import { clearSession } from "@/lib/session";
import type { CharacterId } from "@/lib/characters";
import type { ChatEntry } from "@/lib/types";

type Props = { params: Promise<{ roomId: string }> };

type SlotBubble = { text: string; forbiddenMatch?: string; until: number };

export default function GamePage({ params }: Props) {
  const { roomId: raw } = use(params);
  const roomId = raw.toUpperCase();
  const router = useRouter();
  const { room, playerId } = useSyncedRoom(roomId);
  const roomRef = useRef(room);
  roomRef.current = room;

  const stageRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const diveBoardRef = useRef<HTMLDivElement>(null);

  const [bubbles, setBubbles] = useState<Record<string, SlotBubble>>({});
  const [lastSpeakerId, setLastSpeakerId] = useState<string | null>(null);
  const speakerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [penaltyPayload, setPenaltyPayload] = useState<DivePenaltyPayload | null>(null);
  const [penaltyFlyingId, setPenaltyFlyingId] = useState<string | null>(null);
  const [shakingPlayerId, setShakingPlayerId] = useState<string | null>(null);
  const [scoreDeltaByPlayer, setScoreDeltaByPlayer] = useState<Record<string, number | null>>({});
  const [toasts, setToasts] = useState<string[]>([]);
  const prevScoresRef = useRef<Record<string, number>>({});
  const initializedScoresRef = useRef(false);

  const handlePenaltyDone = useCallback(() => {
    setPenaltyPayload(null);
    setPenaltyFlyingId(null);
  }, []);

  useEffect(() => {
    if (!room) return;
    if (room.gameStatus === "waiting") router.replace(`/lobby/${room.id}`);
    else if (room.gameStatus === "setting_words") router.replace(`/setup/${room.id}`);
    else if (room.gameStatus === "finished") router.replace(`/results/${room.id}`);
  }, [room, router]);

  useEffect(() => {
    if (!room || room.gameStatus !== "playing") return;
    if (!initializedScoresRef.current) {
      for (const p of room.players) prevScoresRef.current[p.id] = p.score;
      initializedScoresRef.current = true;
      return;
    }
    for (const p of room.players) {
      const prev = prevScoresRef.current[p.id] ?? p.score;
      if (p.score < prev) {
        const d = p.score - prev;
        setScoreDeltaByPlayer((m) => ({ ...m, [p.id]: d }));
        window.setTimeout(() => {
          setScoreDeltaByPlayer((m) => ({ ...m, [p.id]: null }));
        }, 900);
      }
      prevScoresRef.current[p.id] = p.score;
    }
  }, [room, room?.players]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      const now = Date.now();
      setBubbles((b) => {
        const next = { ...b };
        let changed = false;
        for (const k of Object.keys(next)) {
          if (next[k]!.until <= now) {
            delete next[k];
            changed = true;
          }
        }
        return changed ? next : b;
      });
    }, 400);
    return () => window.clearInterval(tick);
  }, []);

  function measurePenaltyRects(pid: string): { from: { x: number; y: number }; to: { x: number; y: number } } | null {
    const stage = stageRef.current;
    const slot = slotRefs.current[pid];
    const dive = diveBoardRef.current;
    if (!stage || !slot || !dive) return null;
    const sr = stage.getBoundingClientRect();
    const a = slot.getBoundingClientRect();
    const b = dive.getBoundingClientRect();
    return {
      from: { x: a.left - sr.left + a.width / 2, y: a.top - sr.top + a.height / 2 },
      to: { x: b.left - sr.left + b.width / 2, y: b.top - sr.top + b.height / 2 },
    };
  }

  function runPenalty(pid: string, nickname: string, reason: "forbidden" | "inactive") {
    const r = roomRef.current;
    if (!r) return;
    const p = r.players.find((x) => x.id === pid);
    const characterId = (p?.character ?? "bear") as CharacterId;

    setShakingPlayerId(pid);
    window.setTimeout(() => setShakingPlayerId(null), 320);

    const coords = measurePenaltyRects(pid);
    if (coords) {
      setPenaltyFlyingId(pid);
      setPenaltyPayload({
        key: Date.now(),
        characterId,
        from: coords.from,
        to: coords.to,
      });
    }

    const msg =
      reason === "forbidden"
        ? `[${nickname}] 금지어! 플라잉 체어로 출발~`
        : `[${nickname}] 1분 침묵! 플라잉 체어로~`;
    setToasts((t) => [...t.slice(-5), msg]);
  }

  useEffect(() => {
    const socket = getSocket();

    const onChat = (payload: { entry: ChatEntry }) => {
      const { entry } = payload;
      setBubbles((b) => ({
        ...b,
        [entry.playerId]: {
          text: entry.text,
          forbiddenMatch: entry.forbiddenMatch,
          until: Date.now() + 3000,
        },
      }));
      setLastSpeakerId(entry.playerId);
      if (speakerTimerRef.current) clearTimeout(speakerTimerRef.current);
      speakerTimerRef.current = setTimeout(() => setLastSpeakerId(null), 3200);
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
      if (speakerTimerRef.current) clearTimeout(speakerTimerRef.current);
    };
  }, []);

  if (!room || !playerId || !room.currentTopic) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-cyan-200 via-teal-100 to-amber-100 text-lg font-black text-teal-900">
        풀장 입장 중…
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-[#a5f3fc] via-[#ccfbf1] to-[#fef9c3] pb-28">
      <TopicHeader topic={room.currentTopic} seconds={room.remainingSeconds} roundLabel="ROUND 1" />

      <div ref={stageRef} className="relative flex min-h-0 flex-1 flex-col gap-3 px-2 py-3 md:flex-row md:px-4">
        <section className="flex shrink-0 gap-2 overflow-x-auto pb-1 md:w-[148px] md:flex-col md:overflow-y-auto md:overflow-x-visible md:pr-1">
          {room.players.map((p, i) => (
            <PlayerSlot
              key={p.id}
              ref={(el) => {
                slotRefs.current[p.id] = el;
              }}
              player={p}
              slotIndex={i}
              isMe={p.id === playerId}
              isRecentSpeaker={lastSpeakerId === p.id}
              isHiddenForPenalty={penaltyFlyingId === p.id && penaltyPayload !== null}
              shake={shakingPlayerId === p.id}
              bubble={bubbles[p.id] ? { text: bubbles[p.id]!.text, forbiddenMatch: bubbles[p.id]!.forbiddenMatch } : null}
              scoreDelta={scoreDeltaByPlayer[p.id] ?? null}
            />
          ))}
        </section>

        <section className="relative min-h-[280px] flex-1 md:min-h-[380px]">
          <PoolBackground ref={diveBoardRef} className="h-full w-full">
            <DiveAnimation payload={penaltyPayload} onDone={handlePenaltyDone} />
          </PoolBackground>
        </section>

        <aside className="flex w-full shrink-0 flex-col gap-2 md:w-56">
          <RankingBoard players={room.players} myId={playerId} />
          <div className="rounded-3xl border-4 border-white/80 bg-white/75 p-3 shadow-bubble">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-rose-500">파티 로그</p>
            <ul className="max-h-28 space-y-1 overflow-y-auto text-[11px] font-semibold text-slate-600">
              {toasts.length === 0 ? <li className="text-slate-400">조용한 풀…</li> : null}
              {toasts.map((t, i) => (
                <li key={`${i}-${t}`} className="rounded-lg bg-rose-50/90 px-2 py-1 text-rose-800">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl border-4 border-white bg-white/80 py-2 text-sm font-black text-slate-600 shadow-md"
            onClick={() => {
              getSocket().emit("leave_room");
              clearSession();
              router.push("/");
            }}
          >
            나가기
          </motion.button>
        </aside>
      </div>

      <GameChatDock
        onSend={(text) => {
          getSocket().emit("send_chat", { roomId: room.id, playerId, message: text });
        }}
      />
    </div>
  );
}

