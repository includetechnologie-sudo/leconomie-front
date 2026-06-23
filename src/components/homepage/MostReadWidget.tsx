import Link from "next/link";
import { graphqlFetch } from "@/lib/graphql-fetch";
import { GET_MOST_READ_POSTS } from "@/graphql/queries";

interface Post {
  title: string;
  slug: string;
}

interface MostReadData {
  posts: { nodes: Post[] };
}

export default async function MostReadWidget() {
  let data: MostReadData;
  try {
    data = await graphqlFetch<MostReadData>(GET_MOST_READ_POSTS);
  } catch (err) {
    console.error("MostReadWidget fetch error:", err);
    return null;
  }

  const posts = data.posts.nodes;

  return (
    <div className="bg-white h-full">

      {/* En-tête */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-5 bg-red-600 inline-block shrink-0"></span>
        <h2 className="font-bold text-sm uppercase tracking-widest text-gray-900">
          Articles les plus lus
        </h2>
        <span className="flex-1 h-px bg-red-600"></span>
      </div>

      {/* Liste */}
      <ol className="space-y-0">
        {posts.map((post, index) => (
          <li key={post.slug}>
            <Link
              href={`/article/${post.slug}`}
              className="flex items-start gap-3 py-3 border-b border-gray-100 group hover:bg-gray-50 transition px-1"
            >
              {/* Numéro */}
              <span className="text-red-600 font-bold text-sm w-6 shrink-0 pt-0.5">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Séparateur vertical */}
              <span className="w-px bg-red-600 self-stretch shrink-0 opacity-60"></span>

              {/* Titre */}
              <h3 className="text-sm font-medium leading-snug text-gray-800 group-hover:text-red-600 transition line-clamp-3">
                {post.title}
              </h3>
            </Link>
          </li>
        ))}
      </ol>

    </div>
  );
}
