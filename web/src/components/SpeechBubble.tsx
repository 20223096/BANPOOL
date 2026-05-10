import { cn } from "@/lib/cn";

type SpeechBubbleProps = {
  text: string;
  forbiddenMatch?: string;
  className?: string;
};

export function SpeechBubble({ text, forbiddenMatch, className }: SpeechBubbleProps) {
  return (
    <div
      className={cn(
        "pointer-events-none max-w-[200px] rounded-2xl border-2 border-sky-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-bubble",
        className,
      )}
    >
      <HighlightedLine text={text} match={forbiddenMatch} />
    </div>
  );
}

function HighlightedLine({ text, match }: { text: string; match?: string }) {
  if (!match) return <span className="break-words">{text}</span>;
  const i = text.indexOf(match);
  if (i < 0) return <span className="break-words">{text}</span>;
  return (
    <span className="break-words">
      {text.slice(0, i)}
      <span className="font-extrabold text-red-500">{match}</span>
      {text.slice(i + match.length)}
    </span>
  );
}
