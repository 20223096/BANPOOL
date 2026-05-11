"use client";

import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type PoolBackgroundProps = {
  children?: ReactNode;
  className?: string;
};

export const PoolBackground = forwardRef<HTMLDivElement, PoolBackgroundProps>(function PoolBackground(
  { children, className },
  diveBoardRef,
) {
  return (
    <div
      className={cn(
        "relative h-full min-h-[280px] w-full overflow-hidden rounded-[2rem] border-4 border-white shadow-soft ring-4 ring-teal-100/80 md:min-h-[360px]",
        className,
      )}
    >
      {/* sky / water */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #a5f3fc 0%, #7dd3fc 18%, #5eead4 42%, #22d3ee 62%, #06b6d4 100%)",
        }}
      />
      {/* sparkles */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="animate-floaty absolute h-1 w-1 rounded-full bg-white shadow-[0_0_6px_2px_white]"
            style={{
              left: `${8 + (i * 7) % 86}%`,
              top: `${12 + ((i * 13) % 70)}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      {/* tiles */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[45%] opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* waves */}
      <svg className="pointer-events-none absolute bottom-[38%] left-0 w-full opacity-50" viewBox="0 0 1200 40" preserveAspectRatio="none">
        <path
          fill="rgba(255,255,255,0.35)"
          d="M0,20 Q300,0 600,20 T1200,20 L1200,40 L0,40 Z"
        />
      </svg>
      <svg className="pointer-events-none absolute bottom-[36%] left-0 w-full opacity-30" viewBox="0 0 1200 32" preserveAspectRatio="none">
        <path
          fill="rgba(255,255,255,0.2)"
          d="M0,16 Q400,32 800,16 T1200,16 L1200,32 L0,32 Z"
        />
      </svg>
      {/* palm */}
      <div className="pointer-events-none absolute left-3 top-10 text-5xl opacity-90 drop-shadow-md">🌴</div>
      <div className="pointer-events-none absolute left-8 top-24 text-3xl opacity-70">🌴</div>
      {/* sun */}
      <div className="pointer-events-none absolute right-8 top-6 h-14 w-14 rounded-full bg-gradient-to-br from-[#fef08a] to-[#fbbf24] shadow-[0_0_24px_rgba(250,204,21,0.7)] ring-4 ring-white/50" />
      {/* beach ball */}
      <div className="pointer-events-none absolute bottom-[28%] left-[18%] text-3xl drop-shadow">🏐</div>
      {/* tubes */}
      <div className="pointer-events-none absolute bottom-[22%] right-[28%] flex gap-2">
        <span className="text-3xl drop-shadow">🛟</span>
        <span className="text-2xl drop-shadow opacity-90">🛟</span>
      </div>
      {/* sunbed */}
      <div className="pointer-events-none absolute bottom-[20%] left-[8%] flex flex-col items-center">
        <div className="h-2 w-20 rounded-full bg-white/50" />
        <div className="-mt-1 flex h-8 w-24 items-center justify-center rounded-xl bg-gradient-to-r from-[#fecdd3] to-[#fda4af] shadow-md ring-2 ring-white/80">
          <span className="text-[10px] font-black text-rose-900/70">LOUNGE</span>
        </div>
      </div>
      {/* flying chair zone — bottom right (금지어 페널티 착석·발사 지점) */}
      <div className="pointer-events-none absolute bottom-2 right-4 flex flex-col items-center gap-0.5">
        <div ref={diveBoardRef} className="flex flex-col items-center">
          <div className="relative flex h-14 w-24 items-end justify-center">
            <div className="absolute bottom-8 left-1/2 h-3 w-20 -translate-x-1/2 rounded-full bg-violet-400/90 shadow-md ring-2 ring-white/90" />
            <div className="absolute bottom-[2.15rem] left-1/2 h-7 w-16 -translate-x-1/2 rounded-b-2xl rounded-t-lg bg-gradient-to-b from-sky-300 via-sky-200 to-cyan-200 shadow-lg ring-2 ring-white/90">
              <span className="absolute left-1 top-1 text-[10px] opacity-80">✦</span>
            </div>
            <div className="absolute bottom-6 left-2 h-5 w-2 rounded-full bg-white/70 blur-[1px]" />
            <div className="absolute bottom-6 right-2 h-5 w-2 rounded-full bg-white/70 blur-[1px]" />
            <div className="h-2 w-28 rounded-full bg-slate-400/90 shadow-md ring-2 ring-white" />
          </div>
          <div className="h-10 w-3 rounded-full bg-gradient-to-b from-slate-500 to-slate-600 shadow-lg ring-2 ring-white/80" />
          <div className="-mt-0.5 flex h-9 w-32 items-end justify-center rounded-t-2xl bg-gradient-to-r from-violet-200 via-fuchsia-100 to-violet-200 pb-1 shadow-lg ring-4 ring-white/70">
            <span className="text-[10px] font-black tracking-widest text-violet-900/85">FLY</span>
          </div>
        </div>
        <p className="text-[10px] font-bold text-white/90 drop-shadow">플라잉 체어</p>
      </div>
      {/* water shimmer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-cyan-500/20 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-30 min-h-0 overflow-hidden">{children}</div>
    </div>
  );
});
