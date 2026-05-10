import Image from "next/image";
import { characterSrc, type CharacterId } from "@/lib/characters";
import { cn } from "@/lib/cn";

type CharacterSpriteProps = {
  id: CharacterId;
  size: number;
  className?: string;
  priority?: boolean;
};

export function CharacterSprite({ id, size, className, priority }: CharacterSpriteProps) {
  return (
    <Image
      src={characterSrc(id)}
      alt=""
      width={size}
      height={size}
      className={cn("pointer-events-none select-none object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]", className)}
      priority={priority}
      unoptimized
    />
  );
}
