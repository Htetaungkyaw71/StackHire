import { slugify } from "@/lib/utils";

export const SITE_URL =
  import.meta.env.VITE_SITE_URL || "https://www.stackhire.online";

export const DEFAULT_SEO_IMAGE = `${SITE_URL}/stackhire.svg`;

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();

export const searchPath = (term: string) => `/search/${slugify(term)}`;
