/**
 * SEO utilities for BattleForge
 */

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
  title: "BattleForge - Web-Based Embedded Compiler",
  description:
    "Free browser-based C compiler for embedded systems. Compile firmware for STM32, ESP32, and other microcontrollers directly in your browser.",
  keywords: [
    "embedded compiler",
    "web compiler",
    "STM32 compiler",
    "ESP32 compiler",
    "WASM compiler",
    "browser IDE",
    "firmware compiler",
  ],
  ogImage: "/battleforge.png",
  type: "website",
};

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
    url: `https://battleforge.battlewithbytes.io${url}`,
  };
}
