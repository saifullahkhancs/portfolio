import { useEffect, useState } from "react";
import { PageHeader, SiteShell } from "@/components/SiteShell";
import { Reveal } from "@/components/Reveal";
import { TiltCard } from "@/components/TiltCard";
import { ProjectIcons } from "@/components/ProjectIcons";
import { getProjects, getProfile, fallbackProjects, fallbackProfile, type Project } from "@/lib/api";
import { Film, Info } from "lucide-react";

function ProjectCard({ p }: { p: any }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const videoUrl = p.video_url || p.videoUrl || "";
  const projectUrl = p.project_url || p.projectUrl || "";

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isSwipe = Math.abs(distance) > 50;
    if (isSwipe) {
      setIsFlipped((prev) => !prev);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <div
      className="relative w-full h-full [perspective:1200px]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => setIsFlipped((prev) => !prev)}
      title="Click or swipe to flip card"
    >
      <div
        className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]"
        style={{
          transform: isFlipped ? "rotateY(180deg)" : "none",
        }}
      >
        {/* Front Side */}
        <article
          className="panel group relative flex h-full flex-col overflow-hidden p-6 transition-[border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-[0_0_40px_-10px_var(--color-primary)]"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
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

          <div className="mt-4">
            <ul className="flex flex-wrap gap-2">
              {(p.stack || []).map((s: string) => (
                <li
                  key={s}
                  className="rounded-md bg-secondary px-2.5 py-1 font-mono text-xs text-secondary-foreground transition-colors group-hover:bg-primary/10"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4 font-mono text-xs text-primary">
            {projectUrl ? (
              <a
                href={projectUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline flex items-center gap-1 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                live project ↗
              </a>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(true);
              }}
              className="cursor-pointer text-primary hover:text-glow hover:underline flex items-center gap-1.5 font-semibold z-10"
            >
              <Film size={13} className="text-primary animate-pulse" />
              watch demo ▶
            </button>
          </div>
        </article>

        {/* Back Side */}
        <article
          className="panel absolute inset-0 flex flex-col p-6 bg-surface"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Film size={16} className="text-primary" />
              <h3 className="text-lg font-semibold font-mono text-primary">{p.name}</h3>
            </div>
            <span className="font-mono text-[0.7rem] text-muted-foreground">Demo Video</span>
          </div>

          <div 
            className="flex-1 flex flex-col justify-center min-h-0 bg-black/40 rounded-lg p-2 border border-border/40"
            onClick={(e) => e.stopPropagation()}
          >
            {videoUrl ? (
              <video
                src={videoUrl}
                className="max-h-60 w-full rounded-md bg-black object-contain mx-auto"
                controls
                preload="metadata"
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed border-border/40 bg-black/10 p-4 text-center">
                <span className="text-2xl mb-1">📹</span>
                <p className="text-xs font-semibold text-primary">No video demo yet</p>
                <p className="text-[10px] text-muted-foreground max-w-[200px] mx-auto mt-1">
                  This project's video is currently being prepared. Swipe or click "show details" to flip back!
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4 font-mono text-xs text-primary">
            <span className="text-muted-foreground text-[10px] sm:inline hidden">
              ← swipe card to flip back
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="cursor-pointer text-primary hover:text-glow hover:underline flex items-center gap-1.5 font-semibold ml-auto z-10"
            >
              <Info size={13} className="text-primary" />
              ◀ show details
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(() => setProjects(fallbackProjects as any));
    getProfile()
      .then(setProfile)
      .catch(() => setProfile(fallbackProfile as any));
  }, []);

  const list = (projects?.length ? projects : fallbackProjects) as any[];
  const displayProfile = profile || fallbackProfile;

  return (
    <SiteShell profile={displayProfile as any}>
      <PageHeader
        kicker="Build log"
        title="Projects"
        intro="Automation platforms, ingestion pipelines and full-stack products — mostly Python on the backend, React where a UI is needed."
      />
      <div className="mx-auto grid max-w-5xl gap-4 px-6 py-16 sm:grid-cols-2">
        {list.map((p: any, i: number) => (
          <Reveal key={p.name + i} delay={(i % 2) * 110 + Math.floor(i / 2) * 60}>
            <TiltCard>
              <ProjectCard p={p} />
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </SiteShell>
  );
}
