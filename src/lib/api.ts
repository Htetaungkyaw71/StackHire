const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

export interface User {
  id: string;
  email: string;
  role: "ADMIN" | "RECRUITER" | "CANDIDATE";
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  isRemote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  techStack: string[];
  level: string;
  type: string;
  companyId: string;
  postedById: string;
  company?: { name: string; location: string; website?: string; industry?: string };
  createdAt?: string;
}

export interface Application {
  id: string;
  status: "APPLIED" | "SHORTLISTED" | "INTERVIEW" | "OFFER" | "REJECTED";
  jobId: string;
  userId: string;
  job?: Job;
  user?: User;
  candidateProfile?: CandidateProfile;
  createdAt?: string;
}

export interface CandidateProfile {
  id?: string;
  headline: string;
  description: string;
  location: string;
  openToRemote: boolean;
  expectedSalary: number;
  availability: string;
  jobStatus: string;
  visibility: string;
  skills: Skill[];
  languages: Language[];
  experiences: Experience[];
  userId?: string;
}

export interface Skill {
  name: string;
  level: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface RecruiterProfile {
  id?: string;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  userId?: string;
  companyId?: string;
}

export interface Company {
  id?: string;
  name: string;
  description: string;
  website: string;
  industry: string;
  size: string;
  foundedYear: number;
  location: string;
  hiringStatus: string;
  verified: boolean;
  ownerId?: string;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    register: (email: string, password: string, role: string) =>
      request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify({ email, password, role }) }),
  },
  jobs: {
    list: () => request<Job[]>("/jobs"),
    get: (id: string) => request<Job>(`/jobs/${id}`),
    create: (data: Partial<Job>) => request<Job>("/jobs", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Job>) => request<Job>(`/jobs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/jobs/${id}`, { method: "DELETE" }),
  },
  applications: {
    getForJob: (jobId: string) => request<Application[]>(`/application/${jobId}`),
    apply: (jobId: string) => request<Application>("/application", { method: "POST", body: JSON.stringify({ jobId }) }),
  },
  candidate: {
    get: () => request<CandidateProfile[]>("/candidate"),
    create: (data: CandidateProfile) => request<CandidateProfile>("/candidate", { method: "POST", body: JSON.stringify(data) }),
    update: (data: Partial<CandidateProfile>) => request<CandidateProfile>("/candidate", { method: "PUT", body: JSON.stringify(data) }),
  },
  recruiter: {
    get: () => request<RecruiterProfile[]>("/recruiter"),
    create: (data: RecruiterProfile) => request<RecruiterProfile>("/recruiter", { method: "POST", body: JSON.stringify(data) }),
    update: (data: Partial<RecruiterProfile>) => request<RecruiterProfile>("/recruiter", { method: "PUT", body: JSON.stringify(data) }),
  },
  company: {
    get: () => request<Company[]>("/company"),
    create: (data: Partial<Company>) => request<Company>("/company", { method: "POST", body: JSON.stringify(data) }),
    update: (data: Partial<Company>) => request<Company>("/company", { method: "PUT", body: JSON.stringify(data) }),
    delete: () => request<void>("/company", { method: "DELETE" }),
  },
};
