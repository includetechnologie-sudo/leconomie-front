// Identité du média pour les moteurs de recherche et les IA (JSON-LD schema.org)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export const ORGANIZATION_LOGO = {
  "@type": "ImageObject",
  "url": `${SITE_URL}/images/logo.png`,
  "width": 3110,
  "height": 711,
};

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "@id": ORGANIZATION_ID,
  "name": "L'Economie",
  "url": SITE_URL,
  "logo": ORGANIZATION_LOGO,
  "description": "Le premier quotidien économique de la zone CEMAC : actualité économique, financière et des marchés au Cameroun et en Afrique centrale.",
  "foundingDate": "2010",
  "inLanguage": "fr",
  "areaServed": ["CM", "GA", "CG", "TD", "CF", "GQ"],
  "email": "contact@leconomie.info",
  "telephone": "+237693537690",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Congeni Mvog-Ada, en face de l'entrée de l'hôtel Le Best",
    "addressLocality": "Yaoundé",
    "addressCountry": "CM",
  },
  "contactPoint": [
    { "@type": "ContactPoint", "contactType": "newsroom", "email": "redaction@leconomie.info", "availableLanguage": "fr" },
    { "@type": "ContactPoint", "contactType": "customer service", "email": "contact@leconomie.info", "telephone": "+237693537690", "availableLanguage": "fr" },
  ],
  "publishingPrinciples": `${SITE_URL}/politique-editoriale`,
  "ethicsPolicy": `${SITE_URL}/politique-editoriale`,
  "correctionsPolicy": `${SITE_URL}/corrections`,
  "sameAs": [
    "https://www.facebook.com/leconomiecmr",
    "https://x.com/leconomie_quo",
    "https://www.linkedin.com/company/l-economie-news-tv",
    "https://www.youtube.com/@LEconomieTV",
  ],
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  "url": SITE_URL,
  "name": "L'Economie",
  "inLanguage": "fr",
  "publisher": { "@id": ORGANIZATION_ID },
  "potentialAction": {
    "@type": "SearchAction",
    "target": { "@type": "EntryPoint", "urlTemplate": `${SITE_URL}/recherche?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

// Comptes WordPress qui signent au nom du journal plutôt qu'une personne
const REDACTION_AUTHOR_SLUGS = ["economie"];

export function isRedactionAuthor(slug: string | undefined): boolean {
  return !!slug && REDACTION_AUTHOR_SLUGS.includes(slug);
}
