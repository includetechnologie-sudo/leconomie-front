import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Body invalide" }, { status: 400 }); }

  // WP Webhooks envoie les données sous différentes formes selon la version
  // post_title, post_name (slug), post_excerpt, post_status, featured_image_url
  const title =
    (body.post_title as string) ||
    (body.title as string) ||
    "";

  const slug =
    (body.post_name as string) ||
    (body.slug as string) ||
    "";

  const excerpt =
    (body.post_excerpt as string) ||
    (body.excerpt as string) ||
    "";

  const imageUrl =
    (body.featured_image_url as string) ||
    (body.imageUrl as string) ||
    "";

  const status =
    (body.post_status as string) ||
    (body.status as string) ||
    "publish";

  // N'envoie la notif que pour les articles publiés (pas les brouillons)
  if (status !== "publish") {
    return NextResponse.json({ skipped: true, reason: `status=${status}` });
  }

  if (!title || !slug) {
    console.error("notify-push: title ou slug manquant", body);
    return NextResponse.json({ error: "title et slug requis", received: body }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";
  const articleUrl = `${siteUrl}/article/${slug}`;

  const payload = {
    app_id: process.env.ONESIGNAL_APP_ID,
    included_segments: ["All"],
    headings: { fr: "L'Economie", en: "L'Economie" },
    contents: { fr: title, en: title },
    subtitle: {
      fr: excerpt ? excerpt.replace(/<[^>]+>/g, "").slice(0, 100) : "Nouvelle publication",
      en: excerpt ? excerpt.replace(/<[^>]+>/g, "").slice(0, 100) : "New article",
    },
    url: articleUrl,
    ...(imageUrl ? { big_picture: imageUrl, large_icon: imageUrl } : {}),
    chrome_web_icon: `${siteUrl}/images/favicon.png`,
    firefox_icon: `${siteUrl}/images/favicon.png`,
  };

  try {
    const res = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("OneSignal error:", data);
      return NextResponse.json({ error: "Erreur OneSignal", details: data }, { status: 500 });
    }

    console.log(`notify-push: notif envoyée — "${title}" → ${data.recipients} abonnés`);
    return NextResponse.json({ success: true, recipients: data.recipients, id: data.id });
  } catch (err) {
    console.error("notify-push error:", err);
    return NextResponse.json({ error: "Erreur réseau" }, { status: 500 });
  }
}
