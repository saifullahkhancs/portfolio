import { useEffect, useMemo, useState } from "react";

/**
 * Hero "extraction machine":
 *  1. two side wires carry word-packets INTO a single computer icon
 *  2. the computer sits directly above the description box and is
 *     wired up to the title / name rows and down to the description box
 *  3. as packets pass through, the computer "extracts" the text:
 *     title types out -> name types out -> description appears word by word
 * The final text stays exactly where it was (title + name + desc on the left,
 * profile card on the right) — only the reveal is animated.
 */

/**
 * Stop-words removed when extracting packet labels from free text so the
 * floating labels stay short and meaningful.
 */
const STOP_WORDS = new Set([
  "the","a","an","and","or","but","of","to","in","on","at","for","with","as","by",
  "is","are","was","were","be","been","being","it","its","this","that","from","into",
  "across","over","using","use","using","via","plus","about","also","than","then",
  "not","no","so","if","my","i","we","you","they","he","she","our","their","has","have",
]);

/**
 * Extract short, readable tokens from a free-text string (title or description).
 * Returns up to `max` unique words with the first letter capitalised.
 */
function extractWords(text: string, max: number): string[] {
  return (text || "")
    .split(/[^A-Za-z0-9+#.\-']+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w.toLowerCase()))
    .map((w) => (w[0].toUpperCase() + w.slice(1)).replace(/['"]$/, ""))
    .filter((w, i, arr) => arr.indexOf(w) === i)
    .slice(0, max);
}

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
  "packet absolute whitespace-nowrap rounded border border-primary/30 bg-background/95 px-1.5 py-0.5 font-mono text-[9px] text-primary shadow opacity-0";

export default function HeroAnimation({ name, title, desc }: { name: string; title: string; desc: string }) {
  // Defensive: ensure strings even if backend returns null/undefined
  const safeName = (name || "").trim() || "Saifullah Khan";
  const safeTitle = (title || "").trim() || "Software Engineer";
  const safeDesc = (desc || "").trim() || "Full Stack Developer building web applications, REST APIs, and data-driven systems.";

  const [phase, setPhase] = useState<Phase>("boot");
  const [titleChars, setTitleChars] = useState(0);
  const [nameChars, setNameChars] = useState(0);
  const [descWords, setDescWords] = useState(0);
  const [descVisible, setDescVisible] = useState(true);

  const words = useMemo(() => safeDesc.split(" ").filter(Boolean), [safeDesc]);
  const firstSpace = safeName.indexOf(" ");

  // Packets flowing toward the computer carry real info from the profile:
  // name tokens, title tokens, and keywords extracted from the description.
  const leftPackets = useMemo(() => {
    const nameWords = safeName.split(/\s+/).filter(Boolean);
    const titleWords = extractWords(safeTitle, 4);
    return [...nameWords, ...titleWords].filter((v, i, a) => a.indexOf(v) === i).slice(0, 6);
  }, [safeName, safeTitle]);

  const rightPackets = useMemo(() => {
    const descWords = extractWords(safeDesc, 8);
    return descWords.slice(0, 6);
  }, [safeDesc]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTitleChars(safeTitle.length);
      setNameChars(safeName.length);
      setDescWords(words.length);
      setPhase("done");
      return;
    }

    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    // Parallel typewriter animations: title, name, and description start together
    const tStart = 50; 
    at(tStart, () => setPhase("title"));

    // Speed up typing for parallel effect
    safeTitle.split("").forEach((_, i) => at(tStart + i * 50, () => setTitleChars(i + 1)));
    safeName.split("").forEach((_, i) => at(tStart + i * 60, () => setNameChars(i + 1)));
    words.forEach((_, i) => at(tStart + i * 100, () => setDescWords(i + 1)));

    const maxT = Math.max(safeTitle.length * 50, safeName.length * 60, words.length * 100);
    at(tStart + maxT + 200, () => setPhase("done"));
    return () => timers.forEach(clearTimeout);
  }, [safeName, safeTitle, words]);

  /* ---- Description fade cycle: every 20s the description fades out then back in ---- */
  useEffect(() => {
    if (phase !== "done") return;

    let fadeOutTimer: number;
    const interval = window.setInterval(() => {
      setDescVisible(false);
      fadeOutTimer = window.setTimeout(() => setDescVisible(true), 1500);
    }, 20000);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeOutTimer);
    };
  }, [phase]);

  const started = phase !== "boot";
  const typedFirst = safeName.slice(0, firstSpace === -1 ? nameChars : Math.min(nameChars, firstSpace));
  const typedLast = firstSpace === -1 ? "" : safeName.slice(firstSpace + 1, Math.max(firstSpace + 1, nameChars));
  const showSpace = firstSpace !== -1 && nameChars > firstSpace;

  // If animation hasn't started yet, show at least title + name instantly as fallback so page is never blank
  const displayTitle = started ? safeTitle.slice(0, titleChars) : safeTitle;
  const displayFirst = started ? typedFirst : safeName.slice(0, firstSpace === -1 ? safeName.length : firstSpace);
  const displayLast = started ? typedLast : firstSpace === -1 ? "" : safeName.slice(firstSpace + 1);
  const displayDesc = started ? words.slice(0, descWords).join(" ") : words.slice(0, Math.min(20, words.length)).join(" ");

  return (
    <div className="hero-machine relative max-w-5xl mx-auto px-4">
      {/* ============ output #1 — title, fed from the machine ============ */}
      <div className="flex min-h-[20px] items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] sm:tracking-[0.28em] text-primary">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full bg-primary transition-opacity ${
            started && phase !== "done" ? "opacity-100 animate-[node-glow_0.9s_ease-in-out_infinite]" : started ? "opacity-70" : "opacity-100"
          }`}
        />
        <span>{displayTitle}</span>
        {started && titleChars < safeTitle.length && <Caret />}
      </div>

      {/* ============ output #2 — name (single font for both parts) ============ */}
      <h1 className="mt-2 min-h-[2.4rem] font-mono text-3xl font-bold leading-[1.15] sm:min-h-[4rem] sm:text-4xl md:text-5xl">
        <span className="text-gradient">{displayFirst}</span>
        {showSpace || !started ? " " : ""}
        <span className="text-gradient">{displayLast || (!started && firstSpace !== -1 ? safeName.slice(firstSpace + 1) : "")}</span>
        {started && nameChars < safeName.length && <Caret big />}
      </h1>

      {/* ============ the machine: wires + packets + computer ============ */}
      <div className="relative mt-2 h-[80px] sm:mt-4 sm:h-[108px] animate-fade-up" aria-hidden="true">
        {/* Machine content — scaled down on mobile for compact fit */}
        <div className="absolute inset-0 origin-top scale-[0.72] sm:scale-100">
        {/* side wires (strips) feeding the computer */}
        <div className="absolute left-0 right-[calc(50%+32px)] top-[46px] h-px bg-gradient-to-r from-transparent via-primary/30 to-primary/60" />
        <div className="absolute left-[calc(50%+32px)] right-0 top-[46px] h-px bg-gradient-to-l from-transparent via-primary/30 to-primary/60" />

        {/* packets travelling the left wire, into the computer — carry name & title words */}
        <div className="absolute left-0 right-[calc(50%+36px)] top-[46px]">
          {leftPackets.map((w, i) => (
            <span
              key={`${w}-${i}`}
              className={`${packetClass} animate-[packet-travel_4s_linear_infinite]`}
              style={{ animationDuration: `${(4.2 + i * 0.8).toFixed(1)}s`, animationDelay: `${(i * 1.35).toFixed(1)}s` }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* packets travelling the right wire, into the computer — carry description keywords */}
        <div className="absolute left-[calc(50%+36px)] right-0 top-[46px]">
          {rightPackets.map((w, i) => (
            <span
              key={`${w}-${i}`}
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
              <div className="absolute left-1.5 top-1 space-y-[3px]">
                <span className="block h-[3px] w-8 rounded-full bg-primary/60" />
                <span className="block h-[3px] w-5 rounded-full bg-accent/50" />
                <span className="block h-[3px] w-7 rounded-full bg-primary/40" />
              </div>
              {/* scanning bar while extracting */}
              <span className="absolute top-0 h-full w-[3px] bg-primary/30 animate-[screen-scan_1.6s_ease-in-out_infinite]" />
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
        </div>{/* end machine-content scale wrapper */}
      </div>

      {/* ============ output #3 — description terminal box ============ */}
      <div className="relative min-h-[140px] sm:min-h-[200px] overflow-hidden rounded-xl border border-border bg-surface/70 shadow-inner">
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-1.5 sm:px-4 sm:py-2">
          <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground">extracted_output.txt</span>
          <span className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-zinc-600" />
            <span className={`h-2 w-2 rounded-full ${started ? "bg-primary/70" : "bg-zinc-600"} transition-colors`} />
            <span className={`h-2 w-2 rounded-full ${phase === "done" ? "bg-primary" : "bg-zinc-600"} transition-colors`} />
          </span>
        </div>
        <p className={`p-3 sm:p-4 text-xs sm:text-sm leading-relaxed text-muted-foreground transition-opacity duration-700 ease-in-out ${descVisible ? "opacity-100" : "opacity-0"}`}>
          {displayDesc}
          {started && descWords < words.length && phase !== "done" && <Caret />}
          {!started && words.length > 20 ? "..." : ""}
        </p>
        {/* scanning shimmer while the description is being extracted */}
        {started && descWords < words.length && phase !== "done" && (
          <div className="pointer-events-none absolute left-0 right-0 h-12 bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-[scan-sweep_1.15s_linear_infinite]" />
        )}
      </div>
    </div>
  );
}
