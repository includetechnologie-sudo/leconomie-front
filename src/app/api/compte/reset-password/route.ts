import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { hashPassword } from "@/lib/password";
import nodemailer from "nodemailer";

const DATA_FILE = path.join(process.cwd(), "data", "abonnes.json");
const TOKENS_FILE = path.join(process.cwd(), "data", "reset-tokens.json");

interface Subscriber {
  email: string;
  name: string;
  plan: string;
  ref: string;
  expiresAt: number;
  createdAt: number;
  passwordHash?: string;
}

interface ResetToken {
  email: string;
  token: string;
  expiresAt: number;
}

async function readAbonnes(): Promise<Subscriber[]> {
  try { return JSON.parse(await fs.readFile(DATA_FILE, "utf-8")); } catch { return []; }
}

async function writeAbonnes(list: Subscriber[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2));
}

async function readTokens(): Promise<Record<string, ResetToken>> {
  try { return JSON.parse(await fs.readFile(TOKENS_FILE, "utf-8")); } catch { return {}; }
}

async function writeTokens(tokens: Record<string, ResetToken>) {
  await fs.mkdir(path.dirname(TOKENS_FILE), { recursive: true });
  await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

// POST /api/compte/reset-password → demande de réinitialisation (envoi email)
// PUT  /api/compte/reset-password → confirmation avec token + nouveau mot de passe

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  if (!email) return NextResponse.json({ error: "Email requis." }, { status: 400 });

  const abonnes = await readAbonnes();
  const sub = abonnes.find(a => a.email.toLowerCase() === email.toLowerCase());

  // Toujours répondre "ok" pour ne pas révéler si l'email existe
  if (!sub) {
    return NextResponse.json({ success: true });
  }

  // Génère un token valide 1h
  const token = require("crypto").randomBytes(32).toString("hex");
  const tokens = await readTokens();

  // Purge les anciens tokens de cet email
  for (const k in tokens) {
    if (tokens[k].email.toLowerCase() === email.toLowerCase()) delete tokens[k];
  }

  tokens[token] = { email: sub.email, token, expiresAt: Date.now() + 3600_000 };
  await writeTokens(tokens);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";
  const resetLink = `${siteUrl}/reset-password?token=${token}`;

  // Envoi email
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"L'Économie" <${process.env.SMTP_USER}>`,
      to: sub.email,
      subject: "Réinitialisation de votre mot de passe — L'Économie",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
          <div style="text-align:center;margin-bottom:24px;">
            <img src="https://leconomie.info/images/favicon.png" alt="L'Économie" style="height:60px;width:auto;" />
          </div>
          <h2 style="color:#111;text-align:center;">Réinitialisation du mot de passe</h2>
          <p style="color:#555;">Bonjour <strong>${sub.name || sub.email}</strong>,</p>
          <p style="color:#555;">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${resetLink}" style="background:#dc2626;color:white;font-weight:bold;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;">
              Créer un nouveau mot de passe
            </a>
          </div>
          <p style="color:#888;font-size:12px;">Ce lien est valable <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
          <p style="color:#aaa;font-size:11px;text-align:center;margin-top:32px;">© L'Économie 2026 — leconomie.info</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Reset password email error:", err);
  }

  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const { token, password } = await req.json().catch(() => ({}));
  if (!token || !password) return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Mot de passe trop court (minimum 6 caractères)." }, { status: 400 });

  const tokens = await readTokens();
  const entry = tokens[token];

  if (!entry) return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 404 });
  if (Date.now() > entry.expiresAt) {
    delete tokens[token];
    await writeTokens(tokens);
    return NextResponse.json({ error: "Ce lien a expiré. Faites une nouvelle demande." }, { status: 410 });
  }

  const abonnes = await readAbonnes();
  const idx = abonnes.findIndex(a => a.email.toLowerCase() === entry.email.toLowerCase());
  if (idx < 0) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });

  abonnes[idx].passwordHash = await hashPassword(password);
  await writeAbonnes(abonnes);

  delete tokens[token];
  await writeTokens(tokens);

  return NextResponse.json({ success: true });
}
