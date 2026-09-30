import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getVideos, videoSlug, thumbnail, YT_CHANNEL_URL } from "@/lib/youtube";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "L'Economie TV — vidéos, émissions et analyses économiques",
  description: "Toutes les vidéos de L'Economie TV : émissions, interviews de décideurs, analyses de l'économie camerounaise et africaine.",
  alternates: { canonical: `${SITE_URL}/videos` },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Douala" });
}

export default function VideosPage() {
  const videos = getVideos();

  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "L'Economie TV",
    "itemListElement": videos.slice(0, 50).map((v, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": `${SITE_URL}/videos/${videoSlug(v)}`,
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {videos.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }} />}

      <header className="border-b-4 border-red-600 pb-4 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase">L&apos;Economie TV</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">Émissions, interviews de décideurs et analyses de l&apos;économie camerounaise et africaine.</p>
        </div>
        <a href={`${YT_CHANNEL_URL}?sub_confirmation=1`} target="_blank" rel="noopener"
          className="bg-red-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-red-700 transition text-sm">
          S&apos;abonner sur YouTube
        </a>
      </header>

      {videos.length === 0 ? (
        <p className="text-gray-500">Les vidéos arrivent bientôt.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((v) => (
            <Link key={v.id} href={`/videos/${videoSlug(v)}`} className="group">
              <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                <Image src={thumbnail(v.id)} alt={v.title} fill className="object-cover group-hover:scale-105 transition duration-300" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center">
                    <svg width="22" height="22" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-1">{formatDate(v.published)}</p>
              <h2 className="font-bold text-lg leading-snug group-hover:text-red-600 transition line-clamp-2">{v.title}</h2>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
