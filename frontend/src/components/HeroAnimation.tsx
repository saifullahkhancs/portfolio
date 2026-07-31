import { useEffect, useMemo, useState } from "react";

/**
 * Hero "extraction machine":
 *  1. two side wires carry word-packets INTO a single computer icon
 *     (plus a couple of packets drop into it from above)
 *  2. the computer sits directly above the description box and is
 *     wired up to the title / name rows and down to the description box
 *  3. as packets pass through, the computer "extracts" the text:
 *     title types out -> name types out -> description appears word by word
 * The final text stays exactly where it was (title + name + desc on the left,
 * profile card on the right) — only the reveal is animated.
 */

const LEFT_PACKETS = ["Python", "FastAPI", "Flask", "Django"];
const RIGHT_PACKETS = ["React", ".NET", "Kafka", "SQL"];
const TOP_PACKETS = ["Docker", "JWT"];

type Phase = "boot" | "title" | "name" | "desc" | "done";

function Caret({ big = false }: { big?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`ml-1 inline-block animate-[caret-blink_0.85s_steps(1)_infinite] rounded-[2px] bg-primary align-middle ${
        big ? "h-[0.85em] w-[0.45em]" : "h-[1em] w-[0.5em]"
      }`}
    />
  );
}

const packetClass =
  "packet absolute whitespace-nowrap rounded border border-primary/30 bg-background/95 px-1.5 py-0.5 font-mono text-[9px] text-primary shadow";

