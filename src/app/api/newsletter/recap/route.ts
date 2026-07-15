import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { checkDashboardAuth } from "@/lib/dashboard-auth";

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
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
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
      <!-- Header -->
      <div style="background:#dc2626;padding:24px;text-align:center;border-radius:8px 8px 0 0;">
        <img src="https://leconomie.info/images/favicon.png" alt="L'Économie" style="height:50px;width:auto;" />
        <p style="color:#fca5a5;margin:8px 0 0;font-size:11px;">Le Premier quotidien économique de la zone CEMAC</p>
      </div>

      <!-- Date banner -->
      <div style="background:#1f2937;padding:12px 24px;text-align:center;">
        <span style="color:#fff;font-size:13px;font-weight:bold;letter-spacing:1px;">RÉCAPITULATIF DU ${dateStr}</span>
      </div>

      <!-- Articles -->
      <div style="padding:24px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${articleBlocks}
        </table>
      </div>

      <!-- CTA -->
      <div style="padding:0 24px 32px;text-align:center;">
        <a href="https://leconomie.info" style="background:#dc2626;color:#fff;padding:14px 36px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:14px;display:inline-block;">
          Voir tous les articles sur leconomie.info
        </a>
      </div>

      <!-- Footer -->
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

export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-dashboard-token");
  if (!checkDashboardAuth(auth)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { to } = await req.json();
  if (!to) return NextResponse.json({ error: "Adresse email requise" }, { status: 400 });

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

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"L'Économie" <${process.env.SMTP_USER}>`,
    to,
    subject: `L'Économie — Récapitulatif du ${today}`,
    html: buildRecapEmail(articles, today),
  });

  transporter.close();
  return NextResponse.json({ success: true, to, articlesCount: articles.length });
}
