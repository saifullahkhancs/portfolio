import { useEffect, useState } from "react";
import { assets, profile as staticProfile } from "@/data/portfolio";
import type { Profile } from "@/lib/api";

interface Props {
  profile?: Profile | null;
}

export default function IDCard({ profile }: Props) {
  const [stage, setStage] = useState<"hidden" | "falling" | "caught" | "swaying">("hidden");

  useEffect(() => {
    // Sequence: hidden -> falling -> caught -> swaying
    const t1 = setTimeout(() => setStage("falling"), 80);
    const t2 = setTimeout(() => setStage("caught"), 1500);
    const t3 = setTimeout(() => setStage("swaying"), 1650);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const p = profile || {
    name: staticProfile.name,
    title: staticProfile.role,
    email: staticProfile.email,
    profile_image_url: assets.portrait,
    location: staticProfile.location,
  } as any;

  const isFalling = stage === "falling" || stage === "hidden";
  const isCaught = stage === "caught" || stage === "swaying";
  const isSwaying = stage === "swaying";

  return (
    <div className="relative mx-auto h-[320px] w-[260px] select-none md:mx-0 md:ml-auto md:translate-x-6">
      {/* Impact ring */}
      <div
        className={`pointer-events-none absolute left-1/2 top-[42px] z-10 h-6 w-6 -translate-x-1/2 rounded-full border border-primary/60 transition-all duration-500 ${
          isCaught ? "animate-[impact_0.6s_ease-out]" : "opacity-0 scale-50"
        }`}
      />

      {/* Card assembly - this whole thing drops */}
      <div
        className={`absolute left-1/2 top-0 z-20 w-[220px] -translate-x-1/2 will-change-transform ${
          isSwaying ? "animate-sway origin-top" : ""
        }`}
        style={{
          transform:
            stage === "hidden"
              ? "translate(-50%, -380px) rotate(-6deg)"
              : stage === "falling"
              ? "translate(-50%, 10px) rotate(4deg)"
              : "translate(-50%, 0px) rotate(0deg)",
          transition:
            stage === "hidden"
              ? "none"
              : stage === "falling"
              ? "transform 1.45s cubic-bezier(0.23,1,0.32,1)"
              : "transform 0.55s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* STRIPS - fixed V: both strips share the nail apex and end at the holder rivets */}
        <div className="relative left-1/2 top-[18px] h-[86px] w-[180px] -translate-x-1/2">
          {/* apex knot where strips meet nail */}
          <div className="absolute left-1/2 top-0 z-10 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-white/80 bg-white shadow-sm" />

          {/* Left strip: one transform only, so the endpoint stays aligned with the left rivet. */}
          <div
            className="absolute left-1/2 top-[2px] h-[116px] w-[5px] origin-top translate-x-[-50%] rotate-[42deg] rounded-full bg-gradient-to-b from-white via-zinc-50 to-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.22)]"
          />
          {/* Right strip: mirrored transform keeps the V symmetrical and attached. */}
          <div
            className="absolute left-1/2 top-[2px] h-[116px] w-[5px] origin-top translate-x-[-50%] rotate-[-42deg] rounded-full bg-gradient-to-b from-white via-zinc-50 to-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.22)]"
          />
        </div>

        {/* Plastic holder + card */}
        <div className="relative mt-[18px]">
          {/* translucent plastic badge holder */}
          <div className="relative mx-auto overflow-hidden rounded-[14px] border border-white/15 bg-white/[0.08] p-[7px] shadow-[0_16px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-[2px]">
            {/* attachment rivets aligned with strip ends */}
            <div className="absolute left-[22px] top-0 z-20 h-5 w-5 -translate-y-1/2 rounded-full border border-zinc-300 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
              <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-400" />
            </div>
            <div className="absolute right-[22px] top-0 z-20 h-5 w-5 -translate-y-1/2 rounded-full border border-zinc-300 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
              <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-400" />
            </div>

            {/* Actual ID card */}
            <div className="relative rounded-[10px] bg-[#fbfcfe] p-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]">
              {/* top shine */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[50%] rounded-t-[10px] bg-gradient-to-b from-white to-transparent opacity-80" />

              {/* portrait */}
              <div className="relative mx-auto mt-2 h-[200px] w-[180px] overflow-hidden rounded-[6px] border-[3px] border-white bg-zinc-200 shadow-[0_4px_18px_rgba(0,0,0,0.15)]">
                <img
                  src={p.profile_image_url || assets.portrait}
                  alt={p.name || "Portrait"}
                  className="h-full w-full object-cover object-top"
                  loading="eager"
                />
                {/* inner ring shine */}
                <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_1px_2px_white,inset_0_-2px_6px_rgba(0,0,0,0.12)]" />
              </div>

              {/* name */}
              <div className="relative mt-4 text-center">
                <p className="font-mono text-[15px] font-bold tracking-tight text-zinc-800">
                  {p.name}
                </p>
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-blue-600">
                  {p.title || "Software Engineer"}
                </p>
              </div>

              {/* divider */}
              <div className="relative mt-3 h-px w-full bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

              {/* details */}
              <div className="relative mt-3 space-y-1.5 rounded-md bg-zinc-50/80 p-2.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="font-semibold text-blue-600">ID No:</span>
                  <span className="text-zinc-700">SE-2024-001</span>
                </div>
                <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
                  <span className="shrink-0 font-semibold text-blue-600">Email:</span>
                  <span className="truncate text-right text-zinc-600">{p.email}</span>
                </div>
                {p.location && (
                  <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
                    <span className="shrink-0 font-semibold text-blue-600">Loc:</span>
                    <span className="truncate text-right text-zinc-600">{p.location}</span>
                  </div>
                )}
                <div className="mt-2 flex justify-center">
                  <div className="h-6 w-[92%] rounded-[2px] bg-[repeating-linear-gradient(90deg,#111_0_2px,transparent_2px_4px)] opacity-80" />
                </div>
              </div>

              {/* bottom holographic accent */}
              <div className="relative mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-primary opacity-80" />
            </div>
          </div>

          {/* subtle ground shadow when settled */}
          <div
            className={`pointer-events-none absolute -bottom-5 left-1/2 h-3 w-[120px] -translate-x-1/2 rounded-full bg-black/30 blur-[6px] transition-opacity duration-700 ${
              isCaught ? "opacity-60" : "opacity-0"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
