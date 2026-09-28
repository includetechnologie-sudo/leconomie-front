import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

const DISALLOW = ["/api/", "/mon-compte", "/lecture", "/paiement-succes"];

// Robots des moteurs de réponse IA, nommés explicitement : L'Economie veut être lue et citée
// par Gemini, ChatGPT, Claude, Perplexity… Les articles premium restent protégés (seul le chapô est servi).
const AI_BOTS = [
  "OAI-SearchBot", "ChatGPT-User", "GPTBot",
  "Claude-SearchBot", "Claude-User", "ClaudeBot",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_BOTS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/sitemap-news.xml`],
    host: SITE_URL,
  };
}
