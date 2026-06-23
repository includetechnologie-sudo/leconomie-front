import { graphqlFetch } from "@/lib/graphql-fetch";
import BreakingNewsTicker from "./BreakingNewsTicker";

const GET_BREAKING_NEWS = `
  query GetBreakingNews {
    posts(first: 10, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
      nodes {
        title
        slug
      }
    }
  }
`;

interface Post { title: string; slug: string; }

export default async function BreakingNews() {
  let posts: Post[] = [];
  try {
    const data = await graphqlFetch<{ posts: { nodes: Post[] } }>(GET_BREAKING_NEWS);
    posts = data.posts.nodes;
  } catch { /* silence — fallback dans le ticker */ }

  return <BreakingNewsTicker posts={posts} />;
}