export default function HeroAnimation({ name, title, desc }: { name: string; title: string; desc: string }) {
  const [phase, setPhase] = useState<Phase>("boot");
  const [titleChars, setTitleChars] = useState(0);
  const [nameChars, setNameChars] = useState(0);
  const [descWords, setDescWords] = useState(0);

  const words = useMemo(() => desc.split(" ").filter(Boolean), [desc]);
  const firstSpace = name.indexOf(" ");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTitleChars(title.length);
      setNameChars(name.length);
      setDescWords(words.length);
      setPhase("done");
      return;
    }

    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    // staged typewriter: boot -> title -> name -> description -> done
    let t = 950; // let the wires + computer fade in first
    at(t, () => setPhase("title"));
    title.split("").forEach((_, i) => at(t + 60 + i * 26, () => setTitleChars(i + 1)));
    t += 60 + title.length * 26 + 240;

    at(t, () => setPhase("name"));
    name.split("").forEach((_, i) => at(t + 60 + i * 55, () => setNameChars(i + 1)));
    t += 60 + name.length * 55 + 260;

    at(t, () => setPhase("desc"));
    words.forEach((_, i) => at(t + 80 + i * 30, () => setDescWords(i + 1)));
    t += 80 + words.length * 30 + 120;

    at(t, () => setPhase("done"));
    return () => timers.forEach(clearTimeout);
  }, [name, title, words]);

  const started = phase !== "boot";
  const typedFirst = name.slice(0, firstSpace === -1 ? nameChars : Math.min(nameChars, firstSpace));
  const typedLast = firstSpace === -1 ? "" : name.slice(firstSpace + 1, Math.max(firstSpace + 1, nameChars));
  const showSpace = firstSpace !== -1 && nameChars > firstSpace;

  return (
    <div className="hero-machine relative">
      {/* ============ output #1 — title, fed from the machine ============ */}
      <div className="flex min-h-[20px] items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.28em] text-primary">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full bg-primary transition-opacity ${
            phase === "title" ? "opacity-100 animate-[node-glow_0.9s_ease-in-out_infinite]" : started ? "opacity-70" : "opacity-0"
          }`}
        />
        <span>{title.slice(0, titleChars)}</span>
        {phase === "title" && <Caret />}
      </div>

      {/* ============ output #2 — name (single font for both parts) ============ */}
      <h1 className="mt-3 min-h-[5.6rem] font-mono text-4xl font-bold leading-[1.15] sm:min-h-[3.9rem] sm:text-5xl">
        <span className="text-gradient">{typedFirst}</span>
        {showSpace && " "}
        <span className="text-gradient">{typedLast}</span>
        {phase === "name" && <Caret big />}
      </h1>

      {/* ============ the machine: wires + packets + computer ============ */}
      <div className="relative mt-7 h-[108px] animate-fade-up" aria-hidden="true">
        {/* side wires (strips) feeding the computer */}
        <div className="absolute left-0 right-[calc(50%+32px)] top-[46px] h-px bg-gradient-to-r from-transparent via-primary/30 to-primary/60" />
        <div className="absolute left-[calc(50%+32px)] right-0 top-[46px] h-px bg-gradient-to-l from-transparent via-primary/30 to-primary/60" />

        {/* packets travelling the left wire, into the computer */}
        <div className="absolute left-0 right-[calc(50%+36px)] top-[46px]">
          {LEFT_PACKETS.map((w, i) => (
            <span
              key={w}
              className={`${packetClass} animate-[packet-travel_4s_linear_infinite]`}
              style={{ animationDuration: `${(4.2 + i * 0.8).toFixed(1)}s`, animationDelay: `${(i * 1.35).toFixed(1)}s` }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* packets travelling the right wire, into the computer */}
        <div className="absolute left-[calc(50%+36px)] right-0 top-[46px]">
          {RIGHT_PACKETS.map((w, i) => (
            <span
              key={w}
              className={`${packetClass} animate-[packet-travel_4s_linear_infinite]`}
              style={{
                animationDuration: `${(4.6 + i * 0.7).toFixed(1)}s`,
                animationDelay: `${(0.7 + i * 1.25).toFixed(1)}s`,
                animationDirection: "reverse",
              }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* packets dropping in from above the computer */}
        <div className="absolute left-1/2 top-[-6px] h-[34px] w-40 -translate-x-1/2">
          {TOP_PACKETS.map((w, i) => (
            <span
              key={w}
              className={`${packetClass} animate-[packet-drop_3.2s_ease-in_infinite]`}
              style={{ left: i === 0 ? "32%" : "68%", animationDuration: `${(3.4 + i).toFixed(1)}s`, animationDelay: `${(1.1 + i * 1.7).toFixed(1)}s` }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* the computer — single icon, everything connects here */}
        <div className="absolute left-1/2 top-[28px] z-10 -translate-x-1/2">
          {/* wire going UP to title / name with a pulse travelling up */}
          <div className="absolute bottom-full left-1/2 h-[28px] w-px -translate-x-1/2 overflow-visible bg-gradient-to-b from-transparent to-primary/50">
            <span className="pulse-dot absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary animate-[wire-pulse-up_1.8s_linear_infinite]" />
          </div>

          <div
            className={`relative h-9 w-[60px] rounded-md border-2 bg-[#0a101f] shadow-[0_10px_24px_-8px_rgba(0,0,0,0.8)] transition-colors duration-500 ${
              started ? "border-primary/80" : "border-zinc-500"
            }`}
          >
            {/* screen */}
            <div className="absolute inset-[3px] overflow-hidden rounded-[3px] bg-[#0c1526]">
              {started && (
                <>
                  <div className="absolute left-1.5 top-1 space-y-[3px]">
                    <span className="block h-[3px] w-8 rounded-full bg-primary/60" />
                    <span className="block h-[3px] w-5 rounded-full bg-accent/50" />
                    <span className="block h-[3px] w-7 rounded-full bg-primary/40" />
                  </div>
                  {/* scanning bar while extracting */}
                  <span className="absolute top-0 h-full w-[3px] bg-primary/30 animate-[screen-scan_1.6s_ease-in-out_infinite]" />
                </>
              )}
            </div>
          </div>
          {/* stand + base */}
          <div className="mx-auto h-1.5 w-7 bg-zinc-500" />
          <div className="mx-auto h-1 w-11 rounded-full bg-zinc-600" />

          {/* wire going DOWN into the description box */}
          <div className="absolute left-1/2 top-full h-[30px] w-px -translate-x-1/2 overflow-visible bg-gradient-to-b from-primary/70 to-primary/25">
            <span className="pulse-dot absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary animate-[wire-pulse-down_1.6s_linear_infinite]" />
          </div>
        </div>
      </div>

      {/* ============ output #3 — description terminal box ============ */}
      <div className="relative min-h-[336px] overflow-hidden rounded-xl border border-border bg-surface/70 shadow-inner">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">extracted_output.txt</span>
          <span className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-zinc-600" />
            <span className={`h-2 w-2 rounded-full ${started ? "bg-primary/70" : "bg-zinc-600"} transition-colors`} />
            <span className={`h-2 w-2 rounded-full ${phase === "done" ? "bg-primary" : "bg-zinc-600"} transition-colors`} />
          </span>
        </div>
        <p className="p-4 text-sm leading-relaxed text-muted-foreground">
          {words.slice(0, descWords).join(" ")}
          {phase === "desc" && <Caret />}
        </p>
        {/* scanning shimmer while the description is being extracted */}
        {phase === "desc" && (
          <div className="pointer-events-none absolute left-0 right-0 h-12 bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-[scan-sweep_1.15s_linear_infinite]" />
        )}
      </div>
    </div>
  );
}
