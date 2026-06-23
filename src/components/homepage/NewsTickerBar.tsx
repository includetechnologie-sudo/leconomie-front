import Link from "next/link";
import { graphqlFetch } from "@/lib/graphql-fetch";

const GET_TICKER_POSTS = `
  query GetTickerPosts {
    posts(first: 4) {
      nodes {
        title
        slug
        date
      }
    }
  }
`;

interface TickerPost {
  title: string;
  slug: string;
  date: string;
}

interface TickerData {
  posts: { nodes: TickerPost[] };
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit", minute: "2-digit",
  });
}

const FALLBACK: TickerPost[] = [
  { title: "Le Cameroun et la BAD signent un accord de 130 milliards FCFA", slug: "#", date: new Date().toISOString() },
  { title: "Agriculture : la CEMAC lance un fonds régional de développement", slug: "#", date: new Date().toISOString() },
  { title: "Marché financier : la COSUMAF renforce la protection des épargnants", slug: "#", date: new Date().toISOString() },
  { title: "Énergie : la Guinée équatoriale veut diversifier son économie", slug: "#", date: new Date().toISOString() },
];

export default async function NewsTickerBar() {
  let posts: TickerPost[] = FALLBACK;
  try {
    const data = await graphqlFetch<TickerData>(GET_TICKER_POSTS);
    if (data.posts.nodes.length > 0) posts = data.posts.nodes;
  } catch {
    // utilise le fallback
  }

  const times = ["11:30", "10:45", "09:30", "08:15"];

  return (
    <div className="max-w-7xl mx-auto px-4 mt-4">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 border border-gray-200 bg-white">
        {posts.slice(0, 4).map((post, i) => (
          <Link key={post.slug + i} href={`/article/${post.slug}`}
            className="px-4 py-3 hover:bg-red-50 transition group">
            <span className="text-red-600 font-bold text-xs block mb-1">{times[i]}</span>
            <p className="text-xs font-medium leading-snug text-gray-800 group-hover:text-red-600 transition line-clamp-2">
              {post.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
