import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { graphqlFetch } from "@/lib/graphql-fetch";
import { GET_POST_BY_SLUG, GET_RELATED_POSTS, GET_JOURNAUX } from "@/graphql/queries";
import PremiumWall from "@/components/article/PremiumWall";
import NewsletterForm from "@/components/newsletter/NewsletterForm";
import { parseAccessCookie, canAccess } from "@/lib/subscription";
import type { JournalWP } from "@/lib/types";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await graphqlFetch<{ post: Post }>(GET_POST_BY_SLUG, { slug });
    const post = data.post;
    if (!post) return {};

    const image = post.featuredImage?.node?.sourceUrl || `${SITE_URL}/images/og-default.jpg`;
    const description = post.excerpt
      ? post.excerpt.replace(/<[^>]*>/g, "").trim().slice(0, 160)
      : "";
    const category = post.categories?.nodes[0];
    const url = `${SITE_URL}/article/${slug}`;

    return {
      title: post.title,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        url,
        title: post.title,
        description,
        images: [{ url: image, width: 1200, height: 630 }],
        publishedTime: post.date,
        modifiedTime: post.modified,
        authors: post.author?.node?.name ? [post.author.node.name] : [],
        section: category?.name,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
        images: [image],
      },
    };
  } catch {
    return {};
  }
}

interface Post {
  title: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  slug: string;
  featuredImage?: { node?: { sourceUrl?: string; altText?: string } };
  categories?: { nodes: { name: string; slug: string }[] };
  author?: { node?: { name: string } };
  tags?: { nodes: { name: string }[] };
}

