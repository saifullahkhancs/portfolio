import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteShell } from "@/components/SiteShell";
import { profile as staticProfile, skills as staticSkills, experience as staticExp, projects as staticProjects, education as staticEdu, certifications as staticCerts, assets as staticAssets } from "@/data/portfolio";
import { Reveal } from "@/components/Reveal";
import { SkillBackdrop } from "@/components/SkillBackdrop";
import { ProjectIcons } from "@/components/ProjectIcons";
import { ToolStrips } from "@/components/ToolStrips";
import { TiltCard } from "@/components/TiltCard";
import IDCard from "@/components/IDCard";
import HeroAnimation from "@/components/HeroAnimation";
import { getPortfolio, type PortfolioData } from "@/lib/api";

const certImages: Record<string, string> = {
  javascript: staticAssets.certJavascript,
  azure: staticAssets.certAzure,
  hackerrank: staticAssets.certHackerrank,
};

export default function Home() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPortfolio()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // fallbacks
  const profile = data?.profile || {
    name: staticProfile.name,
    title: staticProfile.role,
    role: staticProfile.role,
    description: staticProfile.summary,
    summary: staticProfile.summary,
    email: staticProfile.email,
    phone: staticProfile.phone,
    location: staticProfile.location,
    linkedin: staticProfile.linkedin,
    github: staticProfile.github,
    profile_image_url: staticAssets.portrait,
    hero_banner_url: staticAssets.heroBanner,
    resume_url: staticAssets.resume,
  } as any;

  const skills = (data?.skills && data.skills.length ? data.skills : staticSkills.map((s: any, i: number) => ({ id: i, group: s.group, group_name: s.group, items: s.items, sort_order: i }))) as any[];
  const experience = data?.experiences?.length ? data.experiences : staticExp;
  const projects = data?.projects?.length ? data.projects : staticProjects;
  const education = (data?.education || data?.educations?.[0] || staticEdu) as any;
  const certifications = data?.certifications?.length ? data.certifications : staticCerts;

  const heroBanner = (profile.hero_banner_url as string) || staticAssets.heroBanner;
  const resumeUrl = (profile.resume_url as string) || staticAssets.resume;

  return (
    <SiteShell profile={profile}>
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={heroBanner}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--background) 12%, color-mix(in oklab, var(--background) 55%, transparent) 60%, transparent)",
          }}
        />
        <div className="hero-surface pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 sm:py-28 md:grid-cols-[minmax(0,1.4fr)_360px] lg:gap-14">
          <div>
          <HeroAnimation name={profile.name || staticProfile.name} title={profile.title || profile.role} desc={profile.description || profile.summary} />

            <div className="mt-8 flex flex-wrap gap-3 font-mono text-sm animate-fade-up" style={{ animationDelay: '300ms' }}>
              <Link
                to="/projects"
                className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                View projects
              </Link>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-border bg-background/60 px-5 py-2.5 font-medium backdrop-blur transition-colors hover:bg-secondary"
              >
                Download résumé
              </a>
              {loading && <span className="ml-2 self-center text-xs text-muted-foreground">syncing from backend…</span>}
            </div>
          </div>

          <div className="animate-fade-up w-full max-w-[360px] justify-self-center pt-2 md:justify-self-end" style={{ animationDelay: "160ms" }}>
            <IDCard profile={profile} />
          </div>
        </div>

        <div className="relative mx-auto max-w-5xl px-6 pb-14">
          <dl className="grid gap-6 border-t border-border pt-8 font-mono text-sm sm:grid-cols-3">
            {[
              ["Experience", "3+ years engineering"],
              ["Focus", "APIs · microservices · full stack"],
              ["Based in", profile.location],
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
            <Reveal key={group.group || group.group_name} delay={i * 70}>
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
            <Reveal key={p.name} delay={i * 110}>
              <TiltCard>
                <article className="panel h-full p-6 transition-[border-color,box-shadow] duration-300 hover:border-primary/50 hover:shadow-[0_0_40px_-18px_var(--color-primary)]">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="mt-1 font-mono text-xs text-primary">{p.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                  <ProjectIcons name={p.name} />
                </article>
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
            <p className="font-mono text-xs text-muted-foreground">{(experience[0] as any).period}</p>
            <h3 className="mt-2 text-lg font-semibold">
              {(experience[0] as any).role} · <span className="text-primary">{(experience[0] as any).company}</span>
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {((experience[0] as any).points || []).slice(0, 3).map((pt: string) => (
                <li key={pt} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <Reveal>
          <h2 className="text-2xl font-bold">Certifications</h2>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((c: any, i: number) => {
            const imgKey = c.image_key || c.image || "";
            const imgUrl = c.image_url || certImages[imgKey] || "";
            return (
              <Reveal key={c.name} delay={i * 110}>
                <article className="panel group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_40px_-18px_var(--color-primary)]">
                  <div className="overflow-hidden border-b border-border bg-secondary">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={`${c.name} certificate issued by ${c.issuer}`}
                        loading="lazy"
                        className="h-40 w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-40 w-full bg-secondary" />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="font-mono text-xs text-muted-foreground">{c.year}</p>
                    <h3 className="mt-2 text-base font-semibold leading-snug">{c.name}</h3>
                    <p className="font-mono text-sm text-primary">{c.issuer}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.detail}</p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-4">
        <Reveal>
          <h2 className="text-2xl font-bold">Education</h2>
        </Reveal>
        <Reveal delay={90}>
          <div className="panel mt-8 p-6">
            <p className="font-mono text-xs text-muted-foreground">{education.period}</p>
            <h3 className="mt-2 text-lg font-semibold">{education.degree}</h3>
            <p className="font-mono text-sm text-primary">
              {education.school} — CGPA {education.cgpa}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{education.coursework}</p>
          </div>
        </Reveal>
      </section>
    </SiteShell>
  );
}
