#!/usr/bin/env node
/**
 * Synchronise les cours officiels de la BVMAC (Bourse des Valeurs Mobilières de l'Afrique Centrale).
 *
 * Source : le « Bulletin officiel de la cote » (BOC) publié en PDF chaque jour de séance sur
 *   https://www.bvm-ac.org/wp-content/uploads/AAAA/MM/BOC-AAAAMMJJ.pdf
 * Résultat : data/bvmac.json (historique des séances), lu par la page /marches et le panneau Bourse.
 *
 * Usage (cron sur le VPS, jours ouvrés) :
 *   node scripts/bvmac-sync.mjs              → cherche les bulletins des 10 derniers jours manquants
 *   node scripts/bvmac-sync.mjs --days=60    → rattrapage sur 60 jours
 *   node scripts/bvmac-sync.mjs --file=boc.pdf --date=2026-07-15   → teste l'analyse d'un PDF local
 *
 * Garde-fous : un bulletin dont l'analyse échoue n'est jamais enregistré ; la page garde alors
 * la dernière séance valide (avec sa date). Les téléchargements sont espacés pour ne pas
 * surcharger le site de la BVMAC.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = path.join(ROOT, "data", "bvmac.json");
const BASE = "https://www.bvm-ac.org/wp-content/uploads";
const MAX_SESSIONS = 400;

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  })
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
const iso = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

/** "48 200" → 48200 ; "4,59%" → 4.59 ; "-" ou "" → null */
function num(s) {
  if (s == null) return null;
  const t = String(s).replace(/%/g, "").replace(/\s/g, "").replace(",", ".");
  if (t === "" || t === "-") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

async function pageItems(doc, n) {
  const page = await doc.getPage(n);
  const tc = await page.getTextContent();
  return tc.items
    .filter((i) => i.str.trim())
    .map((i) => ({ x: i.transform[4], y: i.transform[5], s: i.str.trim() }));
}

// Colonnes du tableau « Marché des actions » (bornes en x, cellules alignées à droite)
const ACTION_COLUMNS = [
  ["coursPrecedent", 200, 265],
  ["datePrecedente", 265, 300],
  ["volumeDemande", 300, 326],
  ["volumeOffert", 326, 355],
  ["volume", 355, 380],
  ["valeur", 380, 430],
  ["transactions", 430, 442],
  ["statut", 442, 465],
  ["ouverture", 465, 500],
  ["cours", 500, 540],
  ["seuilHaut", 540, 580],
  ["seuilBas", 580, 620],
  ["variationPct", 630, 675],
  ["coursReferenceSuivant", 675, 705],
  ["plusHautAnnee", 705, 740],
  ["plusBasAnnee", 740, 780],
  ["variationAnneePct", 780, 900],
];

function parseActions(items) {
  const isinRe = /^([A-Z]{2})\s?(\d{6})$/;
  const actions = [];
  for (const it of items) {
    const m = it.s.match(isinRe);
    if (!m || it.x > 140) continue;
    // Suite de l'ISIN (chiffres, parfois découpés en plusieurs morceaux), puis mnémonique
    const sameLine = items.filter((o) => Math.abs(o.y - it.y) < 1.5 && o.x > it.x && o.x < 230).sort((a, b) => a.x - b.x);
    let isin = m[1] + m[2];
    let k = 0;
    while (k < sameLine.length && isin.length < 12 && /^[\d\s]+$/.test(sameLine[k].s)) isin += sameLine[k++].s.replace(/\s/g, "");
    const mnemo = (sameLine[k]?.s ?? "").replace(/\s/g, "");
    // Nom de l'émetteur : colonne de gauche, sur 1 à 3 lignes autour de la ligne de l'ISIN
    const nom = items
      .filter((o) => o.x < 110 && Math.abs(o.y - it.y) < 12)
      .sort((a, b) => b.y - a.y)
      .map((o) => o.s)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    // Ligne des chiffres : contient la date de la séance précédente
    const dateCell = items.find((o) => Math.abs(o.y - it.y) < 2 && /^\d{2}\/\d{2}\/\d{4}$/.test(o.s));
    if (!dateCell) continue;
    const cells = items.filter((o) => Math.abs(o.y - dateCell.y) < 0.8 && o.x >= 200);
    const row = {};
    for (const c of cells) {
      const col = ACTION_COLUMNS.find(([, a, b]) => c.x >= a && c.x < b);
      if (col) row[col[0]] = row[col[0]] ? `${row[col[0]]} ${c.s}` : c.s;
    }
    actions.push({
      isin,
      mnemo,
      nom,
      cours: num(row.cours),
      coursPrecedent: num(row.coursPrecedent),
      variationPct: num(row.variationPct),
      ouverture: num(row.ouverture),
      volume: num(row.volume) ?? 0,
      valeur: num(row.valeur) ?? 0,
      transactions: num(row.transactions) ?? 0,
      statut: row.statut ?? null,
      plusHautAnnee: num(row.plusHautAnnee),
      plusBasAnnee: num(row.plusBasAnnee),
      variationAnneePct: num(row.variationAnneePct),
    });
  }
  return actions;
}

function validate(session) {
  const errors = [];
  if (!session.numero) errors.push("numéro de bulletin introuvable");
  if (!session.indice?.valeur) errors.push("indice BVMAC All Share introuvable");
  if (session.actions.length < 3) errors.push(`seulement ${session.actions.length} action(s) lue(s)`);
  for (const a of session.actions) {
    if (!/^[A-Z]{2}\d{10}$/.test(a.isin)) errors.push(`ISIN invalide : ${a.isin}`);
    if (!a.cours || !a.coursPrecedent) errors.push(`cours manquant pour ${a.isin}`);
    // La BVMAC calcule la variation du jour sur le cours d'ouverture (cours de référence de la séance)
    if (a.cours && a.ouverture && a.variationPct != null) {
      const calc = (a.cours / a.ouverture - 1) * 100;
      if (Math.abs(calc - a.variationPct) > 0.1) errors.push(`variation incohérente pour ${a.isin} (${a.variationPct} % publié, ${calc.toFixed(2)} % calculé)`);
    }
  }
  return errors;
}

export async function parseBulletin(buffer, date, pdfUrl) {
  const doc = await getDocument({ data: new Uint8Array(buffer), useSystemFonts: true, verbosity: 0 }).promise;
  const p1 = await pageItems(doc, 1);
  const p2 = await pageItems(doc, 2);
  const all = [...p1, ...p2];

  const titre = all.find((i) => /BULLETIN OFFICIEL DE LA COTE N°\s*\d+/.test(i.s))?.s ?? "";
  const numero = num(titre.match(/N°\s*(\d+)/)?.[1]);

  // Indice : « BVMAC-AS » suivi de sa valeur sur la même ligne, puis « Variation jour »
  const asLabel = p1.find((i) => i.s === "BVMAC-AS" || /^BVMAC-AS\s/.test(i.s));
  let indiceValeur = null;
  if (asLabel) {
    const inline = asLabel.s.replace("BVMAC-AS", "").trim();
    const next = p1.filter((o) => Math.abs(o.y - asLabel.y) < 2 && o.x > asLabel.x).sort((a, b) => a.x - b.x)[0];
    indiceValeur = num(inline || next?.s);
  }
  const varLabel = p1.find((i) => /^Variation jour/.test(i.s));
  let indiceVariation = null;
  if (varLabel) {
    const inline = varLabel.s.replace("Variation jour", "").trim();
    const next = p1.filter((o) => Math.abs(o.y - varLabel.y) < 2 && o.x > varLabel.x).sort((a, b) => a.x - b.x)[0];
    indiceVariation = num(inline || next?.s);
  }

  // Synthèse du marché des actions : ligne « ACTIONS volume valeur transactions émetteurs »
  const synthLabel = p2.find((i) => i.s === "ACTIONS");
  let synthese = null;
  if (synthLabel) {
    const cells = p2.filter((o) => Math.abs(o.y - synthLabel.y) < 1.5 && o.x > synthLabel.x).sort((a, b) => a.x - b.x).map((o) => num(o.s));
    synthese = { volume: cells[0] ?? 0, valeur: cells[1] ?? 0, transactions: cells[2] ?? 0, emetteurs: cells[3] ?? null };
  }

  const session = {
    date,
    numero,
    pdfUrl,
    indice: { nom: "BVMAC All Share", code: "BVMAC-AS", valeur: indiceValeur, variationPct: indiceVariation },
    synthese,
    actions: parseActions(p2),
  };
  return { session, errors: validate(session) };
}

function load() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return { source: "BVMAC — Bulletin officiel de la cote", updatedAt: null, sessions: [] };
  }
}

