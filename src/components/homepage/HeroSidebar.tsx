import Image from "next/image";
import Link from "next/link";
import { graphqlFetch } from "@/lib/graphql-fetch";
import { GET_HERO_SIDEBAR_POSTS } from "@/graphql/queries";

interface SidebarPost {
  title: string;
  slug: string;
  featuredImage?: { node?: { sourceUrl?: string } };
  categories?: { nodes: { name: string }[] };
}

interface SidebarData {
  posts: { nodes: SidebarPost[] };
}

export default async function HeroSidebar() {
  let data: SidebarData;
  try {
    data = await graphqlFetch<SidebarData>(GET_HERO_SIDEBAR_POSTS);
  } catch (err) {
    console.error("HeroSidebar fetch error:", err);
    return null;
  }

  // On prend 4 articles (on skip le 1er qui est dans le slider principal)
  const posts = data.posts.nodes.slice(1, 5);

  return (
    <div className="flex flex-col gap-0 h-full">
      {posts.map((post, i) => (
        <Link
          key={post.slug}
          href={`/article/${post.slug}`}
          className={`flex gap-3 bg-white group hover:bg-red-50 transition overflow-hidden
            ${i < posts.length - 1 ? "border-b border-gray-100" : ""}`}
          style={{ flex: 1, minHeight: 0 }}
        >
          {/* Image */}
          <div className="relative w-24 shrink-0" style={{ minHeight: "80px" }}>
            <Image
              src={post.featuredImage?.node?.sourceUrl || "/images/hero.jpg"}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Texte */}
          <div className="py-2 pr-2 flex flex-col justify-center">
            {post.categories?.nodes[0] && (
              <span className="text-red-600 text-[10px] font-bold uppercase tracking-wider mb-1">
                {post.categories.nodes[0].name}
              </span>
            )}
            <h3 className="font-serif font-bold text-[13px] leading-snug line-clamp-3 group-hover:text-red-600 transition">
              {post.title}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
