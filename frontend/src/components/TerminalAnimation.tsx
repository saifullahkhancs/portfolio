export default function TerminalAnimation({ onDone }: { onDone?: () => void }) {
  return (
    <div className="relative h-16 w-full overflow-hidden">
      {/* Computer icon */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 z-20 flex flex-col items-center">
        <div className="h-8 w-12 rounded-t-md border-2 border-zinc-300 bg-slate-800 shadow-lg relative">
          <div className="absolute inset-1 rounded-sm bg-gradient-to-b from-cyan-900/40 to-transparent" />
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 bg-cyan-400 rounded-full animate-pulse" />
        </div>
        <div className="h-1.5 w-8 rounded-b-md bg-zinc-400" />
      </div>
      {/* Falling packets */}
      <div className="absolute inset-0 flex items-start justify-center gap-3 pt-10">
        {["API", ".NET", "React", "Python"].map((w, i) => (
          <span
            key={w}
            className="inline-block rounded bg-zinc-800 border border-zinc-600 px-2 py-0.5 font-mono text-[9px] text-cyan-300 shadow animate-[packetFall_2s_ease-in_infinite]"
            style={{ animationDelay: `${i * 0.5}s` }}
          >
            {w}
          </span>
        ))}
      </div>
      <style jsx global>{`
        @keyframes packetFall {
          0% { transform: translateY(-20px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(40px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
