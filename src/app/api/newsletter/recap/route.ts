import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { checkDashboardAuth } from "@/lib/dashboard-auth";
import { readAbonnes } from "@/lib/abonnes";
import { readSubscribers } from "@/lib/newsletter";

interface Article {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  featuredImage: { node: { sourceUrl: string } } | null;
  categories: { nodes: { name: string }[] };
}

const GRAPHQL_URL = "https://teal-horse-411567.hostingersite.com/graphql";

function stripHtml(html: string): string {
  return html.replace(/<div class="sharedaddy[\s\S]*?<\/div><\/div><\/div>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "–")
    .trim()
    .slice(0, 180);
}

function buildRecapEmail(articles: Article[], dateStr: string): string {
  const articleBlocks = articles.map((a, i) => {
    const cat = a.categories?.nodes?.[0]?.name || "Actualité";
    const excerpt = stripHtml(a.excerpt);
    const url = `https://leconomie.info/article/${a.slug}`;
    const img = a.featuredImage?.node?.sourceUrl || "";

    return `
      <tr><td style="padding:${i === 0 ? "0" : "24px"} 0 0;">
        ${img ? `<a href="${url}" style="display:block;margin-bottom:12px;"><img src="${img}" alt="${a.title}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;display:block;" /></a>` : ""}
        <span style="background:#dc2626;color:#fff;font-size:10px;font-weight:bold;padding:3px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:0.5px;">${cat}</span>
        <h3 style="color:#111;font-size:17px;font-weight:bold;line-height:1.4;margin:8px 0 6px;">
          <a href="${url}" style="color:#111;text-decoration:none;">${a.title}</a>
        </h3>
        <p style="color:#555;font-size:13px;line-height:1.6;margin:0;">${excerpt}...</p>
        <a href="${url}" style="color:#dc2626;font-size:12px;font-weight:bold;text-decoration:none;display:inline-block;margin-top:8px;">Lire la suite &rarr;</a>
      </td></tr>
      ${i < articles.length - 1 ? '<tr><td><hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0 0;" /></td></tr>' : ""}
    `;
  }).join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
      <div style="background:#dc2626;padding:24px;text-align:center;border-radius:8px 8px 0 0;">
        <img src="https://leconomie.info/images/favicon.png" alt="L'Économie" style="height:50px;width:auto;" />
        <p style="color:#fca5a5;margin:8px 0 0;font-size:11px;">Le Premier quotidien économique de la zone CEMAC</p>
      </div>
      <div style="background:#1f2937;padding:12px 24px;text-align:center;">
        <span style="color:#fff;font-size:13px;font-weight:bold;letter-spacing:1px;">RÉCAPITULATIF DU ${dateStr}</span>
      </div>
      <div style="padding:24px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${articleBlocks}
        </table>
      </div>
      <div style="padding:0 24px 32px;text-align:center;">
        <a href="https://leconomie.info" style="background:#dc2626;color:#fff;padding:14px 36px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:14px;display:inline-block;">
          Voir tous les articles sur leconomie.info
        </a>
      </div>
      <div style="background:#f9fafb;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;border-radius:0 0 8px 8px;">
        <img src="https://leconomie.info/images/favicon.png" alt="L'Économie" style="height:30px;width:auto;margin-bottom:8px;" />
        <p style="color:#6b7280;font-size:11px;margin:0;">© 2026 L'Économie — Tous droits réservés</p>
        <p style="color:#9ca3af;font-size:10px;margin:6px 0 0;">
          <a href="https://leconomie.info" style="color:#dc2626;text-decoration:none;">leconomie.info</a>
        </p>
      </div>
    </div>
  `;
}

async function sendBroadcast(recipients: string[], subject: string, html: string) {
  const BATCH_SIZE = 10;
  const DELAY_BETWEEN_EMAILS = 3000;
  const DELAY_BETWEEN_BATCHES = 30000;
  let sent = 0;

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    for (const email of batch) {
      try {
        await transporter.sendMail({
          from: `"L'Économie" <${process.env.SMTP_USER}>`,
          to: email,
          subject,
          html,
        });
        sent++;
      } catch (err) {
        console.error("Recap email error for", email, err);
      }
      if (batch.indexOf(email) < batch.length - 1) {
        await new Promise(r => setTimeout(r, DELAY_BETWEEN_EMAILS));
      }
    }

    transporter.close();

    if (i + BATCH_SIZE < recipients.length) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
    }
  }

  console.log(`[Recap] Broadcast terminé : ${sent}/${recipients.length} emails envoyés`);
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-dashboard-token");
  if (!checkDashboardAuth(auth)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { to, broadcast } = body;

  if (!to && !broadcast) {
    return NextResponse.json({ error: "Paramètre 'to' ou 'broadcast: true' requis" }, { status: 400 });
  }

  // Récupérer les 5 derniers articles via GraphQL
  const gqlRes = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `{ posts(first: 5, where: { status: PUBLISH }) { nodes { title slug excerpt date featuredImage { node { sourceUrl } } categories { nodes { name } } } } }`,
    }),
  });

  if (!gqlRes.ok) return NextResponse.json({ error: "Erreur GraphQL" }, { status: 500 });
  const gqlData = await gqlRes.json();
  const articles: Article[] = gqlData?.data?.posts?.nodes || [];

  if (articles.length === 0) return NextResponse.json({ error: "Aucun article trouvé" }, { status: 404 });

  const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
  const html = buildRecapEmail(articles, today);
  const subject = `L'Économie — Récapitulatif du ${today}`;

  // Collecter les destinataires
  let recipients: string[] = [];

  if (broadcast) {
    const abonnes = await readAbonnes();
    const newsletterSubs = await readSubscribers();

    const abonnesEmails = abonnes
      .filter(a => a.plan === "annuel" || a.plan === "mensuel")
      .map(a => a.email.toLowerCase());

    const newsletterEmails = newsletterSubs.map(s => s.email.toLowerCase());

    const allEmails = new Set([...abonnesEmails, ...newsletterEmails]);
    recipients = Array.from(allEmails);
  } else {
    recipients = [to];
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: "Aucun destinataire" }, { status: 400 });
  }

  // Mode single : envoi direct et attente
  if (!broadcast) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"L'Économie" <${process.env.SMTP_USER}>`,
      to: recipients[0],
      subject,
      html,
    });
    transporter.close();
    return NextResponse.json({ success: true, sent: 1, total: 1, articlesCount: articles.length });
  }

  // Mode broadcast : répondre immédiatement, envoyer en arrière-plan
  sendBroadcast(recipients, subject, html).catch(err => {
    console.error("[Recap] Broadcast error:", err);
  });

  return NextResponse.json({
    success: true,
    message: `Envoi lancé en arrière-plan à ${recipients.length} destinataires`,
    total: recipients.length,
    articlesCount: articles.length,
  });
}
