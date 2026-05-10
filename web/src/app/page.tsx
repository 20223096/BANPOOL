"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { CharacterSelector } from "@/components/CharacterSelector";
import { emitWithAck, getSocketUrl, getSocket, waitForSocketConnection } from "@/lib/socket";
import { saveSession } from "@/lib/session";
import type { CharacterId } from "@/lib/characters";

export default function LandingPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [character, setCharacter] = useState<CharacterId>("bear");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function goLobby(roomId: string) {
    router.push(`/lobby/${roomId}`);
  }

  async function handleCreate() {
    const nick = nickname.trim();
    if (!nick) {
      setError("닉네임을 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    const socket = getSocket();
    const { ok: connected, detail } = await waitForSocketConnection();
    if (!connected) {
      setBusy(false);
      setError(
        "게임 서버에 연결되지 않았어요. (시도 주소: " +
          getSocketUrl() +
          ")" +
          (detail ? ` 상세: ${detail}` : "") +
          " · Railway의 CLIENT_ORIGIN에 지금 접속 중인 Vercel 주소(https 포함, 끝 / 없음)를 넣고 재배포했는지 확인하세요.",
      );
      return;
    }
    const res = await emitWithAck<unknown>(socket, "create_room", { nickname: nick, character });
    setBusy(false);
    const r = res as { ok?: boolean; roomId?: string; playerId?: string } | undefined;
    if (r?.ok && r.roomId && r.playerId) {
      saveSession(r.roomId, r.playerId, nick, character);
      goLobby(r.roomId);
    } else {
      setError(
        r
          ? "방 만들기에 실패했어요. 다시 시도해 주세요."
          : "서버 응답이 없어요. 백엔드가 켜져 있는지·주소가 맞는지 확인하세요.",
      );
    }
  }

  async function handleJoin() {
    const nick = nickname.trim();
    const code = joinCode.trim().toUpperCase();
    if (!nick || !code) {
      setError("닉네임과 방 코드를 모두 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    const socket = getSocket();
    const { ok: connected, detail } = await waitForSocketConnection();
    if (!connected) {
      setBusy(false);
      setError(
        "게임 서버에 연결되지 않았어요. (시도: " + getSocketUrl() + ")" + (detail ? ` 상세: ${detail}` : ""),
      );
      return;
    }
    const res = await emitWithAck<unknown>(socket, "join_room", { roomId: code, nickname: nick, character });
    setBusy(false);
    const r = res as { ok?: boolean; roomId?: string; playerId?: string; reason?: string } | undefined;
    if (r?.ok && r.roomId && r.playerId) {
      saveSession(r.roomId, r.playerId, nick, character);
      goLobby(r.roomId);
    } else {
      setError(r?.reason || "입장에 실패했어요. 서버 응답이 없으면 백엔드를 확인하세요.");
    }
  }

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 overflow-hidden px-4 py-8 md:gap-12 md:py-12">
      <div className="pointer-events-none absolute -left-20 top-10 text-8xl opacity-30">🌴</div>
      <div className="pointer-events-none absolute -right-16 bottom-32 text-7xl opacity-25">🛟</div>

      <motion.header
        className="relative text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <p className="text-xs font-black uppercase tracking-[0.4em] text-teal-700/90">Pool Party Live</p>
        <h1 className="mt-2 bg-gradient-to-r from-[#0d9488] via-[#06b6d4] to-[#eab308] bg-clip-text text-5xl font-black text-transparent drop-shadow-sm md:text-6xl">
          BANPOOL
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base font-bold text-slate-800 md:text-lg">
          귀여운 캐릭터로 수영장 파티! <span className="text-rose-500">금지어</span>와{" "}
          <span className="text-amber-600">1분 침묵</span>만 피하면 돼요.
        </p>
      </motion.header>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section
          className="rounded-[2rem] border-4 border-white/90 bg-gradient-to-br from-white/90 to-cyan-50/90 p-6 shadow-[0_12px_40px_rgba(6,182,212,0.2)] backdrop-blur"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-lg font-black text-slate-800">파티 가이드</h2>
          <ol className="mt-4 space-y-2.5 text-sm font-semibold text-slate-600">
            <li className="flex gap-2">
              <span className="font-black text-teal-500">1</span> 방 만들고 코드 공유
            </li>
            <li className="flex gap-2">
              <span className="font-black text-teal-500">2</span> 서로 금지어 몰래 지정
            </li>
            <li className="flex gap-2">
              <span className="font-black text-teal-500">3</span> 밸런스 주제로 수다 (순서 없음!)
            </li>
            <li className="flex gap-2">
              <span className="font-black text-rose-500">!</span> 금지어 / 1분 무응답 → 다이빙대 DIVE · -10점
            </li>
          </ol>
        </motion.section>

        <motion.section
          className="rounded-[2rem] border-4 border-[#fef08a]/80 bg-gradient-to-b from-white/95 to-amber-50/90 p-6 shadow-[0_12px_40px_rgba(234,179,8,0.15)]"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <label className="block text-sm font-black text-slate-700">닉네임</label>
          <input
            className="mt-1 w-full rounded-2xl border-4 border-teal-100 bg-white px-4 py-3 text-lg font-bold text-slate-800 outline-none ring-teal-200 focus:border-teal-300 focus:ring-4"
            placeholder="예: 민트고래"
            value={nickname}
            maxLength={16}
            onChange={(e) => setNickname(e.target.value)}
          />

          <div className="mt-5">
            <CharacterSelector value={character} onChange={setCharacter} />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <motion.button
              type="button"
              disabled={busy}
              whileHover={{ scale: busy ? 1 : 1.02 }}
              whileTap={{ scale: busy ? 1 : 0.98 }}
              onClick={handleCreate}
              className="rounded-2xl bg-gradient-to-r from-[#2dd4bf] to-[#0ea5e9] py-3.5 text-lg font-black text-white shadow-lg disabled:opacity-50"
            >
              방 만들기
            </motion.button>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-2xl border-4 border-white bg-white/95 px-3 py-2 font-mono font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-amber-200"
                placeholder="방코드"
                value={joinCode}
                maxLength={6}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
              <motion.button
                type="button"
                disabled={busy}
                whileHover={{ scale: busy ? 1 : 1.04 }}
                whileTap={{ scale: busy ? 1 : 0.96 }}
                onClick={handleJoin}
                className="rounded-2xl bg-gradient-to-r from-[#fb7185] to-[#f472b6] px-5 py-2 font-black text-white shadow-lg disabled:opacity-50"
              >
                입장
              </motion.button>
            </div>
          </div>
          {error ? <p className="mt-3 text-center text-sm font-bold text-rose-600">{error}</p> : null}
        </motion.section>
      </div>

      <footer className="text-center text-xs font-medium text-teal-800/70">
        <Link href="https://nextjs.org" className="underline">
          Next.js
        </Link>{" "}
        + Socket.IO · Framer Motion
      </footer>
    </main>
  );
}
