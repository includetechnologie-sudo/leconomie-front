import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { promises as fs } from "fs";
import path from "path";
import { PLAN_LABELS, type Plan } from "@/lib/subscription";

interface Subscriber {
  email: string;
  name: string;
  plan: Plan;
  ref: string;
  expiresAt: number;
  autoRenew?: boolean;
  commentaire?: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "abonnes.json");

async function readAbonnes(): Promise<Subscriber[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeAbonnes(list: Subscriber[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2));
}

async function sendRenewalEmail(sub: Subscriber, daysLeft: number) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const planLabel = PLAN_LABELS[sub.plan] || sub.plan;
  const subject = daysLeft <= 0
    ? "Votre abonnement L'Économie a expiré"
    : `Votre abonnement L'Économie expire dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}`;

  await transporter.sendMail({
    from: `"L'Économie" <${process.env.SMTP_USER}>`,
    to: sub.email,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#dc2626;padding:20px;text-align:center;border-radius:8px 8px 0 0">
          <h1 style="color:white;margin:0;font-size:24px">L'Économie</h1>
          <p style="color:#fca5a5;margin:4px 0 0;font-size:12px">Le Premier quotidien économique de la zone CEMAC</p>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:30px;border-radius:0 0 8px 8px">
          <p style="color:#374151;font-size:16px">Bonjour <strong>${sub.name}</strong>,</p>
          ${daysLeft <= 0
            ? `<p style="color:#374151">Votre abonnement <strong>${planLabel}</strong> a expiré. Vous n'avez plus accès aux contenus premium.</p>`
            : `<p style="color:#374151">Votre abonnement <strong>${planLabel}</strong> expire dans <strong style="color:#dc2626">${daysLeft} jour${daysLeft > 1 ? "s" : ""}</strong>.</p>
               <p style="color:#6b7280;font-size:14px">Pour continuer à accéder au journal, aux magazines et aux articles premium, renouvelez votre abonnement avant l'échéance.</p>`
          }
          <div style="text-align:center;margin:30px 0">
            <a href="https://leconomie.info/abonnement?upgrade=${sub.email}"
               style="background:#dc2626;color:white;padding:14px 32px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:15px;display:inline-block">
              Renouveler mon abonnement
            </a>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center">
            Référence : ${sub.ref}<br/>
            <a href="https://leconomie.info/contact" style="color:#dc2626">Contacter le support</a>
          </p>
        </div>
      </div>
    `,
  });
}

// Cette route est appelée par un cron ou un webhook WordPress quotidien
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const abonnes = await readAbonnes();
  const now = Date.now();
  let notified = 0;
  let expired = 0;

  const updated = abonnes.map((sub) => {
    const daysLeft = Math.ceil((sub.expiresAt - now) / (1000 * 60 * 60 * 24));

    // Auto-renouvellement (Partenaires / Ami DP) — pas d'alerte, on renouvelle
    if (sub.autoRenew && daysLeft <= 0 && sub.plan !== "gratuit") {
      const newExpires = now + 365 * 24 * 60 * 60 * 1000;
      return { ...sub, expiresAt: newExpires };
    }

    // Notification J-7, J-3, J-1 (uniquement pour les non-autoRenew)
    if (!sub.autoRenew && (daysLeft === 7 || daysLeft === 3 || daysLeft === 1)) {
      sendRenewalEmail(sub, daysLeft).catch(console.error);
      notified++;
    }

    // Expiration — notification et basculement (uniquement non-autoRenew)
    if (!sub.autoRenew && daysLeft <= 0 && sub.plan !== "gratuit") {
      sendRenewalEmail({ ...sub }, 0).catch(console.error);
      expired++;
      return { ...sub, plan: "gratuit" as Plan };
    }

    return sub;
  });

  await writeAbonnes(updated);

  return NextResponse.json({ notified, expired, total: abonnes.length });
}
