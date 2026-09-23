import Image from "next/image";
import Link from "next/link";
import { graphqlFetch } from "@/lib/graphql-fetch";
import { GET_PREMIUM_POSTS } from "@/graphql/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles Premium",
  description: "Découvrez tous les articles premium de L'Economie — analyses, enquêtes et décryptages exclusifs.",
};

interface PremiumPost {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  featuredImage?: { node?: { sourceUrl?: string } };
  categories?: { nodes: { name: string; slug: string }[] };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default async function ArticlesPremiumPage() {
  let posts: PremiumPost[] = [];
  try {
    const data = await graphqlFetch<{ posts: { nodes: PremiumPost[] } }>(GET_PREMIUM_POSTS);
    posts = data.posts?.nodes || [];
  } catch { /* silence, affiche page vide */ }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* En-tête */}
      <div className="border-b-4 border-[#c9a84c] pb-4 mb-8">
        <nav className="text-sm text-gray-500 mb-2 flex items-center gap-2">
          <Link href="/" className="hover:text-[#c9a84c] transition">Accueil</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Articles Premium</span>
        </nav>
        <div className="flex items-center gap-2">
          <svg width="26" height="26" fill="none" stroke="#c9a84c" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h1 className="text-4xl font-bold uppercase">Articles Premium</h1>
        </div>
        <p className="text-gray-500 text-sm mt-2 max-w-2xl">
          Nos analyses, enquêtes et décryptages exclusifs. Accessibles avec un abonnement, ou à l&apos;unité pour 200 FCFA (48h).
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">Aucun article premium disponible pour le moment.</p>
          <Link href="/" className="text-[#c9a84c] mt-4 inline-block hover:underline">← Retour à l&apos;accueil</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/article/${post.slug}`} className="group">
              <div className="relative h-[200px] rounded-lg overflow-hidden mb-4">
                <Image
                  src={post.featuredImage?.node?.sourceUrl || "/images/hero.jpg"}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-3 left-3 bg-[#c9a84c] text-black text-xs font-bold px-2 py-1 uppercase tracking-wide flex items-center gap-1">
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  Premium
                </span>
                {post.categories?.nodes[0] && (
                  <span className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1">
                    {post.categories.nodes[0].name}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-1">{formatDate(post.date)}</p>
              <h2 className="font-bold text-lg leading-snug group-hover:text-[#b8943f] transition line-clamp-2 mb-2">
                {post.title}
              </h2>
              <div
                className="text-sm text-gray-600 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: post.excerpt }}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
