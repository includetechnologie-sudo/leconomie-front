import fs from "fs";
import path from "path";
import crypto from "crypto";

// Secret partagé entre les scripts cron du VPS et les routes /api/internal/* :
// stocké dans data/ (hors git, conservé entre les déploiements), créé au premier usage.
const FILE = path.join(process.cwd(), "data", ".internal-secret");

export function getInternalSecret(): string {
  try {
    const s = fs.readFileSync(FILE, "utf8").trim();
    if (s.length >= 32) return s;
  } catch { /* absent : on le crée */ }
  const s = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(FILE, s, { mode: 0o600 });
  return s;
}

export function checkInternalSecret(provided: string | null): boolean {
  if (!provided) return false;
  const expected = Buffer.from(getInternalSecret());
  const given = Buffer.from(provided);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}
