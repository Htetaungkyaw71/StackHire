import { useEffect, useMemo, useState } from "react";
import { Job } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const SAVED_JOBS_KEY = "savedJobs";

const readSavedJobs = (storageKey: string): Job[] => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) => item && typeof item.id === "string",
    ) as Job[];
  } catch {
    return [];
  }
};

export const useSavedJobs = () => {
  const { user, isAuthenticated } = useAuth();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const storageKey = user ? `${SAVED_JOBS_KEY}:${user.id}` : "";

  useEffect(() => {
    if (!storageKey || !isAuthenticated) {
      setSavedJobs([]);
      return;
    }

    setSavedJobs(readSavedJobs(storageKey));

    const sync = () => setSavedJobs(readSavedJobs(storageKey));
    window.addEventListener("storage", sync);

    return () => window.removeEventListener("storage", sync);
  }, [storageKey, isAuthenticated]);

  const persist = (jobs: Job[]) => {
    if (!storageKey || !isAuthenticated) return;
    setSavedJobs(jobs);
    localStorage.setItem(storageKey, JSON.stringify(jobs));
  };

  const isSaved = (jobId: string) => savedJobs.some((job) => job.id === jobId);

  const saveJob = (job: Job) => {
    if (isSaved(job.id)) return;
    persist([...savedJobs, job]);
  };

  const removeJob = (jobId: string) => {
    persist(savedJobs.filter((job) => job.id !== jobId));
  };

  const toggleSaved = (job: Job) => {
    if (isSaved(job.id)) {
      removeJob(job.id);
      return false;
    }

    saveJob(job);
    return true;
  };

  const savedJobIds = useMemo(
    () => savedJobs.map((job) => job.id),
    [savedJobs],
  );

  return {
    isAuthenticated,
    savedJobs,
    savedJobIds,
    isSaved,
    saveJob,
    removeJob,
    toggleSaved,
  };
};
