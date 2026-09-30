import fs from "fs";
import path from "path";

// Vidéos de la chaîne YouTube « L'Economie TV », archivées par scripts/youtube-sync.mjs (cron du VPS)
// dans data/youtube-videos.json, et republiées sur leconomie.info/videos pour le référencement.

export const YT_CHANNEL_ID = "UCQOk7FfVumWv2RLw9yIx2SQ";
export const YT_CHANNEL_URL = `https://www.youtube.com/channel/${YT_CHANNEL_ID}`;

export interface YtVideo {
  id: string; // identifiant YouTube (11 caractères)
  title: string;
  description: string;
  published: string; // ISO avec fuseau
  updated: string;
  views: number | null;
  isShort: boolean;
}

export function getVideos(): YtVideo[] {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "youtube-videos.json"), "utf8"));
    return ((raw.videos ?? []) as YtVideo[]).sort((a, b) => b.published.localeCompare(a.published));
  } catch {
    return [];
  }
}

function slugify(s: string): string {
  return s
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

/** /videos/{titre-en-slug}-{id} : lisible pour les moteurs, l'identifiant YouTube fait foi */
export function videoSlug(v: Pick<YtVideo, "id" | "title">): string {
  const s = slugify(v.title);
  return s ? `${s}-${v.id}` : v.id;
}

export function findVideo(slug: string): YtVideo | null {
  const id = slug.slice(-11);
  return getVideos().find((v) => v.id === id) ?? null;
}

export const thumbnail = (id: string, quality: "maxresdefault" | "hqdefault" = "hqdefault") =>
  `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
export const embedUrl = (id: string) => `https://www.youtube.com/embed/${id}`;
export const watchUrl = (v: Pick<YtVideo, "id" | "isShort">) =>
  v.isShort ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`;

/** Première ligne ou phrase utile de la description, pour les aperçus */
export function shortDescription(v: YtVideo, max = 160): string {
  const text = v.description.replace(/#\S+/g, "").replace(/\s+/g, " ").trim();
  if (!text) return v.title;
  return text.length > max ? `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…` : text;
}
