import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import type { Profile } from "@/lib/api";


const nav = [
  { to: "/", label: "home" },
  { to: "/experience", label: "experience" },
  { to: "/projects", label: "projects" },
  { to: "/contact", label: "contact" },
] as const;

export function SiteShell({ children, profile }: { children: ReactNode; profile?: Profile | null }) {
  const p = profile || ({ name: "", location: "", github: "", linkedin: "", resume_url: "" } as any);

  const resumeUrl = (p.resume_url as string) || (p as any).resumeUrl || "";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">$</span> saifullah<span className="text-muted-foreground">.dev</span>
          </Link>
          <nav className="flex items-center gap-1 font-mono text-xs sm:text-sm">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-md px-2.5 py-1.5 transition-colors hover:bg-secondary hover:text-foreground ${
                    isActive ? "bg-secondary text-foreground" : "text-muted-foreground"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/dashboard"
              className="ml-2 rounded-md border border-primary/30 px-2.5 py-1.5 text-primary hover:bg-primary/10"
            >
              dashboard
            </NavLink>
          </nav>
        </div>
      </header>

      <main>{children}</main>



      <footer className="mt-24 border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-8 font-mono text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {p.name} — {p.location}
          </p>
          <div className="flex gap-4">
            <a className="transition-colors hover:text-primary" href={p.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="transition-colors hover:text-primary" href={p.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a className="transition-colors hover:text-primary" href={resumeUrl} target="_blank" rel="noreferrer">
              Résumé
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageHeader({ kicker, title, intro }: { kicker: string; title: string; intro?: string }) {
  return (
    <section className="hero-surface border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">{kicker}</p>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{title}</h1>
        {intro ? <p className="mt-4 max-w-2xl text-muted-foreground">{intro}</p> : null}
      </div>
    </section>
  );
}
