import { useMemo } from "react";
import { assets, profile as staticProfile } from "@/data/portfolio";
import type { Profile } from "@/lib/api";

interface Props {
  profile?: Profile | null;
}

/**
 * ID badge hanging from two lanyard strips (no pin).
 * ~80% rectangular photo, ~20% contact strip (ID + phone + email).
 */
export default function IDCard({ profile }: Props) {
  const p = profile || {
    email: staticProfile.email,
    phone: staticProfile.phone,
    profile_image_url: assets.portrait,
  } as any;

  // stable random badge id (generated once, not on every render)
  const badgeId = useMemo(() => `SF-${Math.floor(10000 + Math.random() * 89999)}`, []);

  const rivet =
    "absolute h-2.5 w-2.5 rounded-full bg-gradient-to-br from-zinc-100 via-zinc-400 to-zinc-600 ring-1 ring-black/40";

  return (
    <div
      className="relative mx-auto w-[276px] select-none md:mx-0 md:ml-auto md:translate-x-6 lg:translate-x-10"
      aria-label="ID badge"
    >
      {/* whole badge sways gently around the top pivot — no pin, no drop animation */}
      <div className="origin-top animate-[lanyard-sway_5.5s_ease-in-out_infinite]">
        {/* lanyard strips forming a clean V from one pivot point at the top */}
        <div className="relative z-20 h-[96px]">
          <div className="absolute left-1/2 top-0 h-[112px] w-[7px] origin-top -translate-x-1/2 -rotate-[31deg] rounded-full bg-gradient-to-b from-accent/60 via-primary/90 to-primary shadow-[0_0_10px_-2px_var(--color-primary)]" />
          <div className="absolute left-1/2 top-0 h-[112px] w-[7px] origin-top -translate-x-1/2 rotate-[31deg] rounded-full bg-gradient-to-b from-accent/60 via-primary/90 to-primary shadow-[0_0_10px_-2px_var(--color-primary)]" />
          {/* the pivot ring where both strips meet */}
          <span className="absolute left-1/2 top-[-6px] h-3 w-3 -translate-x-1/2 rounded-full border-2 border-primary/80 bg-background" />
          {/* brass rivets where the strips meet the card */}
          <span className={`${rivet} left-[calc(50%-62px)] top-[88px]`} />
          <span className={`${rivet} left-[calc(50%+52px)] top-[88px]`} />
        </div>

        {/* the card itself */}
        <div className="relative -mt-[6px] w-[276px] overflow-hidden rounded-[14px] border border-border bg-white shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)]">
          {/* photo — most of the card, rectangular, framed from the top so the head is never cut */}
          <div className="relative h-[300px] w-full bg-zinc-200">
            <img
              src={p.profile_image_url || assets.portrait}
              alt="Profile"
              className="h-full w-full object-cover object-top"
              loading="eager"
            />
            {/* punch holes behind the rivets */}
            <span className="absolute left-[calc(50%-58px)] top-[4px] h-2 w-2 rounded-full bg-black/25 ring-1 ring-black/40" />
            <span className="absolute right-[calc(50%-58px)] top-[4px] h-2 w-2 rounded-full bg-black/25 ring-1 ring-black/40" />
          </div>

          {/* contact strip — only ID / phone / email */}
          <div className="space-y-[3px] bg-[#f4f6fb] px-3 py-3">
            <div className="flex items-center justify-between gap-2 font-mono text-[9px]">
              <span className="font-semibold uppercase tracking-wider text-blue-600">ID {badgeId}</span>
              <span className="truncate text-right text-zinc-600">{p.phone || "—"}</span>
            </div>
            <p className="truncate font-mono text-[9px] text-zinc-600">{p.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
