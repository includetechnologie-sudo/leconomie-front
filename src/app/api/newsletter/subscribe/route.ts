import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "newsletter-subscribers.json");

function readEmails(): string[] {
  try {
    if (!fs.existsSync(DB_PATH)) return [];
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch { return []; }
}

function saveEmail(email: string) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const emails = readEmails();
  if (!emails.includes(email)) {
    emails.push(email);
    fs.writeFileSync(DB_PATH, JSON.stringify(emails, null, 2));
  }
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const existing = readEmails();
    if (existing.includes(email)) {
      return NextResponse.json({ message: "Déjà inscrit" });
    }

    saveEmail(email);

    // Email de confirmation
    await transporter.sendMail({
      from: `"L'Économie" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Bienvenue dans la newsletter de L'Économie",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
          <div style="background:#dc2626;padding:24px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">L'ÉCONOMIE</h1>
            <p style="color:#fff;opacity:0.85;margin:4px 0 0;font-size:13px;">Le Premier quotidien économique de la zone CEMAC</p>
          </div>
          <div style="padding:32px 24px;">
            <h2 style="color:#111;font-size:20px;margin:0 0 12px;">Inscription confirmée !</h2>
            <p style="color:#555;line-height:1.6;">Vous recevrez désormais chaque matin l'essentiel de l'actualité économique de la zone CEMAC.</p>
            <p style="color:#555;line-height:1.6;margin-top:16px;">Pour vous désabonner à tout moment, cliquez sur le lien en bas de chaque email.</p>
          </div>
          <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
            <a href="https://leconomie.info" style="color:#dc2626;text-decoration:none;font-weight:bold;">leconomie.info</a>
            <p style="color:#9ca3af;font-size:11px;margin:8px 0 0;">© 2026 L'Économie — Tous droits réservés</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
