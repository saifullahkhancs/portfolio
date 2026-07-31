import { useEffect, useMemo, useRef, useState } from "react";
import type { Profile } from "@/lib/api";

interface Props {
  profile?: Profile | null;
}

/**
 * ID badge hanging from two white lanyard strips (no pin).
 * ~80% rectangular photo, ~20% contact strip (ID + phone + email).
 *
 * The drop does NOT start on mount — the profile picture is loaded
 * first and only once it is ready does the card drop in from above
 * the screen, settle, and start swaying.
 *
 * Lanyard geometry (so the strip ends really meet the card):
 *  - strips: 112px long, rotated ±31deg about the single top pivot
 *      -> their tips land at (±58px, 96px) measured from the pivot
 *  - the card overlaps the strip container by 6px (-mt-[6px])
 *      -> the tips sit 6px inside the card top edge
 *  - the punch holes and brass rivets are centred exactly on the tips
 */
export default function IDCard({ profile }: Props) {
  const p = profile || ({} as any);

  // the picture the card wants to show (API url first)
  const wanted = p.profile_image_url || "";
  const [src, setSrc] = useState(wanted);
  const [ready, setReady] = useState(!wanted); // drop immediately if no image
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setSrc(wanted);
    setReady(!wanted);
  }, [wanted]);

  useEffect(() => {
    // if the (cached) image finished before React attached the load listener,
    // fall back to checking it directly — both success and hard failure
    if (ready || !src) return;
    const el = imgRef.current;
    if (!el || !el.complete) return;
    if (el.naturalWidth > 0) {
      setReady(true);
    } else {
      setReady(true); // image failed -> drop anyway
    }
  }, [ready, src]);

  // stable random badge id (generated once, not on every render)
  const badgeId = useMemo(() => `SF-${Math.floor(10000 + Math.random() * 89999)}`, []);

  const rivet =
    "absolute h-2.5 w-2.5 rounded-full bg-gradient-to-br from-zinc-100 via-zinc-400 to-zinc-600 ring-1 ring-black/40";

  return (
    <div
      className="relative mx-auto w-[340px] select-none md:mx-0 md:ml-auto md:translate-x-6 lg:translate-x-10"
      aria-label="ID badge"
    >
      {/* hidden until the picture is loaded, then a full drop from above the
          screen that settles with two little bounces (motion-safe) */}
      <div
        className={
          ready
            ? "origin-top animate-[lanyard-drop_2.8s_linear_forwards] motion-reduce:animate-none"
            : "origin-top opacity-0"
        }
      >
        {/* the sway only mounts together with the drop, its delay (1.7s) equals
            the drop duration and it loops through 0deg, so drop → swing is seamless */}
        <div
          className={
            ready
              ? "origin-top animate-[lanyard-sway_8s_ease-in-out_2.8s_infinite] motion-reduce:animate-none"
              : "origin-top"
          }
        >
        {/* lanyard strips forming a clean V from one pivot point at the top;
            tips land exactly at (±58px, 96px) where the rivets clamp them to the card */}
        <div className="relative z-20 h-[96px]">
          <div className="absolute left-1/2 top-0 h-[112px] w-[7px] origin-top -translate-x-1/2 -rotate-[31deg] rounded-full bg-gradient-to-b from-white via-zinc-100 to-zinc-200 shadow-[0_4px_12px_rgba(0,0,0,0.2)]" />
          <div className="absolute left-1/2 top-0 h-[112px] w-[7px] origin-top -translate-x-1/2 rotate-[31deg] rounded-full bg-gradient-to-b from-white via-zinc-100 to-zinc-200 shadow-[0_4px_12px_rgba(0,0,0,0.2)]" />
          {/* the pivot ring where both strips meet */}
          <span className="absolute left-1/2 top-[-6px] h-3 w-3 -translate-x-1/2 rounded-full border-2 border-primary/80 bg-background" />
          {/* brass rivets clamping the strip ends onto the card (centred on the tips) */}
          <span className={`${rivet} left-[calc(50%-63px)] top-[91px]`} />
          <span className={`${rivet} left-[calc(50%+53px)] top-[91px]`} />
        </div>

        {/* the card itself */}
        <div className="relative -mt-[6px] w-[340px] overflow-hidden rounded-[16px] border border-border bg-gradient-to-br from-[#f4f6fb] via-[#ede9fe] to-[#e0f2fe] bg-[length:200%_200%] animate-[gradient-shift_8s_ease_infinite] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)]">
          {/* photo — most of the card, rectangular, framed from the top so the head is never cut */}
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
                onError={() => {
                  setReady(true); // image failed -> drop anyway
                }}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-200" />
            )}
            {/* punch holes behind the rivets (centred on the strip tips, 6px from the card top) */}
            <span className="absolute left-[calc(50%-62px)] top-[2px] h-2 w-2 rounded-full bg-black/25 ring-1 ring-black/40" />
            <span className="absolute left-[calc(50%+54px)] top-[2px] h-2 w-2 rounded-full bg-black/25 ring-1 ring-black/40" />
          </div>

          {/* contact strip — only ID / phone / email */}
          <div className="space-y-2 bg-gradient-to-r from-[#f4f6fb] via-[#ede9fe] to-[#e0f2fe] bg-[length:200%_200%] animate-[gradient-shift_8s_ease_infinite] px-5 py-5">
            <div className="font-mono text-sm font-extrabold uppercase tracking-widest text-blue-700">ID {badgeId}</div>
            <div className="font-mono text-xl font-bold text-zinc-900 break-words leading-snug">{p.phone || "—"}</div>
            <div className="font-mono text-lg font-medium text-zinc-600 break-words leading-snug">{p.email}</div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
