import { useEffect, useState } from "react";
import {
  API_URL,
  getPortfolio,
  type Profile,
  type Experience,
  type Project,
  type SkillGroup,
  type Education,
  type Certification,
  experiencesApi,
  projectsApi,
  skillGroupsApi,
  educationsApi,
  certificationsApi,
  profilesApi,
} from "@/lib/api";

type Tab = "profile" | "experiences" | "projects" | "skills" | "education" | "certifications" | "messages";

export default function Dashboard() {
  const token = typeof window !== "undefined" ? localStorage.getItem("portfolio_token") : null;
  const [tab, setTab] = useState<Tab>("profile");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillGroup[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [saving, setSaving] = useState<string>("");

  useEffect(() => {
    if (!token) {
      location.href = "/signin";
      return;
    }
    refreshAll();
  }, []);

  async function refreshAll() {
    try {
      const data = await getPortfolio();
      setProfile(data.profile);
      setExperiences(data.experiences);
      setProjects(data.projects);
      setSkills(data.skill_groups);
      setEducations(data.educations);
      setCertifications(data.certifications);
      // messages need auth
      const res = await fetch(`${API_URL}/api/contact`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setMessages(await res.json());
    } catch (e: any) {
      setError(e.message || "Unable to load dashboard.");
    }
  }

  async function saveProfile() {
    if (!profile) return;
    setSaving("profile");
    try {
      if (profile.id) {
        const updated = await profilesApi.update(profile.id, profile);
        setProfile(updated);
      } else {
        // create via /api/profile
        const res = await fetch(`${API_URL}/api/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(profile),
        });
        if (!res.ok) throw new Error("Failed to save profile");
        const updated = await res.json();
        setProfile(updated);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving("");
    }
  }

  async function handleSaveExperience(exp: Experience) {
    setSaving(`exp-${exp.id}`);
    try {
      const upd = await experiencesApi.update(exp.id, exp);
      setExperiences((xs) => xs.map((x) => (x.id === exp.id ? upd : x)));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving("");
    }
  }
  async function handleCreateExperience() {
    const payload = {
      role: "New Role",
      company: "Company",
      location: "",
      period: "2024 - Present",
      points: ["Did something awesome"],
      sort_order: experiences.length,
    };
    try {
      const created = await experiencesApi.create(payload);
      setExperiences((xs) => [...xs, created]);
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleSaveProject(p: Project) {
    setSaving(`proj-${p.id}`);
    try {
      const upd = await projectsApi.update(p.id, p);
      setProjects((xs) => xs.map((x) => (x.id === p.id ? upd : x)));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving("");
    }
  }
  async function handleCreateProject() {
    try {
      const created = await projectsApi.create({
        name: "New Project",
        tagline: "Tagline",
        period: "2024",
        description: "Description",
        stack: ["React"],
        project_url: "",
        video_url: "",
        sort_order: projects.length,
      });
      setProjects((xs) => [...xs, created]);
    } catch (e: any) {
      alert(e.message);
    }
  }
  async function handleDeleteProject(id: number) {
    if (!confirm("Delete project?")) return;
    try {
      await projectsApi.del(id);
      setProjects((xs) => xs.filter((x) => x.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleSaveSkill(s: SkillGroup) {
    setSaving(`skill-${s.id}`);
    try {
      const upd = await skillGroupsApi.update(s.id, {
        group: s.group_name || s.group,
        group_name: s.group_name || s.group,
        items: s.items,
        sort_order: s.sort_order,
      });
      setSkills((xs) => xs.map((x) => (x.id === s.id ? upd : x)));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving("");
    }
  }
  async function handleCreateSkill() {
    try {
      const created = await skillGroupsApi.create({
        group: "New Group",
        items: ["Item"],
        sort_order: skills.length,
      });
      setSkills((xs) => [...xs, created]);
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleSaveEdu(e: Education) {
    setSaving(`edu-${e.id}`);
    try {
      const upd = await educationsApi.update(e.id, e);
      setEducations((xs) => xs.map((x) => (x.id === e.id ? upd : x)));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving("");
    }
  }
  async function handleCreateEdu() {
    try {
      const created = await educationsApi.create({
        school: "University",
        degree: "Degree",
        period: "2019 - 2023",
        cgpa: "3.5",
        coursework: "",
        sort_order: educations.length,
      });
      setEducations((xs) => [...xs, created]);
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleSaveCert(c: Certification) {
    setSaving(`cert-${c.id}`);
    try {
      const upd = await certificationsApi.update(c.id, c);
      setCertifications((xs) => xs.map((x) => (x.id === c.id ? upd : x)));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving("");
    }
  }
  async function handleCreateCert() {
    try {
      const created = await certificationsApi.create({
        name: "New Cert",
        issuer: "Issuer",
        year: new Date().getFullYear().toString(),
        detail: "Details",
        image_url: "",
        image_key: "",
        sort_order: certifications.length,
      });
      setCertifications((xs) => [...xs, created]);
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleDeleteGeneric(api: any, id: number, setter: any) {
    if (!confirm("Delete?")) return;
    try {
      await api.del(id);
      setter((xs: any[]) => xs.filter((x: any) => x.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">authenticated dashboard</p>
          <h1 className="mt-2 text-4xl font-bold">Portfolio CMS</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            All content now lives in <code className="rounded bg-secondary px-1">Supabase/Postgres</code> tables. Edit here — portfolio pages fetch from <code className="rounded bg-secondary px-1">/api/portfolio</code>.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={refreshAll}
            className="rounded-md border border-border px-4 py-2 font-mono text-sm"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("portfolio_token");
              location.href = "/signin";
            }}
            className="rounded-md bg-secondary px-4 py-2 font-mono text-sm text-secondary-foreground"
          >
            Sign out
          </button>
        </div>
      </div>

      {error && <p className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-red-300">{error}</p>}

      <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-3">
        {(["profile", "experiences", "projects", "skills", "education", "certifications", "messages"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3.5 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "profile" && profile && (
          <div className="panel space-y-4 p-6">
            <h2 className="font-mono text-sm font-semibold uppercase tracking-widest">User Info / Profile (user_info)</h2>
            <p className="text-xs text-muted-foreground">Contains name, title, description, profile image — exactly as requested.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="font-mono text-xs text-muted-foreground">Name</span>
                <input className="w-full rounded border bg-background p-2.5 text-sm" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </label>
              <label className="space-y-1.5">
                <span className="font-mono text-xs text-muted-foreground">Title / Role</span>
                <input className="w-full rounded border bg-background p-2.5 text-sm" value={profile.title || profile.role} onChange={(e) => setProfile({ ...profile, title: e.target.value, role: e.target.value })} />
              </label>
              <label className="space-y-1.5">
                <span className="font-mono text-xs text-muted-foreground">Email</span>
                <input className="w-full rounded border bg-background p-2.5 text-sm" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </label>
              <label className="space-y-1.5">
                <span className="font-mono text-xs text-muted-foreground">Phone</span>
                <input className="w-full rounded border bg-background p-2.5 text-sm" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </label>
              <label className="space-y-1.5">
                <span className="font-mono text-xs text-muted-foreground">Location</span>
                <input className="w-full rounded border bg-background p-2.5 text-sm" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
              </label>
              <label className="space-y-1.5">
                <span className="font-mono text-xs text-muted-foreground">GitHub</span>
                <input className="w-full rounded border bg-background p-2.5 text-sm" value={profile.github} onChange={(e) => setProfile({ ...profile, github: e.target.value })} />
              </label>
              <label className="space-y-1.5">
                <span className="font-mono text-xs text-muted-foreground">LinkedIn</span>
                <input className="w-full rounded border bg-background p-2.5 text-sm" value={profile.linkedin} onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })} />
              </label>
              <label className="space-y-1.5">
                <span className="font-mono text-xs text-muted-foreground">Profile Image URL</span>
                <input className="w-full rounded border bg-background p-2.5 text-sm" value={profile.profile_image_url} onChange={(e) => setProfile({ ...profile, profile_image_url: e.target.value })} />
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <span className="font-mono text-xs text-muted-foreground">Hero Banner URL</span>
                <input className="w-full rounded border bg-background p-2.5 text-sm" value={profile.hero_banner_url} onChange={(e) => setProfile({ ...profile, hero_banner_url: e.target.value })} />
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <span className="font-mono text-xs text-muted-foreground">Resume URL</span>
                <input className="w-full rounded border bg-background p-2.5 text-sm" value={profile.resume_url} onChange={(e) => setProfile({ ...profile, resume_url: e.target.value })} />
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <span className="font-mono text-xs text-muted-foreground">Description / Summary</span>
                <textarea className="w-full rounded border bg-background p-2.5 text-sm" rows={5} value={profile.description || profile.summary} onChange={(e) => setProfile({ ...profile, description: e.target.value, summary: e.target.value })} />
              </label>
            </div>
            <button onClick={saveProfile} disabled={saving === "profile"} className="rounded bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {saving === "profile" ? "Saving…" : "Save Profile"}
            </button>
          </div>
        )}

        {tab === "experiences" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm uppercase tracking-widest">Experiences ({experiences.length})</h2>
              <button onClick={handleCreateExperience} className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground">+ Add</button>
            </div>
            {experiences.map((e, i) => (
              <div key={e.id} className="panel space-y-3 p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="rounded border bg-background p-2 text-sm" placeholder="Role" value={e.role} onChange={(ev) => setExperiences((xs) => xs.map((x, j) => (j === i ? { ...x, role: ev.target.value } : x)))} />
                  <input className="rounded border bg-background p-2 text-sm" placeholder="Company" value={e.company} onChange={(ev) => setExperiences((xs) => xs.map((x, j) => (j === i ? { ...x, company: ev.target.value } : x)))} />
                  <input className="rounded border bg-background p-2 text-sm" placeholder="Location" value={e.location} onChange={(ev) => setExperiences((xs) => xs.map((x, j) => (j === i ? { ...x, location: ev.target.value } : x)))} />
                  <input className="rounded border bg-background p-2 text-sm" placeholder="Period" value={e.period} onChange={(ev) => setExperiences((xs) => xs.map((x, j) => (j === i ? { ...x, period: ev.target.value } : x)))} />
                </div>
                <div className="space-y-2">
                  <p className="font-mono text-xs text-muted-foreground">Points (one per line)</p>
                  <textarea
                    className="w-full rounded border bg-background p-2 text-sm"
                    rows={4}
                    value={(e.points || []).join("\n")}
                    onChange={(ev) => setExperiences((xs) => xs.map((x, j) => (j === i ? { ...x, points: ev.target.value.split("\n").filter(Boolean) } : x)))}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleSaveExperience(e)} disabled={saving === `exp-${e.id}`} className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
                    {saving === `exp-${e.id}` ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => handleDeleteGeneric(experiencesApi, e.id, setExperiences)} className="rounded border border-destructive/40 px-4 py-2 text-sm text-destructive">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "projects" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm uppercase tracking-widest">Projects ({projects.length})</h2>
              <button onClick={handleCreateProject} className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground">+ Add</button>
            </div>
            {projects.map((p, i) => (
              <div key={p.id} className="panel space-y-3 p-6">
                <input className="w-full rounded border bg-background p-2 text-sm font-semibold" value={p.name} onChange={(e) => setProjects((xs) => xs.map((q, j) => (j === i ? { ...q, name: e.target.value } : q)))} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="rounded border bg-background p-2 text-sm" placeholder="Tagline" value={p.tagline} onChange={(e) => setProjects((xs) => xs.map((q, j) => (j === i ? { ...q, tagline: e.target.value } : q)))} />
                  <input className="rounded border bg-background p-2 text-sm" placeholder="Period" value={p.period} onChange={(e) => setProjects((xs) => xs.map((q, j) => (j === i ? { ...q, period: e.target.value } : q)))} />
                  <input className="rounded border bg-background p-2 text-sm" placeholder="Project URL" value={p.project_url || (p as any).projectUrl || ""} onChange={(e) => setProjects((xs) => xs.map((q, j) => (j === i ? { ...q, project_url: e.target.value, projectUrl: e.target.value } : q)))} />
                  <input className="rounded border bg-background p-2 text-sm" placeholder="Video URL" value={p.video_url || (p as any).videoUrl || ""} onChange={(e) => setProjects((xs) => xs.map((q, j) => (j === i ? { ...q, video_url: e.target.value, videoUrl: e.target.value } : q)))} />
                </div>
                <textarea className="w-full rounded border bg-background p-2 text-sm" rows={3} value={p.description} onChange={(e) => setProjects((xs) => xs.map((q, j) => (j === i ? { ...q, description: e.target.value } : q)))} />
                <div>
                  <p className="font-mono text-xs text-muted-foreground">Stack (comma separated)</p>
                  <input className="mt-1 w-full rounded border bg-background p-2 text-sm" value={(p.stack || []).join(", ")} onChange={(e) => setProjects((xs) => xs.map((q, j) => (j === i ? { ...q, stack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } : q)))} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleSaveProject(p)} disabled={saving === `proj-${p.id}`} className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
                    {saving === `proj-${p.id}` ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => handleDeleteProject(p.id)} className="rounded border border-destructive/40 px-4 py-2 text-sm text-destructive">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "skills" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm uppercase tracking-widest">Skill Groups ({skills.length})</h2>
              <button onClick={handleCreateSkill} className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground">+ Add</button>
            </div>
            {skills.map((s, i) => (
              <div key={s.id} className="panel space-y-3 p-6">
                <input className="w-full rounded border bg-background p-2 text-sm font-semibold" value={s.group_name || s.group} onChange={(e) => setSkills((xs) => xs.map((q, j) => (j === i ? { ...q, group: e.target.value, group_name: e.target.value } : q)))} />
                <div>
                  <p className="font-mono text-xs text-muted-foreground">Items (comma separated)</p>
                  <textarea className="mt-1 w-full rounded border bg-background p-2 text-sm" rows={2} value={(s.items || []).join(", ")} onChange={(e) => setSkills((xs) => xs.map((q, j) => (j === i ? { ...q, items: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) } : q)))} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleSaveSkill(s)} disabled={saving === `skill-${s.id}`} className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
                    {saving === `skill-${s.id}` ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => handleDeleteGeneric(skillGroupsApi, s.id, setSkills)} className="rounded border border-destructive/40 px-4 py-2 text-sm text-destructive">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "education" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm uppercase tracking-widest">Education ({educations.length})</h2>
              <button onClick={handleCreateEdu} className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground">+ Add</button>
            </div>
            {educations.map((e, i) => (
              <div key={e.id} className="panel space-y-3 p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="rounded border bg-background p-2 text-sm" placeholder="School" value={e.school} onChange={(ev) => setEducations((xs) => xs.map((x, j) => (j === i ? { ...x, school: ev.target.value } : x)))} />
                  <input className="rounded border bg-background p-2 text-sm" placeholder="Degree" value={e.degree} onChange={(ev) => setEducations((xs) => xs.map((x, j) => (j === i ? { ...x, degree: ev.target.value } : x)))} />
                  <input className="rounded border bg-background p-2 text-sm" placeholder="Period" value={e.period} onChange={(ev) => setEducations((xs) => xs.map((x, j) => (j === i ? { ...x, period: ev.target.value } : x)))} />
                  <input className="rounded border bg-background p-2 text-sm" placeholder="CGPA" value={e.cgpa} onChange={(ev) => setEducations((xs) => xs.map((x, j) => (j === i ? { ...x, cgpa: ev.target.value } : x)))} />
                </div>
                <textarea className="w-full rounded border bg-background p-2 text-sm" rows={3} placeholder="Coursework" value={e.coursework} onChange={(ev) => setEducations((xs) => xs.map((x, j) => (j === i ? { ...x, coursework: ev.target.value } : x)))} />
                <div className="flex gap-2">
                  <button onClick={() => handleSaveEdu(e)} disabled={saving === `edu-${e.id}`} className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
                    {saving === `edu-${e.id}` ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => handleDeleteGeneric(educationsApi, e.id, setEducations)} className="rounded border border-destructive/40 px-4 py-2 text-sm text-destructive">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "certifications" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm uppercase tracking-widest">Certifications ({certifications.length})</h2>
              <button onClick={handleCreateCert} className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground">+ Add</button>
            </div>
            {certifications.map((c, i) => (
              <div key={c.id} className="panel space-y-3 p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="rounded border bg-background p-2 text-sm font-semibold" placeholder="Name" value={c.name} onChange={(ev) => setCertifications((xs) => xs.map((x, j) => (j === i ? { ...x, name: ev.target.value } : x)))} />
                  <input className="rounded border bg-background p-2 text-sm" placeholder="Issuer" value={c.issuer} onChange={(ev) => setCertifications((xs) => xs.map((x, j) => (j === i ? { ...x, issuer: ev.target.value } : x)))} />
                  <input className="rounded border bg-background p-2 text-sm" placeholder="Year" value={c.year} onChange={(ev) => setCertifications((xs) => xs.map((x, j) => (j === i ? { ...x, year: ev.target.value } : x)))} />
                  <input className="rounded border bg-background p-2 text-sm" placeholder="Image URL" value={c.image_url} onChange={(ev) => setCertifications((xs) => xs.map((x, j) => (j === i ? { ...x, image_url: ev.target.value } : x)))} />
                </div>
                <textarea className="w-full rounded border bg-background p-2 text-sm" rows={2} placeholder="Detail" value={c.detail} onChange={(ev) => setCertifications((xs) => xs.map((x, j) => (j === i ? { ...x, detail: ev.target.value } : x)))} />
                <div className="flex gap-2">
                  <button onClick={() => handleSaveCert(c)} disabled={saving === `cert-${c.id}`} className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
                    {saving === `cert-${c.id}` ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => handleDeleteGeneric(certificationsApi, c.id, setCertifications)} className="rounded border border-destructive/40 px-4 py-2 text-sm text-destructive">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "messages" && (
          <div className="space-y-4">
            <h2 className="font-mono text-sm uppercase tracking-widest">Contact Messages ({messages.length})</h2>
            {messages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
            {messages.map((m) => (
              <div key={m.id} className="panel p-5">
                <p className="font-mono text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()} — {m.email}</p>
                <p className="mt-2 font-semibold">{m.name}</p>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{m.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
