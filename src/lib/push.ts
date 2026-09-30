// Notification push (OneSignal) annonçant un nouvel article à tous les abonnés
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

export async function sendArticlePush(article: { title: string; slug: string; excerpt?: string; imageUrl?: string }) {
  if (!process.env.ONESIGNAL_APP_ID || !process.env.ONESIGNAL_REST_API_KEY) {
    return { ok: false, error: "OneSignal non configuré" };
  }
  const subtitle = article.excerpt ? article.excerpt.replace(/<[^>]+>/g, "").trim().slice(0, 100) : "";
  const payload = {
    app_id: process.env.ONESIGNAL_APP_ID,
    included_segments: ["All"],
    headings: { fr: "L'Economie", en: "L'Economie" },
    contents: { fr: article.title, en: article.title },
    subtitle: { fr: subtitle || "Nouvelle publication", en: subtitle || "New article" },
    url: `${SITE_URL}/article/${article.slug}`,
    ...(article.imageUrl ? { big_picture: article.imageUrl, large_icon: article.imageUrl } : {}),
    chrome_web_icon: `${SITE_URL}/images/favicon.png`,
    firefox_icon: `${SITE_URL}/images/favicon.png`,
  };
  try {
    const res = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Key ${process.env.ONESIGNAL_REST_API_KEY}` },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return res.ok ? { ok: true, recipients: data.recipients } : { ok: false, error: data };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
