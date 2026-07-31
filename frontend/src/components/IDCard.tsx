import { useEffect, useState } from "react";
import { assets, profile as staticProfile } from "@/data/portfolio";
import type { Profile } from "@/lib/api";

interface Props {
  profile?: Profile | null;
}

export default function IDCard({ profile }: Props) {
  const p = profile || {
    email: staticProfile.email,
    profile_image_url: assets.portrait,
    phone: staticProfile.phone,
  } as any;

  return (
    <div className="relative mx-auto h-[300px] w-[240px] select-none md:mx-0 md:ml-auto md:translate-x-8">
      <div className="relative overflow-hidden rounded-[12px] border border-border bg-[#fbfcfe] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Image ~80% */}
        <div className="relative h-[220px] w-full overflow-hidden bg-zinc-200">
          <img
            src={p.profile_image_url || assets.portrait}
            alt="Profile"
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>
        {/* Details ~20% */}
        <div className="space-y-1.5 p-3 bg-zinc-50/90">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="font-semibold text-blue-600">ID:</span>
            <span className="text-zinc-700">{Math.floor(Math.random()*99999)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
            <span className="font-semibold text-blue-600">Email:</span>
            <span className="truncate text-right text-zinc-600">{p.email}</span>
          </div>
          <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
            <span className="font-semibold text-blue-600">Phone:</span>
            <span className="truncate text-right text-zinc-600">{p.phone || "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
