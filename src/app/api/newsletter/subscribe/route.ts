import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { readSubscribers, writeSubscribers, generateToken, buildUnsubscribeUrl } from "@/lib/newsletter";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const subscribers = await readSubscribers();
    const existing = subscribers.find((s) => s.email === email);
    if (existing) {
      return NextResponse.json({ message: "Déjà inscrit" });
    }

    const token = generateToken(email);
    subscribers.push({ email, token, createdAt: Date.now() });
    await writeSubscribers(subscribers);

    const unsubscribeUrl = buildUnsubscribeUrl(email, token);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"L'Economie" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Bienvenue dans la newsletter de L'Economie",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
          <div style="background:#dc2626;padding:24px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">L'ECONOMIE</h1>
            <p style="color:#fff;opacity:0.85;margin:4px 0 0;font-size:13px;">Le Premier quotidien économique de la zone CEMAC</p>
          </div>
          <div style="padding:32px 24px;">
            <h2 style="color:#111;font-size:20px;margin:0 0 12px;">Inscription confirmée !</h2>
            <p style="color:#555;line-height:1.6;">Vous recevrez désormais l'essentiel de l'actualité économique de la zone CEMAC directement dans votre boîte email.</p>
            <div style="text-align:center;margin:28px 0;">
              <a href="https://leconomie.info" style="background:#dc2626;color:#fff;padding:14px 32px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:14px;">
                Accéder à L'Economie
              </a>
            </div>
          </div>
          <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
            <a href="https://leconomie.info" style="color:#dc2626;text-decoration:none;font-weight:bold;font-size:13px;">leconomie.info</a>
            <p style="color:#9ca3af;font-size:11px;margin:8px 0 4px;">© 2026 L'Economie — Tous droits réservés</p>
            <a href="${unsubscribeUrl}" style="color:#9ca3af;font-size:11px;text-decoration:underline;">Se désabonner</a>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
