import type { Metadata } from "next";
import Link from "next/link";
import {
  CATEGORIES,
  getBlogsByCategory,
  type Blog,
  type BlogCategory,
} from "@/data/blogs";

export const metadata: Metadata = {
  title: "Blogs | Wedding Central",
  description:
    "Rituals, regional traditions, outfits and budgets, for everyone planning a shaadi or attending one.",
};

const INTRO =
  "Indian weddings can look very different: a thousand traditions, a million " +
  "stories. And with so much to explore, where do you even begin? From outfits, " +
  "rituals, customs, food, music and everything in between, we bring it all " +
  "together. Whether you are planning a shaadi or attending one, we are here to " +
  "decode how India celebrates love, one baraat at a time.";

/** Heading shown above each filtered group. */
const SECTION_TITLES: Record<BlogCategory, string> = {
  Planning: "Planning a Wedding?",
  Attending: "Attending a Wedding?",
};

function BlogCard({ blog }: { blog: Blog }) {
  return (
    <li>
      <Link
        href={`/blogs/${blog.slug}`}
        /*
          Frosted glass over the damask. The whole card is the link rather than a
          "read more" inside it, so the target is large on touch and a screen
          reader announces the title as the link text.
        */
        className="group flex h-full flex-col rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg shadow-black/20 backdrop-blur-md transition duration-300 ease-out hover:-translate-y-1.5 hover:border-white/35 hover:bg-white/15 hover:shadow-xl hover:shadow-black/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory md:p-7"
      >
        <p className="font-body text-xs font-semibold tracking-[0.18em] text-ivory/70 uppercase">
          {blog.category}
        </p>

        <h3 className="mt-4 font-serif-display text-xl font-semibold leading-snug text-ivory md:text-2xl">
          {blog.title}
        </h3>

        <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-ivory/85">
          {blog.excerpt}
        </p>

        <p className="mt-6 flex items-center gap-2 font-body text-xs text-ivory/70">
          <span>{blog.author}</span>
          <span aria-hidden="true">/</span>
          <span>{blog.readTime}</span>
        </p>
      </Link>
    </li>
  );
}

export default function BlogsPage() {
  return (
    <main className="w-full px-6 py-20 md:px-8 md:py-28">
      <header className="mx-auto max-w-3xl">
        <h1 className="font-serif-display text-4xl font-medium text-ivory md:text-5xl">
          Stories
        </h1>
        <p className="mt-6 font-body text-base font-light leading-loose text-ivory sm:text-lg">
          {INTRO}
        </p>
      </header>

      <div className="mx-auto mt-16 flex max-w-6xl flex-col gap-16 md:mt-20 md:gap-20">
        {CATEGORIES.map((category) => {
          const posts = getBlogsByCategory(category);
          if (posts.length === 0) return null;

          return (
            <section key={category} aria-labelledby={`section-${category}`}>
              <h2
                id={`section-${category}`}
                className="font-serif-display text-2xl font-medium text-ivory sm:text-3xl"
              >
                {SECTION_TITLES[category]}
              </h2>

              <ul className="mt-8 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((blog) => (
                  <BlogCard key={blog.slug} blog={blog} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
