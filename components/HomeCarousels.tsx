import Link from "next/link";
import { BlogThumb } from "@/components/PostCard";
import { blogs, formatDate, type Blog, type BlogCategory } from "@/data/blogs";

const INTRO =
  "Indian weddings can look very different: a thousand traditions, a million " +
  "stories. And with so much to explore, where do you even begin? From outfits, " +
  "rituals, customs, food, music and everything in between, we bring it all " +
  "together. Whether you are planning a shaadi or attending one, we are here to " +
  "decode how India celebrates love, one baraat at a time.";

/** How many stories each rail shows. */
const PER_RAIL = 5;

const RAILS: { title: string; href: string; category: BlogCategory }[] = [
  { title: "Planning a Wedding?", href: "/planning", category: "Planning" },
  { title: "Visiting a Wedding?", href: "/visiting", category: "Attending" },
];

/** Newest first, so a new story surfaces on the homepage without being placed. */
function railFor(category: BlogCategory) {
  return blogs
    .filter((blog) => blog.category === category)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, PER_RAIL);
}

/** Minimal stroked chevron. Sized in em so it tracks the label's own type size. */
function ChevronRight() {
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
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function StoryCard({ blog }: { blog: Blog }) {
  return (
    <li className="w-[80%] shrink-0 snap-start sm:w-[46%] lg:w-[30%]">
      {/*
        The whole card is the link rather than a "read more" inside it, so the
        target is large on touch and a screen reader announces the title as the
        link text. overflow-hidden is what lets the artwork run to the rounded
        edge and scale on hover without spilling past it.
      */}
      <Link
        href={`/blogs/${blog.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-lg shadow-black/25 backdrop-blur-md transition duration-300 ease-out hover:-translate-y-1.5 hover:border-white/40 hover:bg-white/15 hover:shadow-2xl hover:shadow-black/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory"
      >
        {/* Full bleed: the artwork carries no border and no inset, so it meets
            the card's edges on three sides. */}
        <div className="relative aspect-video w-full">
          <BlogThumb blog={blog} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 80vw" />
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h4 className="font-serif-display text-xl leading-snug font-semibold text-ivory md:text-2xl">
            {blog.title}
          </h4>

          <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-ivory/80">
            {blog.excerpt}
          </p>

          <p className="mt-6 flex flex-wrap items-center gap-2 font-body text-xs tracking-wide text-ivory/65">
            <span>{formatDate(blog.date)}</span>
            <span aria-hidden="true">/</span>
            <span>{blog.readTime}</span>
          </p>
        </div>
      </Link>
    </li>
  );
}

function Rail({
  title,
  href,
  category,
}: {
  title: string;
  href: string;
  category: BlogCategory;
}) {
  const headingId = `rail-${category.toLowerCase()}`;
  const stories = railFor(category);

  return (
    <section className="w-full" aria-labelledby={headingId}>
      <h3
        id={headingId}
        className="px-6 font-serif-display text-2xl font-medium text-ivory sm:text-3xl md:px-8"
      >
        {/* The heading itself is the link, so the accessible name of the link
            and the name of the section it opens are the same words. */}
        <Link
          href={href}
          className="group inline-flex items-center gap-2 rounded transition-colors duration-200 hover:text-ivory/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory"
        >
          {title}
          <span className="transition-transform duration-200 ease-out group-hover:translate-x-1">
            <ChevronRight />
          </span>
        </Link>
      </h3>

      {/*
        A focusable scroll region, so the rail can be reached and driven from
        the keyboard as well as by swiping. `scroll-px` keeps a snapped card
        clear of the gutter instead of flush against it.
      */}
      <ul
        role="region"
        aria-labelledby={headingId}
        tabIndex={0}
        className="no-scrollbar mt-5 flex w-full list-none snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-px-6 px-6 pb-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory md:gap-6 md:scroll-px-8 md:px-8"
      >
        {stories.map((blog) => (
          <StoryCard key={blog.slug} blog={blog} />
        ))}
      </ul>
    </section>
  );
}

export default function HomeCarousels() {
  return (
    <section className="relative w-full py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6 md:px-8">
        <p className="font-body text-base font-light leading-loose text-ivory sm:text-lg">
          {INTRO}
        </p>
      </div>

      <div className="mt-16 flex w-full flex-col gap-14 md:mt-20 md:gap-16">
        {RAILS.map((rail) => (
          <Rail key={rail.category} {...rail} />
        ))}
      </div>
    </section>
  );
}
