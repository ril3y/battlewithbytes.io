/**
 * SEO utilities for serial-terminal app
 */

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
    url: `https://battlewithbytes.io/tools/serial-terminal${url}`,
  };
}
