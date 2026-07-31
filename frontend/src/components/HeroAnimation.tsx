import { useEffect, useState } from "react";

export default function HeroAnimation({ name, title, desc }: { name: string; title: string; desc: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative">
      {/* Packets falling from top into computer */}
      <div className="relative h-14 overflow-hidden">
        <div className="absolute left-[15%] top-0 z-10 flex flex-col gap-1">
          {["API", ".NET", "React", "Python"].map((w, i) => (
            <span
              key={w}
              className="inline-block rounded border border-zinc-600 bg-zinc-800 px-2 py-0.5 font-mono text-[9px] text-cyan-300 shadow animate-[packetFall_2s_ease-in_infinite]"
              style={{ animationDelay: `${i * 0.35}s`, animationDuration: "2.5s" }}
            >
              {w}
            </span>
          ))}
        </div>
        {/* Computer icon */}
        <div className="absolute left-[35%] top-4 z-20 flex flex-col items-center">
          <div className="h-6 w-10 rounded-t-md border-2 border-zinc-400 bg-slate-900 shadow-md relative">
            <span className="absolute left-1/2 top-1 -translate-x-1/2 text-[7px] text-cyan-300 font-mono">comp</span>
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-3 bg-cyan-500 rounded-full animate-pulse" />
          </div>
          <div className="h-1 w-7 rounded-b-md bg-zinc-400" />
        </div>
      </div>

      {/* Title + Name connected from computer */}
      <div className="relative flex items-center gap-3 mt-1">
        <div className="h-0.5 w-6 bg-zinc-500 rounded-full" />
        <div className="font-mono text-xs text-primary">{title}</div>
      </div>
      <h1 className="mt-1 font-mono text-4xl font-bold leading-tight sm:text-5xl">
        <span className="text-foreground">{name.split(" ")[0]} </span>
        <span className="text-gradient">{name.split(" ").slice(1).join(" ")}</span>
      </h1>

      {/* Connection line to description */}
      <div className="relative mt-4 flex items-start gap-4">
        <div className="flex flex-col items-center">
          <div className="h-4 w-0.5 bg-gradient-to-b from-zinc-400 to-zinc-600 rounded-full" />
          <div className="h-0.5 w-4 bg-zinc-500 rounded-full" />
        </div>
        <div className="flex-1 rounded-xl border border-border bg-surface/60 p-4 shadow-inner min-h-[80px]">
          <p className={`text-sm leading-relaxed text-muted-foreground transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
            {desc}
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes packetFall {
          0% { transform: translateY(-30px); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(60px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
