import { promises as fs } from "fs";
import path from "path";
import { PLAN_DURATION_DAYS, PLAN_LABELS, type Plan } from "./subscription";

const DATA_FILE = path.join(process.cwd(), "data", "abonnes.json");

export interface Subscriber {
  email: string;
  name: string;
  plan: Plan;
  ref: string;
  expiresAt: number;
  createdAt: number;
  passwordHash?: string;
  achats?: { id: number; type: "journal" | "magazine"; titre: string; ref: string; acheteLe: number }[];
}

export async function readAbonnes(): Promise<Subscriber[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeAbonnes(list: Subscriber[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2));
}

const PLAN_RANK: Record<Plan, number> = { gratuit: 0, mensuel: 1, annuel: 2 };

export interface SaveResult {
  success: boolean;
  expiresAt: number;
  hasPassword: boolean;
  error?: string;
}

export async function saveSubscriber(
  email: string,
  name: string,
  plan: Plan,
  ref: string
): Promise<SaveResult> {
  const abonnes = await readAbonnes();
  const existingIndex = abonnes.findIndex((a) => a.email === email);
  const existing = abonnes[existingIndex];

  const days = PLAN_DURATION_DAYS[plan];
  const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;

  if (existing && existing.plan !== "gratuit") {
    const isUpgrade = PLAN_RANK[plan] > PLAN_RANK[existing.plan];
    const isRenewal = plan === existing.plan;
    if (!isUpgrade && !isRenewal) {
      return {
        success: false,
        expiresAt: existing.expiresAt,
        hasPassword: !!existing.passwordHash,
        error: `Abonnement ${PLAN_LABELS[existing.plan]} déjà actif.`,
      };
    }
  }

  const subscriber: Subscriber = {
    email,
    name: name || email.split("@")[0],
    plan,
    ref,
    expiresAt,
    createdAt: existing?.createdAt || Date.now(),
    passwordHash: existing?.passwordHash,
  };

  if (existingIndex >= 0) {
    abonnes[existingIndex] = subscriber;
  } else {
    abonnes.push(subscriber);
  }

  await writeAbonnes(abonnes);

  return {
    success: true,
    expiresAt,
    hasPassword: !!existing?.passwordHash,
  };
}

export async function sendWelcomeEmailAsync(subscriber: Subscriber) {
  // Fire-and-forget — ne bloque jamais la réponse
  Promise.resolve().then(async () => {
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      const planLabel = PLAN_LABELS[subscriber.plan] || subscriber.plan;
      const expDate = new Date(subscriber.expiresAt).toLocaleDateString("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
      });

      await transporter.sendMail({
        from: `"L'Économie" <${process.env.SMTP_USER}>`,
        to: subscriber.email,
        subject: `Bienvenue dans L'Économie Premium — ${planLabel}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <div style="background:#dc2626;padding:20px;text-align:center;border-radius:8px 8px 0 0">
              <h1 style="color:white;margin:0;font-size:24px">L'Économie</h1>
            </div>
            <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:30px;border-radius:0 0 8px 8px">
              <p>Bonjour <strong>${subscriber.name}</strong>,</p>
              <p>Votre abonnement <strong style="color:#dc2626">${planLabel}</strong> est actif jusqu'au <strong>${expDate}</strong>.</p>
              <div style="text-align:center;margin:24px 0">
                <a href="https://leconomie.info/lecture"
                   style="background:#dc2626;color:white;padding:14px 32px;border-radius:8px;font-weight:bold;text-decoration:none">
                  Accéder au journal
                </a>
              </div>
              <p style="color:#9ca3af;font-size:12px;text-align:center">Référence : ${subscriber.ref}</p>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error("Welcome email error:", err);
    }
  });
}
