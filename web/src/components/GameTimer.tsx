type GameTimerProps = { seconds: number };

export function GameTimer({ seconds }: GameTimerProps) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const urgent = seconds <= 30;
  return (
    <div
      className={`rounded-2xl border-2 px-4 py-2 text-sm font-black shadow-md ${
        urgent
          ? "border-rose-400 bg-rose-50 text-rose-600"
          : "border-sky-200 bg-white/90 text-sky-700"
      }`}
    >
      ⏱ {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </div>
  );
}
