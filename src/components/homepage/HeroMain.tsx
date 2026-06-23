import { graphqlFetch } from "@/lib/graphql-fetch";
import { GET_HERO_SLIDER_POSTS } from "@/graphql/queries";
import HeroSliderClient from "./HeroSliderClient";

interface SliderPost {
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  featuredImage?: { node?: { sourceUrl?: string } };
  categories?: { nodes: { name: string }[] };
}

interface SliderData {
  posts: { nodes: SliderPost[] };
}

export default async function HeroMain() {
  let posts: SliderPost[] = [];
  try {
    const data = await graphqlFetch<SliderData>(GET_HERO_SLIDER_POSTS);
    posts = data.posts.nodes;
  } catch (err) {
    console.error("HeroMain fetch error:", err);
  }

  return <HeroSliderClient posts={posts} />;
}
