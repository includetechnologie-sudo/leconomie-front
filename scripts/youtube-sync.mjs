#!/usr/bin/env node
/**
 * Archive les vidéos de la chaîne YouTube « L'Economie TV » dans data/youtube-videos.json.
 * Le flux RSS public de YouTube ne donne que les 15 dernières vidéos : lancé toutes les heures,
 * ce script constitue l'historique au fil du temps (les anciennes vidéos restent archivées).
 *
 * Nouvelles vidéos → /api/internal/on-publish (rafraîchit /videos et prévient les moteurs via IndexNow).
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = path.join(ROOT, "data", "youtube-videos.json");
const SECRET_FILE = path.join(ROOT, "data", ".internal-secret");
const APP_URL = process.env.APP_URL || "http://127.0.0.1:3000";
const CHANNEL_ID = "UCQOk7FfVumWv2RLw9yIx2SQ";

const decode = (s) => s
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const pick = (entry, re) => (entry.match(re) || [])[1] ?? "";

// Même règle que videoSlug() dans src/lib/youtube.ts
function videoSlug(v) {
  const s = v.title.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80).replace(/-+$/, "");
  return s ? `${s}-${v.id}` : v.id;
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

async function main() {
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`);
  if (!res.ok) throw new Error(`RSS YouTube ${res.status}`);
  const xml = await res.text();
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  if (!entries.length) throw new Error("flux vide");

  const fresh = entries.map((e) => ({
    id: pick(e, /<yt:videoId>([^<]+)<\/yt:videoId>/),
    title: decode(pick(e, /<media:title>([^<]*)<\/media:title>/)).trim(),
    description: decode(pick(e, /<media:description>([\s\S]*?)<\/media:description>/)).trim(),
    published: pick(e, /<published>([^<]+)<\/published>/),
    updated: pick(e, /<updated>([^<]+)<\/updated>/),
    views: Number(pick(e, /<media:statistics views="(\d+)"/)) || null,
    isShort: /\/shorts\//.test(pick(e, /<link rel="alternate" href="([^"]+)"/)),
  })).filter((v) => /^[\w-]{11}$/.test(v.id));

  let db = { videos: [] };
  try { db = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); } catch { /* premier passage */ }
  const byId = new Map(db.videos.map((v) => [v.id, v]));
  const added = fresh.filter((v) => !byId.has(v.id));
  const changed = fresh.filter((v) => byId.has(v.id) && (byId.get(v.id).title !== v.title || byId.get(v.id).description !== v.description));
  for (const v of fresh) byId.set(v.id, { ...byId.get(v.id), ...v });


  // Enregistré après la notification : si elle échoue, les vidéos restent « nouvelles » au prochain passage
  const save = () => {
    db = { updatedAt: new Date().toISOString(), videos: [...byId.values()].sort((a, b) => b.published.localeCompare(a.published)) };
    const tmp = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(db, null, 1));
    fs.renameSync(tmp, DATA_FILE);
  };

  const touched = [...added, ...changed];
  if (touched.length) {
    const paths = ["/", "/videos", ...touched.map((v) => `/videos/${videoSlug(v)}`)];
    const r = await fetch(`${APP_URL}/api/internal/on-publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-secret": secret() },
      body: JSON.stringify({ articles: [], paths, urls: paths.slice(1) }),
    });
    const out = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`on-publish ${r.status} ${JSON.stringify(out)}`);
    console.log(`${new Date().toISOString()} — ${added.length} nouvelle(s), ${changed.length} modifiée(s) : ${touched.map((v) => v.id).join(", ")} → IndexNow ${out.indexnow?.status ?? r.status}`);
  }
  save();
}

main().catch((e) => {
  console.error(`${new Date().toISOString()} — erreur : ${e.message}`);
  process.exit(1);
});
