import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import nodemailer from "nodemailer";

const TOKENS_FILE = path.join(process.cwd(), "data", "magic-links.json");
const TTL_MS = 15 * 60 * 1000;

interface MagicLinkToken {
  email: string;
  expiresAt: number;
}

async function readTokens(): Promise<Record<string, MagicLinkToken>> {
  try {
    return JSON.parse(await fs.readFile(TOKENS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

async function writeTokens(tokens: Record<string, MagicLinkToken>) {
  await fs.mkdir(path.dirname(TOKENS_FILE), { recursive: true });
  await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

export async function createMagicLinkToken(email: string): Promise<string> {
  const tokens = await readTokens();
  const now = Date.now();
  for (const k of Object.keys(tokens)) {
    if (tokens[k].email.toLowerCase() === email.toLowerCase() || tokens[k].expiresAt < now) {
      delete tokens[k];
    }
  }
  const token = crypto.randomBytes(32).toString("hex");
  tokens[token] = { email, expiresAt: now + TTL_MS };
  await writeTokens(tokens);
  return token;
}

// Consomme le token (usage unique) et retourne l'email associé, ou null si invalide/expiré.
export async function consumeMagicLinkToken(token: string): Promise<string | null> {
  const tokens = await readTokens();
  const entry = tokens[token];
  if (!entry) return null;
  delete tokens[token];
  await writeTokens(tokens);
  if (Date.now() > entry.expiresAt) return null;
  return entry.email;
}

export async function sendMagicLinkEmail(email: string, name: string, token: string, context?: { titre?: string }) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";
    const link = `${siteUrl}/api/auth/lien-magique?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const intro = context?.titre
      ? `Merci pour votre achat ! Votre exemplaire <strong style="color:#dc2626">${context.titre}</strong> vous attend.`
      : `Cliquez sur le bouton ci-dessous pour accéder à votre espace, sans mot de passe.`;

    await transporter.sendMail({
      from: `"L'Economie" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Votre lien de connexion — L'Economie",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
          <div style="text-align:center;margin-bottom:24px;">
            <img src="https://leconomie.info/images/favicon.png" alt="L'Economie" style="height:60px;width:auto;" />
          </div>
          <h2 style="color:#111;text-align:center;">Bonjour ${name}</h2>
          <p style="color:#555;">${intro}</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${link}" style="background:#dc2626;color:white;font-weight:bold;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;">
              Accéder à mon compte
            </a>
          </div>
          <p style="color:#888;font-size:12px;">Ce lien est valable <strong>15 minutes</strong> et ne peut être utilisé qu'une seule fois. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
          <p style="color:#aaa;font-size:11px;text-align:center;margin-top:32px;">© L'Economie 2026 — leconomie.info</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Magic link email error:", err);
  }
}
