import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getBlogsByCategory, type BlogCategory } from "@/data/blogs";

/**
 * Shared body for the two category routes, /planning and /visiting.
 *
 * Both pages are the same layout over a different slice of the same data, so
 * the markup lives here once and each route supplies its own copy and metadata.
 */
export default function CategoryPage({
  title,
  intro,
  category,
}: {
  title: string;
  intro: string;
  category: BlogCategory;
}) {
  const posts = getBlogsByCategory(category);

  return (
    <main className="w-full px-6 py-16 md:px-8 md:py-24">
      <header className="mx-auto max-w-3xl text-center">
        <h1 className="font-serif-display text-4xl leading-tight font-medium text-ivory md:text-5xl">
          {title}
        </h1>

        <p className="mt-6 font-body text-base leading-relaxed font-light text-ivory/85 sm:text-lg">
          {intro}
        </p>
      </header>

      {posts.length > 0 ? (
        <ul className="mx-auto mt-14 grid max-w-6xl list-none grid-cols-1 gap-8 p-0 md:mt-20 md:grid-cols-3">
          {posts.map((blog) => (
            <PostCard key={blog.slug} blog={blog} />
          ))}
        </ul>
      ) : (
        <p className="mx-auto mt-14 max-w-3xl text-center font-body text-base text-ivory/75">
          Nothing here yet. New stories land every few weeks.
        </p>
      )}

      <div className="mx-auto mt-14 max-w-3xl text-center">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-body text-sm text-ivory backdrop-blur-md transition duration-200 hover:border-white/35 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory"
        >
          See every story
        </Link>
      </div>
    </main>
  );
}
