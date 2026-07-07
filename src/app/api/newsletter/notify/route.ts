import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { readSubscribers, buildUnsubscribeUrl } from "@/lib/newsletter";

const WEBHOOK_SECRET = process.env.NEWSLETTER_WEBHOOK_SECRET || "";
const NOTIFIED_PATH = path.join(process.cwd(), "data", "newsletter-notified.json");

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

function buildEmail(article: {
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  imageUrl?: string;
}, unsubscribeUrl: string): string {
  const articleUrl = `https://leconomie.info/article/${article.slug}`;
  const category = article.category?.toUpperCase() || "ACTUALITÉ";
  const excerpt = article.excerpt?.replace(/<[^>]+>/g, "").slice(0, 200) || "";

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
      <!-- Header -->
      <div style="background:#dc2626;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:bold;">L'ÉCONOMIE</h1>
          <p style="color:#fff;opacity:0.8;margin:2px 0 0;font-size:11px;">Le Premier quotidien économique de la zone CEMAC</p>
        </div>
        <span style="background:#fff;color:#dc2626;font-size:10px;font-weight:bold;padding:4px 10px;border-radius:20px;text-transform:uppercase;">${category}</span>
      </div>

      <!-- Article -->
      <div style="padding:32px 24px;">
        ${article.imageUrl ? `
        <div style="margin-bottom:20px;border-radius:8px;overflow:hidden;">
          <img src="${article.imageUrl}" alt="${article.title}" style="width:100%;max-height:300px;object-fit:cover;display:block;" />
        </div>` : ""}

        <p style="color:#dc2626;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Nouvel article</p>
        <h2 style="color:#111;font-size:22px;font-weight:bold;line-height:1.3;margin:0 0 14px;">${article.title}</h2>

        ${excerpt ? `<p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 24px;">${excerpt}…</p>` : ""}

        <div style="text-align:center;margin:24px 0;">
          <a href="${articleUrl}" style="background:#dc2626;color:#fff;padding:14px 36px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:14px;display:inline-block;">
            Lire l'article complet →
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
        <a href="https://leconomie.info" style="color:#dc2626;text-decoration:none;font-weight:bold;font-size:13px;">leconomie.info</a>
        <p style="color:#9ca3af;font-size:11px;margin:8px 0 4px;">© 2026 L'Économie — Tous droits réservés</p>
        <a href="${unsubscribeUrl}" style="color:#9ca3af;font-size:11px;text-decoration:underline;">Se désabonner de la newsletter</a>
      </div>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  try {
    // Vérification du secret
    const secret = req.headers.get("x-webhook-secret") || req.nextUrl.searchParams.get("secret") || "";
    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();

    // Ignorer les brouillons/révisions — on ne notifie que les articles publiés
    const postStatus = body.post_status || body.status || "publish";
    if (postStatus !== "publish") {
      return NextResponse.json({ success: true, skipped: true, reason: "non publié" });
    }

    // WP Webhooks envoie les données de l'article publié
    const title    = body.post_title || body.title || "";
    const excerpt  = body.post_excerpt || body.excerpt || body.post_content || "";
    const slug     = body.post_name || body.slug || "";
    // WP Webhooks : post_thumbnail = URL directe de l'image mise en avant
    const imageUrl = body.post_thumbnail || body.featured_image_url || body.thumbnail || "";
    // WP Webhooks : taxonomies est un objet { category: { slug: { name, ... } } }
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

    // Anti-doublon : si cet article a déjà été notifié, on ignore
    if (hasBeenNotified(slug)) {
      return NextResponse.json({ success: true, skipped: true, reason: "déjà notifié" });
    }

    const subscribers = await readSubscribers();
    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, sent: 0 });
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

    // Envoi en parallèle par batch de 10
    let sent = 0;
    const BATCH = 10;
    for (let i = 0; i < subscribers.length; i += BATCH) {
      const batch = subscribers.slice(i, i + BATCH);
      await Promise.allSettled(
        batch.map((sub) => {
          const unsubUrl = buildUnsubscribeUrl(sub.email, sub.token);
          return transporter.sendMail({
            from: `"L'Économie" <${process.env.SMTP_USER}>`,
            to: sub.email,
            subject: `[L'Économie] ${title}`,
            html: buildEmail({ title, excerpt, slug, category, imageUrl }, unsubUrl),
          }).then(() => { sent++; });
        })
      );
    }

    markNotified(slug);
    console.log(`Newsletter notify: ${sent}/${subscribers.length} emails envoyés pour "${title}"`);
    return NextResponse.json({ success: true, sent, total: subscribers.length });
  } catch (err) {
    console.error("Newsletter notify error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
