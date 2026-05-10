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
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

/**
 * 소켓이 붙을 때까지 기다립니다.
 * 배포에서 env 누락·백엔드 다운 시 여기서 실패로 떨어집니다.
 */
export function waitForSocketConnection(timeoutMs = 12000): Promise<boolean> {
  const s = getSocket();
  if (s.connected) return Promise.resolve(true);
  return new Promise((resolve) => {
    const finish = (ok: boolean) => {
      clearTimeout(timer);
      s.off("connect", onConnect);
      s.off("connect_error", onErr);
      resolve(ok);
    };
    const onConnect = () => finish(true);
    const onErr = () => finish(false);
    const timer = setTimeout(() => finish(false), timeoutMs);
    s.once("connect", onConnect);
    s.once("connect_error", onErr);
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
