import { NextRequest, NextResponse } from "next/server";
import { readAbonnes, type Subscriber } from "@/lib/abonnes";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";

const TOKENS_FILE = path.join(process.cwd(), "data", "reset-tokens.json");

interface ResetToken {
  email: string;
  token: string;
  expiresAt: number;
}

async function readTokens(): Promise<Record<string, ResetToken>> {
  try { return JSON.parse(await fs.readFile(TOKENS_FILE, "utf-8")); } catch { return {}; }
}

async function writeTokens(tokens: Record<string, ResetToken>) {
  await fs.mkdir(path.dirname(TOKENS_FILE), { recursive: true });
  await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const abonnes = await readAbonnes();

  const tokens = await readTokens();
  const now = Date.now();

  // Emails qui ont deja un token valide (non expire) = deja traites
  const alreadySent = new Set(
    Object.values(tokens)
      .filter(t => t.expiresAt > now)
      .map(t => t.email.toLowerCase())
  );

  const newAccounts: Subscriber[] = [];

  for (const sub of abonnes) {
    if (!sub.passwordHash && !alreadySent.has(sub.email.toLowerCase())) {
      newAccounts.push(sub);
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";
  let emailsSent = 0;

  // Envoi par lots de 10 avec pause de 30s entre chaque lot (limite Gmail)
  const BATCH_SIZE = 10;
  const BATCH_DELAY_MS = 30_000;
  const DELAY_BETWEEN_EMAILS_MS = 3_000;

  for (let i = 0; i < newAccounts.length; i += BATCH_SIZE) {
    const batch = newAccounts.slice(i, i + BATCH_SIZE);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    for (const sub of batch) {
      const token = crypto.randomBytes(32).toString("hex");
      for (const k in tokens) {
        if (tokens[k].email.toLowerCase() === sub.email.toLowerCase()) delete tokens[k];
      }
      tokens[token] = { email: sub.email, token, expiresAt: Date.now() + 7 * 24 * 3600_000 };

      const resetLink = `${siteUrl}/reset-password?token=${token}`;

      try {
        await transporter.sendMail({
          from: `"L'Economie" <${process.env.SMTP_USER}>`,
          to: sub.email,
          subject: "Bienvenue sur L'Economie - Creez votre mot de passe",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
              <div style="background:#dc2626;padding:20px;text-align:center;border-radius:8px 8px 0 0">
                <h1 style="color:white;margin:0;font-size:24px">L'Economie</h1>
                <p style="color:#fca5a5;margin:4px 0 0;font-size:12px">Le Premier quotidien economique de la zone CEMAC</p>
              </div>
              <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:30px;border-radius:0 0 8px 8px">
                <p style="color:#374151;font-size:16px">Bonjour <strong>${sub.name}</strong>,</p>
                <p style="color:#374151">Votre abonnement <strong style="color:#dc2626">Annuel</strong> est actif sur leconomie.info.</p>
                <p style="color:#6b7280;font-size:14px">Pour acceder a votre espace abonne (journal quotidien, magazines, articles premium), veuillez creer votre mot de passe en cliquant ci-dessous :</p>
                <div style="text-align:center;margin:30px 0">
                  <a href="${resetLink}"
                     style="background:#dc2626;color:white;padding:14px 32px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:15px;display:inline-block">
                    Creer mon mot de passe
                  </a>
                </div>
                <p style="color:#6b7280;font-size:13px">Ce lien est valable <strong>7 jours</strong>. Apres ce delai, vous pourrez demander un nouveau lien depuis la page de connexion.</p>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
                <p style="color:#9ca3af;font-size:12px;text-align:center">
                  Reference : ${sub.ref}<br/>
                  <a href="https://leconomie.info/contact" style="color:#dc2626">Contacter le support</a>
                </p>
              </div>
            </div>
          `,
        });
        emailsSent++;
      } catch (err) {
        console.error("Import email error for", sub.email, err);
      }

      await new Promise(r => setTimeout(r, DELAY_BETWEEN_EMAILS_MS));
    }

    transporter.close();

    if (i + BATCH_SIZE < newAccounts.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  await writeTokens(tokens);

  return NextResponse.json({
    total: abonnes.length,
    newAccounts: newAccounts.length,
    emailsSent,
    message: `${emailsSent} emails de bienvenue envoyes sur ${newAccounts.length} nouveaux comptes.`,
  });
}
