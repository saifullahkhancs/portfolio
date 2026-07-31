// Base URL of the Flask API. Set VITE_API_URL in .env / Vercel project settings,
// e.g. VITE_API_URL=https://api.yourdomain.com
//
// Static-deploy workflow: leave VITE_API_URL EMPTY (or unset) in the Vercel
// project. In production that resolves to "" — the public getters below then
// skip the network call entirely and return fallback.ts data instantly (no
// failed localhost requests, no mixed-content/console errors). In local dev
// it defaults to the local backend so the dashboard can edit live data.
// @ts-ignore vite import.meta.env
const _RAW_API_URL = ((import.meta as any).env?.VITE_API_URL || "").trim();
export const API_URL = _RAW_API_URL || (import.meta.env.DEV ? "http://localhost:8000" : "");

// static fallback that lives in src/data/fallback.ts – avoids blank screen when backend is down
import {
  fallbackPortfolio as _fallback,
  fallbackProfile as _fallbackProfile,
  fallbackExperiences as _fallbackExperiences,
  fallbackProjects as _fallbackProjects,
  fallbackSkills as _fallbackSkills,
  fallbackEducations as _fallbackEducations,
  fallbackCertifications as _fallbackCertifications,
} from "@/data/fallback";
// re-export for convenience
export const fallbackPortfolio = _fallback;
export const fallbackProfile = _fallbackProfile;
export const fallbackExperiences = _fallbackExperiences;
export const fallbackProjects = _fallbackProjects;
export const fallbackSkills = _fallbackSkills;
export const fallbackEducations = _fallbackEducations;
export const fallbackCertifications = _fallbackCertifications;

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export interface ApiError {
  message: string;
}

export interface UploadResponse {
  url: string;
  path: string;
  filename: string;
  content_type: string;
  size: number;
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

export async function uploadMedia(file: File, kind = "media"): Promise<UploadResponse> {
  const body = new FormData();
  body.append("file", file);
  body.append("kind", kind);

  const res = await fetch(`${API_URL}/api/uploads`, {
    method: "POST",
    headers: { ...authHeaders() },
    body,
  });

  return handleRes<UploadResponse>(res);
}

// ----- public GET with graceful fallback to static data so UI never goes blank -----

// When no backend is configured (static-only deployment), short-circuit to the
// fallback instantly instead of firing a request that will fail. The catch
// blocks below cover the local-dev case where a backend IS configured but
// unreachable, so the UI can never go blank either way.
export async function getPortfolio(): Promise<PortfolioData> {
  if (!API_URL) return _fallback as PortfolioData;
  try {
    if (import.meta.env.DEV) console.log(`[api] fetching ${API_URL}/api/portfolio from origin ${typeof window !== 'undefined' ? window.location.origin : 'ssr'}`);
    const res = await fetch(`${API_URL}/api/portfolio`);
    if (import.meta.env.DEV) console.log(`[api] /api/portfolio -> ${res.status} ${res.statusText}, CORS ok? headers:`, [...res.headers.entries()].slice(0,5));
    if (!res.ok) throw new Error(`Failed to load portfolio: ${res.status}`);
    const json = (await res.json()) as PortfolioData;
    if (import.meta.env.DEV) console.log(`[api] portfolio data`, { profile: !!json.profile, exp: json.experiences?.length, proj: json.projects?.length });
    // if backend returns empty arrays, merge with fallback so page still renders
    return {
      profile: json.profile || _fallback.profile,
      experiences: json.experiences?.length ? json.experiences : _fallback.experiences,
      projects: json.projects?.length ? json.projects : _fallback.projects,
      skill_groups: (json.skill_groups?.length ? json.skill_groups : _fallback.skill_groups) as any,
      skills: (json.skills?.length ? json.skills : (json.skill_groups?.length ? json.skill_groups : _fallback.skills)) as any,
      educations: json.educations?.length ? json.educations : _fallback.educations,
      education: json.education || json.educations?.[0] || _fallback.education,
      certifications: json.certifications?.length ? json.certifications : _fallback.certifications,
    };
  } catch (e) {
    console.warn(`[api] getPortfolio failed (API_URL=${API_URL}), falling back to static data. Cause:`, e);
    // backend down – return full static fallback, never crash UI
    return _fallback as PortfolioData;
  }
}

export async function getProfile(): Promise<Profile | null> {
  if (!API_URL) return _fallback.profile as Profile;
  try {
    const res = await fetch(`${API_URL}/api/profile`);
    if (!res.ok) throw new Error("no profile");
    const data = await res.json();
    if (!data) return _fallback.profile as Profile;
    return data as Profile;
  } catch {
    // return static profile so header/footer + hero never blank
    return _fallback.profile as Profile;
  }
}

export async function getExperiences(): Promise<Experience[]> {
  if (!API_URL) return _fallback.experiences as any;
  try {
    const res = await fetch(`${API_URL}/api/experiences`);
    const data = await handleRes<Experience[]>(res);
    return data?.length ? data : (_fallback.experiences as any);
  } catch {
    return _fallback.experiences as any;
  }
}

export async function getProjects(): Promise<Project[]> {
  if (!API_URL) return _fallback.projects as any;
  try {
    const res = await fetch(`${API_URL}/api/projects`);
    const data = await handleRes<Project[]>(res);
    return data?.length ? data : (_fallback.projects as any);
  } catch {
    return _fallback.projects as any;
  }
}

export async function getSkillGroups(): Promise<SkillGroup[]> {
  if (!API_URL) return _fallback.skills as any;
  try {
    const res = await fetch(`${API_URL}/api/skill-groups`);
    const data = await handleRes<SkillGroup[]>(res);
    return data?.length ? data : (_fallback.skills as any);
  } catch {
    return _fallback.skills as any;
  }
}

export async function getEducations(): Promise<Education[]> {
  if (!API_URL) return _fallback.educations as any;
  try {
    const res = await fetch(`${API_URL}/api/educations`);
    const data = await handleRes<Education[]>(res);
    return data?.length ? data : (_fallback.educations as any);
  } catch {
    return _fallback.educations as any;
  }
}

export async function getCertifications(): Promise<Certification[]> {
  if (!API_URL) return _fallback.certifications as any;
  try {
    const res = await fetch(`${API_URL}/api/certifications`);
    const data = await handleRes<Certification[]>(res);
    return data?.length ? data : (_fallback.certifications as any);
  } catch {
    return _fallback.certifications as any;
  }
}

// ----- authenticated mutations (dashboard only — require a live backend) -----
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
