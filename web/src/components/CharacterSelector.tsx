"use client";

import { CHARACTERS, type CharacterId } from "@/lib/characters";
import { CharacterCard } from "@/components/CharacterCard";

type CharacterSelectorProps = {
  value: CharacterId;
  onChange: (id: CharacterId) => void;
};

export function CharacterSelector({ value, onChange }: CharacterSelectorProps) {
  return (
    <div className="w-full">
      <p className="mb-2 text-center text-xs font-black uppercase tracking-widest text-[#0d9488]">
        캐릭터 선택
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 [scrollbar-width:thin] snap-x snap-mandatory px-1">
        {CHARACTERS.map((c) => (
          <CharacterCard
            key={c.id}
            id={c.id}
            label={c.label}
            selected={value === c.id}
            onSelect={() => onChange(c.id)}
          />
        ))}
      </div>
    </div>
  );
}
