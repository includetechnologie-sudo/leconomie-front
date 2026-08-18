import { PLAN_LABELS, type Plan } from "./subscription";

interface InvoiceAbonnement {
  type: "abonnement";
  email: string;
  name: string;
  plan: Plan;
  amount: number;
  reference: string;
  expiresAt: number;
}

interface InvoiceAchat {
  type: "achat";
  email: string;
  name: string;
  itemType: "journal" | "magazine";
  titre: string;
  amount: number;
  reference: string;
}

type InvoiceData = InvoiceAbonnement | InvoiceAchat;

export async function sendInvoiceEmail(data: InvoiceData) {
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const now = new Date();
    const dateStr = now.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const heureStr = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";
    const amountFormatted = new Intl.NumberFormat("fr-FR").format(data.amount);

    let subject: string;
    let detailsHtml: string;

    if (data.type === "abonnement") {
      const planLabel = PLAN_LABELS[data.plan] || data.plan;
      const expDate = new Date(data.expiresAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      subject = `Facture — Abonnement ${data.plan === "annuel" ? "Annuel" : "Mensuel"}`;
      detailsHtml = `
        <tr>
          <td style="padding:8px 0;color:#374151;border-bottom:1px solid #f3f4f6;">Désignation</td>
          <td style="padding:8px 0;color:#111;font-weight:600;border-bottom:1px solid #f3f4f6;text-align:right;">Abonnement ${planLabel.split("—")[0].trim()}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#374151;border-bottom:1px solid #f3f4f6;">Période</td>
          <td style="padding:8px 0;color:#111;border-bottom:1px solid #f3f4f6;text-align:right;">${dateStr} → ${expDate}</td>
        </tr>
      `;
    } else {
      const typeLabel = data.itemType === "magazine" ? "Magazine" : "Journal quotidien";
      subject = `Facture — ${data.titre}`;
      detailsHtml = `
        <tr>
          <td style="padding:8px 0;color:#374151;border-bottom:1px solid #f3f4f6;">Désignation</td>
          <td style="padding:8px 0;color:#111;font-weight:600;border-bottom:1px solid #f3f4f6;text-align:right;">${typeLabel}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#374151;border-bottom:1px solid #f3f4f6;">Titre</td>
          <td style="padding:8px 0;color:#111;border-bottom:1px solid #f3f4f6;text-align:right;">${data.titre}</td>
        </tr>
      `;
    }

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#f9fafb;">
        <!-- En-tête -->
        <div style="background:#dc2626;padding:24px;text-align:center;">
          <img src="${siteUrl}/images/favicon.png" alt="L'Economie" style="height:40px;width:auto;margin-bottom:8px;" />
          <h1 style="color:white;margin:0;font-size:20px;font-weight:700;">FACTURE</h1>
        </div>

        <!-- Corps -->
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;">
          <p style="color:#374151;margin:0 0 4px;">Bonjour <strong>${data.name}</strong>,</p>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px;">
            Merci pour votre paiement. Voici votre facture récapitulative.
          </p>

          <!-- Infos facture -->
          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr>
                <td style="padding:8px 0;color:#374151;border-bottom:1px solid #f3f4f6;">N° Facture</td>
                <td style="padding:8px 0;color:#111;font-weight:600;border-bottom:1px solid #f3f4f6;text-align:right;">${data.reference}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#374151;border-bottom:1px solid #f3f4f6;">Date</td>
                <td style="padding:8px 0;color:#111;border-bottom:1px solid #f3f4f6;text-align:right;">${dateStr} à ${heureStr}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#374151;border-bottom:1px solid #f3f4f6;">Client</td>
                <td style="padding:8px 0;color:#111;border-bottom:1px solid #f3f4f6;text-align:right;">${data.name} (${data.email})</td>
              </tr>
              ${detailsHtml}
            </table>
          </div>

          <!-- Total -->
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;text-align:center;margin-bottom:24px;">
            <p style="margin:0 0 4px;color:#991b1b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Montant payé</p>
            <p style="margin:0;color:#dc2626;font-size:28px;font-weight:800;">${amountFormatted} FCFA</p>
          </div>

          <!-- Méthode -->
          <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px;">
            <tr>
              <td style="color:#6b7280;">Moyen de paiement</td>
              <td style="color:#111;text-align:right;">Mobile Money / Carte bancaire</td>
            </tr>
            <tr>
              <td style="color:#6b7280;">Statut</td>
              <td style="text-align:right;"><span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:4px;font-weight:600;">Payé ✓</span></td>
            </tr>
          </table>

          <!-- Boutons -->
          <div style="text-align:center;margin:24px 0;">
            <a href="${siteUrl}/facture/${data.reference}"
               style="background:#dc2626;color:white;padding:14px 32px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:14px;display:inline-block;margin-bottom:12px;">
              Imprimer ma facture
            </a>
            <br/>
            <a href="${siteUrl}/mon-compte"
               style="color:#dc2626;font-size:13px;text-decoration:underline;">
              Accéder à mon espace
            </a>
          </div>
        </div>

        <!-- Pied de page -->
        <div style="padding:20px;text-align:center;">
          <p style="color:#9ca3af;font-size:11px;margin:0 0 4px;">
            L'Economie Media Group — Le Premier quotidien économique de la zone CEMAC
          </p>
          <p style="color:#9ca3af;font-size:11px;margin:0 0 4px;">
            Tél : (+237) 672 556 944 / 693 537 690
          </p>
          <p style="color:#d1d5db;font-size:10px;margin:0;">
            Ce document tient lieu de facture. Conservez-le pour vos archives.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"L'Economie" <${process.env.SMTP_USER}>`,
      to: data.email,
      subject,
      html,
    });
  } catch (err) {
    console.error("Invoice email error:", err);
  }
}