import { api, User } from "@/lib/api";

export async function resolveOnboardingPath(user: User): Promise<string> {
  console.log(user);
  if (user.role === "CANDIDATE") {
    const profiles = await api.candidate.get().catch(() => []);
    return profiles.length > 0 ? "/" : "/candidate/profile";
  }

  if (user.role === "RECRUITER") {
    const recruiterProfiles = await api.recruiter.get().catch(() => []);
    console.log(recruiterProfiles);

    if (recruiterProfiles.length === 0) {
      return "/recruiter/profile";
    }

    const companies = await api.company.get().catch(() => []);
    return companies.length > 0
      ? "/recruiter/dashboard"
      : "/recruiter/create-company";
  }

  return "/";
}
