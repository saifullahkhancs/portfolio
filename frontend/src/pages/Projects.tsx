import { useEffect, useState } from "react";
import { PageHeader, SiteShell } from "@/components/SiteShell";
import { Reveal } from "@/components/Reveal";
import { TiltCard } from "@/components/TiltCard";
import { projects as staticProjects } from "@/data/portfolio";
import { ProjectIcons } from "@/components/ProjectIcons";
import { getProjects, getProfile, type Project } from "@/lib/api";

function isDirectVideoUrl(value: string) {
  return /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i.test((value || "").trim());
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {});
    getProfile().then(setProfile).catch(() => {});
  }, []);

  const list = projects?.length ? projects : (staticProjects as unknown as Project[]);

  return (
    <SiteShell profile={profile}>
      <PageHeader
        kicker="Build log"
        title="Projects"
        intro="Automation platforms, ingestion pipelines and full-stack products — mostly Python on the backend, React where a UI is needed."
      />
      <div className="mx-auto grid max-w-5xl gap-4 px-6 py-16 sm:grid-cols-2">
        {list.map((p: any, i: number) => (
          <Reveal key={p.name} delay={(i % 2) * 110 + Math.floor(i / 2) * 60}>
            <TiltCard>
              <article className="panel group relative flex h-full flex-col overflow-hidden p-6 transition-[border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-[0_0_40px_-10px_var(--color-primary)]">
                {/* shine sweep on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[420%]"
                />
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold">{p.name}</h2>
                  <span className="font-mono text-[0.7rem] text-muted-foreground">{p.period}</span>
                </div>
                <p className="mt-1 font-mono text-xs text-primary">{p.tagline}</p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                <ProjectIcons name={p.name} />
                {isDirectVideoUrl(p.video_url || p.videoUrl || "") && (
                  <video
                    src={p.video_url || p.videoUrl}
                    className="mt-5 max-h-64 w-full rounded-lg border border-border bg-black"
                    controls
                    preload="metadata"
                  />
                )}
                {(p.project_url || p.projectUrl || p.video_url || p.videoUrl) && (
                  <div className="mt-5 flex gap-4 font-mono text-xs text-primary">
                    {(p.project_url || p.projectUrl) && (
                      <a href={p.project_url || p.projectUrl} target="_blank" rel="noreferrer">
                        live project ↗
                      </a>
                    )}
                    {(p.video_url || p.videoUrl) && (
                      <a href={p.video_url || p.videoUrl} target="_blank" rel="noreferrer">
                        watch demo ▶
                      </a>
                    )}
                  </div>
                )}
                <ul className="mt-5 flex flex-wrap gap-2">
                  {(p.stack || []).map((s: string) => (
                    <li
                      key={s}
                      className="rounded-md bg-secondary px-2.5 py-1 font-mono text-xs text-secondary-foreground transition-colors group-hover:bg-primary/10"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </article>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </SiteShell>
  );
}
