#!/usr/bin/env node
/**
 * Compte les passages des robots des moteurs IA (ChatGPT, Claude, Perplexity…) et des moteurs
 * classiques (Google, Bing) à partir des journaux nginx du VPS → data/ai-bots.json
 *
 * Lancé toutes les heures par le cron root du VPS. Lit access.log, access.log.1 et access.log.2.gz,
 * ce qui couvre les deux derniers jours complets ; pour chaque jour on garde le compte le plus élevé
 * (un jour à cheval sur une rotation des journaux n'est ainsi jamais sous-compté).
 *
 * Usage : node scripts/ai-bots-stats.mjs [--log-dir=/var/log/nginx]
 */
import fs from "fs";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = path.join(ROOT, "data", "ai-bots.json");
const LOG_DIR = process.argv.find((a) => a.startsWith("--log-dir="))?.split("=")[1] ?? "/var/log/nginx";
const KEEP_DAYS = 120;
const TOP_PAGES = 40;

// kind : "live" = un utilisateur a posé une question et l'IA lit la page en direct ;
//        "index" = indexation pour la recherche de l'IA ; "training" = collecte pour l'entraînement.
export const BOTS = [
  { key: "chatgpt-user", re: /ChatGPT-User/i, group: "OpenAI", kind: "live" },
  { key: "oai-searchbot", re: /OAI-SearchBot/i, group: "OpenAI", kind: "index" },
  { key: "gptbot", re: /GPTBot/i, group: "OpenAI", kind: "training" },
  { key: "claude-user", re: /Claude-User/i, group: "Anthropic", kind: "live" },
  { key: "claude-searchbot", re: /Claude-SearchBot/i, group: "Anthropic", kind: "index" },
  { key: "claudebot", re: /ClaudeBot/i, group: "Anthropic", kind: "training" },
  { key: "perplexity-user", re: /Perplexity-User/i, group: "Perplexity", kind: "live" },
  { key: "perplexitybot", re: /PerplexityBot/i, group: "Perplexity", kind: "index" },
  { key: "mistralai-user", re: /MistralAI-User/i, group: "Mistral", kind: "live" },
  { key: "duckassistbot", re: /DuckAssistBot/i, group: "DuckDuckGo", kind: "live" },
  { key: "meta-externalagent", re: /meta-external(agent|fetcher)/i, group: "Meta", kind: "training" },
  { key: "applebot", re: /Applebot/i, group: "Apple", kind: "index" },
  { key: "amazonbot", re: /Amazonbot/i, group: "Amazon", kind: "index" },
  { key: "bytespider", re: /Bytespider/i, group: "ByteDance", kind: "training" },
  { key: "ccbot", re: /CCBot/i, group: "Common Crawl", kind: "training" },
  { key: "googlebot", re: /Googlebot|Google-InspectionTool|GoogleOther/i, group: "Google", kind: "index" },
  { key: "bingbot", re: /bingbot|msnbot|adidxbot/i, group: "Bing", kind: "index" },
];

const MONTHS = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
const LINE_RE = /^\S+ \S+ \S+ \[(\d{2})\/(\w{3})\/(\d{4}):[^\]]*\] "(?:GET|HEAD) (\S+)[^"]*" (\d{3}) \S+ "[^"]*" "([^"]*)"/;
// Pages du site Next uniquement (le même journal contient d'autres sites et les fichiers techniques)
const IGNORE_PATH = /^\/(_next|wp-|images\/|api\/|graphql|xmlrpc|favicon|manifest|sw\.js|workbox|OneSignal|pdf\.worker)|\.(js|css|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|map|txt|xml|json)(\?|$)/i;

function readLog(file) {
  const p = path.join(LOG_DIR, file);
  if (!fs.existsSync(p)) return "";
  const buf = fs.readFileSync(p);
  return file.endsWith(".gz") ? zlib.gunzipSync(buf).toString("utf8") : buf.toString("utf8");
}

function load() {
  try {
    const s = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return { days: s.days ?? {}, pages: s.pages ?? {} };
  } catch {
    return { days: {}, pages: {} };
  }
}

function main() {
  const counts = {}; // date → bot → n
  const pages = {}; // date → path → n (robots IA « live » et « index », hors Google/Bing)

  for (const file of ["access.log.2.gz", "access.log.1", "access.log"]) {
    for (const line of readLog(file).split("\n")) {
      const m = line.match(LINE_RE);
      if (!m) continue;
      const [, dd, mon, yyyy, reqPath, status, ua] = m;
      if (status !== "200" && status !== "304") continue;
      if (IGNORE_PATH.test(reqPath)) continue;
      const bot = BOTS.find((b) => b.re.test(ua));
      if (!bot) continue;
      const date = `${yyyy}-${MONTHS[mon]}-${dd}`;
      (counts[date] ??= {})[bot.key] = (counts[date][bot.key] ?? 0) + 1;
      if (bot.group !== "Google" && bot.group !== "Bing" && bot.kind !== "training") {
        const p = reqPath.split("?")[0].slice(0, 200);
        (pages[date] ??= {})[p] = (pages[date][p] ?? 0) + 1;
      }
    }
  }

  const db = load();
  for (const [date, bots] of Object.entries(counts)) {
    db.days[date] ??= {};
    for (const [k, n] of Object.entries(bots)) db.days[date][k] = Math.max(db.days[date][k] ?? 0, n);
  }
  for (const [date, byPath] of Object.entries(pages)) {
    const merged = { ...(db.pages[date] ?? {}) };
    for (const [p, n] of Object.entries(byPath)) merged[p] = Math.max(merged[p] ?? 0, n);
    db.pages[date] = Object.fromEntries(Object.entries(merged).sort((a, b) => b[1] - a[1]).slice(0, TOP_PAGES));
  }

  const limit = new Date(Date.now() - KEEP_DAYS * 86_400_000).toISOString().slice(0, 10);
  for (const k of Object.keys(db.days)) if (k < limit) delete db.days[k];
  for (const k of Object.keys(db.pages)) if (k < limit) delete db.pages[k];

  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify({ updatedAt: new Date().toISOString(), ...db }));
  fs.renameSync(tmp, DATA_FILE);
  console.log(`${new Date().toISOString()} — ${Object.keys(counts).length} jour(s) mis à jour`);
}

main();
