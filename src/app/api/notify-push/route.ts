import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Vérification du secret partagé avec WordPress
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.NEWSLETTER_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { title, excerpt, slug, imageUrl } = await req.json().catch(() => ({}));

  if (!title || !slug) {
    return NextResponse.json({ error: "Paramètres manquants (title, slug)" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";
  const articleUrl = `${siteUrl}/article/${slug}`;

  const payload = {
    app_id: process.env.ONESIGNAL_APP_ID,
    included_segments: ["All"],
    headings: { fr: "L'Économie", en: "L'Économie" },
    contents: { fr: title, en: title },
    subtitle: { fr: excerpt ? excerpt.slice(0, 100) : "Nouvelle publication", en: excerpt ? excerpt.slice(0, 100) : "New article" },
    url: articleUrl,
    ...(imageUrl ? { big_picture: imageUrl, large_icon: imageUrl } : {}),
    chrome_web_icon: `${siteUrl}/images/favicon.png`,
    firefox_icon: `${siteUrl}/images/favicon.png`,
    web_push_topic: "new-article",
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

    return NextResponse.json({ success: true, recipients: data.recipients, id: data.id });
  } catch (err) {
    console.error("notify-push error:", err);
    return NextResponse.json({ error: "Erreur réseau" }, { status: 500 });
  }
}
