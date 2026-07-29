import { useEffect, useState } from "react";

/**
 * Fixed hanging card animation: drops once, bounces on nail, then subtle idle sway.
 * No infinite fall loop, clean physics.
 */
export function HangingCardAnimation() {
  const [stage, setStage] = useState<"hidden" | "falling" | "settled">("hidden");

  useEffect(() => {
    const t1 = setTimeout(() => setStage("falling"), 120);
    const t2 = setTimeout(() => setStage("settled"), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const isFalling = stage === "falling" || stage === "hidden";
  const isSettled = stage === "settled";

  return (
    <div className="relative h-[210px] w-[240px] overflow-visible">
      {/* Nail */}
      <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2">
        <div className="relative">
          <div className="h-[7px] w-[28px] rounded-full bg-primary shadow-[0_0_12px_rgba(0,255,180,0.6)]" />
          <div className="absolute left-1/2 top-[3px] h-[14px] w-[4px] -translate-x-1/2 rounded-b-full bg-gradient-to-r from-zinc-500 via-zinc-200 to-zinc-500" />
        </div>
      </div>

      {/* Impact */}
      <div
        className={`absolute left-1/2 top-[18px] z-10 h-3 w-3 -translate-x-1/2 rounded-full border border-primary transition-all ${
          isSettled ? "animate-[impact_0.5s_ease-out]" : "scale-0 opacity-0"
        }`}
      />

      {/* Assembly */}
      <div
        className={`absolute left-1/2 top-0 z-10 flex w-[148px] -translate-x-1/2 flex-col items-center will-change-transform ${
          isSettled ? "animate-sway origin-top" : ""
        }`}
        style={{
          transform:
            stage === "hidden"
              ? "translate(-50%, -160px) rotate(-8deg)"
              : stage === "falling"
              ? "translate(-50%, 28px) rotate(5deg)"
              : "translate(-50%, 22px) rotate(0deg)",
          transition:
            stage === "hidden"
              ? "none"
              : stage === "falling"
              ? "transform 1.3s cubic-bezier(0.22,1,0.36,1)"
              : "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* ropes */}
        <div className="relative h-[56px] w-full">
          <div
            className="absolute left-[22%] top-[10px] h-[56px] w-px origin-top bg-gradient-to-b from-primary to-primary/40"
            style={{
              transform: isFalling ? "rotate(14deg)" : "rotate(12deg)",
              transition: "transform 0.5s ease",
            }}
          />
          <div
            className="absolute right-[22%] top-[10px] h-[56px] w-px origin-top bg-gradient-to-b from-primary to-primary/40"
            style={{
              transform: isFalling ? "rotate(-14deg)" : "rotate(-12deg)",
              transition: "transform 0.5s ease",
            }}
          />
          {/* knot */}
          <div className="absolute left-1/2 top-[8px] h-2 w-2 -translate-x-1/2 rounded-full bg-white shadow" />
        </div>

        {/* card */}
        <div className="relative flex h-[68px] w-[132px] flex-col items-center justify-center rounded-[10px] border border-primary/60 bg-surface shadow-[0_12px_30px_rgba(0,0,0,0.5)]">
          <span className="font-mono text-[13px] font-bold tracking-[0.22em] text-primary">BUILD</span>
          <span className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            with purpose
          </span>
          <div className="absolute inset-0 rounded-[10px] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
