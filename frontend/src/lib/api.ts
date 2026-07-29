// Base URL of the Flask API. Set VITE_API_URL in .env / Vercel project settings,
// e.g. VITE_API_URL=https://api.yourdomain.com
// @ts-ignore vite import.meta.env
export const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:5175";

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export interface ApiError {
  message: string;
}

export interface Profile {
  id: number;
  name: string;
  title: string;
  role: string;
  description: string;
  summary: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  profile_image_url: string;
  hero_banner_url: string;
  resume_url: string;
}

export interface Experience {
  id: number;
  role: string;
  company: string;
  location: string;
  period: string;
  points: string[];
  sort_order: number;
}

export interface Project {
  id: number;
  name: string;
  tagline: string;
  period: string;
  description: string;
  stack: string[];
  project_url: string;
  projectUrl: string;
  video_url: string;
  videoUrl: string;
  featured?: boolean;
  sort_order: number;
}

export interface SkillGroup {
  id: number;
  group: string;
  group_name: string;
  items: string[];
  sort_order: number;
}

export interface Education {
  id: number;
  school: string;
  degree: string;
  period: string;
  cgpa: string;
  coursework: string;
  sort_order: number;
}

export interface Certification {
  id: number;
  name: string;
  issuer: string;
  year: string;
  detail: string;
  image_url: string;
  image: string;
  image_key: string;
  sort_order: number;
}

export interface PortfolioData {
  profile: Profile | null;
  experiences: Experience[];
  projects: Project[];
  skill_groups: SkillGroup[];
  skills: SkillGroup[];
  educations: Education[];
  education: Education | null;
  certifications: Certification[];
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("portfolio_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleRes<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || `Request failed ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function submitContactForm(payload: ContactPayload): Promise<void> {
  const res = await fetch(`${API_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Something went wrong. Please try again.");
  }
}

// ----- public GET -----
export async function getPortfolio(): Promise<PortfolioData> {
  const res = await fetch(`${API_URL}/api/portfolio`);
  if (!res.ok) throw new Error("Failed to load portfolio");
  return res.json();
}

export async function getProfile(): Promise<Profile | null> {
  try {
    const res = await fetch(`${API_URL}/api/profile`);
    if (!res.ok) return null;
    const data = await res.json();
    return data as Profile | null;
  } catch {
    return null;
  }
}

export async function getExperiences(): Promise<Experience[]> {
  const res = await fetch(`${API_URL}/api/experiences`);
  return handleRes<Experience[]>(res);
}

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_URL}/api/projects`);
  return handleRes<Project[]>(res);
}

export async function getSkillGroups(): Promise<SkillGroup[]> {
  const res = await fetch(`${API_URL}/api/skill-groups`);
  return handleRes<SkillGroup[]>(res);
}

export async function getEducations(): Promise<Education[]> {
  const res = await fetch(`${API_URL}/api/educations`);
  return handleRes<Education[]>(res);
}

export async function getCertifications(): Promise<Certification[]> {
  const res = await fetch(`${API_URL}/api/certifications`);
  return handleRes<Certification[]>(res);
}

// ----- authenticated mutations -----
export async function login(email: string, password: string): Promise<{ token: string; user: any }> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleRes(res);
}

export async function createOrUpdateProfile(payload: Partial<Profile> & { id?: number }): Promise<Profile> {
  const hasId = !!payload.id;
  const url = hasId ? `${API_URL}/api/profiles/${payload.id}` : `${API_URL}/api/profile`;
  const method = hasId ? "PUT" : payload.id === undefined && (await getProfile()) ? "PUT" : "POST";
  const finalUrl = method === "PUT" && !hasId ? `${API_URL}/api/profile` : url;
  const res = await fetch(finalUrl, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleRes<Profile>(res);
}

export async function updateProfile(id: number, payload: Partial<Profile>): Promise<Profile> {
  const res = await fetch(`${API_URL}/api/profiles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleRes<Profile>(res);
}

export function crudFactory<T>(base: string) {
  return {
    list: async (): Promise<T[]> => {
      const res = await fetch(`${API_URL}${base}`);
      return handleRes<T[]>(res);
    },
    create: async (payload: any): Promise<T> => {
      const res = await fetch(`${API_URL}${base}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      return handleRes<T>(res);
    },
    update: async (id: number, payload: any): Promise<T> => {
      const res = await fetch(`${API_URL}${base}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      return handleRes<T>(res);
    },
    del: async (id: number): Promise<void> => {
      const res = await fetch(`${API_URL}${base}/${id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      if (!res.ok && res.status !== 204) {
        const data = (await res.json().catch(() => null)) as ApiError | null;
        throw new Error(data?.message || "Delete failed");
      }
    },
  };
}

export const experiencesApi = crudFactory<Experience>("/api/experiences");
export const projectsApi = crudFactory<Project>("/api/projects");
export const skillGroupsApi = crudFactory<SkillGroup>("/api/skill-groups");
export const educationsApi = crudFactory<Education>("/api/educations");
export const certificationsApi = crudFactory<Certification>("/api/certifications");
export const profilesApi = crudFactory<Profile>("/api/profiles");
