import type { ReactNode } from "react";
import { MAP_H, MAP_W } from "@/lib/constants";
import { cn } from "@/lib/cn";

type PoolMapProps = {
  children?: ReactNode;
  className?: string;
};

export function PoolMap({ children, className }: PoolMapProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2rem] border-4 border-white shadow-soft ring-4 ring-sky-100",
        className,
      )}
      style={{ width: MAP_W, height: MAP_H }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 100%, #22d3ee 0%, #38bdf8 35%, #7dd3fc 70%, #e0f2fe 100%)",
        }}
      />
      <div className="pointer-events-none absolute -left-10 top-6 h-24 w-[140%] rotate-[-6deg] bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-20 w-40 rounded-full bg-cyan-200/35 blur-xl" />
      <div className="absolute left-0 top-0 h-16 w-full border-b-4 border-amber-200/80 bg-gradient-to-b from-amber-100 to-amber-50/90" />
      <div className="absolute left-4 top-3 flex gap-2">
        <div className="h-8 w-14 rounded-full bg-white/80 shadow-inner ring-2 ring-amber-100" />
        <div className="h-8 w-20 rounded-2xl bg-gradient-to-r from-pink-200 to-rose-200 shadow-inner ring-2 ring-white" />
      </div>
      <div className="absolute right-6 top-2 flex flex-col items-center gap-1">
        <div className="h-3 w-24 rounded-full bg-slate-300 shadow-md ring-2 ring-white" />
        <div className="h-10 w-2 rounded-full bg-slate-400" />
        <div className="text-[10px] font-bold text-slate-600">DIVE</div>
      </div>
      <svg className="pointer-events-none absolute inset-0 opacity-25" width={MAP_W} height={MAP_H}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div className="pointer-events-none absolute bottom-4 right-4 flex rotate-6 flex-col items-center opacity-90">
        <div className="h-2 w-16 rounded-full bg-orange-400 shadow" />
        <div className="-mt-1 h-8 w-10 rounded-lg bg-orange-300 shadow-inner ring-2 ring-white" />
        <span className="mt-1 text-[9px] font-bold text-orange-900/80">chair</span>
      </div>
      {children}
    </div>
  );
}
