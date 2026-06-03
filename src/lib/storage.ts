import type { Project } from "@/config/projects";

const PROJECTS_KEY = "nexo_user_projects";
const PROFILES_KEY = "nexo_user_profiles";

// ─── Proyectos por usuario ───

export function getUserProjects(authorId: string): Project[] {
  const all = JSON.parse(localStorage.getItem(PROJECTS_KEY) || "{}");
  return all[authorId] || [];
}

export function saveUserProject(authorId: string, project: Project): void {
  const all = JSON.parse(localStorage.getItem(PROJECTS_KEY) || "{}");
  if (!all[authorId]) all[authorId] = [];
  all[authorId] = all[authorId].filter((p: Project) => p.id !== project.id);
  all[authorId].push(project);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(all));
}

export function deleteUserProject(authorId: string, projectId: string): void {
  const all = JSON.parse(localStorage.getItem(PROJECTS_KEY) || "{}");
  if (all[authorId]) {
    all[authorId] = all[authorId].filter((p: Project) => p.id !== projectId);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(all));
  }
}

// ─── Perfiles editables por usuario ───

export interface ContactInfo {
  instagram?: string;
  behance?: string;
  linkedin?: string;
  portfolio?: string;
  email?: string;
}

export interface UserProfileData {
  bio: string;
  location: string;
  interests: string[];
  contact?: ContactInfo;
}

export function getUserProfile(googleSub: string): UserProfileData | null {
  const all = JSON.parse(localStorage.getItem(PROFILES_KEY) || "{}");
  return all[googleSub] || null;
}

export function saveUserProfile(googleSub: string, data: UserProfileData): void {
  const all = JSON.parse(localStorage.getItem(PROFILES_KEY) || "{}");
  all[googleSub] = data;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(all));
}
