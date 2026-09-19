export type BlogCategory = "Planning" | "Attending";

export type Blog = {
  slug: string;
  title: string;
  category: BlogCategory;
  author: string;
  readTime: string;
  /** ISO date, YYYY-MM-DD. Rendered through formatDate so it never varies by locale. */
  date: string;
  /**
   * Card and hero artwork, from `public/blogs/`, named after the slug.
   *
   * Optional: a post with no photograph yet renders a placeholder panel
   * instead, so a part-photographed set still looks deliberate. Drop
   * `public/blogs/<slug>.jpg` in and set this to switch that card over.
   */
  image?: string;
  excerpt: string;
  /**
   * Article body as an HTML string.
   *
   * Authored here in the repository and never taken from user input, which is
   * what makes it safe to inject with dangerouslySetInnerHTML on the reading
   * page. If this ever becomes editable from outside the codebase, it has to be
   * sanitised before it is rendered.
   */
  content: string;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Formats an ISO date without touching Date or Intl, so the server and the
 * browser cannot disagree about the runtime locale and break hydration.
 */
export function formatDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

export const blogs: Blog[] = [
  {
    slug: "wedding-photographer-prep",
    image: "/blogs/wedding-photographer-prep.jpg",
    title: "Wedding Photographer Prep",
    category: "Planning",
    author: "Bushra",
    readTime: "5 min read",
    date: "2026-08-28",
    excerpt:
      "Your photographer is the only vendor whose work you will still be looking at in thirty years. Here is how to brief them properly.",
    content: `
      <p>Your photographer is the only vendor whose work you will still be looking at in thirty years. Everything else gets eaten, worn once, or packed away. That makes the hour you spend briefing them the highest-return hour in your entire planning calendar, and most couples skip it.</p>

      <h2>Do not hire from Instagram alone</h2>
      <p>A feed is a highlight reel. It is thirty of the best frames from three hundred weddings, colour graded to a house style, and it tells you almost nothing about what a full day in that photographer's hands actually looks like.</p>
      <p>Ask to see two or three complete galleries instead, start to finish, ideally from weddings close to the size and format of yours. That is where you find out whether they can hold a frame together in a dark sangeet hall, whether they catch the quiet moments between the set pieces, and whether the people in the background look like guests or like obstacles.</p>

      <h2>Share the timeline, not just the date</h2>
      <p>Send the running order for every function, with the times you actually expect things to happen rather than the times printed on the card. Flag the moments that are non-negotiable: the entrance, the varmala, the pheras, the vidaai.</p>
      <p>Tell them where the light will be. A haldi at eleven in the morning in an open courtyard is a completely different job from one at four in the afternoon under a shamiana, and your photographer can only plan for the second if somebody tells them.</p>

      <h2>Talk about content, not just photographs</h2>
      <p>Decide early whether you want a content creator alongside the photography team. Vertical video, same-day reels, and behind-the-scenes clips are a separate craft with a separate rhythm, and asking a documentary photographer to produce them mid-ceremony rarely ends well for either output.</p>
      <p>If you do want both, brief them together, in the same room, so they can agree who stands where. Two people fighting for the same angle at the pheras is the fastest way to ruin both sets of images.</p>

      <h2>Give them a shot list, and keep it short</h2>
      <p>A list of fifteen must-have combinations is useful. A list of eighty is a way of spending your entire cocktail hour in a queue. Name the relatives who must be photographed, the heirloom jewellery that must be captured in detail, and the one or two frames you have pictured in your head since you were a child. Then let them work.</p>

      <h2>Be present</h2>
      <p>The best photographs in almost every gallery are the unposed ones, and they only exist if there is something real happening to photograph. Couples who spend the day performing for the camera get pictures of themselves performing.</p>
      <p>Hire people you trust, brief them properly, and then forget they are there. That is the whole method.</p>
    `,
  },
  {
    slug: "unwritten-rules-of-attending-an-indian-wedding",
    image: "/blogs/unwritten-rules-of-attending-an-indian-wedding.jpg",
    title: "The Unwritten Rules of Attending an Indian Wedding",
    category: "Attending",
    author: "Bushra",
    readTime: "4 min read",
    date: "2026-08-14",
    excerpt:
      "Nobody hands you a rulebook with the invitation. Here is what everyone else seems to already know.",
    content: `
      <p>Nobody hands you a rulebook with the invitation, and yet everybody seems to know the rules. Here is what the card does not spell out.</p>

      <h2>Read the invite properly</h2>
      <p>Read all of it, including the inserts. An Indian wedding is rarely one event; it is a week of them, and the invitation usually tells you exactly which ones you are being asked to. Turning up to a function you were not invited to is awkward for everyone, and missing one you were expected at is worse.</p>
      <p>Check the venue for each function separately. They are frequently in different parts of the city, and the mehendi is almost never where the pheras are.</p>

      <h2>Your invitation is for the names on it</h2>
      <p>If the card says two names, it means two people. Catering, seating, and favours are counted weeks in advance, and every uninvited guest is a plate taken from someone who was counted.</p>
      <p>If you genuinely need to bring someone, ask. Ask early, ask the couple or their family directly, and accept the answer gracefully. Do not ask on the day.</p>

      <h2>Dress to the brief</h2>
      <p>If the invitation names a colour palette or a dress code, it exists for a reason, usually a photograph the family has been imagining for months. Follow it.</p>
      <p>Where there is no brief, the safe rule is to dress up rather than down, and to stay clear of white and black for the ceremony itself unless the family has said otherwise. Avoid anything close to the bridal red unless you have been told the palette calls for it.</p>

      <h2>Let the photographers work</h2>
      <p>You are not the second photographer. Standing in the aisle with a phone during the entrance, or leaning into the varmala for a better angle, puts you directly into frames the couple has paid for and will keep forever.</p>
      <p>Watch the professionals and stay behind them. They have planned their positions. If you want the shot, you will get a better version of it from the official gallery in three weeks.</p>

      <h2>Be present</h2>
      <p>Eat the food while it is hot. Learn the two steps everyone is doing. Talk to the great-aunt sitting alone at table nine. Put the phone down for the pheras.</p>
      <p>The couple will not remember whether you posted. They will remember whether you were there.</p>
    `,
  },
  {
    slug: "instagrammification-of-weddings",
    image: "/blogs/instagrammification-of-weddings.jpg",
    title: "Instagrammification of Weddings",
    category: "Planning",
    author: "Sanah",
    readTime: "5 min read",
    date: "2026-07-30",
    excerpt:
      "Social media rebuilt how India plans weddings, from vendor discovery to which rituals get revived. That is not all bad.",
    content: `
      <p>A generation ago, you planned a wedding from whatever your family had already seen. Today you plan it from everything everyone has ever posted. That shift has done more to change Indian weddings than any trend, and it deserves a more honest look than it usually gets.</p>

      <h2>Inspiration without end</h2>
      <p>The obvious gain is reference. You no longer have to describe a mandap to a decorator and hope you both mean the same thing; you send four images and a note about what you like in each. Colour palettes, entrance concepts, lighting, table settings, all of it is now a shared visual vocabulary between you and every vendor you hire.</p>
      <p>The obvious risk is the same thing. When everyone draws from the same feed, weddings start to converge. The counterweight is to bring references from outside the wedding internet: your grandmother's photographs, the textiles in your own family, the architecture of the place you are marrying in.</p>

      <h2>Finding vendors you would never have found</h2>
      <p>This is the genuinely democratising part. A decorator in Indore or a photographer in Kochi can now be discovered by a couple in Delhi without a single introduction. Small studios compete on work rather than on who their family knows.</p>
      <p>Look past the follower count. Check the tagged photographs rather than the grid, since those are posted by clients rather than by the vendor. Ask for references from weddings in your own city and actually call them.</p>

      <h2>Discovering cultures, including your own</h2>
      <p>Couples are encountering rituals they had never heard of, including from their own communities. Regional traditions that were fading are being revived because somebody posted one and it travelled.</p>
      <p>The care needed here is to learn what a ritual means before borrowing it. A ceremony lifted for its visuals, stripped of its context, reads as hollow to everyone who grew up with it. If you love something you saw, find out what it is for, and ask someone who practises it.</p>

      <h2>Planning became collaborative</h2>
      <p>Shared boards, saved collections, and group chats have turned planning into something families do together across cities. Aunts in three time zones can vote on the invitation. Whether that is a feature or a problem depends entirely on your family.</p>

      <h2>The wedding as a story</h2>
      <p>The real change is structural. A wedding is now built to be narrated: a save-the-date, a hashtag, a pre-wedding shoot, a reel per function, an after-film. It has an arc, and couples are its authors.</p>
      <p>That is a genuinely new form of creative expression and there is nothing wrong with enjoying it. The only question worth asking, repeatedly, is whether a given decision is for the day or for the documentation. Both are valid answers. Confusing one for the other is what people regret.</p>
    `,
  },
  {
    slug: "bride-and-groom-outfits-a-modern-guide",
    image: "/blogs/bride-and-groom-outfits-a-modern-guide.jpg",
    title: "Bride & Groom Outfits: A Modern Guide",
    category: "Planning",
    author: "Nalin",
    readTime: "6 min read",
    date: "2026-07-11",
    excerpt:
      "What to wear, across every function, without losing the ability to sit down, eat, or dance.",
    content: `
      <p>Wedding dressing has loosened considerably in the last decade. The rules that remain are mostly practical ones, and they are worth knowing before the first fitting rather than after.</p>

      <h2>Bridal outfits</h2>
      <p>The lehenga still dominates, but the silhouette has moved: lighter canvases, less structured blouses, and a shift away from the heaviest zardozi toward handwork that photographs well without adding kilos. Sarees are firmly back for the ceremony, particularly Banarasi and Kanjeevaram, often in colours other than red.</p>
      <p>Order early. A custom lehenga from a serious atelier runs four to six months, and the final fitting should be no earlier than two weeks before the function. Ask what the finished piece weighs before you commit, then wear it for twenty minutes in the shop and try sitting down in it.</p>

      <h2>Groom outfits</h2>
      <p>Grooms have far more room than they used to and are finally using it. The bandhgala has become the default for receptions and cocktails because it works with the same ease as a suit. Sherwanis have moved toward cleaner tailoring and subtler tonal embroidery, and the safa is increasingly chosen to complement rather than match.</p>
      <p>Get the shoulders and the sleeve length right and everything else follows. Most grooms spend on embellishment and skip the second fitting, which is precisely backwards.</p>

      <h2>Coordinating without matching</h2>
      <p>Matching outfits exactly tends to flatten both in photographs. Working within one palette, at different levels of saturation, almost always reads better: an ivory sherwani against a deep rust lehenga, or a gold bandhgala against a dusty rose saree.</p>
      <p>Agree the palette for each function together, early, and tell both families so the close relatives can dress into it rather than against it.</p>

      <h2>Dress for every celebration, not just the big one</h2>
      <p>The ceremony outfit gets all the attention and the other five leave you scrambling. Plan the whole week at once.</p>
      <p>The haldi will ruin whatever you wear, so wear something you are content to lose, in a fabric that copes with turmeric. The mehendi needs sleeves you can push back and no cuffs to spoil. The sangeet needs to survive three hours of dancing. The reception is the one place a sharper, more western silhouette is entirely at home.</p>

      <h2>Style and comfort are not opposites</h2>
      <p>The single most common regret is an outfit too heavy to enjoy the day in. You will be in it for eight to twelve hours, much of it standing, in a room that is warmer than it looks.</p>
      <p>Break your shoes in for two weeks beforehand. Ask for a second, lighter dupatta for the long stretches between photographs. Make sure you can raise your arms above your head, because at some point in the sangeet you will need to.</p>
    `,
  },
  {
    slug: "budget-friendly-wedding-playbook",
    title: "Budget-Friendly Wedding Playbook",
    category: "Planning",
    author: "Parnika",
    readTime: "4 min read",
    date: "2026-06-24",
    excerpt:
      "Weddings have become week long parties, and the fluff is where the budget quietly goes. Here is how to curb it without touching the experience.",
    content: `
      <p>The wedding market today is dominated by Gen Z and late millennials who increasingly see weddings as a full blown, week long party, valuing experiences and memories more than traditions and rituals. This cohort has an eclectic set of expenses that silently pump up the budget. Here is exactly how you can curb the fluff without compromising on the experience.</p>

      <h2>Start with the guest list</h2>
      <p>Before the venue, caterers or decoration, the first order of business is determining your guest list. Your wedding is about you, your partner and your loved ones, the judgemental next door neighbour has no place here. Be intentional with your guest list.</p>

      <h2>Reuse your decor</h2>
      <p>Being sustainable has never been cooler, so reuse your decor. Ditch the superfluous decoration, it is so 2016. Minimal floral decorations that segue into nature's backdrop exude luxury in a cost-effective manner.</p>

      <h2>Hand a camera to your guests</h2>
      <p>Disposable cameras can be a fun way of engaging with your wedding guests and at the same time help you save up on a photographer, especially if you are someone who loves candid pictures. We know it is important to get those perfect solo shots too, so hire a professional for a few hours before the event to get those in, and let your guests do the magic.</p>

      <h2>Make the outfit rewearable</h2>
      <p>Here is our hot take, your wedding outfit should be rewearable. If you are putting in the bucks, you should be able to flaunt it on multiple occasions post wedding. Pick a timeless base piece and tastefully accessorize it for your big day. The trick lies in how you style it, and you will have a different outfit each time. But if you are someone who wants to walk with the trend, we suggest renting your outfit.</p>

      <h2>How to split the budget</h2>
      <p>Essentially, allocate about 50 percent of your total budget to venue and catering, 10 percent to decoration, 10 percent to entertainment, 5 percent to beauty and attire, 5 percent to photography and videography, and 20 percent for other miscellaneous expenses, trust us, there are many.</p>
    `,
  },
  {
    slug: "bride-vanity-diaries",
    image: "/blogs/bride-vanity-diaries.jpg",
    title: "The Bride Vanity Diaries",
    category: "Planning",
    author: "Wedding Central",
    readTime: "4 min read",
    date: "2026-09-12",
    excerpt:
      "Somewhere between choosing your lehenga and arguing about the guest list, someone will mention that you should \"start your skin prep now.\" Panic sets in.",
    content: `
      <p>Somewhere between choosing your lehenga and arguing about the guest list, someone will mention that you should "start your skin prep now." Panic sets in. What does that even mean?</p>
      <p>Do you need seventeen serums? Is your face supposed to have "THE" bridal glow already? Take a breath.</p>
      <p>Bridal glow is not a miracle that happens the night before your sangeet. It is a slow, fairly boring, extremely effective routine that starts months in advance and gets calmer as the wedding gets closer. Think of it less like a sprint and more like training for a marathon you didn't sign up for but will absolutely finish looking radiant.</p>
      <p>Good Indian wedding planning always leaves room for this part of the process, right alongside the venue and the outfits. Here is the full plan, skin, hair, and vanity box included.</p>
      <h2>Six Months Before: Get Your Skin's Act Together</h2>
      <p>This is the "handle the real stuff" phase, before your inbox fills up with catering package quotes. If you have acne scars, stubborn pigmentation, or fine lines bothering you, this is when a dermatologist visit will actually make a difference. Treatments like microneedling or PRP need multiple sittings spaced weeks apart, so waiting until two months before the d-day means starting a race you cannot finish in time.</p>
      <p>While you're at it, build a simple daily routine. A gentle cleanser, a treatment serum such as niacinamide, a moisturizer that suits your skin, and sunscreen every single morning. That's it.</p>
      <p>If laser hair removal is on your list, start now too because it works in cycles, and your wedding date means nothing to it.</p>
      <h2>Three Months Before: Add Some Sparkle</h2>
      <p>Your basics are running on autopilot, so now you can layer in the fun stuff. A vitamin C serum in the morning helps with dullness and dark spots, and a mild exfoliating acid once or twice a week keeps texture in check without overdoing it. Book yourself a trial facial.</p>
      <p>A hydrating one works well as a first test. You want to know how your skin behaves under a professional's hands well before the actual event, not the week of. This is also a nice time to bring in some Indian wedding traditions that actually work.</p>
      <p>A weekly warm oil massage for your hair, using ingredients your grandmother would approve of, does wonders for scalp health and shine before any heat styling begins. And a homemade or store-bought ubtan once a week keeps your body skin smooth and even-toned without any drama.</p>
      <h2>One Month Before: Freeze Everything New</h2>
      <p>This is peak "why fix what isn't broken" energy. No new products. No skincare hack you saw at 1 a.m.</p>
      <p>on social media and suddenly trust with your face. Your skin does not want surprises this close to the wedding. If you need any extractions done, get them out of the way now.</p>
      <p>Skin needs about two to three weeks to fully calm down afterward, and you do not want that timeline clashing with your</p>
      <p>haldi</p>
      <p>. Hydration becomes the main character here. Hyaluronic acid, ceramides, and actual water- the kind you drink, not just apply. Aim for two to three liters a day if you can manage it.</p>
      <p>Your skin barrier will thank you quietly but persistently.</p>
      <h2>Final Week: Less is Better</h2>
      <p>This is not the week for ambition. Book one gentle, hydrating facial and nothing more adventurous. No deep peels, no aggressive extractions, nothing that risks leaving your face looking like it went through something.</p>
      <p>Stop retinol and strong acids five to seven days before the wedding so your skin stays smooth and cooperative for makeup, not flaky and defensive. Finish any threading, waxing, or touch-ups five to seven days out as well, giving any redness enough time to disappear quietly before the cameras start rolling.</p>
      <h2>The Vanity Box Basics Nobody Tells You About</h2>
      <p>Skin and hair aside, your actual wedding day vanity kit deserves a little planning too. Keep a gentle, non-stripping cleanser for washing your face between events, and a proper cleansing balm for melting away heavy, waterproof makeup at the end of a long day. A lightweight, fast-absorbing moisturizer matters more than people admit, since it needs to sit nicely under both sunscreen and layers of bridal makeup without turning greasy or patchy.</p>
      <p>And if the whole process starts feeling overwhelming, a calming pillow mist or a stress relief oil at night isn't indulgent; it's basic maintenance. Wedding planning is exhausting, and sleep is doing more for your glow than any serum ever will.</p>
      <h2>The Actual Takeaway</h2>
      <p>Nobody's skin transforms overnight, no matter what that instagram reel promises. What actually works is unglamorous consistency, started early and eased off gently as the big day approaches. Build the routine, trust the timeline, and resist the urge to try something new the week of.</p>
      <p>Your skin, your hair, and your makeup artist will all thank you for keeping things simple.</p>
    `,
  },
  {
    slug: "experiential-games-in-weddings",
    image: "/blogs/experiential-games-in-weddings.jpg",
    title: "Experiential Games in Weddings",
    category: "Planning",
    author: "Wedding Central",
    readTime: "3 min read",
    date: "2026-09-08",
    excerpt:
      "A wedding is no longer just about beautiful decorations, a grand entrance, and a dance floor filled with music. Today, couples are looking for ways to make their celebrations more personal, immersive, and memorable.",
    content: `
      <p>A wedding is no longer just about beautiful decorations, a grand entrance, and a dance floor filled with music. Today, couples are looking for ways to make their celebrations more personal, immersive, and memorable. This is where experiential wedding games come in.</p>
      <p>Forget the kiddish games and predictable activities. Modern wedding games are about creating moments that bring people together, spark conversations, and turn wedding guests into active participants in the celebration. </p>
      <h2>What Are Experiential Wedding Games?</h2>
      <p>Experiential games are thoughtfully designed activities that go beyond entertainment. They encourage guests to explore, connect, create, and participate in the wedding atmosphere. Instead of simply watching the celebrations, guests become part of the story.</p>
      <p>From interactive installations and personalised challenges to cultural experiences and creative guest activities, these games can be designed to complement the wedding's theme, venue, and personality of the couple. The goal is simple: create an experience guests will remember long after the wedding ends.</p>
      <h2>1. The Couple's Story: An Interactive Wedding Hunt</h2>
      <p>Why should wedding games be limited to guessing the bride's favourite colour or competing in noisy challenges? An interactive wedding hunt can be built around the couple's actual journey. Guests can discover clues about their first meeting, favourite travel destinations, shared memories, or important milestones.</p>
      <p>Imagine guests exploring different corners of the venue, scanning QR codes, answering interesting questions, or discovering hidden stories about the couple. This transforms the wedding into a personalised experience while encouraging guests from different friend groups and families to interact. </p>
      <h2>2. Immersive Cultural Experiences</h2>
      <p>Indian weddings are rich in traditions, regional customs, music, food, and storytelling. Experiential games offer a modern way to celebrate this cultural diversity. A wedding inspired by Rajasthan could feature a heritage-inspired discovery trail, while a Maharashtrian wedding could introduce guests to traditional elements through interactive storytelling and creative challenges.</p>
      <p>These experiences should feel authentic rather than staged. The idea is to make culture accessible, engaging, and enjoyable for guests of all ages and backgrounds.</p>
      <h2>3. Creative Stations That Guests Actually Enjoy</h2>
      <p>Not everyone wants to dance on stage or participate in loud group games. Some guests prefer experiences that allow them to express themselves creatively. Personalised perfume-making, custom postcard writing, live illustration, collaborative artwork, and memory-wall installations can add an interactive element to the wedding.</p>
      <p>For example, guests could create a small artwork inspired by the couple and contribute it to a collective installation. The final piece becomes more than wedding decor, it becomes a visual memory of everyone who attended. </p>
      <h2>4. Digital Experiences for Modern Weddings</h2>
      <p>Technology can add another layer of interaction without taking away from the elegance of the celebration. Couples can introduce digital guestbooks, interactive wedding timelines, personalised photo challenges, and venue-based discovery experiences. Guests can contribute messages, photographs, or memories that the couple can revisit after the wedding.</p>
      <p>The key is to ensure that technology enhances the occasion rather than making guests feel like they are attending a corporate event. A simple, well-designed experience often works better than an overly complicated setup.</p>
      <h2>5. Designing Games Around the Wedding Vibe</h2>
      <p>The most successful experiential games are those that feel like a natural part of the wedding. A luxury palace wedding may benefit from refined, heritage-inspired activities, while a destination beach wedding could incorporate relaxed, location-based experiences. The choice of activity should consider the guest list, venue, cultural setting, and overall mood of the celebration.</p>
      <p>Games should be optional, inclusive, and easy to understand, allowing guests to participate at their own pace.</p>
      <h2>The Future of Wedding Entertainment</h2>
      <p>Experiential games are changing how couples think about wedding entertainment. They bring together storytelling, design, culture, technology, and human connection to create celebrations that feel more personal. A wedding is not remembered only for how it looked.</p>
      <p>It is remembered for how it made people feel, the conversations they had, and the moments they shared. At Wedding Central, discover ideas that turn your wedding from a celebration into an experience worth remembering.</p>
    `,
  },
  {
    slug: "decoding-the-wedding-dress-code",
    image: "/blogs/decoding-the-wedding-dress-code.jpg",
    title: "Decoding the Dress Code",
    category: "Attending",
    author: "Wedding Central",
    readTime: "3 min read",
    date: "2026-09-04",
    excerpt:
      "The wedding invitation has arrived, the dates are blocked, and the age-old question remains: what should you wear? Indian weddings are multi-day affairs, with each function demanding a distinct aesthetic.",
    content: `
      <p>The wedding invitation has arrived, the dates are blocked, and the age-old question remains: what should you wear? Indian weddings are multi-day affairs, with each function demanding a distinct aesthetic. The goal of any guest is to look impeccable, feel comfortable, and ensure the couple remains the focal point of the celebrations.</p>
      <p>Here is a practical breakdown of how to approach the three main events.</p>
      <h2>The Haldi: Daytime Comfort Meets Style</h2>
      <p>The Haldi is traditionally an intimate, daytime event heavily involving turmeric paste, water, and outdoor settings. Breathability is your biggest priority.</p>
      <ul><li>For Women: Opt for lightweight fabrics like cotton, georgette, or chiffon. Yellow, mustard, or floral prints are standard, but soft greens and peaches work equally well. Avoid heavy embroidery that will weigh you down in the daytime heat.</li><li>For Men: This is where simplicity is highly effective. A classic Chikankari kurta in soft pastel shades is a foolproof choice. It provides an effortlessly stylish look, breathes beautifully during humid daytime outdoor events, and photographs exceptionally well without looking overdone. Pair it with comfortable pyjamas or straight-cut trousers.</li></ul>
      <h2>The Sangeet: Glamour and Mobility</h2>
      <p>The Sangeet is a high-energy evening centered around music, performances, and hours on the dance floor. Your outfit needs to accommodate constant movement.</p>
      <ul><li>For Women: Pre-draped sarees, sharply tailored fusion wear, or lehengas with lighter borders are ideal. You want the visual impact of evening wear without the restriction of a heavy skirt. Avoid anything with long, trailing dupattas that require constant adjustment.</li><li>For Men: Elevate your look with structured layers. A sharp Nehru jacket or an Indo-Western tailored jacket over a solid silk kurta strikes the right balance. Stick to deeper tones like navy blue, emerald green, or deep maroon. Leave the heavily embellished, floor-length sherwanis for the groom.</li></ul>
      <h2>The Reception: Formal and Refined</h2>
      <p>The Reception is the grand finale and usually demands the most formal attire.</p>
      <ul><li>For Women: This is the time for elegant silk sarees, sophisticated floor-length gowns, or intricately worked Anarkalis. Jewel tones work best under banquet lighting. Statement jewelry is appropriate, but avoid wearing full bridal-style sets.</li><li>For Men: A well-tailored dark suit or tuxedo is the standard for modern receptions. Ensure the fit is precise, especially around the shoulders and the trouser break. If you prefer traditional wear, a structured Bandhgala suit is an exceptionally sharp alternative.</li></ul>
      <h2>Footwear and Finishing Touches</h2>
      <p>Your choice of footwear can define your comfort level at these events. For the Haldi, which is often outdoors on grass, avoid stiletto heels. Women should opt for elegant flats or embellished juttis, while men can wear simple leather sandals.</p>
      <p>The Sangeet requires dancing shoes, so men should choose well-broken-in brogues or loafers, and women should stick to block heels or wedges. For the Reception, formal oxfords for men and classic heels for women complete the refined aesthetic.</p>
    `,
  },
  {
    slug: "modern-guest-gifting-guide",
    image: "/blogs/modern-guest-gifting-guide.jpg",
    title: "The Modern Guest Gifting Guide",
    category: "Attending",
    author: "Wedding Central",
    readTime: "3 min read",
    date: "2026-08-30",
    excerpt:
      "The traditional envelope of cash will always have its place at weddings. However, modern couples are increasingly practical.",
    content: `
      <p>The traditional envelope of cash will always have its place at weddings. However, modern couples are increasingly practical. Many are already living independently, meaning they do not necessarily need another silver bowl, decorative clock, or a set of dinner plates.</p>
      <p>If you want to give a gift that truly adds value to their new life together, it requires looking past the conventional registry.</p>
      <h2>Prioritize Experiences Over Objects</h2>
      <p>After months of stressful wedding planning and non-stop socializing, the best gift you can offer a newlywed couple is a chance to relax.</p>
      <ul><li>Weekend Getaways: A voucher for a boutique hotel or a premium Airbnb gives the couple a much-needed escape to decompress.</li><li>Dining and Wellness: A reservation at an exclusive restaurant or a couple's spa day provides a memorable experience without adding physical clutter to their home.</li></ul>
      <h2>Invest in Everyday Convenience</h2>
      <p>Think about the friction points in daily life and how your gift can solve them. Modern couples value time and convenience above almost everything else.</p>
      <ul><li>Subscription Services: Instead of a physical item, consider gifting annual subscriptions that make life easier. For couples who love ordering in, a premium food delivery membership like Swiggy One is an incredibly practical, highly appreciated gift that they will actually use every single week.</li><li>Smart Home Upgrades: Devices that automate daily tasks, from robotic vacuums to smart lighting systems, are highly sought after. They offer immediate, tangible improvements to their daily routine.</li></ul>
      <h2>The Power of Group Gifting</h2>
      <p>If the couple has their eye on a high-ticket item, do not attempt to buy a cheaper, lower-quality alternative on your own. Instead, pool your resources with a group of friends.</p>
      <ul><li>Major Appliances: Contributing to a high-end espresso machine, an air purifier, or a premium mattress is far more useful than gifting a standalone toaster.</li><li>Honeymoon Funds: Many couples now prefer contributions to their honeymoon. A collective gift that covers their flights or a special excursion during their trip is always welcome.</li></ul>
      <h2>Personalized and Custom Offerings</h2>
      <p>If you prefer giving something tangible, customization elevates a standard gift into a keepsake. Monogrammed leather luggage tags or passport holders for their honeymoon show careful thought. Custom illustrations of the venue or a high-quality framing of their wedding invitation are unique pieces they can display in their home.</p>
      <p>These touches demonstrate that you invested time and planning into their gift.</p>
      <h2>Guidelines for Getting It Right</h2>
      <p>If you do choose to give a physical item, ensure you know their aesthetic preferences. If you are unsure, always include a gift receipt. Finally, whether you are giving an experience, a digital subscription, or cash, always include a handwritten note.</p>
      <p>It adds a necessary personal touch to even the most practical gifts.</p>
    `,
  },
  {
    slug: "navigating-the-shaadi-buffet",
    title: "Navigating the Shaadi Buffet",
    category: "Attending",
    author: "Wedding Central",
    readTime: "3 min read",
    date: "2026-08-25",
    excerpt:
      "The Indian wedding buffet is an overwhelming landscape of culinary delights, often stretching across massive lawns with dozens of different cuisines. Approaching it without a solid plan usually results in a chaotic plate of conflicting flavors and feeling uncomfortably full within the first twenty minutes.",
    content: `
      <p>The Indian wedding buffet is an overwhelming landscape of culinary delights, often stretching across massive lawns with dozens of different cuisines. Approaching it without a solid plan usually results in a chaotic plate of conflicting flavors and feeling uncomfortably full within the first twenty minutes. Conquering the buffet requires strategy, pacing, and prioritization.</p>
      <h2>Step One: Scout the Perimeter</h2>
      <p>Never pick up a plate immediately upon entering the dining area. Take a complete lap of the entire setup first.</p>
      <ul><li>Mental Mapping: Identify the high-value items, note where the live counters are located, and decide what you absolutely must try.</li><li>Filtering: Mentally filter out the filler items. Skip the generic dinner rolls, plain rice, or standard salads that you can eat on any regular day. Save your appetite for the specialty dishes.</li></ul>
      <h2>Step Two: Master the Live Counters</h2>
      <p>Live counters are the undisputed highlight of the wedding feast, offering the freshest food.</p>
      <ul><li>Timing is Everything: Head to the popular counters, like chaat, pasta, or dim sum, early in the evening before the main rush hits.</li><li>Portion Control: Explicitly ask the chefs for smaller, tasting-sized portions. This allows you to sample a wider variety of items without hitting your capacity too early.</li></ul>
      <h2>Step Three: The Beverage Strategy</h2>
      <p>While the majority of guests will crowd around the mocktail bar or the heavy, sugary sherbet counters, look for the traditional setups.</p>
      <ul><li>The Palate Cleanser: Find the dedicated tea vendor. A strong, freshly brewed cup of chai is the perfect palate cleanser halfway through the evening. It cuts through the richness of the heavy appetizers, settles the stomach, and provides a clean reset before you move on to the main course.</li></ul>
      <h2>Step Four: Strategic Plating for the Main Course</h2>
      <p>Do not treat your plate like a mixing bowl.</p>
      <ul><li>Cuisine Isolation: Keep different cuisines on separate plates or eat them in distinct rounds. Mixing a rich paneer makhani with a delicate Thai green curry ruins the flavor profile of both.</li><li>Temperature Matters: Only plate hot food when you are ready to eat it. Letting carefully prepared dishes go cold while you stand in another line defeats the purpose.</li></ul>
      <h2>Step Five: Managing the Flow and Timing</h2>
      <p>Understanding the rhythm of a wedding buffet is crucial. The food stations will see a massive surge of crowds immediately after the couple completes their main stage photographs. To avoid the longest lines, aim to eat in waves.</p>
      <p>Have your appetizers early, take a break during the peak dinner rush to socialize, and return for the main course once the crowd begins to disperse toward the dessert stations.</p>
      <h2>Step Six: The Dessert Station Finale</h2>
      <p>Always operate at eighty percent capacity during the main course to leave room for dessert. Bypass the standard blocks of ice cream and head straight for the items being made on the spot. Hot jalebis straight from the oil or freshly steamed malpua offer a significantly better culinary experience.</p>
    `,
  },
];

/** Every category, in display order. Kept for filtering the hub later on. */
export const CATEGORIES: BlogCategory[] = ["Planning", "Attending"];

export function getBlogBySlug(slug: string) {
  return blogs.find((blog) => blog.slug === slug);
}

export function getBlogsByCategory(category: BlogCategory) {
  return blogs.filter((blog) => blog.category === category);
}
