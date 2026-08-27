import { NextResponse } from "next/server";

export async function GET() {
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"L'Economie" <${process.env.SMTP_USER}>`,
      to: "biloaaristide10@gmail.com",
      subject: "Votre abonnement expire dans 2 jours — Renouvelez maintenant",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;">
          <div style="background:#dc2626;padding:24px;text-align:center;border-radius:8px 8px 0 0;">
            <h1 style="color:white;margin:0;font-size:22px;">L'Economie</h1>
            <p style="color:#fecaca;margin:6px 0 0;font-size:12px;">Le premier quotidien économique de la zone CEMAC</p>
          </div>
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:32px;border-radius:0 0 8px 8px;">
            <p style="color:#374151;font-size:15px;">Bonjour <strong>Jean Essimi</strong>,</p>
            <p style="color:#374151;font-size:15px;line-height:1.6;">
              Nous vous informons que votre abonnement <strong style="color:#dc2626;">mensuel</strong> à L'Economie expire dans <strong>2 jours</strong> (le 29 août 2026).
            </p>
            <p style="color:#374151;font-size:15px;line-height:1.6;">
              Pour continuer à bénéficier de l'accès illimité aux articles premium, au journal quotidien et au magazine, renouvelez dès maintenant :
            </p>
            <div style="text-align:center;margin:28px 0;">
              <a href="https://leconomie.info/abonnement" style="background:#dc2626;color:white;font-weight:bold;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:15px;display:inline-block;">
                Renouveler mon abonnement
              </a>
            </div>
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:24px 0;">
              <p style="color:#991b1b;font-size:13px;margin:0;font-weight:bold;">Ce que vous perdez après expiration :</p>
              <ul style="color:#991b1b;font-size:13px;margin:8px 0 0;padding-left:20px;">
                <li>Accès aux articles premium</li>
                <li>Lecture du journal quotidien en ligne</li>
                <li>Accès au magazine L'Economie International</li>
              </ul>
            </div>
            <p style="color:#6b7280;font-size:13px;line-height:1.5;">
              Si vous avez des questions, n'hésitez pas à nous contacter via WhatsApp au +237 693 537 690 ou par email.
            </p>
            <p style="color:#374151;font-size:14px;margin-top:24px;">
              Cordialement,<br/>
              <strong>L'équipe L'Economie</strong>
            </p>
          </div>
          <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:16px;">
            © L'Economie 2026 — leconomie.info
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Email envoyé à biloaaristide10@gmail.com" });
  } catch (err) {
    console.error("Rappel email error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}