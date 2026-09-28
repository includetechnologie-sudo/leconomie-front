import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { graphqlFetch } from "@/lib/graphql-fetch";
import { GET_AUTHOR } from "@/graphql/queries";
import { ORGANIZATION_ID, isRedactionAuthor } from "@/lib/organization";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

interface AuthorPost {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  featuredImage?: { node?: { sourceUrl?: string } };
  categories?: { nodes: { name: string }[] };
}

interface Author {
  name: string;
  slug: string;
  description: string | null;
  avatar?: { url?: string } | null;
  posts: { nodes: AuthorPost[] };
}

async function getAuthor(slug: string): Promise<Author | null> {
  const data = await graphqlFetch<{ user: Author | null }>(GET_AUTHOR, { slug });
  return data.user;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const author = await getAuthor(slug);
    if (!author) return {};
    const description = author.description?.trim()
      || `Les articles de ${author.name} sur L'Economie, le quotidien économique de la zone CEMAC.`;
    return {
      title: `${author.name} — articles et analyses`,
      description: description.slice(0, 160),
      alternates: { canonical: `${SITE_URL}/auteur/${slug}` },
      openGraph: { type: "profile", url: `${SITE_URL}/auteur/${slug}`, title: author.name, description },
    };
  } catch {
    return {};
  }
}

export default async function AuteurPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let author: Author | null;
  try {
    author = await getAuthor(slug);
  } catch {
    throw new Error("Impossible de charger l'auteur — WordPress inaccessible");
  }
  if (!author) notFound();

  const url = `${SITE_URL}/auteur/${slug}`;
  const redaction = isRedactionAuthor(slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "url": url,
    "mainEntity": redaction
      ? { "@id": ORGANIZATION_ID }
      : {
          "@type": "Person",
          "@id": `${url}#person`,
          "name": author.name,
          "url": url,
          ...(author.description ? { "description": author.description } : {}),
          ...(author.avatar?.url ? { "image": author.avatar.url } : {}),
          "worksFor": { "@id": ORGANIZATION_ID },
          "jobTitle": "Journaliste",
        },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="border-b-4 border-red-600 pb-6 mb-8 flex items-center gap-5">
        {author.avatar?.url && (
          <Image src={author.avatar.url} alt={author.name} width={96} height={96} className="rounded-full shrink-0" />
        )}
        <div>
          <nav className="text-sm text-gray-500 mb-2 flex items-center gap-2">
            <Link href="/" className="hover:text-red-600 transition">Accueil</Link>
            <span>›</span>
            <span className="text-gray-900 dark:text-slate-200 font-medium">Auteurs</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold">{author.name}</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2 max-w-3xl">
            {author.description?.trim() || (redaction
              ? "Les articles signés par la rédaction de L'Economie."
              : `Journaliste à L'Economie, le quotidien économique de la zone CEMAC.`)}
          </p>
        </div>
      </div>

      <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Derniers articles</h2>
      {author.posts.nodes.length === 0 ? (
        <p className="text-gray-500">Aucun article publié pour le moment.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {author.posts.nodes.map((post) => (
            <Link key={post.slug} href={`/article/${post.slug}`} className="group">
              <div className="relative h-[200px] rounded-lg overflow-hidden mb-4">
                <Image
                  src={post.featuredImage?.node?.sourceUrl || "/images/hero.jpg"}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <p className="text-xs text-gray-400 mb-1">{formatDate(post.date)}</p>
              <h3 className="font-bold text-lg leading-snug group-hover:text-red-600 transition line-clamp-2 mb-2">
                {post.title}
              </h3>
              <div className="text-sm text-gray-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: post.excerpt }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
