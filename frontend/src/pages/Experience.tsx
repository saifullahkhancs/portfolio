import { PageHeader, SiteShell } from "@/components/SiteShell";
import { experience } from "@/data/portfolio";

export default function Experience() {
  return (
    <SiteShell>
      <PageHeader
        kicker="Career"
        title="Experience"
        intro="Three years building backend services, ingestion pipelines and APIs across security intelligence, business workflow and networking research teams."
      />
      <div className="mx-auto max-w-5xl px-6 py-16">
        <ol className="relative space-y-6 border-l border-border pl-6">
          {experience.map((job) => (
            <li key={job.company} className="relative">
              <span className="absolute -left-[1.9rem] top-6 h-2.5 w-2.5 rounded-full bg-primary" />
              <div className="panel p-6">
                <p className="font-mono text-xs text-muted-foreground">
                  {job.period} · {job.location}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{job.role}</h2>
                <p className="font-mono text-sm text-primary">{job.company}</p>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {job.points.map((pt) => (
                    <li key={pt} className="flex gap-3">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SiteShell>
  );
}
