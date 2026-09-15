const INTRO =
  "Indian weddings can look very different: a thousand traditions, a million " +
  "stories. And with so much to explore, where do you even begin? From outfits, " +
  "rituals, customs, food, music and everything in between, we bring it all " +
  "together. Whether you are planning a shaadi or attending one, we are here to " +
  "decode how India celebrates love, one baraat at a time. Explore the wedding " +
  "traditions across India and discover the stories behind the celebrations.";

type Card = {
  title: string;
  /** One supporting line, drawn from the content pillars in the strategy doc. */
  blurb: string;
};

const PLANNING: Card[] = [
  {
    title: "Ritual Deep-Dives",
    blurb:
      "Haldi, Mehendi, Sangeet, Baraat, Pheras and Vidaai, with the symbolism behind each.",
  },
  {
    title: "Regional Wedding Traditions",
    blurb:
      "Bengali, Punjabi, Marwari, Tamil, Gujarati, Malayali, Kashmiri and Assamese ceremonies.",
  },
  {
    title: "Budget Breakdowns",
    blurb:
      "What a 5 lakh, a 50 lakh and a 5 crore wedding actually cover, line by line.",
  },
  {
    title: "Planning Tools & Timelines",
    blurb:
      "Budgeting frameworks, vendor checklists and function timeline templates.",
  },
];

const VISITING: Card[] = [
  {
    title: "Guest Etiquette & Gifting",
    blurb:
      "What to give, what to spend and when to arrive, by function and by region.",
  },
  {
    title: "What to Wear?",
    blurb:
      "Daytime and evening dress codes, and how they shift across the week.",
  },
  {
    title: "Understanding the Pheras",
    blurb:
      "What the seven rounds mean, and the vow that is spoken at each one.",
  },
  {
    title: "Music & Playlists",
    blurb:
      "Sangeet playlists by function, and choosing between a live band and a DJ.",
  },
];

function Carousel({ title, cards }: { title: string; cards: Card[] }) {
  const headingId = `blog-${title.replace(/[^a-z]+/gi, "-").toLowerCase()}`;

  return (
    <section className="w-full" aria-labelledby={headingId}>
      <h3
        id={headingId}
        className="px-6 font-serif-display text-2xl font-medium text-ivory sm:text-3xl md:px-8"
      >
        {title}
      </h3>

      {/*
        A focusable scroll region, so the carousel can be reached and driven
        from the keyboard as well as by swiping. `scroll-px` keeps a snapped
        card clear of the gutter instead of flush against it.
      */}
      <div
        role="region"
        aria-labelledby={headingId}
        tabIndex={0}
        className="no-scrollbar mt-5 flex w-full snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory md:scroll-px-8 md:gap-6 md:px-8"
      >
        {cards.map((card) => (
          <article
            key={card.title}
            className="group w-[78%] shrink-0 snap-start rounded-2xl border border-white/50 bg-white/70 p-6 shadow-lg shadow-black/15 backdrop-blur-md transition duration-300 ease-out hover:-translate-y-1.5 hover:bg-white/80 hover:shadow-xl hover:shadow-black/25 sm:w-[48%] md:p-7 lg:w-[31%]"
          >
            <h4 className="font-serif-display text-xl font-semibold leading-snug text-maroon md:text-2xl">
              {card.title}
            </h4>
            <p className="mt-3 font-body text-sm leading-relaxed text-maroon-soft md:text-base">
              {card.blurb}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function BlogSection() {
  return (
    <section className="relative w-full py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6 md:px-8">
        <p className="font-body text-base font-light leading-loose text-ivory sm:text-lg">
          {INTRO}
        </p>
      </div>

      <div className="mt-16 flex w-full flex-col gap-14 md:mt-20 md:gap-16">
        <Carousel title="Planning a Wedding?" cards={PLANNING} />
        <Carousel title="Visiting a Wedding?" cards={VISITING} />
      </div>
    </section>
  );
}
