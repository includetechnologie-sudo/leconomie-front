// Le domaine technique WordPress (*.hostingersite.com) est classé « suspect » par certains filtres
// d'entreprise (Symantec chez la BEAC…) : les lecteurs ne doivent jamais le contacter. Les médias passent
// par leconomie.info/wp-content/ (proxy nginx avec cache) et les liens internes par leconomie.info.
const WP_HOST_RE = /https?:(?:\\?\/){2}teal-horse-411567\.hostingersite\.com/g;
const PUBLIC_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

/** Remplace le domaine technique WordPress par leconomie.info dans un texte (JSON, HTML…) */
export function toPublicUrls(text: string): string {
  return text.replace(WP_HOST_RE, PUBLIC_ORIGIN);
}
