#!/usr/bin/env node
/**
 * Veilleur de publication : détecte les articles nouvellement publiés ou modifiés dans WordPress
 * et déclenche /api/internal/on-publish (rafraîchissement du site, IndexNow, notification push…).
 *
 * Remplace le déclencheur WP Webhooks « Post created », qui se déclenchait à la création des
 * brouillons et jamais à la publication. Une seule requête GraphQL légère par passage.
 *
 * Cron du VPS : toutes les 3 minutes. Premier passage : mémorise l'existant sans rien déclencher.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATE_FILE = path.join(ROOT, "data", "publish-watch.json");
const SECRET_FILE = path.join(ROOT, "data", ".internal-secret");
const APP_URL = process.env.APP_URL || "http://127.0.0.1:3000";

function graphqlUrl() {
  if (process.env.GRAPHQL_URL) return process.env.GRAPHQL_URL;
  try {
    const env = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8");
    const m = env.match(/^(?:NEXT_PUBLIC_)?GRAPHQL_URL=(.+)$/m);
    if (m) return m[1].trim();
  } catch { /* pas de .env.local */ }
  return "https://teal-horse-411567.hostingersite.com/graphql";
}

function secret() {
  try {
    const s = fs.readFileSync(SECRET_FILE, "utf8").trim();
    if (s.length >= 32) return s;
  } catch { /* créé ci-dessous */ }
  const s = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(SECRET_FILE, s, { mode: 0o600 });
  return s;
}

const QUERY = `query PublishWatch {
  posts(first: 20, where: { orderby: { field: MODIFIED, order: DESC } }) {
    nodes { slug title excerpt dateGmt modifiedGmt featuredImage { node { sourceUrl } } }
  }
}`;

async function main() {
  const res = await fetch(graphqlUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY }),
  });
  if (!res.ok) throw new Error(`GraphQL ${res.status}`);
  const json = await res.json();
  const posts = json.data?.posts?.nodes ?? [];
  if (!posts.length) throw new Error("aucun article reçu");

  let state = null;
  try { state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8")); } catch { /* premier passage */ }

  const seen = state?.seen ?? {};
  const changed = [];
  // « Nouveau » = jamais vu ET publié depuis moins de 48 h (la correction d'un vieil article n'est
  // qu'une mise à jour : pas de notification aux abonnés)
  const recent = (p) => Date.now() - new Date(`${p.dateGmt}Z`).getTime() < 48 * 3_600_000;
  for (const p of posts) {
    if (!(p.slug in seen)) changed.push({ ...p, isNew: recent(p) });
    else if (seen[p.slug] !== p.modifiedGmt) changed.push({ ...p, isNew: false });
  }
  for (const p of posts) seen[p.slug] = p.modifiedGmt;
  // On ne garde que les 300 derniers slugs vus
  const trimmed = Object.fromEntries(Object.entries(seen).sort((a, b) => String(b[1]).localeCompare(String(a[1]))).slice(0, 300));

  if (state && changed.length) {
    const r = await fetch(`${APP_URL}/api/internal/on-publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-secret": secret() },
      body: JSON.stringify({
        articles: changed.map((p) => ({
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          imageUrl: p.featuredImage?.node?.sourceUrl,
          isNew: p.isNew,
        })),
      }),
    });
    const out = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`on-publish ${r.status} ${JSON.stringify(out)}`);
    console.log(`${new Date().toISOString()} — ${changed.map((p) => `${p.isNew ? "NOUVEAU" : "maj"} ${p.slug}`).join(", ")} → IndexNow ${out.indexnow?.status}, push ${JSON.stringify(out.push?.map((x) => x.ok))}`);
  } else if (!state) {
    console.log(`${new Date().toISOString()} — premier passage : ${posts.length} articles mémorisés, rien déclenché`);
  }

  fs.writeFileSync(STATE_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), seen: trimmed }));
}

main().catch((e) => {
  console.error(`${new Date().toISOString()} — erreur : ${e.message}`);
  process.exit(1);
});
