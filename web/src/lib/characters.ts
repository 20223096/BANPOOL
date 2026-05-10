export const CHARACTER_IDS = [
  "bear",
  "rabbit",
  "cat",
  "dog",
  "hamster",
  "fox",
  "penguin",
] as const;

export type CharacterId = (typeof CHARACTER_IDS)[number];

export const CHARACTERS: { id: CharacterId; label: string }[] = [
  { id: "bear", label: "곰" },
  { id: "rabbit", label: "토끼" },
  { id: "cat", label: "고양이" },
  { id: "dog", label: "강아지" },
  { id: "hamster", label: "햄스터" },
  { id: "fox", label: "여우" },
  { id: "penguin", label: "펭귄" },
];

export function characterSrc(id: CharacterId): string {
  return `/characters/${id}.png`;
}

export function isCharacterId(s: string): s is CharacterId {
  const t = s.trim().toLowerCase();
  return (CHARACTER_IDS as readonly string[]).includes(t);
}

/** 소켓/서버에서 온 값을 안전하게 캐릭터 id로 (대소문자·공백 허용) */
export function coerceCharacterId(raw: unknown): CharacterId {
  if (raw == null || raw === "") return "bear";
  const t = String(raw).trim().toLowerCase();
  if ((CHARACTER_IDS as readonly string[]).includes(t)) return t as CharacterId;
  return "bear";
}
