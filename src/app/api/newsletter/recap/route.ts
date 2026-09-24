import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { checkDashboardAuth } from "@/lib/dashboard-auth";
import { readAbonnes } from "@/lib/abonnes";
import { isPaidPlan } from "@/lib/subscription";
import { readSubscribers } from "@/lib/newsletter";

interface Article {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  featuredImage: { node: { sourceUrl: string } } | null;
  categories: { nodes: { name: string }[] };
}

interface JournalDuJour {
  databaseId: number;
  title: string;
  numero: string;
  datePublication: string;
  featuredImage: { node: { sourceUrl: string } } | null;
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

function buildJournalSection(journal: JournalDuJour, isActiveSubscriber: boolean): string {
  const cover = journal.featuredImage?.node?.sourceUrl || "";
  const numero = journal.numero ? `N° ${journal.numero}` : "";
  const readUrl = `https://leconomie.info/lecture/${journal.databaseId}`;
  const buyUrl = `https://leconomie.info/magazine`;

  return `
    <tr><td style="padding:0 0 24px;">
      <div style="background:#fffbeb;border:2px solid #c9a84c;border-radius:12px;padding:20px;">
        <p style="color:#c9a84c;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 12px;text-align:center;">
          📰 Journal du Jour
        </p>
        ${cover ? `
        <div style="text-align:center;margin-bottom:14px;">
          <img src="${cover}" alt="${journal.title}" style="max-width:200px;width:100%;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);" />
        </div>` : ""}
        <h3 style="color:#111;font-size:16px;font-weight:bold;text-align:center;margin:0 0 4px;">${journal.title}</h3>
        ${numero ? `<p style="color:#666;font-size:12px;text-align:center;margin:0 0 16px;">${numero}</p>` : ""}
        <div style="text-align:center;">
          ${isActiveSubscriber
            ? `<a href="${readUrl}" style="background:#c9a84c;color:#fff;padding:12px 28px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:13px;display:inline-block;">
                Lire l'intégralité →
              </a>`
            : `<a href="${buyUrl}" style="background:#c9a84c;color:#fff;padding:12px 28px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:13px;display:inline-block;">
                Acheter — 200 FCFA
              </a>`
          }
        </div>
      </div>
    </td></tr>
    <tr><td><hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px;" /></td></tr>
  `;
}

function trackUrl(targetUrl: string, cid: string, email: string): string {
  return `https://leconomie.info/api/newsletter/track?type=click&cid=${encodeURIComponent(cid)}&email=${encodeURIComponent(email)}&url=${encodeURIComponent(targetUrl)}`;
}

function openPixel(cid: string, email: string): string {
  return `<img src="https://leconomie.info/api/newsletter/track?type=open&cid=${encodeURIComponent(cid)}&email=${encodeURIComponent(email)}" width="1" height="1" style="display:none;" alt="" />`;
}

function buildRecapEmail(articles: Article[], dateStr: string, journalHtml: string, cid: string, subscriberEmail: string): string {
  const articleBlocks = articles.map((a, i) => {
    const cat = a.categories?.nodes?.[0]?.name || "Actualité";
    const excerpt = stripHtml(a.excerpt);
    const url = `https://leconomie.info/article/${a.slug}`;
    const trackedUrl = trackUrl(url, cid, subscriberEmail);
    const img = a.featuredImage?.node?.sourceUrl || "";

    return `
      <tr><td style="padding:${i === 0 ? "0" : "24px"} 0 0;">
        ${img ? `<a href="${trackedUrl}" style="display:block;margin-bottom:12px;"><img src="${img}" alt="${a.title}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;display:block;" /></a>` : ""}
        <span style="background:#dc2626;color:#fff;font-size:10px;font-weight:bold;padding:3px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:0.5px;">${cat}</span>
        <h3 style="color:#111;font-size:17px;font-weight:bold;line-height:1.4;margin:8px 0 6px;">
          <a href="${trackedUrl}" style="color:#111;text-decoration:none;">${a.title}</a>
        </h3>
        <p style="color:#555;font-size:13px;line-height:1.6;margin:0;">${excerpt}...</p>
        <a href="${trackedUrl}" style="color:#dc2626;font-size:12px;font-weight:bold;text-decoration:none;display:inline-block;margin-top:8px;">Lire la suite &rarr;</a>
      </td></tr>
      ${i < articles.length - 1 ? '<tr><td><hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0 0;" /></td></tr>' : ""}
    `;
  }).join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
      <div style="background:#dc2626;padding:24px;text-align:center;border-radius:8px 8px 0 0;">
        <img src="https://leconomie.info/images/favicon.png" alt="L'Economie" style="height:50px;width:auto;" />
        <p style="color:#fca5a5;margin:8px 0 0;font-size:11px;">Le Premier quotidien économique de la zone CEMAC</p>
      </div>
      <div style="background:#1f2937;padding:12px 24px;text-align:center;">
        <span style="color:#fff;font-size:13px;font-weight:bold;letter-spacing:1px;">NEWSLETTER DU ${dateStr}</span>
      </div>
      <div style="padding:24px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${journalHtml}
          ${articleBlocks}
        </table>
      </div>
      <div style="padding:0 24px 32px;text-align:center;">
        <a href="https://leconomie.info" style="background:#dc2626;color:#fff;padding:14px 36px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:14px;display:inline-block;">
          Voir tous les articles sur leconomie.info
        </a>
      </div>
      <div style="background:#f9fafb;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;border-radius:0 0 8px 8px;">
        <img src="https://leconomie.info/images/favicon.png" alt="L'Economie" style="height:30px;width:auto;margin-bottom:8px;" />
        <p style="color:#6b7280;font-size:11px;margin:0;">© 2026 L'Economie — Tous droits réservés</p>
        <p style="color:#9ca3af;font-size:10px;margin:6px 0 0;">
          <a href="https://leconomie.info" style="color:#dc2626;text-decoration:none;">leconomie.info</a>
        </p>
      </div>
      ${openPixel(cid, subscriberEmail)}
    </div>
  `;
}

async function fetchLatestJournal(): Promise<JournalDuJour | null> {
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{ journaux(first: 1, where: { orderby: { field: DATE, order: DESC } }) { nodes { databaseId title numero datePublication featuredImage { node { sourceUrl } } } } }`,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const nodes = data?.data?.journaux?.nodes;
    return nodes?.[0] || null;
  } catch {
    return null;
  }
}

