import { useEffect, useState } from "react";
import { PageHeader, SiteShell } from "@/components/SiteShell";
import { experience as staticExp } from "@/data/portfolio";
import { getExperiences, type Experience as ExpType, getProfile } from "@/lib/api";

export default function Experience() {
  const [experiences, setExperiences] = useState<ExpType[] | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    getExperiences().then(setExperiences).catch(() => {});
    getProfile().then(setProfile).catch(() => {});
  }, []);

  const list = experiences?.length ? experiences : (staticExp as unknown as ExpType[]);

  return (
    <SiteShell profile={profile}>
      <PageHeader
        kicker="Career"
        title="Experience"
        intro="Three years building backend services, ingestion pipelines and APIs across security intelligence, business workflow and networking research teams."
      />
      <div className="mx-auto max-w-5xl px-6 py-16">
        <ol className="relative space-y-6 border-l border-border pl-6">
          {list.map((job: any) => (
            <li key={`${job.company}-${job.role}-${job.id || job.period}`} className="relative">
              <span className="absolute -left-[1.9rem] top-6 h-2.5 w-2.5 rounded-full bg-primary" />
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
            </li>
          ))}
        </ol>
      </div>
    </SiteShell>
  );
}
