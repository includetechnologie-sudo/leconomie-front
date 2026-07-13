import Image from "next/image";
import Link from "next/link";
import { graphqlFetch } from "@/lib/graphql-fetch";
import { GET_CATEGORY_POSTS } from "@/graphql/queries";

interface RubriqueSectionProps {
  title: string;          // nom de catégorie WordPress pour GraphQL
  displayTitle?: string;  // titre affiché sur la page
  categorySlug?: string;  // slug pour le lien "Voir plus" (si différent du title)
}

interface CategoryPost {
  title: string;
  excerpt: string;
  slug: string;
  featuredImage?: {
    node?: {
      sourceUrl?: string;
    };
  };
}

interface CategoryData {
  posts: {
    nodes: CategoryPost[];
  };
}

export default async function RubriqueSection({ title, displayTitle, categorySlug }: RubriqueSectionProps) {
  // Pour la query GraphQL, on utilise le slug si fourni, sinon le title
  const queryCategory = categorySlug || title;
  let data: CategoryData;
  try {
    data = await graphqlFetch<CategoryData>(GET_CATEGORY_POSTS, { category: queryCategory });
  } catch (err) {
    console.error(`RubriqueSection fetch error (${title}):`, err);
    return null;
  }

  const posts = data.posts.nodes;
  if (posts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto mt-16 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{displayTitle || title}</h2>

        <Link
          href={`/${categorySlug || title.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-")}`}
          className="text-red-600 font-semibold hover:underline transition"
        >
          Voir plus →
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link key={post.slug} href={`/article/${post.slug}`} className="group">
            <div className="relative h-[220px] rounded-lg overflow-hidden">
              <Image
                src={post.featuredImage?.node?.sourceUrl || "/images/hero.jpg"}
                alt={post.title}
                fill
                className="object-cover object-top group-hover:scale-105 transition"
              />
            </div>

            <h3 className="font-bold text-xl mt-4">{post.title}</h3>

            <div
              className="text-gray-600 mt-2 line-clamp-3"
              dangerouslySetInnerHTML={{ __html: post.excerpt }}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
