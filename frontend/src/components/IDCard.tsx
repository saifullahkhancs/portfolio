import { useMemo } from "react";
import { assets, profile as staticProfile } from "@/data/portfolio";
import type { Profile } from "@/lib/api";

interface Props {
  profile?: Profile | null;
}

/**
 * ID badge hanging from two white lanyard strips (no pin).
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
      className="relative mx-auto w-[340px] select-none md:mx-0 md:ml-auto md:translate-x-6 lg:translate-x-10"
      aria-label="ID badge"
    >
      {/* Drop from above on load (settles with a bounce) then continuous sway */}
      <div className="origin-top animate-[lanyard-drop_1.5s_ease-out_forwards]">
        <div className="origin-top animate-[lanyard-sway_5.5s_ease-in-out_1.5s_infinite]">
        {/* lanyard strips forming a clean V from one pivot point at the top */}
        <div className="relative z-20 h-[96px]">
          <div className="absolute left-1/2 top-0 h-[112px] w-[7px] origin-top -translate-x-1/2 -rotate-[31deg] rounded-full bg-gradient-to-b from-white via-zinc-100 to-zinc-200 shadow-[0_4px_12px_rgba(0,0,0,0.2)]" />
          <div className="absolute left-1/2 top-0 h-[112px] w-[7px] origin-top -translate-x-1/2 rotate-[31deg] rounded-full bg-gradient-to-b from-white via-zinc-100 to-zinc-200 shadow-[0_4px_12px_rgba(0,0,0,0.2)]" />
          {/* the pivot ring where both strips meet */}
          <span className="absolute left-1/2 top-[-6px] h-3 w-3 -translate-x-1/2 rounded-full border-2 border-primary/80 bg-background" />
          {/* brass rivets where the strips meet the card */}
          <span className={`${rivet} left-[calc(50%-58px)] top-[88px]`} />
          <span className={`${rivet} left-[calc(50%+58px)] top-[88px]`} />
        </div>

        {/* the card itself */}
        <div className="relative -mt-[6px] w-[340px] overflow-hidden rounded-[16px] border border-border bg-white shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)]">
          {/* photo — most of the card, rectangular, framed from the top so the head is never cut */}
          <div className="relative h-[360px] w-full bg-zinc-200">
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
          <div className="space-y-2 bg-[#f4f6fb] px-5 py-5">
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