function save(db) {
  db.sessions.sort((a, b) => b.date.localeCompare(a.date));
  db.sessions = db.sessions.slice(0, MAX_SESSIONS);
  db.updatedAt = new Date().toISOString();
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DATA_FILE); // écriture atomique : la page ne lit jamais un fichier à moitié écrit
}

/** Le PDF est rangé dans le dossier du mois de mise en ligne : même mois, ou le suivant en fin de mois */
function candidateUrls(d) {
  const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  return [
    `${BASE}/${d.getUTCFullYear()}/${pad(d.getUTCMonth() + 1)}/BOC-${ymd(d)}.pdf`,
    `${BASE}/${next.getUTCFullYear()}/${pad(next.getUTCMonth() + 1)}/BOC-${ymd(d)}.pdf`,
  ];
}

async function download(url) {
  const res = await fetch(url, { headers: { "User-Agent": "LEconomie-BVMAC-sync/1.0 (+https://leconomie.info/marches)" } });
  if (!res.ok) return null;
  const type = res.headers.get("content-type") || "";
  if (!type.includes("pdf")) return null;
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  // Mode test : analyse d'un PDF local, sans rien enregistrer
  if (args.file) {
    const { session, errors } = await parseBulletin(fs.readFileSync(args.file), args.date || "inconnue", null);
    console.log(JSON.stringify(session, null, 2));
    console.log(errors.length ? `ERREURS :\n- ${errors.join("\n- ")}` : "Analyse OK");
    process.exit(errors.length ? 1 : 0);
  }

  const days = Number(args.days || 10);
  const db = load();
  const known = new Set(db.sessions.map((s) => s.date));
  const today = new Date();
  let added = 0;

  for (let i = 0; i < days; i++) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const dow = d.getUTCDay();
    if (dow === 0 || dow === 6 || known.has(iso(d))) continue;

    for (const url of candidateUrls(d)) {
      const buf = await download(url);
      await sleep(1500);
      if (!buf) continue;
      const { session, errors } = await parseBulletin(buf, iso(d), url);
      if (errors.length) {
        console.error(`[${iso(d)}] bulletin ignoré (${url}) :\n- ${errors.join("\n- ")}`);
      } else {
        db.sessions.push(session);
        added++;
        console.log(`[${iso(d)}] bulletin n° ${session.numero} ajouté : indice ${session.indice.valeur}, ${session.actions.length} actions`);
      }
      break;
    }
  }

  if (added) save(db);
  console.log(`${new Date().toISOString()} — ${added} séance(s) ajoutée(s), ${db.sessions.length} au total`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
