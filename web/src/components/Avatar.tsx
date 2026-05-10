import { cn } from "@/lib/cn";

type AvatarProps = {
  nickname: string;
  color: string;
  size?: "sm" | "md" | "lg";
  isMe?: boolean;
  className?: string;
};

export function Avatar({ nickname, color, size = "md", isMe, className }: AvatarProps) {
  const dim =
    size === "lg" ? "h-14 w-14 text-sm" : size === "sm" ? "h-9 w-9 text-[10px]" : "h-11 w-11 text-xs";
  return (
    <div className={cn("flex flex-col items-center gap-0.5", className)}>
      <div
        className={cn(
          "relative rounded-full border-[3px] border-white shadow-bubble ring-2 ring-white/70",
          dim,
        )}
        style={{ backgroundColor: color }}
      >
        <div className="absolute inset-1 rounded-full bg-white/25" />
        {isMe ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-amber-300 px-1.5 py-0.5 text-[9px] font-bold text-amber-950 shadow">
            ME
          </span>
        ) : null}
      </div>
      <span className="max-w-[88px] truncate rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow-sm">
        {nickname}
      </span>
    </div>
  );
}