async function sendBroadcast(
  recipients: { email: string; isActive: boolean }[],
  subject: string,
  articles: Article[],
  dateStr: string,
  journal: JournalDuJour | null,
  campaignId: string
) {
  const BATCH_SIZE = 10;
  const DELAY_BETWEEN_EMAILS = 3000;
  const DELAY_BETWEEN_BATCHES = 30000;
  let sent = 0;
  const failed: { email: string; error: string }[] = [];

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    for (const recipient of batch) {
      try {
        const journalHtml = journal ? buildJournalSection(journal, recipient.isActive) : "";
        const html = buildRecapEmail(articles, dateStr, journalHtml, campaignId, recipient.email);
        await transporter.sendMail({
          from: `"L'Economie" <${process.env.SMTP_USER}>`,
          to: recipient.email,
          subject,
          html,
        });
        sent++;
      } catch (err) {
        console.error("Recap email error for", recipient.email, err);
        failed.push({ email: recipient.email, error: err instanceof Error ? err.message : String(err) });
      }
      if (batch.indexOf(recipient) < batch.length - 1) {
        await new Promise(r => setTimeout(r, DELAY_BETWEEN_EMAILS));
      }
    }

    transporter.close();

    if (i + BATCH_SIZE < recipients.length) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
    }
  }

  // Met à jour le résultat final de la campagne (le décompte initial n'est qu'une estimation)
  try {
    const { promises: fsStats } = await import("fs");
    const statsPath = (await import("path")).default.join(process.cwd(), "data", "newsletter-stats.json");
    let stats: Record<string, Record<string, unknown>> = {};
    try { stats = JSON.parse(await fsStats.readFile(statsPath, "utf-8")); } catch {}
    stats[campaignId] = { ...stats[campaignId], sent, failed, status: "terminé" };
    await fsStats.writeFile(statsPath, JSON.stringify(stats, null, 2));
  } catch {}

  console.log(`[Recap] Broadcast terminé : ${sent}/${recipients.length} emails envoyés (${failed.length} échecs)`);
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

  // Récupérer les 5 derniers articles + le dernier journal
  const [gqlRes, journal] = await Promise.all([
    fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{ posts(first: 5, where: { status: PUBLISH }) { nodes { title slug excerpt date featuredImage { node { sourceUrl } } categories { nodes { name } } } } }`,
      }),
    }),
    fetchLatestJournal(),
  ]);

  if (!gqlRes.ok) return NextResponse.json({ error: "Erreur GraphQL" }, { status: 500 });
  const gqlData = await gqlRes.json();
  const articles: Article[] = gqlData?.data?.posts?.nodes || [];

  if (articles.length === 0) return NextResponse.json({ error: "Aucun article trouvé" }, { status: 404 });

  const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
  const subject = `L'Economie — Newsletter du ${today}`;

  // Charger les abonnés actifs pour la logique du bouton journal
  const abonnes = await readAbonnes();
  const now = Date.now();
  const activeEmails = new Set(
    abonnes
      .filter(a => isPaidPlan(a.plan) && a.expiresAt > now)
      .map(a => a.email.toLowerCase())
  );

  // Collecter les destinataires avec leur statut d'abonnement
  let recipients: { email: string; isActive: boolean }[] = [];

  if (broadcast) {
    const newsletterSubs = await readSubscribers();

    const abonnesEmails = abonnes
      .filter(a => isPaidPlan(a.plan))
      .map(a => a.email.toLowerCase());

    const newsletterEmails = newsletterSubs.map(s => s.email.toLowerCase());

    const allEmails = new Set([...abonnesEmails, ...newsletterEmails]);
    recipients = Array.from(allEmails).map(email => ({
      email,
      isActive: activeEmails.has(email),
    }));
  } else {
    recipients = [{ email: to, isActive: activeEmails.has(to.toLowerCase()) }];
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: "Aucun destinataire" }, { status: 400 });
  }

  const campaignId = `recap-${Date.now()}`;

  // Mode single : envoi direct et attente
  if (!broadcast) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const journalHtml = journal ? buildJournalSection(journal, recipients[0].isActive) : "";
    const html = buildRecapEmail(articles, today, journalHtml, campaignId, recipients[0].email);

    await transporter.sendMail({
      from: `"L'Economie" <${process.env.SMTP_USER}>`,
      to: recipients[0].email,
      subject,
      html,
    });
    transporter.close();
    return NextResponse.json({ success: true, sent: 1, total: 1, articlesCount: articles.length });
  }

  // Enregistrer les stats d'envoi
  try {
    const { promises: fsStats } = await import("fs");
    const statsPath = (await import("path")).default.join(process.cwd(), "data", "newsletter-stats.json");
    let stats: Record<string, object> = {};
    try { stats = JSON.parse(await fsStats.readFile(statsPath, "utf-8")); } catch {}
    stats[campaignId] = { sent: 0, total: recipients.length, failed: [], opens: [], clicks: [], subject, date: new Date().toISOString(), status: "en cours" };
    await fsStats.writeFile(statsPath, JSON.stringify(stats, null, 2));
  } catch {}

  // Mode broadcast : répondre immédiatement, envoyer en arrière-plan
  sendBroadcast(recipients, subject, articles, today, journal, campaignId).catch(err => {
    console.error("[Recap] Broadcast error:", err);
  });

  return NextResponse.json({
    success: true,
    message: `Envoi lancé en arrière-plan à ${recipients.length} destinataires`,
    total: recipients.length,
    articlesCount: articles.length,
  });
}