import { Link } from "react-router-dom";
import { SiteShell } from "@/components/SiteShell";
import { profile, skills, experience, projects, education, certifications, assets } from "@/data/portfolio";
import { Reveal } from "@/components/Reveal";
import { SkillBackdrop } from "@/components/SkillBackdrop";
import { ProjectIcons } from "@/components/ProjectIcons";

const certImages: Record<string, string> = {
  javascript: assets.certJavascript,
  azure: assets.certAzure,
  hackerrank: assets.certHackerrank,
};

export default function Home() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={assets.heroBanner}
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
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-6 py-20 sm:py-28 md:grid-cols-[1.5fr_auto]">
          <div className="animate-fade-up">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">{profile.role}</p>
            <h1 className="mt-5 text-5xl font-bold leading-[1.05] sm:text-6xl">
              {profile.name.split(" ")[0]} <span className="text-gradient">{profile.name.split(" ")[1]}</span>
            </h1>
            <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">{profile.summary}</p>
            <div className="mt-8 flex flex-wrap gap-3 font-mono text-sm">
              <Link
                to="/projects"
                className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                View projects
              </Link>
              <a
                href={assets.resume}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-border bg-background/60 px-5 py-2.5 font-medium backdrop-blur transition-colors hover:bg-secondary"
              >
                Download résumé
              </a>
            </div>
          </div>

          <div className="animate-fade-up justify-self-start md:justify-self-end" style={{ animationDelay: "160ms" }}>
            <div className="relative h-48 w-48 overflow-hidden rounded-2xl border border-primary/40 bg-secondary shadow-[0_0_60px_-15px_var(--color-primary)] transition-transform duration-500 hover:scale-[1.03] sm:h-60 sm:w-60">
              <img
                src={assets.portrait}
                alt="Portrait of Saifullah Khan"
                className="h-full w-full object-cover object-top"
              />
            </div>
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
          {skills.map((group, i) => (
            <Reveal key={group.group} delay={i * 70}>
              <div className="skill-card panel relative h-full overflow-hidden p-5 transition-colors duration-300 hover:border-primary/50">
                <SkillBackdrop group={group.group} />
                <div className="relative">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{group.group}</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {group.items.map((item) => (
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
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-bold">Selected work</h2>
            <Link to="/projects" className="font-mono text-sm text-primary hover:underline">
              all projects →
            </Link>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {projects.slice(0, 2).map((p, i) => (
            <Reveal key={p.name} delay={i * 110}>
              <article className="panel h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 font-mono text-xs text-primary">{p.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                <ProjectIcons name={p.name} />
              </article>
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
            <p className="font-mono text-xs text-muted-foreground">{experience[0].period}</p>
            <h3 className="mt-2 text-lg font-semibold">
              {experience[0].role} · <span className="text-primary">{experience[0].company}</span>
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {experience[0].points.slice(0, 3).map((pt) => (
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
          {certifications.map((c, i) => (
            <Reveal key={c.name} delay={i * 110}>
              <article className="panel group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_40px_-18px_var(--color-primary)]">
                <div className="overflow-hidden border-b border-border bg-secondary">
                  <img
                    src={certImages[c.image]}
                    alt={`${c.name} certificate issued by ${c.issuer}`}
                    loading="lazy"
                    className="h-40 w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="font-mono text-xs text-muted-foreground">{c.year}</p>
                  <h3 className="mt-2 text-base font-semibold leading-snug">{c.name}</h3>
                  <p className="font-mono text-sm text-primary">{c.issuer}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.detail}</p>
                </div>
              </article>
            </Reveal>
          ))}
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
