import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { graphqlFetch } from "@/lib/graphql-fetch";

// Mapping slug URL → catégories WordPress à essayer (par ordre de priorité)
const PAYS_CONFIG: Record<string, {
  name: string;
  flag: string;
  description: string;
  slugs: string[];   // slugs WordPress à tenter
}> = {
  cameroun: {
    name: "Cameroun", flag: "🇨🇲",
    description: "Leader économique de la CEMAC",
    slugs: ["cameroun", "cameroon"],
  },
  tchad: {
    name: "Tchad", flag: "🇹🇩",
    description: "Économie soutenue par les secteurs pétrolier et agricole",
    slugs: ["tchad", "chad"],
  },
  rca: {
    name: "République Centrafricaine", flag: "🇨🇫",
    description: "Développement des infrastructures et du secteur minier",
    slugs: ["republique-centrafricaine", "centrafrique", "rca", "central-african-republic"],
  },
  congo: {
    name: "Congo", flag: "🇨🇬",
    description: "Développement industriel et investissements énergétiques",
    slugs: ["congo", "congo-brazzaville", "republique-du-congo"],
  },
  gabon: {
    name: "Gabon", flag: "🇬🇦",
    description: "Économie portée par le pétrole et la forêt équatoriale",
    slugs: ["gabon"],
  },
  "guinee-equatoriale": {
    name: "Guinée Équatoriale", flag: "🇬🇶",
    description: "Secteur pétrolier dominant et diversification en cours",
    slugs: ["guinee-equatoriale", "guinee-equatoriale-2", "equatorial-guinea"],
  },
};

interface Post {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  featuredImage?: { node: { sourceUrl: string } } | null;
  categories: { nodes: { name: string; slug: string }[] };
}

const GET_POSTS_BY_CATEGORY = `
  query GetPostsByCategory($category: String!, $after: String) {
    posts(first: 12, after: $after, where: { categoryName: $category }) {
      pageInfo { hasNextPage endCursor }
      nodes {
        title slug date excerpt
        featuredImage { node { sourceUrl } }
        categories { nodes { name slug } }
      }
    }
  }
`;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").slice(0, 160);
}

export default async function PaysPage({
  params,
}: {
  params: Promise<{ pays: string }>;
}) {
  const { pays } = await params;
  const config = PAYS_CONFIG[pays];
  if (!config) notFound();

  // Essaie chaque slug WordPress jusqu'à trouver des articles
  let posts: Post[] = [];
  let hasNextPage = false;
  let endCursor: string | null = null;

  for (const slug of config.slugs) {
    try {
      const data = await graphqlFetch<{
        posts: { pageInfo: { hasNextPage: boolean; endCursor: string }; nodes: Post[] };
      }>(GET_POSTS_BY_CATEGORY, { category: slug });
      if (data.posts.nodes.length > 0) {
        posts = data.posts.nodes;
        hasNextPage = data.posts.pageInfo.hasNextPage;
        endCursor = data.posts.pageInfo.endCursor;
        break;
      }
    } catch { /* essaie le suivant */ }
  }

  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Bandeau pays */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="text-gray-400 hover:text-white text-sm transition">Accueil</Link>
            <span className="text-gray-600">/</span>
            <Link href="/cemac" className="text-gray-400 hover:text-white text-sm transition">CEMAC</Link>
            <span className="text-gray-600">/</span>
            <span className="text-white text-sm">{config.name}</span>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-5xl">{config.flag}</span>
            <div>
              <h1 className="font-serif text-3xl font-bold">{config.name}</h1>
              <p className="text-gray-400 mt-1">{config.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-2">Aucun article trouvé pour <strong>{config.name}</strong>.</p>
            <p className="text-gray-500 text-sm mb-6">
              Assurez-vous que la catégorie WordPress existe avec l&apos;un de ces slugs :{" "}
              <code className="bg-gray-100 px-1 rounded">{config.slugs.join(", ")}</code>
            </p>
            <Link href="/" className="inline-block bg-red-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition">
              Retour à l&apos;accueil
            </Link>
          </div>
        ) : (
          <>
            {/* Article à la une */}
            {featured && (
              <Link href={`/article/${featured.slug}`} className="group block mb-10">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="grid md:grid-cols-2">
                    <div className="relative aspect-video md:aspect-auto md:min-h-[280px] bg-gray-200">
                      {featured.featuredImage?.node?.sourceUrl ? (
                        <Image
                          src={featured.featuredImage.node.sourceUrl}
                          alt={featured.title}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center">
                          <span className="text-white/30 text-6xl font-black">É</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded uppercase">
                          {config.flag} {config.name}
                        </span>
                        <span className="text-gray-400 text-xs">{formatDate(featured.date)}</span>
                      </div>
                      <h2 className="font-serif text-2xl font-bold leading-snug mb-3 group-hover:text-red-600 transition">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-gray-500 text-sm leading-relaxed">
                          {stripHtml(featured.excerpt)}…
                        </p>
                      )}
                      <span className="mt-4 text-red-600 text-sm font-semibold group-hover:underline">
                        Lire l&apos;article →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grille des autres articles */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/article/${post.slug}`}
                    className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col"
                  >
                    <div className="relative aspect-video bg-gray-200 overflow-hidden">
                      {post.featuredImage?.node?.sourceUrl ? (
                        <Image
                          src={post.featuredImage.node.sourceUrl}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                          <span className="text-white/20 text-4xl font-black">É</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-xs text-gray-400 mb-2">{formatDate(post.date)}</p>
                      <h3 className="font-serif font-bold text-base leading-snug mb-2 group-hover:text-red-600 transition flex-1">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                          {stripHtml(post.excerpt)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination simple */}
            {hasNextPage && endCursor && (
              <div className="text-center mt-10">
                <Link
                  href={`/cemac/${pays}?after=${endCursor}`}
                  className="inline-block border border-red-600 text-red-600 font-bold px-8 py-3 rounded-lg hover:bg-red-600 hover:text-white transition"
                >
                  Charger plus d&apos;articles
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
