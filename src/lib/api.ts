const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const responseCache = new Map<string, unknown>();
const inFlightRequests = new Map<string, Promise<unknown>>();

const readErrorMessage = async (res: Response) => {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await res.json().catch(() => ({}));
    return body.message || `Request failed: ${res.status}`;
  }

  const text = await res.text().catch(() => "");
  return text.trim() || `Request failed: ${res.status}`;
};

export const clearApiCache = () => {
  responseCache.clear();
  inFlightRequests.clear();
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const cacheKey = `${method}:${endpoint}`;

  if (method === "GET") {
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse !== undefined) {
      return cachedResponse as T;
    }

    const inFlightRequest = inFlightRequests.get(cacheKey);
    if (inFlightRequest) {
      return inFlightRequest as Promise<T>;
    }
  } else {
    clearApiCache();
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  const requestPromise = (async () => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: "include",
      headers,
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res));
    }

    if (res.status === 204) return {} as T;
    return res.json() as Promise<T>;
  })();

  if (method === "GET") {
    inFlightRequests.set(cacheKey, requestPromise);
  }

  try {
    const data = await requestPromise;

    if (method === "GET") {
      responseCache.set(cacheKey, data);
    }

    return data;
  } finally {
    if (method === "GET") {
      inFlightRequests.delete(cacheKey);
    }
  }
}

export interface User {
  id: string;
  email: string;
  role: "ADMIN" | "RECRUITER" | "CANDIDATE";
  createdAt: string;
}

export interface CandidateProfile {
  id?: string;
  fullName: string;
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

export interface ApplicationUser extends User {
  candidateProfile?: CandidateProfile;
}

export interface AuthResponse {
  token?: string;
  user: User;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  isRemote: boolean;
  salary?: string | null;
  externalJob?: boolean;
  applyLink?: string | null;
  logo?: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  techStack: string[];
  level: string;
  type: string;
  companyId: string;
  postedById: string;
  company_name?: string | null;
  company?: {
    name: string;
    location: string;
    website?: string;
    industry?: string;
  };
  createdAt?: string;
}

export type JobWritePayload = Omit<Partial<Job>, "salaryMin" | "salaryMax"> & {
  salaryMin?: string | number;
  salaryMax?: string | number;
};

export interface Application {
  id: string;
  status: "APPLIED" | "SHORTLISTED" | "INTERVIEW" | "OFFER" | "REJECTED";
  name?: string | null;
  email?: string | null;
  cv_url?: string | null;
  jobId: string;
  userId: string;
  job?: Job;
  user?: ApplicationUser;
  candidateProfile?: CandidateProfile;
  createdAt?: string;
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
  title?: string;
  company?: string;
  role?: string;
  companyName?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  isCurrent?: boolean;
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

export interface UploadSignature {
  signature: string;
  timestamp: number;
  folder: string;
}

export interface JobsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface JobsListPaginatedResponse {
  data: Job[];
  pagination: JobsPagination;
}

export interface JobsListParams {
  page: number;
  limit: number;
  type?: string;
  level?: string;
  isRemote?: boolean;
  minSalary?: number;
  search?: string;
  tech?: string[];
  sort?: "newest" | "salary";
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, role: string) =>
      request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, role }),
      }),
    verifyOtp: (email: string, code: string, password: string, role: string) =>
      request<AuthResponse>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, code, password, role }),
      }),
    resendOtp: (email: string) =>
      request<{ message: string; expiresIn: number }>("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    forgotPassword: (email: string) =>
      request<{ message: string; expiresIn: number }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    resetPassword: (email: string, code: string, newPassword: string) =>
      request<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, code, newPassword }),
      }),
  },
  jobs: {
    list: () => request<Job[]>("/jobs"),
    listPaginated: (params: JobsListParams) => {
      const query = new URLSearchParams({
        page: String(params.page),
        limit: String(params.limit),
      });

      if (params.type) query.set("type", params.type);
      if (params.level) query.set("level", params.level);
      if (params.isRemote !== undefined) {
        query.set("isRemote", String(params.isRemote));
      }
      if (params.minSalary !== undefined) {
        query.set("minSalary", String(params.minSalary));
      }
      if (params.search) query.set("search", params.search);
      if (params.tech && params.tech.length > 0) {
        query.set("tech", params.tech.join(","));
      }
      if (params.sort) query.set("sort", params.sort);

      return request<JobsListPaginatedResponse>(`/jobs?${query.toString()}`);
    },
    get: (id: string) => request<Job>(`/jobs/${id}`),
    create: (data: JobWritePayload) =>
      request<Job>("/jobs", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: JobWritePayload) =>
      request<Job>(`/jobs/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request<void>(`/jobs/${id}`, { method: "DELETE" }),
  },
  applications: {
    getMine: () => request<Application[]>("/application/me"),
    getForJob: (jobId: string) =>
      request<Application[]>(`/application/${jobId}`),
    apply: (data: {
      jobId: string;
      name: string;
      email: string;
      cv_url: string;
    }) =>
      request<Application>("/application", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  candidate: {
    get: () => request<CandidateProfile[]>("/candidate"),
    create: (data: CandidateProfile) =>
      request<CandidateProfile>("/candidate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (data: Partial<CandidateProfile>) =>
      request<CandidateProfile>("/candidate", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
  recruiter: {
    get: () => request<RecruiterProfile[]>("/recuriter"),
    create: (data: RecruiterProfile) =>
      request<RecruiterProfile>("/recuriter", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (data: Partial<RecruiterProfile>) =>
      request<RecruiterProfile>("/recuriter", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
  company: {
    get: () => request<Company[]>("/company"),
    create: (data: Partial<Company>) =>
      request<Company>("/company", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (data: Partial<Company>) =>
      request<Company>("/company", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: () => request<void>("/company", { method: "DELETE" }),
  },
  uploads: {
    getSignature: () => request<UploadSignature>("/uploads/signature"),
  },
};
