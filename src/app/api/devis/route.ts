import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { nom, email, telephone, entreprise, poste, effectif, message } = await req.json();

    if (!nom || !email || !entreprise || !effectif) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"L'Économie" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `[Devis Entreprise] ${entreprise} — ${effectif} utilisateurs`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
          <div style="background:#dc2626;padding:20px 24px;">
            <h1 style="color:#fff;margin:0;font-size:20px;">Demande de devis entreprise</h1>
          </div>
          <div style="padding:24px;border:1px solid #e5e7eb;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:130px;">Entreprise</td><td style="padding:8px 0;font-weight:bold;font-size:13px;">${entreprise}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Contact</td><td style="padding:8px 0;font-size:13px;">${nom}${poste ? ` — ${poste}` : ""}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Email</td><td style="padding:8px 0;font-size:13px;"><a href="mailto:${email}" style="color:#dc2626;">${email}</a></td></tr>
              ${telephone ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Téléphone</td><td style="padding:8px 0;font-size:13px;">${telephone}</td></tr>` : ""}
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Effectif souhaité</td><td style="padding:8px 0;font-weight:bold;font-size:13px;color:#dc2626;">${effectif}</td></tr>
            </table>
            ${message ? `<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" /><p style="color:#374151;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</p>` : ""}
          </div>
          <div style="padding:12px 24px;background:#f9fafb;text-align:center;">
            <p style="color:#9ca3af;font-size:11px;margin:0;">Demande reçue depuis leconomie.info/abonnement/entreprise</p>
          </div>
        </div>
      `,
    });

    // Persister la demande de devis
    const devisPath = path.join(process.cwd(), "data", "devis.json");
    try {
      const existing = JSON.parse(fs.readFileSync(devisPath, "utf-8"));
      existing.push({ nom, email, telephone, entreprise, poste, effectif, message, date: new Date().toISOString() });
      fs.writeFileSync(devisPath, JSON.stringify(existing, null, 2));
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Devis error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
