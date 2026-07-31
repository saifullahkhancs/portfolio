import { useEffect, useState } from "react";
import { PageHeader, SiteShell } from "@/components/SiteShell";
import { getProfile, fallbackProfile, type Profile } from "@/lib/api";

export default function Contact() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => setProfile(fallbackProfile as any));
  }, []);

  const p = (profile || fallbackProfile) as any;

  const links = [
    { label: "Email", value: p.email || "saifullahkhank66@gmail.com", href: `mailto:${p.email || "saifullahkhank66@gmail.com"}` },
    { label: "Phone", value: p.phone || "03007117755", href: `tel:${p.phone || "03007117755"}` },
    { label: "LinkedIn", value: "saifullah-khan", href: p.linkedin || "https://linkedin.com/in/saifullah-khan" },
    { label: "GitHub", value: "saifullahkhancs", href: p.github || "https://github.com/saifullahkhancs" },
  ];

  return (
    <SiteShell profile={p}>
      <PageHeader
        kicker="Say hello"
        title="Contact"
        intro="Open to backend engineering roles and freelance work on APIs, automation and data pipelines."
      />
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href?.startsWith?.("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="panel group p-6 transition-colors hover:border-primary"
            >
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{l.label}</p>
              <p className="mt-2 break-all font-mono text-sm text-foreground group-hover:text-primary">{l.value}</p>
            </a>
          ))}
        </div>

        <div className="panel mt-4 flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Résumé</p>
            <p className="mt-2 font-mono text-sm">Full PDF résumé, always up to date.</p>
          </div>
          <a
            href={p.resume_url || (p as any).resume || fallbackProfile.resume_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-primary px-5 py-2.5 font-mono text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Download
          </a>
        </div>

        {/* Contact form intentionally disabled on this site.
            Reach out directly via the channels above instead. */}
        <div className="panel mt-4 p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Send a message</p>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            The contact form is disabled on this site. The quickest way to reach me is by{" "}
            <a
              className="text-primary underline-offset-2 hover:underline"
              href={`mailto:${p.email || "saifullahkhank66@gmail.com"}`}
            >
              email
            </a>{" "}
            or LinkedIn — I usually reply within a day.
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
