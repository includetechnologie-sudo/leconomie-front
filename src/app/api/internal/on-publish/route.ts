import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { WP_CACHE_TAG } from "@/lib/graphql-fetch";
import { checkInternalSecret } from "@/lib/internal-secret";
import { submitIndexNow } from "@/lib/indexnow";
import { sendArticlePush } from "@/lib/push";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

// Appelée par scripts/publish-watch.mjs (cron du VPS) quand de nouveaux articles sont publiés.
// Corps : { articles: [{ slug, title, excerpt?, imageUrl?, isNew }] } — isNew=false pour une simple mise à jour.
export async function POST(req: NextRequest) {
  if (!checkInternalSecret(req.headers.get("x-internal-secret"))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { articles = [] } = (await req.json().catch(() => ({}))) as {
    articles?: { slug: string; title: string; excerpt?: string; imageUrl?: string; isNew?: boolean }[];
  };

  // 1. Le site affiche tout de suite les nouveautés (accueil, rubriques, sitemap News…)
  revalidateTag(WP_CACHE_TAG, "max");

  // 2. Moteurs prévenus immédiatement
  const urls = articles.map((a) => `${SITE_URL}/article/${a.slug}`);
  const indexnow = await submitIndexNow(urls.length ? [...urls, `${SITE_URL}/`] : []);

  // 3. Notification push, uniquement pour les nouvelles publications
  const push = [];
  for (const a of articles.filter((x) => x.isNew)) push.push({ slug: a.slug, ...(await sendArticlePush(a)) });

  console.log(`on-publish: ${articles.length} article(s), IndexNow ${indexnow.status}, push ${push.filter((p) => p.ok).length}/${push.length}`);
  return NextResponse.json({ ok: true, indexnow, push });
}
