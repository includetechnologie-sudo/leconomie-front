import { graphqlFetch } from "@/lib/graphql-fetch";
import { GET_LATEST_POSTS } from "@/graphql/queries";

type Post = {
  id: string;
  title: string;
  slug: string;
  date: string;
};

type PostsData = {
  posts: {
    nodes: Post[];
  };
};

export default async function LatestPosts() {
  let posts: Post[] = [];
  try {
    const data = await graphqlFetch<PostsData>(GET_LATEST_POSTS);
    posts = data.posts?.nodes ?? [];
  } catch (err) {
    console.error("LatestPosts fetch error:", err);
  }

  if (posts.length === 0) {
    return (
      <section className="max-w-7xl mx-auto mt-10 p-4">
        <h2 className="text-2xl font-bold mb-6">
          Derniers articles WordPress
        </h2>
        <p>Aucun article trouvé.</p>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto mt-10 p-4">
      <h2 className="text-2xl font-bold mb-6">
        Derniers articles WordPress
      </h2>

      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id} className="border p-4 rounded-lg">
            <h3 className="font-bold">{post.title}</h3>
            <p className="text-gray-500">{post.date}</p>
            <p>{post.slug}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
