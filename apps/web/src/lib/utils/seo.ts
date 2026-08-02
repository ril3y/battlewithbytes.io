/**
 * SEO utilities for Battle With Bytes
 * Helps generate consistent metadata across the site
 */

import type { Metadata } from "next";

/** Canonical origin for the deployed site (matches public/CNAME). */
export const SITE_URL = "https://battlewithbytes.io";

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  type?: "website" | "article" | "tool";
  publishedAt?: string;
  updatedAt?: string;
}

/**
 * Default SEO values
 */
export const defaultSEO: SEOProps = {
  title: "Battle With Bytes | Cybersecurity, Hardware & Software Engineering",
  description:
    "Explore cybersecurity concepts, hardware projects, and software engineering tools with interactive calculators and in-depth tutorials.",
  keywords: [
    "cybersecurity",
    "embedded hardware",
    "software engineering",
    "electronics",
    "programming",
    "engineering tools",
    "MOSFET calculator",
    "Ohm's Law calculator",
  ],
  // Purpose-built 1200x630 card; the square logo gets cropped by scrapers
  ogImage: "/images/og-image.png",
  type: "website",
};

/**
 * Generate metadata for a page
 * @param props Custom SEO properties for the page
 * @returns Complete SEO metadata object
 */
export function generateSEO(props: Partial<SEOProps> = {}): SEOProps {
  return {
    ...defaultSEO,
    ...props,
    // Ensure title has site name if not already included
    title: props.title
      ? props.title.includes("Battle With Bytes")
        ? props.title
        : `${props.title} | Battle With Bytes`
      : defaultSEO.title,
    // Combine keywords
    keywords: [...(defaultSEO.keywords || []), ...(props.keywords || [])],
  };
}

/**
 * Build a Next.js Metadata object from SEO props, including OpenGraph,
 * Twitter card, and canonical URL. Relative image/canonical paths resolve
 * against metadataBase (set in the root layout).
 */
export function buildMetadata(props: Partial<SEOProps> = {}): Metadata {
  const seo = generateSEO(props);
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonical,
      type: seo.type === "article" ? "article" : "website",
      // Only the shared card has known dimensions; per-page covers vary,
      // so let scrapers measure those themselves
      images: seo.ogImage
        ? [
            seo.ogImage === defaultSEO.ogImage
              ? { url: seo.ogImage, width: 1200, height: 630 }
              : { url: seo.ogImage },
          ]
        : [],
      siteName: "Battle With Bytes",
      ...(seo.type === "article" && seo.publishedAt
        ? { publishedTime: seo.publishedAt, modifiedTime: seo.updatedAt }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : [],
    },
    ...(seo.canonical ? { alternates: { canonical: seo.canonical } } : {}),
  };
}

/**
 * Generate structured data for tools
 * @param name Tool name
 * @param description Tool description
 * @param url Tool URL
 * @returns JSON-LD structured data
 */
export function generateToolSchema(
  name: string,
  description: string,
  url: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: name,
    description: description,
    applicationCategory: "EngineeringApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: `https://battlewithbytes.io${url}`,
  };
}

/**
 * Generate structured data for blog articles
 * @param title Article title
 * @param description Article description
 * @param url Article URL
 * @param publishedAt Publication date
 * @param updatedAt Last update date
 * @param imageUrl Featured image URL
 * @returns JSON-LD structured data
 */
export function generateArticleSchema(
  title: string,
  description: string,
  url: string,
  publishedAt: string,
  updatedAt?: string,
  imageUrl?: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description,
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    image: imageUrl ? `https://battlewithbytes.io${imageUrl}` : undefined,
    url: `https://battlewithbytes.io${url}`,
    author: {
      "@type": "Person",
      name: "Battle With Bytes",
    },
    publisher: {
      "@type": "Organization",
      name: "Battle With Bytes",
      logo: {
        "@type": "ImageObject",
        url: "https://battlewithbytes.io/images/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://battlewithbytes.io${url}`,
    },
  };
}
