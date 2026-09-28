import Image from "next/image";
import Link from "next/link";
import { graphqlFetch } from "@/lib/graphql-fetch";
import { GET_POSTS_BY_CATEGORY } from "@/graphql/queries";
import LoadMorePosts from "@/components/category/LoadMorePosts";
import { CATEGORY_MAP } from "@/lib/categories";
import { permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

// Les anciennes URL WordPress (`/{slug}/`) sont encore connues de Google et des réseaux
// sociaux : si le segment est le slug d'un article, on redirige vers `/article/{slug}`.
async function isPostSlug(slug: string): Promise<boolean> {
  try {
    const data = await graphqlFetch<{ post: { slug: string } | null }>(
      `query IsPostSlug($slug: ID!) { post(id: $slug, idType: SLUG) { slug } }`,
      { slug }
    );
    return !!data.post;
  } catch {
    return false;
  }
}

interface CatPost {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  featuredImage?: { node?: { sourceUrl?: string } };
  categories?: { nodes: { name: string; slug: string }[] };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export async function generateMetadata(
  { params }: { params: Promise<{ categorie: string }> }
): Promise<Metadata> {
  const { categorie } = await params;
  const label = CATEGORY_MAP[categorie] || categorie;
  return {
    title: `${label} — Actualités`,
    description: `Toute l'actualité ${label} de la zone CEMAC sur L'Economie.`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info"}/${categorie}`,
    },
  };
}

export default async function CategoriePage({
  params,
}: {
  params: Promise<{ categorie: string }>;
}) {
  const { categorie } = await params;
  const categoryName = CATEGORY_MAP[categorie];

  if (!categoryName) {
    if (await isPostSlug(categorie)) permanentRedirect(`/article/${categorie}`);

    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Rubrique introuvable</h1>
        <Link href="/" className="text-red-600 mt-4 inline-block hover:underline">← Retour à l'accueil</Link>
      </div>
    );
  }

  let posts: CatPost[] = [];
  let hasNextPage = false;
  let endCursor: string | null = null;
  try {
    const data = await graphqlFetch<{
      posts: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: CatPost[];
      };
    }>(GET_POSTS_BY_CATEGORY, { category: categoryName });
    posts = data.posts.nodes;
    hasNextPage = data.posts.pageInfo.hasNextPage;
    endCursor = data.posts.pageInfo.endCursor;
  } catch { /* silence, affiche page vide */ }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* En-tête rubrique */}
      <div className="border-b-4 border-red-600 pb-4 mb-8">
        <nav className="text-sm text-gray-500 mb-2 flex items-center gap-2">
          <Link href="/" className="hover:text-red-600 transition">Accueil</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">{categoryName}</span>
        </nav>
        <h1 className="text-4xl font-bold uppercase">{categoryName}</h1>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">Aucun article disponible pour le moment.</p>
          <Link href="/" className="text-red-600 mt-4 inline-block hover:underline">← Retour à l'accueil</Link>
        </div>
      ) : (
        <>
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
                  {post.categories?.nodes[0] && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1">
                      {post.categories.nodes[0].name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-1">{formatDate(post.date)}</p>
                <h2 className="font-bold text-lg leading-snug group-hover:text-red-600 transition line-clamp-2 mb-2">
                  {post.title}
                </h2>
                <div
                  className="text-sm text-gray-600 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: post.excerpt }}
                />
              </Link>
            ))}
          </div>
          <LoadMorePosts
            categoryName={categoryName}
            initialCursor={endCursor}
            initialHasNext={hasNextPage}
          />
        </>
      )}
    </div>
  );
}
