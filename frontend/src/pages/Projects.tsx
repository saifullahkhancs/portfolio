import { useEffect, useState } from "react";
import { PageHeader, SiteShell } from "@/components/SiteShell";
import { Reveal } from "@/components/Reveal";
import { TiltCard } from "@/components/TiltCard";
import ProjectCard from "@/components/ProjectCard";
import { getProjects, getProfile, fallbackProjects, fallbackProfile, type Project } from "@/lib/api";

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
