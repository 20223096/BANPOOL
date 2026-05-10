type TopicBannerProps = { topic: string };

export function TopicBanner({ topic }: TopicBannerProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700/80">오늘의 주제</p>
      <div className="rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300 px-10 py-2 text-lg font-black text-white shadow-lg ring-4 ring-white/70">
        {topic}
      </div>
    </div>
  );
}
