export default function PacketFlow({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 flex items-center gap-6 px-4 opacity-60">
        {["API", "JWT", "Kafka", "GraphQL", "Redis", "FastAPI", "Flask", "React"].map((w, i) => (
          <span
            key={w}
            className="inline-block whitespace-nowrap rounded-md bg-secondary px-3 py-1 font-mono text-[10px] text-foreground shadow animate-msg-flow"
            style={{ animationDelay: `${i * 0.4}s`, animationDuration: `${2 + i * 0.4}s` }}
          >
            {w}
          </span>
        ))}
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface p-3 shadow-md">
        <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Terminal</p>
        <p className="mt-1 font-mono text-xs text-foreground">extract → display</p>
      </div>
    </div>
  );
}
