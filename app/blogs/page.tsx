import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  blogs,
  CATEGORIES,
  formatDate,
  type Blog,
  type BlogCategory,
} from "@/data/blogs";

export const metadata: Metadata = {
  title: "Wedding Planning & Inspiration | Wedding Central",
  description:
    "Rituals, regional traditions, outfits and budgets, for everyone planning a shaadi or attending one.",
};

const INTRO =
  "Indian weddings can look very different: a thousand traditions, a million " +
  "stories. And with so much to explore, where do you even begin? From outfits, " +
  "rituals, customs, food, music and everything in between, we bring it all " +
  "together. Whether you are planning a shaadi or attending one, we are here to " +
  "decode how India celebrates love, one baraat at a time.";

/** Heading shown above each category group. */
const SECTION_TITLES: Record<BlogCategory, string> = {
  Planning: "Planning a Wedding?",
  Attending: "Attending a Wedding?",
};

/**
 * Newest first, so the featured slot always holds the latest story and the
 * order of the data file never has to be maintained by hand.
 */
const sorted = [...blogs].sort((a, b) => b.date.localeCompare(a.date));
const [featured, ...rest] = sorted;

/**
 * The groups beneath the featured card. Drawn from `rest` rather than from the
 * full list, so the featured story is not also printed again in its category.
 */
const groups = CATEGORIES.map((category) => ({
  category,
  posts: rest.filter((blog) => blog.category === category),
})).filter((group) => group.posts.length > 0);

/**
 * Sits over the artwork so the panel always reads as an image area rather than
 * merging into the damask, and so the category pill and rounded edge keep a
 * predictable backdrop whatever photograph is dropped in later.
 */
function Scrim() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/30"
    />
  );
}

/** Small capsule carrying the post's category. */
function CategoryPill({
  category,
  tone = "light",
}: {
  category: string;
  tone?: "light" | "glass";
}) {
  const palette =
    tone === "light"
      ? "bg-ivory text-maroon"
      : "border border-white/30 bg-black/35 text-ivory backdrop-blur-md";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3.5 py-1.5 font-body text-xs font-semibold tracking-[0.12em] uppercase ${palette}`}
    >
      {category}
    </span>
  );
}

function FeaturedCard({ blog }: { blog: Blog }) {
  return (
    <Link
      href={`/blogs/${blog.slug}`}
      /*
        overflow-hidden on the container is what lets the artwork scale on
        hover without spilling past the rounded corner.
      */
      className="group grid overflow-hidden rounded-xl border border-white/25 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl transition duration-300 ease-out hover:border-white/40 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory md:grid-cols-5"
    >
      {/* Artwork, three of five columns, which is the 60 percent share. */}
      <div className="relative aspect-[16/10] md:col-span-3 md:aspect-auto md:min-h-[26rem]">
        <Image
          src={blog.image}
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 60vw, 100vw"
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
        <Scrim />
      </div>

      {/* Copy, the remaining two columns. */}
      <div className="flex flex-col justify-center gap-5 p-7 md:col-span-2 md:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <CategoryPill category={blog.category} />
          <span className="font-body text-xs tracking-[0.12em] text-ivory/70 uppercase">
            Featured
          </span>
        </div>

        <h2 className="font-serif-display text-3xl leading-tight font-medium text-ivory lg:text-4xl">
          {blog.title}
        </h2>

        <p className="font-body text-base leading-relaxed text-ivory/85">
          {blog.excerpt}
        </p>

        <p className="flex flex-wrap items-center gap-2 font-body text-sm text-ivory/70">
          <span>{blog.author}</span>
          <span aria-hidden="true">/</span>
          <span>{formatDate(blog.date)}</span>
          <span aria-hidden="true">/</span>
          <span>{blog.readTime}</span>
        </p>

        {/* A span rather than a button, since the whole card is already a link. */}
        <span className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg bg-ivory px-6 py-3 font-body text-sm font-semibold text-maroon transition duration-200 group-hover:bg-white">
          Read More
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            className="h-[0.9em] w-[0.9em] shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

function PostCard({ blog }: { blog: Blog }) {
  return (
    <li>
      <Link
        href={`/blogs/${blog.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-lg shadow-black/25 backdrop-blur-xl transition duration-300 ease-out hover:-translate-y-1.5 hover:border-white/40 hover:bg-white/15 hover:shadow-2xl hover:shadow-black/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory"
      >
        <div className="relative aspect-video w-full">
          <Image
            src={blog.image}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
          <Scrim />

          <span className="absolute top-4 left-4">
            <CategoryPill category={blog.category} tone="glass" />
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-serif-display text-xl leading-snug font-semibold text-ivory md:text-2xl">
            {blog.title}
          </h3>

          <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-ivory/80">
            {blog.excerpt}
          </p>

          <p className="mt-6 flex flex-wrap items-center gap-2 font-body text-xs tracking-wide text-ivory/70">
            <span>{formatDate(blog.date)}</span>
            <span aria-hidden="true">/</span>
            <span>{blog.readTime}</span>
          </p>
        </div>
      </Link>
    </li>
  );
}

export default function BlogsPage() {
  return (
    <main className="w-full px-6 py-16 md:px-8 md:py-24">
      <header className="mx-auto max-w-3xl text-center">
        <p className="font-body text-xs font-semibold tracking-[0.22em] text-ivory/70 uppercase">
          Wedding Central
        </p>

        <h1 className="mt-4 font-serif-display text-4xl leading-tight font-medium text-ivory md:text-5xl lg:text-6xl">
          Wedding Planning &amp; Inspiration
        </h1>

        <p className="mt-6 font-body text-base leading-relaxed font-light text-ivory/85 sm:text-lg">
          {INTRO}
        </p>
      </header>

      <div className="mx-auto mt-14 max-w-6xl md:mt-20">
        <FeaturedCard blog={featured} />
      </div>

      <div className="mx-auto mt-16 flex max-w-6xl flex-col gap-16 md:mt-20 md:gap-20">
        {groups.map(({ category, posts }) => (
          <section key={category} aria-labelledby={`section-${category}`}>
            <h2
              id={`section-${category}`}
              className="font-serif-display text-2xl font-medium text-ivory sm:text-3xl"
            >
              {SECTION_TITLES[category]}
            </h2>

            <ul className="mt-8 grid list-none grid-cols-1 gap-8 p-0 md:grid-cols-3">
              {posts.map((blog) => (
                <PostCard key={blog.slug} blog={blog} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