interface RelatedPost {
  title: string;
  slug: string;
  date: string;
  featuredImage?: { node?: { sourceUrl?: string } };
  categories?: { nodes: { name: string }[] };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function readingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, "");
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Vérifie le plan de l'utilisateur — seul mensuel/annuel non expiré accède au premium
  const cookieStore = await cookies();
  const access = cookieStore.get("abonne_access");
  let hasPremiumAccess = false;
  if (access) {
    try {
      const user = parseAccessCookie(access.value);
      hasPremiumAccess = user !== null && canAccess(user.plan, "premium") && !user.isExpired;
    } catch { /* cookie invalide */ }
  }

  let post: Post | null = null;
  let fetchError = false;
  try {
    const data = await graphqlFetch<{ post: Post }>(GET_POST_BY_SLUG, { slug });
    post = data.post;
  } catch {
    fetchError = true;
  }

  // Erreur réseau (WordPress inaccessible) → page d'erreur, pas 404
  if (fetchError) {
    throw new Error("Impossible de charger l'article — WordPress inaccessible");
  }

  // Article vraiment introuvable dans WordPress → 404
  if (!post) notFound();

  const category = post.categories?.nodes[0];
  const image = post.featuredImage?.node?.sourceUrl || "/images/hero.jpg";
  const minutes = readingTime(post.content);
  // Article premium = tag "premium" dans WordPress
  const isPremium = post.tags?.nodes?.some(t => t.name.toLowerCase() === "premium") ?? false;
  const showWall = isPremium && !hasPremiumAccess;

  let related: RelatedPost[] = [];
  if (category) {
    try {
      const rel = await graphqlFetch<{ posts: { nodes: RelatedPost[] } }>(
        GET_RELATED_POSTS,
        { category: category.name }
      );
      related = rel.posts.nodes.filter(r => r.slug !== slug).slice(0, 3);
    } catch { /* silence */ }
  }

  // Dernier journal pour la sidebar
  let latestJournal: JournalWP | null = null;
  try {
    const jData = await graphqlFetch<{ journaux: { nodes: JournalWP[] } }>(GET_JOURNAUX);
    latestJournal = jData.journaux.nodes[0] ?? null;
  } catch { /* fallback placeholder */ }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-[1fr_300px] gap-10">

        {/* ── Contenu principal ── */}
        <article>
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-red-600 transition">Accueil</Link>
            <span>›</span>
            {category && (
              <>
                <Link href={`/${category.slug}`} className="hover:text-red-600 transition capitalize">
                  {category.name}
                </Link>
                <span>›</span>
              </>
            )}
            <span className="text-gray-400 truncate max-w-[300px]">{post.title}</span>
          </nav>

          {/* Badge catégorie */}
          {category && (
            <Link href={`/${category.slug}`}
              className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 mb-4 uppercase tracking-wide hover:bg-red-700 transition">
              {category.name}
            </Link>
          )}

          {/* Titre */}
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{post.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-6 border-b pb-4">
            {post.author?.node?.name && (
              <span className="font-medium text-gray-700 flex items-center gap-1">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {post.author.node.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {formatDate(post.date)}
            </span>
            {post.modified !== post.date && (
              <span className="text-gray-400 text-xs">Mis à jour le {formatDate(post.modified)}</span>
            )}
            <span className="flex items-center gap-1 text-gray-400 text-xs">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Temps de lecture {minutes} min
            </span>
          </div>

          {/* Image principale */}
          <div className="relative rounded-lg overflow-hidden mb-8" style={{ aspectRatio: "16/9" }}>
            <Image
              src={image}
              alt={post.featuredImage?.node?.altText || post.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Contenu article — mur premium si non connecté */}
          {showWall ? (
            <PremiumWall content={post.content} />
          ) : (
            <div
              className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-red-600 prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}

          {/* Barre newsletter inline */}
          <NewsletterForm variant="article-bar" />

          {/* Tags */}
          {post.tags && post.tags.nodes.filter(t => t.name.toLowerCase() !== "premium").length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tags :</span>
              {post.tags.nodes
                .filter(t => t.name.toLowerCase() !== "premium")
                .map(tag => (
                  <span
                    key={tag.name}
                    className="text-xs bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 px-3 py-1 rounded-full border border-gray-200 transition cursor-default"
                  >
                    {tag.name}
                  </span>
                ))}
            </div>
          )}

          {/* Partage social */}
          <div className="mt-6 pt-6 border-t flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-gray-600">Partager :</span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://leconomie.info/article/${slug}`)}`}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 bg-[#1877F2] text-white text-xs font-bold px-3 py-1.5 rounded hover:opacity-90 transition"
            >
              <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://leconomie.info/article/${slug}`)}&text=${encodeURIComponent(post.title)}`}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 bg-black text-white text-xs font-bold px-3 py-1.5 rounded hover:opacity-90 transition"
            >
              <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${post.title} - https://leconomie.info/article/${slug}`)}`}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-3 py-1.5 rounded hover:opacity-90 transition"
            >
              <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </article>

        {/* ── Sidebar ── */}
        <aside className="space-y-6">

          {/* ZONE 1 — Actuellement en kiosque */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-red-600 text-white text-center py-2.5 px-4">
              <p className="text-xs font-bold uppercase tracking-widest">Actuellement en kiosque</p>
            </div>
            <div className="p-4 bg-white">
              <div className="relative w-full rounded-lg overflow-hidden shadow-md mb-3" style={{ aspectRatio: "3/4" }}>
                <Image
                  src={latestJournal?.featuredImage?.node?.sourceUrl || "/images/journal-cover.jpg"}
                  alt="Dernière édition du journal L'Économie"
                  fill
                  className="object-cover"
                />
              </div>
              {latestJournal && (
                <div className="mb-2 text-center">
                  {latestJournal.numero && (
                    <p className="text-xs font-bold text-red-600">N° {latestJournal.numero}</p>
                  )}
                  {latestJournal.datePublication && (
                    <p className="text-[10px] text-gray-400">{latestJournal.datePublication}</p>
                  )}
                </div>
              )}
              <Link
                href={`/magazine?achat=${latestJournal?.databaseId ?? ""}`}
                className="block w-full bg-red-600 text-white text-center py-2 rounded-lg font-bold text-xs hover:bg-red-700 transition"
              >
                Achetez votre journal — 300 FCFA
              </Link>
              <p className="text-[10px] text-gray-400 text-center mt-1.5">www.leconomie.info</p>
            </div>
          </div>

          {/* Newsletter + Push */}
          <NewsletterForm variant="sidebar" />

          {/* ZONE 2 — Pub maison */}
          <Link href="/abonnement" className="block group">
            <div className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
              <Image
                src="/images/pub-maison.jpg"
                alt="Abonnement numérique L'Économie"
                width={300}
                height={400}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition" />
            </div>
          </Link>

          {/* Les plus lus */}
          {related.length > 0 && (
            <div>
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-red-600 inline-block rounded" />
                Les plus lus
              </h3>
              <div className="space-y-4">
                {related.map((r, i) => (
                  <Link key={r.slug} href={`/article/${r.slug}`} className="flex gap-3 group">
                    <span className="text-red-600 font-bold text-lg w-5 shrink-0">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-xs text-red-600 font-semibold mb-0.5">
                        {r.categories?.nodes[0]?.name}
                      </p>
                      <h4 className="text-sm font-medium leading-snug group-hover:text-red-600 transition line-clamp-2">
                        {r.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Accès Premium */}
          <div className="border-2 border-red-600 rounded-xl p-5">
            <h3 className="font-bold text-base mb-1">Accès Premium</h3>
            <p className="text-xs text-gray-600 mb-3">
              Accédez à l&apos;intégralité des articles, archives et magazine.
            </p>
            <Link href="/abonnement"
              className="block w-full bg-red-600 text-white text-center py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition">
              S&apos;abonner dès 5 000 FCFA/mois
            </Link>
          </div>

        </aside>
      </div>

      {/* ── DANS LA MÊME CATÉGORIE — pleine largeur ── */}
      {related.length > 0 && (
        <div className="mt-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-7 bg-red-600 rounded inline-block" />
            <h2 className="text-xl font-bold uppercase tracking-wide">Dans la même catégorie</h2>
            {category && (
              <Link href={`/${category.slug}`} className="ml-auto text-sm text-red-600 font-semibold hover:underline whitespace-nowrap">
                Voir plus →
              </Link>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((r) => (
              <Link key={r.slug} href={`/article/${r.slug}`} className="group flex flex-col">
                <div className="relative rounded-lg overflow-hidden mb-3" style={{ aspectRatio: "16/9" }}>
                  <Image
                    src={r.featuredImage?.node?.sourceUrl || "/images/hero.jpg"}
                    alt={r.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                  {r.categories?.nodes[0] && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                      {r.categories.nodes[0].name}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm leading-snug group-hover:text-red-600 transition line-clamp-2 flex-1">
                  {r.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{formatDate(r.date)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── BANDEAU 2026 — pleine largeur sous l'article ── */}
      <div className="mt-12">
        <Link href="/abonnement" className="block hover:opacity-95 transition rounded-lg overflow-hidden">
          <Image
            src="/images/bandeau-2026.jpg"
            alt="Souscrivez à un abonnement numérique annuel à 50 000 FCFA"
            width={1400}
            height={224}
            className="w-full h-auto object-cover"
          />
        </Link>
      </div>

    </div>
  );
}
