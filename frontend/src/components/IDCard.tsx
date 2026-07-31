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
      className="relative mx-auto w-[248px] select-none md:mx-0 md:ml-auto md:translate-x-6 lg:translate-x-10"
      aria-label="ID badge"
    >
      {/* whole badge sways gently around the top pivot — no pin, no drop animation */}
      <div className="origin-top animate-[lanyard-sway_5.5s_ease-in-out_infinite]">
        {/* lanyard strips forming a V, continuing up out of frame */}
        <div className="relative z-20 h-[58px]">
          <div className="absolute left-[calc(50%-26px)] top-[-12px] h-[84px] w-[6px] origin-top -rotate-[32deg] rounded-full bg-gradient-to-b from-accent/60 via-primary/90 to-primary shadow-[0_0_10px_-2px_var(--color-primary)]" />
          <div className="absolute left-[calc(50%+20px)] top-[-12px] h-[84px] w-[6px] origin-top rotate-[32deg] rounded-full bg-gradient-to-b from-accent/60 via-primary/90 to-primary shadow-[0_0_10px_-2px_var(--color-primary)]" />
          {/* brass rivets where the strips meet the card */}
          <span className={`${rivet} left-[51px] top-[50px]`} />
          <span className={`${rivet} left-[186px] top-[50px]`} />
        </div>

        {/* the card itself */}
        <div className="relative -mt-[6px] w-[248px] overflow-hidden rounded-[14px] border border-border bg-white shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)]">
          {/* photo — ~80% of the card, rectangular */}
          <div className="relative h-[204px] w-full bg-zinc-200">
            <img
              src={p.profile_image_url || assets.portrait}
              alt="Profile"
              className="h-full w-full object-cover object-center"
              loading="eager"
            />
            {/* punch holes behind the rivets */}
            <span className="absolute left-[55px] top-[3px] h-2 w-2 rounded-full bg-black/25 ring-1 ring-black/40" />
            <span className="absolute right-[54px] top-[3px] h-2 w-2 rounded-full bg-black/25 ring-1 ring-black/40" />
          </div>

          {/* contact strip — ~20% of the card, only ID / phone / email */}
          <div className="space-y-[3px] bg-[#f4f6fb] px-3 py-2.5">
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
