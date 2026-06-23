import { NextRequest, NextResponse } from "next/server";
import { graphqlFetch } from "@/lib/graphql-fetch";
import { SEARCH_POSTS } from "@/graphql/queries";

export async function POST(req: NextRequest) {
  try {
    const { q, after } = await req.json();
    if (!q || q.trim().length < 2) {
      return NextResponse.json({ posts: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } } });
    }

    const data = await graphqlFetch(SEARCH_POSTS, { search: q.trim(), after: after || null });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { posts: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } } },
      { status: 500 }
    );
  }
}
