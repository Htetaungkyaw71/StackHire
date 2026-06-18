import { useEffect } from "react";

type SeoOptions = {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  noindex?: boolean;
};

const setMetaTag = (
  selector: string,
  attributes: Record<string, string>,
  content?: string,
) => {
  if (typeof document === "undefined") return null;

  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => {
      element?.setAttribute(key, value);
    });
    element.setAttribute("data-seo-managed", "true");
    document.head.appendChild(element);
  }

  if (content !== undefined) {
    element.setAttribute("content", content);
  }

  return element;
};

const setLinkTag = (rel: string, href?: string) => {
  if (typeof document === "undefined") return null;

  let element =
    document.head.querySelector<HTMLLinkElement>(
      `link[rel="${rel}"][data-seo-managed="true"]`,
    ) || document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!href) {
    element?.remove();
    return null;
  }

  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    element.setAttribute("data-seo-managed", "true");
    document.head.appendChild(element);
  }

  element.href = href;
  return element;
};

export function useSeo({
  title,
  description,
  canonical,
  image,
  noindex,
}: SeoOptions) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const previousTitle = document.title;
    document.title = title;

    setMetaTag(
      'meta[name="description"]',
      { name: "description" },
      description,
    );
    setMetaTag('meta[property="og:title"]', { property: "og:title" }, title);
    setMetaTag(
      'meta[property="og:description"]',
      { property: "og:description" },
      description,
    );
    setMetaTag('meta[property="og:type"]', { property: "og:type" }, "website");
    setMetaTag('meta[property="og:url"]', { property: "og:url" }, canonical);
    setMetaTag('meta[property="og:image"]', { property: "og:image" }, image);
    setMetaTag('meta[name="twitter:title"]', { name: "twitter:title" }, title);
    setMetaTag(
      'meta[name="twitter:description"]',
      { name: "twitter:description" },
      description,
    );
    setMetaTag('meta[name="twitter:image"]', { name: "twitter:image" }, image);
    setMetaTag(
      'meta[name="robots"]',
      { name: "robots" },
      noindex ? "noindex,nofollow" : "index,follow",
    );
    setLinkTag("canonical", canonical);

    return () => {
      document.title = previousTitle;
      document.head
        .querySelectorAll('[data-seo-managed="true"]')
        .forEach((element) => element.remove());
    };
  }, [canonical, description, image, noindex, title]);
}
