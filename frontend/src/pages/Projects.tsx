import { PageHeader, SiteShell } from "@/components/SiteShell";
import { projects } from "@/data/portfolio";
import { ProjectIcons } from "@/components/ProjectIcons";

export default function Projects() {
  return (
    <SiteShell>
      <PageHeader
        kicker="Build log"
        title="Projects"
        intro="Automation platforms, ingestion pipelines and full-stack products — mostly Python on the backend, React where a UI is needed."
      />
      <div className="mx-auto grid max-w-5xl gap-4 px-6 py-16 sm:grid-cols-2">
        {projects.map((p) => (
          <article key={p.name} className="panel flex flex-col p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <span className="font-mono text-[0.7rem] text-muted-foreground">{p.period}</span>
            </div>
            <p className="mt-1 font-mono text-xs text-primary">{p.tagline}</p>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
            <ProjectIcons name={p.name} />
            {((p as any).projectUrl || (p as any).videoUrl) && <div className="mt-5 flex gap-4 font-mono text-xs text-primary">{(p as any).projectUrl && <a href={(p as any).projectUrl} target="_blank" rel="noreferrer">live project ↗</a>}{(p as any).videoUrl && <a href={(p as any).videoUrl} target="_blank" rel="noreferrer">watch demo ▶</a>}</div>}
            <ul className="mt-5 flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <li key={s} className="rounded-md bg-secondary px-2.5 py-1 font-mono text-xs text-secondary-foreground">
                  {s}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </SiteShell>
  );
}
