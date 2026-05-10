import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PenaltyAnimationProps = {
  active: boolean;
  phase?: "none" | "buzz" | "fly" | "splash";
  children: ReactNode;
};

export function PenaltyAnimation({ active, phase = "none", children }: PenaltyAnimationProps) {
  return (
    <div
      className={cn(
        "relative transition-transform will-change-transform",
        active && phase === "buzz" && "animate-[wiggle_0.35s_ease-in-out_infinite]",
        active && phase === "fly" && "animate-[banpool-fly_1.1s_ease-in_forwards]",
        active && phase === "splash" && "opacity-80",
      )}
    >
      {children}
      {active && phase === "buzz" ? (
        <div className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-rose-500 px-3 py-1 text-[11px] font-black text-white shadow-lg ring-2 ring-white">
          삐빅!
        </div>
      ) : null}
      {active && phase === "splash" ? (
        <div className="pointer-events-none absolute -bottom-10 left-1/2 z-20 -translate-x-1/2 text-lg font-black text-sky-600 drop-shadow animate-splash">
          풍덩!
        </div>
      ) : null}
    </div>
  );
}
