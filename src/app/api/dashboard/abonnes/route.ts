import { NextRequest, NextResponse } from "next/server";
import { readAbonnes, writeAbonnes, type Subscriber } from "@/lib/abonnes";
import { checkDashboardAuth } from "@/lib/dashboard-auth";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";

const TOKENS_FILE = path.join(process.cwd(), "data", "reset-tokens.json");

interface ResetToken { email: string; token: string; expiresAt: number; }

async function readTokens(): Promise<Record<string, ResetToken>> {
  try { return JSON.parse(await fs.readFile(TOKENS_FILE, "utf-8")); } catch { return {}; }
}

async function writeTokens(tokens: Record<string, ResetToken>) {
  await fs.mkdir(path.dirname(TOKENS_FILE), { recursive: true });
  await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

// POST — Ajouter un abonne
export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-dashboard-token");
  if (!checkDashboardAuth(auth)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { email, name, plan, commentaire } = await req.json();
  if (!email || !plan) {
    return NextResponse.json({ error: "Email et plan requis" }, { status: 400 });
  }

  const abonnes = await readAbonnes();
  const existing = abonnes.find(a => a.email.toLowerCase() === email.toLowerCase());

  if (existing) {
    existing.plan = plan;
    existing.name = name || existing.name;
    if (commentaire) existing.commentaire = commentaire;
    const days = plan === "annuel" ? 365 : 31;
    existing.expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
    await writeAbonnes(abonnes);
    return NextResponse.json({ success: true, action: "upgraded", email });
  }

  const days = plan === "annuel" ? 365 : 31;
  const newSub: Subscriber = {
    email,
    name: name || email.split("@")[0],
    plan,
    ref: "dashboard-" + Date.now(),
    expiresAt: Date.now() + days * 24 * 60 * 60 * 1000,
    createdAt: Date.now(),
    commentaire: commentaire || (plan === "annuel" ? "Abonne Annuel" : "Abonne Mensuel"),
  };

  abonnes.push(newSub);
  await writeAbonnes(abonnes);

  // Envoyer email de reset
  let emailSent = false;
  try {
    const token = crypto.randomBytes(32).toString("hex");
    const tokens = await readTokens();
    tokens[token] = { email, token, expiresAt: Date.now() + 7 * 24 * 3600_000 };
    await writeTokens(tokens);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";
    const resetLink = `${siteUrl}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"L'Economie" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Bienvenue sur L'Economie - Creez votre mot de passe",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <div style="background:#dc2626;padding:20px;text-align:center;border-radius:8px 8px 0 0">
            <img src="https://leconomie.info/images/favicon.png" alt="L'Economie" style="height:50px;width:auto;" />
          </div>
          <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:30px;border-radius:0 0 8px 8px">
            <p>Bonjour <strong>${newSub.name}</strong>,</p>
            <p>Votre abonnement <strong style="color:#dc2626">${plan === "annuel" ? "Annuel" : "Mensuel"}</strong> est actif sur leconomie.info.</p>
            <p style="color:#6b7280;font-size:14px">Cliquez ci-dessous pour creer votre mot de passe et acceder au journal :</p>
            <div style="text-align:center;margin:30px 0">
              <a href="${resetLink}" style="background:#dc2626;color:white;padding:14px 32px;border-radius:8px;font-weight:bold;text-decoration:none">
                Creer mon mot de passe
              </a>
            </div>
            <p style="color:#9ca3af;font-size:12px">Ce lien est valable 7 jours.</p>
          </div>
        </div>
      `,
    });
    transporter.close();
    emailSent = true;
  } catch (err) {
    console.error("Dashboard add subscriber email error:", err);
  }

  return NextResponse.json({ success: true, action: "created", email, emailSent });
}

// DELETE — Supprimer un abonne
export async function DELETE(req: NextRequest) {
  const auth = req.headers.get("x-dashboard-token");
  if (!checkDashboardAuth(auth)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

  const abonnes = await readAbonnes();
  const filtered = abonnes.filter(a => a.email.toLowerCase() !== email.toLowerCase());

  if (filtered.length === abonnes.length) {
    return NextResponse.json({ error: "Abonne introuvable" }, { status: 404 });
  }

  await writeAbonnes(filtered);
  return NextResponse.json({ success: true, email });
}
