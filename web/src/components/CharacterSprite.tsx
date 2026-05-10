import { getCharacterImageSrc } from "@/lib/characterImageMap";
import { coerceCharacterId, type CharacterId } from "@/lib/characters";
import { cn } from "@/lib/cn";

type CharacterSpriteProps = {
  id: CharacterId | string | null | undefined;
  size: number;
  className?: string;
  priority?: boolean;
};

/** 이미지는 `src/assets/characters`에서 번들 — 로비/게임에서 URL이 깨지지 않음 */
export function CharacterSprite({ id, size, className, priority }: CharacterSpriteProps) {
  const resolved = coerceCharacterId(id);
  const src = getCharacterImageSrc(resolved);
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={cn(
        "pointer-events-none select-none object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]",
        className,
      )}
    />
  );
}
