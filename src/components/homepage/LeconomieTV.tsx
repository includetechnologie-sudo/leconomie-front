import Link from "next/link";
import VideoPlayerClient from "./VideoPlayerClient";

const CHANNEL_ID = "UCQOk7FfVumWv2RLw9yIx2SQ";
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const CHANNEL_URL = `https://www.youtube.com/channel/${CHANNEL_ID}`;

interface Video {
  videoId: string;
  title: string;
  thumbnail: string;
  published: string;
  description: string;
  url: string;
}

function parseRSS(xml: string): Video[] {
  const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
  return entries.slice(0, 3).map((entry) => {
    const videoId = (entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1] || "";
    const title = (entry.match(/<media:title>([^<]+)<\/media:title>/) || [])[1] || "";
    const thumbnail = (entry.match(/url="([^"]+hqdefault\.jpg)"/) || [])[1] ||
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const published = (entry.match(/<published>([^<]+)<\/published>/) || [])[1] || "";
    const description = (entry.match(/<media:description>([^<]*)<\/media:description>/) || [])[1] || "";
    const isShort = entry.includes("/shorts/");
    const url = isShort
      ? `https://www.youtube.com/shorts/${videoId}`
      : `https://www.youtube.com/watch?v=${videoId}`;

    return { videoId, title: decodeXml(title), thumbnail, published, description: decodeXml(description), url };
  });
}

function decodeXml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n/g, " ")
    .trim();
}

export default async function LeconomieTV() {
  let videos: Video[] = [];

  try {
    const res = await fetch(RSS_URL, { next: { revalidate: 3600 } });
    const xml = await res.text();
    videos = parseRSS(xml);
  } catch (err) {
    console.error("LeconomieTV RSS error:", err);
  }

  if (videos.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-16">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="w-1 h-7 bg-red-600 inline-block"></span>
          <h2 className="font-serif text-2xl font-bold uppercase tracking-wide">
            L&apos;Economie TV
          </h2>
        </div>
        <Link
          href={CHANNEL_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-red-600 text-sm font-semibold hover:underline"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Voir toutes les vidéos →
        </Link>
      </div>

      {/* Lecteur vidéo client */}
      <VideoPlayerClient videos={videos} />

    </section>
  );
}
