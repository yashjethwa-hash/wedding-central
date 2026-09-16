import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogs, getBlogBySlug } from "@/data/blogs";

/** In Next 15 route params arrive as a promise and have to be awaited. */
type Params = { params: Promise<{ slug: string }> };

/** Pre-renders every article at build time, so no request hits the filter. */
export function generateStaticParams() {
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) return { title: "Not found | Wedding Central" };

  return {
    title: `${blog.title} | Wedding Central`,
    description: blog.excerpt,
  };
}

function ChevronLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="h-[0.9em] w-[0.9em] shrink-0"
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export default async function BlogPage({ params }: Params) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  // Anything not in the data file is a genuine 404 rather than an empty page.
  if (!blog) notFound();

  return (
    <main className="w-full px-6 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/blogs"
          className="group inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 font-body text-sm text-ivory backdrop-blur-md transition duration-200 hover:border-white/35 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory"
        >
          <span className="transition-transform duration-200 ease-out group-hover:-translate-x-1">
            <ChevronLeft />
          </span>
          Back to Blogs
        </Link>
      </div>

      {/*
        Darker glass than the index cards on purpose. Long-form text sitting
        directly over a busy damask is hard work to read; dropping the panel and
        turning the blur up lifts the body copy well clear of the pattern while
        the background still shows through.
      */}
      <article className="mx-auto mt-8 max-w-3xl rounded-3xl border border-white/15 bg-black/30 p-7 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-10 md:p-14">
        <p className="font-body text-xs font-semibold tracking-[0.18em] text-ivory/70 uppercase">
          {blog.category}
        </p>

        <h1 className="mt-4 font-serif-display text-3xl font-medium leading-tight text-ivory md:text-4xl">
          {blog.title}
        </h1>

        <p className="mt-5 flex flex-wrap items-center gap-2 font-body text-sm text-ivory/75">
          <span>By {blog.author}</span>
          <span aria-hidden="true">/</span>
          <span>{blog.readTime}</span>
        </p>

        <hr className="mt-8 border-white/15" />

        {/*
          The body is an HTML string authored in data/blogs.ts and never from
          user input, which is what makes this injection safe. Child selectors
          style the injected tags, since they cannot carry classes themselves.
        */}
        <div
          className="mt-10 font-body text-base leading-[1.9] text-ivory/90 [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:font-serif-display [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:text-ivory [&_li]:mb-2 [&_p]:mb-6 [&_strong]:font-semibold [&_strong]:text-ivory [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 md:text-lg"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>

      <div className="mx-auto mt-10 max-w-3xl">
        <Link
          href="/blogs"
          className="group inline-flex items-center gap-2 font-body text-sm text-ivory/80 transition-colors duration-200 hover:text-ivory focus-visible:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory"
        >
          <span className="transition-transform duration-200 ease-out group-hover:-translate-x-1">
            <ChevronLeft />
          </span>
          Back to all stories
        </Link>
      </div>
    </main>
  );
}
