import Image from "next/image";
import Link from "next/link";
import { formatDate, type Blog } from "@/data/blogs";

/**
 * Sits over the artwork so the panel always reads as an image area rather than
 * merging into the damask, and so the category pill and rounded edge keep a
 * predictable backdrop whatever photograph is dropped in later.
 */
export function Scrim() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/30"
    />
  );
}

/** Small capsule carrying the post's category. */
export function CategoryPill({
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

/**
 * Card artwork, full bleed and borderless.
 *
 * A post with no photograph yet gets a tinted panel carrying its category
 * rather than a gap or a stand-in photograph, so a part-photographed set still
 * reads as designed. The scrim sits over both, which keeps the pill legible
 * whatever the picture turns out to be.
 */
export function BlogThumb({
  blog,
  sizes,
  priority = false,
  pillTone = "glass",
}: {
  blog: Blog;
  sizes: string;
  priority?: boolean;
  pillTone?: "light" | "glass";
}) {
  return (
    <>
      {blog.image ? (
        <Image
          src={blog.image}
          alt=""
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-[#6b2340] via-[#4a0f28] to-[#2c0917]"
        >
          <span className="absolute inset-0 grid place-items-center font-serif-display text-5xl text-ivory/15">
            {blog.title.charAt(0)}
          </span>
        </span>
      )}
      <Scrim />
      <span className="absolute top-4 left-4">
        <CategoryPill category={blog.category} tone={pillTone} />
      </span>
    </>
  );
}

export default function PostCard({ blog }: { blog: Blog }) {
  return (
    <li>
      <Link
        href={`/blogs/${blog.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-lg shadow-black/25 backdrop-blur-xl transition duration-300 ease-out hover:-translate-y-1.5 hover:border-white/40 hover:bg-white/15 hover:shadow-2xl hover:shadow-black/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory"
      >
        <div className="relative aspect-video w-full">
          <BlogThumb blog={blog} sizes="(min-width: 768px) 33vw, 100vw" />
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
