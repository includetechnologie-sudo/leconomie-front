import Image from "next/image";
import Link from "next/link";
import { graphqlFetch } from "@/lib/graphql-fetch";

const CATEGORIES = [
  { label: "ÉCONOMIE", slug: "economie", name: "Economie" },
  { label: "FINANCE", slug: "finance", name: "Finance" },
  { label: "POLITIQUES PUBLIQUES", slug: "politiques-publiques", name: "Politiques publiques" },
  { label: "INTERVIEW", slug: "interview", name: "Interview" },
];

const GET_CATEGORY_POSTS_GRID = `
  query GetCategoryPostsGrid($category: String!) {
    posts(first: 4, where: { categoryName: $category }) {
      nodes {
        title
        slug
        date
        featuredImage { node { sourceUrl } }
      }
    }
  }
`;

interface GridPost {
  title: string;
  slug: string;
  date: string;
  featuredImage?: { node?: { sourceUrl?: string } };
}

interface GridData {
  posts: { nodes: GridPost[] };
}

async function fetchCategoryPosts(name: string): Promise<GridPost[]> {
  try {
    const data = await graphqlFetch<GridData>(GET_CATEGORY_POSTS_GRID, { category: name });
    return data.posts.nodes;
  } catch {
    return [];
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default async function CategoryGrid() {
  const results = await Promise.all(
    CATEGORIES.map(async (cat) => ({
      ...cat,
      posts: await fetchCategoryPosts(cat.name),
    }))
  );

  return (
    <section className="max-w-7xl mx-auto px-4 mt-12">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0 border border-gray-200">
        {results.map((cat, colIndex) => (
          <div key={cat.slug} className={`${colIndex < 3 ? "border-r border-gray-200" : ""}`}>
            {/* En-tête colonne */}
            <div className="border-b-2 border-red-600 px-4 py-3 flex justify-between items-center">
              <Link href={`/${cat.slug}`}
                className="font-bold text-sm uppercase tracking-wide text-gray-900 hover:text-red-600 transition flex items-center gap-1">
                <span className="w-1.5 h-4 bg-red-600 inline-block mr-1"></span>
                {cat.label}
              </Link>
              <Link href={`/${cat.slug}`}
                className="text-xs text-red-600 font-semibold hover:underline whitespace-nowrap">
                Voir plus →
              </Link>
            </div>

            {/* Article principal avec image */}
            {cat.posts[0] && (
              <Link href={`/article/${cat.posts[0].slug}`} className="block group p-4 border-b border-gray-100">
                <div className="relative h-[140px] rounded overflow-hidden mb-3">
                  <Image
                    src={cat.posts[0].featuredImage?.node?.sourceUrl || "/images/hero.jpg"}
                    alt={cat.posts[0].title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <h3 className="font-bold text-sm leading-snug group-hover:text-red-600 transition line-clamp-3">
                  {cat.posts[0].title}
                </h3>
                {cat.posts[0].date && (
                  <p className="text-xs text-gray-400 mt-1">{formatDate(cat.posts[0].date)}</p>
                )}
              </Link>
            )}

            {/* Articles suivants sans image */}
            <ul className="divide-y divide-gray-100">
              {cat.posts.slice(1, 4).map((post) => (
                <li key={post.slug}>
                  <Link href={`/article/${post.slug}`}
                    className="block px-4 py-3 text-xs font-medium leading-snug hover:text-red-600 transition line-clamp-2">
                    • {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
