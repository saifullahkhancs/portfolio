import { useEffect, useRef, useState } from "react";
import { PageHeader, SiteShell } from "@/components/SiteShell";
import { Reveal } from "@/components/Reveal";
import { getExperiences, getProfile, fallbackExperiences, fallbackProfile, type Experience as ExpType } from "@/lib/api";

/**
 * Experience deck: cards start stacked with the first in front.
 * Scrolling pushes the front card to the back (it rotates away)
 * and brings the next one forward — a continuous scroll-driven rotation.
 */
function ExperienceDeck({ jobs }: { jobs: any[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const n = Math.max(jobs.length, 1);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      setProgress(p);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (!jobs.length) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm text-muted-foreground">No experiences to display.</p>
      </div>
    );
  }

  // continuous "front card" position: 0 -> n-1 as you scroll through the section
  const active = progress * (n - 1);
  const current = Math.round(active);
  const safeCurrent = Math.min(Math.max(current, 0), jobs.length - 1);

  const jumpTo = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (n > 1 ? (i / (n - 1)) * total : 0), behavior: "smooth" });
  };

  return (
    <div ref={sectionRef} className="relative" style={{ height: `${Math.max(jobs.length, 2) * 110 + 40}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          scroll — the deck rotates
        </p>

        <div className="relative h-[min(540px,62vh)] w-[min(680px,92vw)]" style={{ perspective: "1200px" }}>
          {jobs.map((job: any, i: number) => {
            const d = i - active; // d < 0 already passed, d = 0 front, d > 0 waiting behind
            let transform: string;
            let opacity: number;
            if (d >= 0) {
              // waiting deck behind the front card: slightly lower + smaller
              const clamped = Math.min(d, 3.2);
              transform = `translate3d(${clamped * 14}px, ${clamped * 26}px, 0) scale(${1 - clamped * 0.055}) rotate(${clamped * 1.6}deg)`;
              opacity = Math.max(0, 1 - Math.max(0, d - 1.6) * 0.55);
            } else {
              // passed cards: swing up-left and fade to the back
              const t = Math.min(1, -d);
              transform = `translate3d(${-t * 300}px, ${-t * 130}px, 0) rotate(${-t * 16}deg) scale(${1 - t * 0.08})`;
              opacity = Math.max(0, 1 - t * 1.15);
            }
            return (
              <article
                key={`${job.company}-${job.role}-${job.id || i}`}
                className="panel absolute inset-0 flex flex-col overflow-hidden"
                style={{
                  transform,
                  opacity,
                  zIndex: 100 - Math.round(Math.abs(d) * 10) - (d < 0 ? 50 : 0),
                  pointerEvents: Math.abs(d) < 0.5 ? "auto" : "none",
                  willChange: "transform, opacity",
                }}
              >
                <div className="flex items-center justify-between border-b border-border px-6 py-3">
                  <p className="font-mono text-xs text-muted-foreground">
                    {job.period} · {job.location}
                  </p>
                  <span className="font-mono text-xs text-primary">
                    {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <h2 className="text-xl font-semibold">{job.role}</h2>
                  <p className="font-mono text-sm text-primary">{job.company}</p>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                    {(job.points || []).map((pt: string) => (
                      <li key={pt} className="flex gap-3">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        {/* prev / next controls + progress rail */}
        <div className="mt-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => jumpTo(Math.max(0, safeCurrent - 1))}
            disabled={safeCurrent === 0}
            aria-label="Previous role"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/80 font-mono text-sm text-primary transition-colors hover:border-primary/60 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-35"
          >
            &lt;
          </button>

          <div className="flex items-center gap-3">
            {jobs.map((job: any, i: number) => (
              <button
                key={job.company + i}
                type="button"
                onClick={() => jumpTo(i)}
                aria-label={`Go to ${job.company}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === safeCurrent ? "w-8 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => jumpTo(Math.min(n - 1, safeCurrent + 1))}
            disabled={safeCurrent >= n - 1}
            aria-label="Next role"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/80 font-mono text-sm text-primary transition-colors hover:border-primary/60 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-35"
          >
            &gt;
          </button>
        </div>
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          {(jobs[safeCurrent] as any)?.company || ""} — {safeCurrent + 1} of {jobs.length}
        </p>
      </div>
    </div>
  );
}

/** simple fallback list when the user prefers reduced motion */
function ExperienceList({ jobs }: { jobs: any[] }) {
  if (!jobs.length) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm text-muted-foreground">No experiences to display.</p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <ol className="relative space-y-6 border-l border-border pl-6">
        {jobs.map((job: any, idx: number) => (
          <li key={`${job.company}-${job.role}-${idx}`} className="relative">
            <span className="absolute -left-[1.9rem] top-6 h-2.5 w-2.5 rounded-full bg-primary" />
            <Reveal>
              <div className="panel p-6">
                <p className="font-mono text-xs text-muted-foreground">
                  {job.period} · {job.location}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{job.role}</h2>
                <p className="font-mono text-sm text-primary">{job.company}</p>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {(job.points || []).map((pt: string) => (
                    <li key={pt} className="flex gap-3">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Experience() {
  const [experiences, setExperiences] = useState<ExpType[] | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [reduced, setReduced] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExperiences()
      .then(setExperiences)
      .catch(() => setExperiences(fallbackExperiences as any))
      .finally(() => setLoading(false));
    getProfile()
      .then(setProfile)
      .catch(() => setProfile(fallbackProfile as any));
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const list = (experiences?.length ? experiences : fallbackExperiences) as any[];
  const displayProfile = profile || fallbackProfile;

  return (
    <SiteShell profile={displayProfile as any}>
      <PageHeader
        kicker="Career"
        title="Experience"
        intro="Three years building backend services, ingestion pipelines and APIs across security intelligence, business workflow and networking research teams."
      />
      {loading && !experiences ? (
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="font-mono text-sm text-muted-foreground">Loading experience…</p>
        </div>
      ) : reduced ? (
        <ExperienceList jobs={list} />
      ) : (
        <ExperienceDeck jobs={list} />
      )}
    </SiteShell>
  );
}
