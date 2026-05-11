import type { StaticImageData } from "next/image";
import type { CharacterId } from "./characters";
import { coerceCharacterId } from "./characters";
import bear from "@/assets/characters/bear.png";
import rabbit from "@/assets/characters/rabbit.png";
import cat from "@/assets/characters/cat.png";
import dog from "@/assets/characters/dog.png";
import hamster from "@/assets/characters/hamster.png";
import fox from "@/assets/characters/fox.png";
import penguin from "@/assets/characters/penguin.png";

const byId: Record<CharacterId, StaticImageData> = {
  bear,
  cat,
  dog,
  hamster,
  fox,
  penguin,
  rabbit,
};

/** 번들된 PNG — `public/` 미배포·경로 이슈와 무관하게 로비/게임에서 동일하게 표시 */
export function getCharacterImageSrc(rawId: unknown): string {
  const id = coerceCharacterId(rawId);
  return byId[id].src;
}
