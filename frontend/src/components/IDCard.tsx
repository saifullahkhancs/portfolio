import { useEffect, useMemo, useRef, useState } from "react";
import type { Profile } from "@/lib/api";

interface Props {
  profile?: Profile | null;
}

/**
 * ID badge hanging from two white lanyard strips (no pin).
 * Now robust: never stays invisible if image fails or hangs.
 */
export default function IDCard({ profile }: Props) {
  const p = profile || ({} as any);

  const wanted = p.profile_image_url || "";
  const [src, setSrc] = useState(wanted);
  const [ready, setReady] = useState(!wanted); // drop immediately if no image
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setSrc(wanted);
    setReady(!wanted);
  }, [wanted]);

  useEffect(() => {
    if (ready || !src) return;
    const el = imgRef.current;
    if (!el) return;
    // if already cached
    if (el.complete) {
      setReady(true);
      return;
    }
    // safety timeout: force show after 1.5s even if image hangs
    const t = window.setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(t);
  }, [ready, src]);

  // Extra safety: never stay hidden longer than 2s
  useEffect(() => {
    if (ready) return;
    const t = window.setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(t);
  }, [ready]);

  const badgeId = useMemo(() => `SF-${Math.floor(10000 + Math.random() * 89999)}`, []);

  const rivet =
    "absolute h-2.5 w-2.5 rounded-full bg-gradient-to-br from-zinc-100 via-zinc-400 to-zinc-600 ring-1 ring-black/40";

  return (
    <div
      className="relative mx-auto w-[340px] select-none md:mx-0 md:ml-auto md:translate-x-6 lg:translate-x-10"
      aria-label="ID badge"
    >
      <div
        className={
          ready
            ? "origin-top animate-[lanyard-drop_4.8s_linear_forwards] motion-reduce:animate-none"
            : "origin-top opacity-0"
        }
      >
        <div
        className={
          ready
            ? "origin-top animate-[lanyard-sway_8s_ease-in-out_4.8s_infinite] motion-reduce:animate-none"
            : "origin-top"
        }
        >
          <div className="relative z-20 h-[96px]">
            <div className="absolute left-1/2 top-0 h-[112px] w-[7px] origin-top -translate-x-1/2 -rotate-[31deg] rounded-full bg-gradient-to-b from-white via-zinc-100 to-zinc-200 shadow-[0_4px_12px_rgba(0,0,0,0.2)]" />
            <div className="absolute left-1/2 top-0 h-[112px] w-[7px] origin-top -translate-x-1/2 rotate-[31deg] rounded-full bg-gradient-to-b from-white via-zinc-100 to-zinc-200 shadow-[0_4px_12px_rgba(0,0,0,0.2)]" />
            <span className="absolute left-1/2 top-[-6px] h-3 w-3 -translate-x-1/2 rounded-full border-2 border-primary/80 bg-background" />
            <span className={`${rivet} left-[calc(50%-63px)] top-[91px]`} />
            <span className={`${rivet} left-[calc(50%+53px)] top-[91px]`} />
          </div>

          <div className="relative -mt-[6px] w-[340px] overflow-hidden rounded-[16px] border border-border bg-gradient-to-br from-[#f4f6fb] via-[#ede9fe] to-[#e0f2fe] bg-[length:200%_200%] animate-[gradient-shift_8s_ease_infinite] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)]">
            <div className="relative h-[360px] w-full bg-zinc-200">
              {src ? (
                <img
                  ref={imgRef}
                  src={src}
                  alt="Profile"
                  className="h-full w-full object-cover object-top"
                  loading="eager"
                  fetchPriority="high"
                  onLoad={() => setReady(true)}
                  onError={() => setReady(true)}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-200 flex items-center justify-center">
                  <span className="font-mono text-4xl font-bold text-zinc-400">{(p.name || "SK").slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              <span className="absolute left-[calc(50%-62px)] top-[2px] h-2 w-2 rounded-full bg-black/25 ring-1 ring-black/40" />
              <span className="absolute left-[calc(50%+54px)] top-[2px] h-2 w-2 rounded-full bg-black/25 ring-1 ring-black/40" />
            </div>

            <div className="space-y-2 bg-gradient-to-r from-[#f4f6fb] via-[#ede9fe] to-[#e0f2fe] bg-[length:200%_200%] animate-[gradient-shift_8s_ease_infinite] px-5 py-5">
              <div className="font-mono text-sm font-extrabold uppercase tracking-widest text-blue-700">ID {badgeId}</div>
              <div className="font-mono text-xl font-bold text-zinc-900 break-words leading-snug">{p.phone || "—"}</div>
              <div className="font-mono text-lg font-medium text-zinc-600 break-words leading-snug">{p.email || "—"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
