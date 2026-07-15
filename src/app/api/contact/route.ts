import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { nom, email, sujet, message } = await req.json();

    if (!nom || !email || !sujet || !message) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
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

    await transporter.sendMail({
      from: `"L'Economie Contact" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `[Contact] ${sujet} — ${nom}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
          <div style="background:#dc2626;padding:20px 24px;">
            <h1 style="color:#fff;margin:0;font-size:20px;">Nouveau message de contact</h1>
          </div>
          <div style="padding:24px;border:1px solid #e5e7eb;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:100px;">Nom</td><td style="padding:8px 0;font-weight:bold;font-size:13px;">${nom}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Email</td><td style="padding:8px 0;font-size:13px;"><a href="mailto:${email}" style="color:#dc2626;">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Sujet</td><td style="padding:8px 0;font-weight:bold;font-size:13px;">${sujet}</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
            <p style="color:#374151;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</p>
          </div>
          <div style="padding:12px 24px;background:#f9fafb;text-align:center;">
            <p style="color:#9ca3af;font-size:11px;margin:0;">Message reçu depuis leconomie.info</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
