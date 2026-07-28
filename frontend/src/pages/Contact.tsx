import { useState, type FormEvent } from "react";
import { PageHeader, SiteShell } from "@/components/SiteShell";
import { profile, assets } from "@/data/portfolio";
import { submitContactForm } from "@/lib/api";

const links = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "Phone", value: profile.phone, href: `tel:${profile.phone}` },
  { label: "LinkedIn", value: "saifullah-khan", href: profile.linkedin },
  { label: "GitHub", value: "saifullahkhancs", href: profile.github },
];

type Status = "idle" | "submitting" | "success" | "error";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      await submitContactForm(form);
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <SiteShell>
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
              target={l.href.startsWith("http") ? "_blank" : undefined}
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
            href={assets.resume}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-primary px-5 py-2.5 font-mono text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Download
          </a>
        </div>

        <div className="panel mt-4 p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Send a message</p>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            Goes straight to the backend and gets stored for follow-up.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Name
                </label>
                <input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-2 w-full rounded-md border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="email" className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-2 w-full rounded-md border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="mt-2 w-full rounded-md border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="rounded-md bg-primary px-5 py-2.5 font-mono text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {status === "submitting" ? "Sending…" : "Send message"}
              </button>
              {status === "success" && (
                <p className="font-mono text-sm text-primary">Thanks — message received.</p>
              )}
              {status === "error" && <p className="font-mono text-sm text-destructive">{error}</p>}
            </div>
          </form>
        </div>
      </div>
    </SiteShell>
  );
}
