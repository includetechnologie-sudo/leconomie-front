"use client";

import { useState } from "react";
import Image from "next/image";

const CHANNEL_ID = "UCQOk7FfVumWv2RLw9yIx2SQ";
const CHANNEL_URL = `https://www.youtube.com/channel/${CHANNEL_ID}?sub_confirmation=1`;

interface Video {
  videoId: string;
  title: string;
  thumbnail: string;
  published: string;
  description: string;
  url: string;
}

interface Props {
  videos: Video[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Il y a 1 jour";
  if (days < 7) return `Il y a ${days} jours`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "Il y a 1 semaine";
  if (weeks < 5) return `Il y a ${weeks} semaines`;
  return `Il y a ${Math.floor(days / 30)} mois`;
}

export default function VideoPlayerClient({ videos }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  if (videos.length === 0) return null;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => {
        const isPlaying = activeId === video.videoId;

        return (
          <div
            key={video.videoId}
            className="group bg-white rounded-xl overflow-hidden border hover:shadow-lg transition flex flex-col"
          >
            {/* Zone lecteur / thumbnail */}
            <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
              {isPlaying ? (
                /* Lecteur iframe YouTube — autoplay=1, rel=0 (pas de suggestions externes) */
                <iframe
                  src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                /* Thumbnail cliquable */
                <button
                  onClick={() => setActiveId(video.videoId)}
                  className="absolute inset-0 w-full h-full group/thumb"
                  aria-label={`Lire : ${video.title}`}
                >
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover group-hover/thumb:scale-105 transition duration-300"
                  />
                  {/* Overlay foncé au hover */}
                  <div className="absolute inset-0 bg-black/20 group-hover/thumb:bg-black/30 transition" />
                  {/* Bouton play */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-600/90 flex items-center justify-center shadow-xl group-hover/thumb:scale-110 group-hover/thumb:bg-red-600 transition">
                      <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  {/* Badge durée / YouTube */}
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <svg width="10" height="10" fill="red" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    YouTube
                  </div>
                </button>
              )}
            </div>

            {/* Infos */}
            <div className="p-4 flex flex-col flex-1">
              <p className="text-red-600 text-xs font-semibold mb-1 uppercase tracking-wide">
                L&apos;Économie TV · {timeAgo(video.published)}
              </p>
              <h3 className="font-serif font-bold text-sm leading-snug line-clamp-2 mb-2 flex-1">
                {video.title}
              </h3>
              {video.description && !isPlaying && (
                <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-3">
                  {video.description}
                </p>
              )}

              {/* Bouton S'abonner à la chaîne */}
              <a
                href={CHANNEL_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                S&apos;abonner à la chaîne
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
