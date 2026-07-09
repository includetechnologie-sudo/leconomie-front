import fs from "fs";
import path from "path";

const CONFIG_FILE = path.join(process.cwd(), "data", "dashboard-config.json");

// Lit le mot de passe depuis data/dashboard-config.json en priorité, sinon .env
export function getDashboardPassword(): string {
  try {
    const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    if (cfg?.password) return cfg.password;
  } catch {}
  return process.env.DASHBOARD_PASSWORD || "";
}

export function checkDashboardAuth(token: string | null): boolean {
  if (!token) return false;
  return token === getDashboardPassword();
}

export function saveDashboardPassword(newPassword: string): void {
  let cfg: Record<string, unknown> = {};
  try { cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8")); } catch {}
  cfg.password = newPassword;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
}
