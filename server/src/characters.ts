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

export function normalizeCharacterId(raw: unknown): CharacterId {
  const s = String(raw ?? "bear").toLowerCase();
  return (CHARACTER_IDS as readonly string[]).includes(s) ? (s as CharacterId) : "bear";
}
