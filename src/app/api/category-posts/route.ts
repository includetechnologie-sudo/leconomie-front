import { NextRequest, NextResponse } from "next/server";
import { graphqlFetch } from "@/lib/graphql-fetch";
import { GET_POSTS_BY_CATEGORY } from "@/graphql/queries";

export async function POST(req: NextRequest) {
  try {
    const { category, after } = await req.json();
    if (!category) return NextResponse.json({ posts: [], hasNextPage: false });

    const data = await graphqlFetch<{
      posts: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: unknown[];
      };
    }>(GET_POSTS_BY_CATEGORY, { category, after: after || null });

    return NextResponse.json({
      posts: data.posts.nodes,
      hasNextPage: data.posts.pageInfo.hasNextPage,
      endCursor: data.posts.pageInfo.endCursor,
    });
  } catch {
    return NextResponse.json({ posts: [], hasNextPage: false });
  }
}
