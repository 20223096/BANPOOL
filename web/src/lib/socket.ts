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
      /** websocket만 먼저 쓰면 일부 환경에서 첫 핸드셰이크가 실패했다가 connect_error만 나고 끊기는 경우가 있어 polling을 앞에 둡니다. */
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 800,
      timeout: 20000,
    });
  }
  return socket;
}

/**
 * 소켓이 붙을 때까지 기다립니다.
 * 주의: connect_error는 재시도 과정에서도 날 수 있어 "첫 에러"로 실패 판정하지 않습니다.
 * (이전 버전은 여기서 잘못 막혀 배포 환경에서 항상 실패하는 경우가 있었습니다.)
 */
export function waitForSocketConnection(timeoutMs = 20000): Promise<boolean> {
  const s = getSocket();
  if (s.connected) return Promise.resolve(true);
  return new Promise((resolve) => {
    const done = (ok: boolean) => {
      clearTimeout(timer);
      s.off("connect", onConnect);
      resolve(ok);
    };
    const onConnect = () => done(true);
    const timer = setTimeout(() => done(false), timeoutMs);
    s.once("connect", onConnect);
    if (!s.connected) s.connect();
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
