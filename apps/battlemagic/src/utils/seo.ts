/**
 * SEO utilities for BattleMagic
 */

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  type?: "website" | "article" | "tool";
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
