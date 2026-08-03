import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SiteShell } from "@/components/SiteShell";
import { Reveal } from "@/components/Reveal";
import { SkillBackdrop } from "@/components/SkillBackdrop";
import { ToolStrips } from "@/components/ToolStrips";
import { TiltCard } from "@/components/TiltCard";
import ProjectCard from "@/components/ProjectCard";
import IDCard from "@/components/IDCard";
import HeroAnimation from "@/components/HeroAnimation";
import CertCarousel from "@/components/CertCarousel";
import { getPortfolio, type Education, type PortfolioData, fallbackPortfolio } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Full-page loader — shown while the backend data is being fetched   */
/* ------------------------------------------------------------------ */
function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background">
      {/* Terminal-style loading animation */}
      <div className="relative">
        {/* Outer ring */}
        <div className="h-20 w-20 rounded-full border-2 border-border" />
        {/* Spinning arc */}
        <div className="absolute inset-0 h-20 w-20 animate-spin rounded-full border-2 border-transparent border-t-primary" style={{ animationDuration: "1.2s" }} />
        {/* Inner pulse */}
        <div className="absolute inset-3 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-primary/20 animate-[node-glow_1.4s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Terminal text */}
      <div className="flex flex-col items-center gap-2">
        <div className="font-mono text-sm text-primary flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-[node-glow_0.9s_ease-in-out_infinite]" />
          <span>Fetching portfolio data</span>
          <span className="inline-block animate-[caret-blink_0.85s_steps(1)_infinite] h-[1em] w-[0.5em] bg-primary rounded-[2px]" />
        </div>
        <p className="font-mono text-xs text-muted-foreground">loading from server…</p>
      </div>

      {/* Animated data stream bars */}
      <div className="flex items-end gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="block w-1.5 rounded-full bg-primary/60"
            style={{
              height: `${12 + i * 4}px`,
              animation: `loader-bar 1.2s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getPortfolio()
      .then((d) => {
        if (!mounted) return;
        setData(d);
      })
      .catch((err: any) => {
        if (!mounted) return;
        setError(err?.message || "Failed to load");
        setData(fallbackPortfolio as PortfolioData);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const source = useMemo(() => data || (fallbackPortfolio as PortfolioData), [data]);
  const profile = source?.profile || (fallbackPortfolio.profile as any);
  const skills = (source?.skills?.length ? source.skills : source?.skill_groups?.length ? source.skill_groups : fallbackPortfolio.skills) as any[];
  const experience = (source?.experiences?.length ? source.experiences : fallbackPortfolio.experiences) as any[];
  const projects = (source?.projects?.length ? source.projects : fallbackPortfolio.projects) as any[];
  const education: Education | null = (source?.education || source?.educations?.[0] || fallbackPortfolio.education) as any;
  const certifications = (source?.certifications?.length ? source.certifications : fallbackPortfolio.certifications) as any[];

  const heroBanner = (profile?.hero_banner_url as string) || "";
  const resumeUrl = (profile?.resume_url as string) || "";
  const firstExp = (experience?.[0] || null) as any;

  /* While the API call is in flight, show the full-page loader so the user
     never sees hardcoded / fallback data flash before the real data arrives. */
  if (loading && !data) {
    return <PageLoader />;
  }

  return (
    <SiteShell profile={profile}>
      <section className="relative overflow-hidden border-b border-border">
        {heroBanner ? (
          <img
            src={heroBanner}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
          />
        ) : null}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--background) 12%, color-mix(in oklab, var(--background) 55%, transparent) 60%, transparent)",
          }}
        />
        <div className="hero-surface pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-4 py-12 sm:gap-10 sm:px-6 sm:py-20 md:grid-cols-[minmax(0,1.4fr)_360px] md:py-28 lg:gap-14">
          <div>
            <HeroAnimation
              name={profile?.name || "Saifullah Khan"}
              title={profile?.title || (profile as any)?.role || "Software Engineer"}
              desc={profile?.description || (profile as any)?.summary || fallbackPortfolio.profile!.description}
            />

            <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3 font-mono text-sm animate-fade-up" style={{ animationDelay: "150ms" }}>
              <Link
                to="/projects"
                className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                View projects
              </Link>
              {resumeUrl ? (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-border bg-background/60 px-5 py-2.5 font-medium backdrop-blur transition-colors hover:bg-secondary"
                >
                  Download résumé
                </a>
              ) : null}
              {error && !loading && (
                <span className="ml-2 self-center text-xs text-amber-500">backend offline – showing cached portfolio</span>
              )}
            </div>
          </div>

          <div className="animate-fade-up w-full max-w-[280px] sm:max-w-[360px] justify-self-center pt-2 md:justify-self-end" style={{ animationDelay: "80ms" }}>
            <IDCard profile={profile} />
          </div>
        </div>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pb-10 sm:pb-14">
          <dl className="grid gap-6 border-t border-border pt-8 font-mono text-sm sm:grid-cols-3">
            {[
              ["Experience", "3+ years engineering"],
              ["Focus", "APIs · microservices · full stack"],
              ["Based in", profile?.location || "Lahore, Pakistan"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">{k}</dt>
                <dd className="mt-1.5 text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <Reveal>
          <h2 className="text-2xl font-bold">Technical stack</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {skills.map((group: any, i: number) => (
            <Reveal key={group.group || group.group_name || i} delay={i * 70}>
              <div className="skill-card panel relative h-full overflow-hidden p-5 transition-colors duration-300 hover:border-primary/50">
                <SkillBackdrop group={group.group || group.group_name} />
                <div className="relative">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{group.group || group.group_name}</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {(group.items || []).map((item: string) => (
                      <li
                        key={item}
                        className="rounded-md bg-secondary px-2.5 py-1 font-mono text-xs text-secondary-foreground transition-colors hover:bg-primary/15 hover:text-primary"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <Reveal>
          <h2 className="text-2xl font-bold">Tools &amp; platforms</h2>
        </Reveal>
        <Reveal delay={90}>
          <div className="mt-8">
            <ToolStrips />
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <Reveal>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-bold">Selected work</h2>
            <Link to="/projects" className="font-mono text-sm text-primary hover:underline">
              all projects →
            </Link>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {projects.slice(0, 2).map((p: any, i: number) => (
            <Reveal key={p.name || i} delay={i * 110}>
              <TiltCard>
                <ProjectCard p={p} />
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <Reveal>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-bold">Recent role</h2>
            <Link to="/experience" className="font-mono text-sm text-primary hover:underline">
              full history →
            </Link>
          </div>
        </Reveal>
        <Reveal delay={90}>
          <div className="panel mt-8 p-6">
            {firstExp ? (
              <>
                <p className="font-mono text-xs text-muted-foreground">{firstExp.period}</p>
                <h3 className="mt-2 text-lg font-semibold">
                  {firstExp.role} · <span className="text-primary">{firstExp.company}</span>
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {(firstExp.points || []).slice(0, 3).map((pt: string) => (
                    <li key={pt} className="flex gap-3">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Experience details coming soon.</p>
            )}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <Reveal>
          <h2 className="text-2xl font-bold">Certifications</h2>
        </Reveal>
        <Reveal delay={90}>
          <div className="mt-10">
            <CertCarousel items={certifications as any[]} imageFor={(c: any) => c.image_url || ""} />
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <Reveal>
          <h2 className="text-2xl font-bold">Education</h2>
        </Reveal>
        <Reveal delay={90}>
          <div className="panel mt-8 p-6">
            {education ? (
              <>
                <p className="font-mono text-xs text-muted-foreground">{education.period}</p>
                <h3 className="mt-2 text-lg font-semibold">{education.degree}</h3>
                <p className="font-mono text-sm text-primary">
                  {education.school} — CGPA {education.cgpa}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{education.coursework}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Education details coming soon.</p>
            )}
          </div>
        </Reveal>
      </section>
    </SiteShell>
  );
}
