import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { findVideo, getVideos, videoSlug, thumbnail, embedUrl, watchUrl, shortDescription, YT_CHANNEL_URL } from "@/lib/youtube";
import { ORGANIZATION_ID } from "@/lib/organization";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

// Relit l'archive régulièrement ; les nouvelles vidéos sont aussi régénérées à la demande (youtube-sync)
export const revalidate = 600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = findVideo(slug);
  if (!v) return {};
  const url = `${SITE_URL}/videos/${videoSlug(v)}`;
  const description = shortDescription(v);
  return {
    title: `${v.title} — L'Economie TV`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "video.other",
      url,
      title: v.title,
      description,
      images: [{ url: thumbnail(v.id), width: 480, height: 360 }],
      videos: [{ url: embedUrl(v.id) }],
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Douala" });
}

export default async function VideoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = findVideo(slug);
  if (!v) notFound();
  const canonicalSlug = videoSlug(v);
  if (slug !== canonicalSlug) permanentRedirect(`/videos/${canonicalSlug}`); // titre modifié sur YouTube

  const url = `${SITE_URL}/videos/${canonicalSlug}`;
  const autres = getVideos().filter((x) => x.id !== v.id).slice(0, 6);

  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": v.title,
    "description": v.description || v.title,
    "thumbnailUrl": [thumbnail(v.id, "maxresdefault"), thumbnail(v.id)],
    "uploadDate": v.published,
    "embedUrl": embedUrl(v.id),
    "url": url,
    "inLanguage": "fr",
    "publisher": { "@id": ORGANIZATION_ID },
    ...(v.views != null && {
      "interactionStatistic": { "@type": "InteractionCounter", "interactionType": { "@type": "WatchAction" }, "userInteractionCount": v.views },
    }),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": `${SITE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": "L'Economie TV", "item": `${SITE_URL}/videos` },
      { "@type": "ListItem", "position": 3, "name": v.title, "item": url },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([videoJsonLd, breadcrumbJsonLd]) }} />

      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-red-600 transition">Accueil</Link>
        <span>›</span>
        <Link href="/videos" className="hover:text-red-600 transition">L&apos;Economie TV</Link>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-2">{v.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Publiée le {formatDate(v.published)}
        {v.views != null && <> · {v.views.toLocaleString("fr-FR")} vue{v.views > 1 ? "s" : ""}</>}
        {" · "}
        <a href={watchUrl(v)} target="_blank" rel="noopener" className="text-red-600 hover:underline">Voir sur YouTube</a>
      </p>

      <div className={`relative w-full overflow-hidden rounded-xl bg-black mb-8 ${v.isShort ? "max-w-sm mx-auto aspect-[9/16]" : "aspect-video"}`}>
        <iframe
          src={embedUrl(v.id)}
          title={v.title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {v.description && (
        <div className="prose prose-lg max-w-none dark:prose-invert whitespace-pre-line mb-10">{v.description}</div>
      )}

      <p className="mb-12">
        <a href={`${YT_CHANNEL_URL}?sub_confirmation=1`} target="_blank" rel="noopener"
          className="inline-block bg-red-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-red-700 transition">
          S&apos;abonner à L&apos;Economie TV
        </a>
      </p>

      {autres.length > 0 && (
        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-5">Autres vidéos</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {autres.map((o) => (
              <Link key={o.id} href={`/videos/${videoSlug(o)}`} className="group">
                <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                  <Image src={thumbnail(o.id)} alt={o.title} fill className="object-cover group-hover:scale-105 transition duration-300" />
                </div>
                <h3 className="font-semibold leading-snug group-hover:text-red-600 transition line-clamp-2">{o.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
