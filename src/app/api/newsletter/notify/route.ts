import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { readSubscribers, buildUnsubscribeUrl } from "@/lib/newsletter";
import { readAbonnes } from "@/lib/abonnes";
import { isPaidPlan } from "@/lib/subscription";

const WEBHOOK_SECRET = process.env.NEWSLETTER_WEBHOOK_SECRET || "";
const NOTIFIED_PATH = path.join(process.cwd(), "data", "newsletter-notified.json");
const GRAPHQL_URL = "https://teal-horse-411567.hostingersite.com/graphql";

interface JournalDuJour {
  databaseId: number;
  title: string;
  numero: string;
  datePublication: string;
  featuredImage: { node: { sourceUrl: string } } | null;
}

function hasBeenNotified(slug: string): boolean {
  try {
    const data = JSON.parse(fs.readFileSync(NOTIFIED_PATH, "utf-8"));
    return Array.isArray(data) && data.includes(slug);
  } catch {
    return false;
  }
}

function markNotified(slug: string) {
  let data: string[] = [];
  try {
    data = JSON.parse(fs.readFileSync(NOTIFIED_PATH, "utf-8"));
  } catch {}
  if (!data.includes(slug)) {
    data.push(slug);
    fs.writeFileSync(NOTIFIED_PATH, JSON.stringify(data, null, 2));
  }
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

function buildJournalSection(journal: JournalDuJour, isActiveSubscriber: boolean): string {
  const cover = journal.featuredImage?.node?.sourceUrl || "";
  const numero = journal.numero ? `N° ${journal.numero}` : "";
  const readUrl = `https://leconomie.info/lecture/${journal.databaseId}`;
  const buyUrl = `https://leconomie.info/magazine`;

  return `
    <!-- Journal du Jour -->
    <div style="background:#fffbeb;border:2px solid #c9a84c;border-radius:12px;padding:20px;margin-bottom:24px;">
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
  `;
}

function trackUrl(targetUrl: string, cid: string, email: string): string {
  return `https://leconomie.info/api/newsletter/track?type=click&cid=${encodeURIComponent(cid)}&email=${encodeURIComponent(email)}&url=${encodeURIComponent(targetUrl)}`;
}

function openPixel(cid: string, email: string): string {
  return `<img src="https://leconomie.info/api/newsletter/track?type=open&cid=${encodeURIComponent(cid)}&email=${encodeURIComponent(email)}" width="1" height="1" style="display:none;" alt="" />`;
}

function buildEmail(article: {
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  imageUrl?: string;
}, unsubscribeUrl: string, journalHtml: string, cid: string, subscriberEmail: string): string {
  const articleUrl = `https://leconomie.info/article/${article.slug}`;
  const trackedArticleUrl = trackUrl(articleUrl, cid, subscriberEmail);
  const category = article.category?.toUpperCase() || "ACTUALITE";
  const excerpt = article.excerpt?.replace(/<[^>]+>/g, "").slice(0, 200) || "";

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
      <!-- Header -->
      <div style="background:#dc2626;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:bold;">L'ECONOMIE</h1>
          <p style="color:#fff;opacity:0.8;margin:2px 0 0;font-size:11px;">Le Premier quotidien économique de la zone CEMAC</p>
        </div>
        <span style="background:#fff;color:#dc2626;font-size:10px;font-weight:bold;padding:4px 10px;border-radius:20px;text-transform:uppercase;">${category}</span>
      </div>

      <!-- Content -->
      <div style="padding:32px 24px;">
        ${journalHtml}

        ${article.imageUrl ? `
        <div style="margin-bottom:20px;border-radius:8px;overflow:hidden;">
          <img src="${article.imageUrl}" alt="${article.title}" style="width:100%;max-height:300px;object-fit:cover;display:block;" />
        </div>` : ""}

        <p style="color:#dc2626;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Nouvel article</p>
        <h2 style="color:#111;font-size:22px;font-weight:bold;line-height:1.3;margin:0 0 14px;">${article.title}</h2>

        ${excerpt ? `<p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 24px;">${excerpt}…</p>` : ""}

        <div style="text-align:center;margin:24px 0;">
          <a href="${trackedArticleUrl}" style="background:#dc2626;color:#fff;padding:14px 36px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:14px;display:inline-block;">
            Lire l'article complet →
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
        <a href="https://leconomie.info" style="color:#dc2626;text-decoration:none;font-weight:bold;font-size:13px;">leconomie.info</a>
        <p style="color:#9ca3af;font-size:11px;margin:8px 0 4px;">© 2026 L'Economie — Tous droits réservés</p>
        <a href="${unsubscribeUrl}" style="color:#9ca3af;font-size:11px;text-decoration:underline;">Se désabonner de la newsletter</a>
      </div>
      ${openPixel(cid, subscriberEmail)}
    </div>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-webhook-secret") || req.nextUrl.searchParams.get("secret") || "";
    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();

    const postStatus = body.post_status || body.status || "publish";
    if (postStatus !== "publish") {
      return NextResponse.json({ success: true, skipped: true, reason: "non publié" });
    }

    const title    = body.post_title || body.title || "";
    const excerpt  = body.post_excerpt || body.excerpt || body.post_content || "";
    const slug     = body.post_name || body.slug || "";
    const imageUrl = body.post_thumbnail || body.featured_image_url || body.thumbnail || "";
    let category = body.category || "";
    if (!category && body.taxonomies) {
      const cats = body.taxonomies.category || body.taxonomies;
      if (cats && typeof cats === "object") {
        const first = Object.values(cats)[0] as Record<string, string> | undefined;
        category = first?.name || "";
      }
    }

    if (!title || !slug) {
      return NextResponse.json({ error: "Données article manquantes" }, { status: 400 });
    }

    if (hasBeenNotified(slug)) {
      return NextResponse.json({ success: true, skipped: true, reason: "déjà notifié" });
    }

    const subscribers = await readSubscribers();
    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    // Récupérer le dernier journal + la liste des abonnés actifs
    const [journal, abonnes] = await Promise.all([
      fetchLatestJournal(),
      readAbonnes(),
    ]);

    const now = Date.now();
    const activeEmails = new Set(
      abonnes
        .filter(a => isPaidPlan(a.plan) && a.expiresAt > now)
        .map(a => a.email.toLowerCase())
    );

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const campaignId = `notify-${slug}-${Date.now()}`;
    let sent = 0;
    const failed: { email: string; error: string }[] = [];
    const BATCH = 10;
    for (let i = 0; i < subscribers.length; i += BATCH) {
      const batch = subscribers.slice(i, i + BATCH);
      await Promise.allSettled(
        batch.map((sub) => {
          const unsubUrl = buildUnsubscribeUrl(sub.email, sub.token);
          const isActive = activeEmails.has(sub.email.toLowerCase());
          const journalHtml = journal ? buildJournalSection(journal, isActive) : "";
          return transporter.sendMail({
            from: `"L'Economie" <${process.env.SMTP_USER}>`,
            to: sub.email,
            subject: `[L'Economie] ${title}`,
            html: buildEmail({ title, excerpt, slug, category, imageUrl }, unsubUrl, journalHtml, campaignId, sub.email),
          }).then(() => { sent++; }).catch((err) => {
            failed.push({ email: sub.email, error: err instanceof Error ? err.message : String(err) });
          });
        })
      );
    }

    // Enregistrer le résultat détaillé de l'envoi
    try {
      const statsFile = path.join(process.cwd(), "data", "newsletter-stats.json");
      let stats: Record<string, object> = {};
      try { stats = JSON.parse(fs.readFileSync(statsFile, "utf-8")); } catch {}
      stats[campaignId] = {
        sent,
        total: subscribers.length,
        failed,
        opens: [],
        clicks: [],
        subject: `[L'Economie] ${title}`,
        date: new Date().toISOString(),
        status: "terminé",
      };
      fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
    } catch {}

    markNotified(slug);
    console.log(`Newsletter notify: ${sent}/${subscribers.length} emails envoyés pour "${title}" (${failed.length} échecs)`);
    return NextResponse.json({ success: true, sent, failed: failed.length, total: subscribers.length });
  } catch (err) {
    console.error("Newsletter notify error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}