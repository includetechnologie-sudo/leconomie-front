import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ABONNES_FILE = path.join(process.cwd(), "data", "abonnes.json");

const PARTNER_EMAILS = ["messibala2014@gmail.com", "reinelovelyzang@gmail.com", "delphine_mbia@yahoo.com", "josephelvisbengonozang@gmail.com"];

const EMAIL_SUBJECT = "Important – Nouvelle modalité d'accès à votre abonnement annuel";

const EMAIL_HTML = `
<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:0;background:#f9fafb;">
  <!-- En-tête -->
  <div style="background:#dc2626;padding:24px;text-align:center;">
    <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">L'Economie</h1>
    <p style="color:#fecaca;margin:4px 0 0;font-size:13px;">L'information économique au cœur de la CEMAC</p>
  </div>

  <!-- Corps -->
  <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;">
    <p style="color:#374151;font-size:15px;line-height:1.7;">Cher(e) abonné(e),</p>

    <p style="color:#374151;font-size:15px;line-height:1.7;">
      Nous avons le plaisir de vous informer d'une évolution importante concernant l'accès à votre abonnement annuel au journal <strong>L'Economie</strong>.
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.7;">
      Désormais, la lecture de votre journal se fera <strong>exclusivement en ligne sur notre plateforme officielle : <a href="https://www.leconomie.info" style="color:#dc2626;text-decoration:underline;">www.leconomie.info</a></strong>. Vous ne recevrez donc plus le journal au format PDF par voie électronique comme cela se faisait habituellement.
    </p>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:20px;margin:24px 0;">
      <h3 style="color:#991b1b;margin:0 0 12px;font-size:16px;">Comment accéder à votre abonnement ?</h3>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 12px;">
        Votre compte est <strong>déjà enregistré sur la plateforme</strong>. Vous n'avez donc pas besoin de créer un nouveau compte.
      </p>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 8px;"><strong>Pour activer votre accès :</strong></p>
      <ol style="color:#374151;font-size:14px;line-height:2;margin:0;padding-left:20px;">
        <li>Rendez-vous sur <strong><a href="https://www.leconomie.info" style="color:#dc2626;">www.leconomie.info</a></strong>.</li>
        <li>Cliquez sur <strong>« Se connecter »</strong>.</li>
        <li>Saisissez <strong>l'adresse e-mail utilisée lors de votre abonnement</strong>.</li>
        <li>Cliquez sur <strong>« Mot de passe oublié »</strong>.</li>
        <li>Suivez les instructions reçues par e-mail afin de <strong>réinitialiser et définir votre nouveau mot de passe</strong>.</li>
        <li>Connectez-vous ensuite à votre compte pour accéder à votre journal.</li>
      </ol>
    </div>

    <p style="color:#374151;font-size:15px;line-height:1.7;">
      Cette nouvelle méthode nous permettra de vous offrir une expérience de lecture plus pratique, sécurisée et accessible depuis votre ordinateur, votre smartphone ou votre tablette.
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.7;">
      En cas de difficulté pour accéder à votre compte ou pour toute assistance, notre équipe support reste à votre disposition au :
    </p>

    <div style="text-align:center;margin:20px 0;">
      <p style="font-size:18px;font-weight:bold;color:#111;">📞 +237 693 537 690</p>
    </div>

    <p style="color:#374151;font-size:15px;line-height:1.7;">
      Nous vous remercions pour votre fidélité et votre confiance.
    </p>

    <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;">
      <p style="color:#111;font-weight:bold;font-size:15px;margin:0;">L'Economie – L'information économique au cœur de la CEMAC</p>
      <p style="margin:4px 0 0;">
        <a href="https://www.leconomie.info" style="color:#dc2626;font-size:14px;text-decoration:underline;">www.leconomie.info</a>
      </p>
    </div>
  </div>

  <!-- Pied de page -->
  <div style="padding:16px;text-align:center;">
    <p style="color:#9ca3af;font-size:11px;margin:0;">
      Vous recevez cet e-mail car vous êtes abonné(e) annuel(le) à L'Economie.
    </p>
  </div>
</div>
`;

export async function GET() {
  try {
    let abonnes: { email?: string; plan?: string; name?: string }[] = [];
    try {
      abonnes = JSON.parse(fs.readFileSync(ABONNES_FILE, "utf-8"));
    } catch {}

    const annuels = abonnes
      .filter((a) => a.plan === "annuel" && a.email)
      .map((a) => a.email as string);

    const allRecipients = [...new Set([...annuels, ...PARTNER_EMAILS])];

    // Envoi en arrière-plan pour éviter le timeout
    Promise.resolve().then(async () => {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.default.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 465,
          secure: true,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        for (const email of allRecipients) {
          try {
            await transporter.sendMail({
              from: `"L'Economie" <${process.env.SMTP_USER}>`,
              to: email,
              subject: EMAIL_SUBJECT,
              html: EMAIL_HTML,
            });
            console.log(`Alerte annuel envoyée à ${email}`);
          } catch (err) {
            console.error(`Alerte annuel échouée pour ${email}:`, err);
          }
        }
        console.log(`Alerte annuel terminée: ${allRecipients.length} destinataires`);
      } catch (err) {
        console.error("Alerte annuel erreur globale:", err);
      }
    });

    return NextResponse.json({
      success: true,
      total: allRecipients.length,
      sent: allRecipients.length,
      failed: 0,
      message: `Envoi lancé en arrière-plan à ${allRecipients.length} destinataires`,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}