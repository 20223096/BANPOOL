import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

/** 브라우저에 박히는 소켓 서버 주소 — 배포 시 Vercel에 NEXT_PUBLIC_SOCKET_URL 필수 */
export function getSocketUrl(): string {
  return process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
}

export function getSocket(): Socket {
  if (!socket) {
    const url = getSocketUrl();
    socket = io(url, {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 25000,
    });
  }
  return socket;
}

export type WaitResult = { ok: boolean; detail?: string };

/**
 * 소켓 연결 대기. connect 이벤트를 놓치지 않도록 microtask에서 한 번 더 확인합니다.
 * 실패 시 마지막 connect_error 메시지를 detail로 넘깁니다 (원인 파악용).
 */
export function waitForSocketConnection(timeoutMs = 25000): Promise<WaitResult> {
  const s = getSocket();
  if (s.connected) return Promise.resolve({ ok: true });

  let lastError = "";
  const onErr = (e: Error) => {
    lastError = e?.message || String(e);
  };

  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      s.off("connect", onConnect);
      s.off("connect_error", onErr);
      resolve({ ok, detail: ok ? undefined : lastError || undefined });
    };

    const onConnect = () => finish(true);
    const timer = setTimeout(() => finish(false), timeoutMs);

    s.on("connect_error", onErr);
    s.on("connect", onConnect);

    queueMicrotask(() => {
      if (s.connected) finish(true);
    });

    if (!s.connected) {
      s.connect();
    }
  });
}

/** ack 콜백 기반 emit — 응답이 없으면 timeout 후 undefined */
export function emitWithAck<T>(
  socket: Socket,
  event: string,
  payload: object,
  timeoutMs = 10000,
): Promise<T | undefined> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(undefined), timeoutMs);
    socket.emit(event, payload, (res: T) => {
      clearTimeout(t);
      resolve(res);
    });
  });
}
