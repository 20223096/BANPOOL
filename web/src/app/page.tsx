"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { emitWithAck, getSocketUrl, getSocket, waitForSocketConnection } from "@/lib/socket";
import { saveSession } from "@/lib/session";

export default function LandingPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [joinCode, setJoinCode] = useState("");
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
    const res = await emitWithAck<unknown>(socket, "create_room", { nickname: nick });
    setBusy(false);
    const r = res as { ok?: boolean; roomId?: string; playerId?: string } | undefined;
    if (r?.ok && r.roomId && r.playerId) {
      saveSession(r.roomId, r.playerId, nick);
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
    const res = await emitWithAck<unknown>(socket, "join_room", { roomId: code, nickname: nick });
    setBusy(false);
    const r = res as { ok?: boolean; roomId?: string; playerId?: string; reason?: string } | undefined;
    if (r?.ok && r.roomId && r.playerId) {
      saveSession(r.roomId, r.playerId, nick);
      goLobby(r.roomId);
    } else {
      setError(r?.reason || "입장에 실패했어요. 서버 응답이 없으면 백엔드를 확인하세요.");
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-10 px-4 py-10">
      <header className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-sky-700/80">Realtime Party</p>
        <h1 className="mt-2 text-5xl font-black text-slate-900 drop-shadow-sm">BANPOOL</h1>
        <p className="mx-auto mt-3 max-w-xl text-lg font-semibold text-slate-700">
          수영장 파티 맵에서 아바타로 돌아다니며 수다를 떨되,{" "}
          <span className="text-rose-500">금지어</span>와 <span className="text-amber-600">침묵</span>만은
          피하세요!
        </p>
      </header>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[2rem] border-4 border-white bg-white/80 p-6 shadow-soft backdrop-blur">
          <h2 className="text-lg font-black text-slate-800">이렇게 즐겨요</h2>
          <ol className="mt-3 space-y-2 text-sm font-medium text-slate-600">
            <li>1. 방을 만들고 코드를 친구에게 공유</li>
            <li>2. 서로의 금지어를 몰래 지정</li>
            <li>3. 주제에 맞춰 채팅하며 맵을 돌아다니기</li>
            <li>4. 금지어 또는 1분 침묵 → 플라잉체어 벌칙 · -10점</li>
            <li>5. 5분 뒤 최고 점수가 승리!</li>
          </ol>
        </div>
        <div className="rounded-[2rem] border-4 border-white bg-gradient-to-br from-sky-50 to-cyan-50 p-6 shadow-soft">
          <label className="block text-sm font-bold text-slate-700">닉네임</label>
          <input
            className="mt-1 w-full rounded-2xl border-2 border-sky-100 bg-white px-4 py-3 text-lg font-semibold outline-none ring-sky-200 focus:border-sky-300 focus:ring-2"
            placeholder="예: 민트고래"
            value={nickname}
            maxLength={16}
            onChange={(e) => setNickname(e.target.value)}
          />
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={handleCreate}
              className="rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-400 py-3 text-lg font-black text-white shadow-lg transition hover:brightness-105 disabled:opacity-50"
            >
              방 만들기
            </button>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-2xl border-2 border-white bg-white/90 px-3 py-2 font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="방 코드"
                value={joinCode}
                maxLength={6}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
              <button
                type="button"
                disabled={busy}
                onClick={handleJoin}
                className="rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 px-4 py-2 font-black text-white shadow-md hover:brightness-105 disabled:opacity-50"
              >
                입장
              </button>
            </div>
          </div>
          {error ? <p className="mt-3 text-center text-sm font-bold text-rose-500">{error}</p> : null}
          <p className="mt-4 text-center text-xs text-slate-500">
            로컬 테스트: 브라우저 탭을 여러 개 열어 각각 다른 닉네임으로 입장해 보세요.
          </p>
        </div>
      </section>
      <footer className="text-center text-xs text-slate-500">
        <Link href="https://nextjs.org" className="underline">
          Next.js
        </Link>{" "}
        + Socket.IO
      </footer>
    </main>
  );
}
