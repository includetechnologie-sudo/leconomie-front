import { graphqlFetch } from "@/lib/graphql-fetch";
import { GET_PREMIUM_POSTS } from "@/graphql/queries";
import PremiumArticlesCarouselClient from "./PremiumArticlesCarouselClient";

interface PremiumPost {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  featuredImage?: { node?: { sourceUrl?: string } };
  categories?: { nodes: { name: string; slug: string }[] };
}

export default async function PremiumArticlesCarousel() {
  let posts: PremiumPost[] = [];
  try {
    const data = await graphqlFetch<{ posts: { nodes: PremiumPost[] } }>(GET_PREMIUM_POSTS);
    posts = data.posts?.nodes || [];
  } catch { /* silence — section masquée si WordPress indisponible */ }

  if (posts.length === 0) return null;

  return <PremiumArticlesCarouselClient posts={posts} />;
}
