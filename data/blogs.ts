export type BlogCategory = "Planning" | "Attending";

export type Blog = {
  slug: string;
  title: string;
  category: BlogCategory;
  author: string;
  readTime: string;
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

export const blogs: Blog[] = [
  {
    slug: "wedding-photographer-prep",
    title: "Wedding Photographer Prep",
    category: "Planning",
    author: "Bushra",
    readTime: "5 min read",
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
    title: "The Unwritten Rules of Attending an Indian Wedding",
    category: "Attending",
    author: "Bushra",
    readTime: "4 min read",
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
    title: "Instagrammification of Weddings",
    category: "Planning",
    author: "Sanah",
    readTime: "5 min read",
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
    title: "Bride & Groom Outfits: A Modern Guide",
    category: "Planning",
    author: "Nalin",
    readTime: "6 min read",
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
    readTime: "6 min read",
    excerpt:
      "A smaller budget is a design constraint, not a compromise. Where the money actually goes, and where it does not need to.",
    content: `
      <p>A smaller budget is a design constraint, not a compromise. Constraints tend to produce better weddings than blank cheques do, as long as you decide early where the money goes.</p>

      <h2>Start with the guest list, because it is the budget</h2>
      <p>Almost every number in your spreadsheet is really a function of one number: how many people are eating. Catering, seating, venue size, favours, and the size of the space you have to decorate all scale directly with the headcount.</p>
      <p>Cutting fifty guests will save you more than every clever saving in the rest of this article put together. Decide the number first, hold the line, and build everything else inside it. If that is not possible in your family, and often it is not, accept it and cut elsewhere rather than pretending.</p>

      <h2>The 50-10-10 starting point</h2>
      <p>As a first draft, allocate roughly 50 percent of the total to venue and catering together, 10 percent to decor, and 10 percent to photography and video. That leaves about 30 percent for outfits, jewellery, music, invitations, transport, and the contingency you will absolutely need.</p>
      <p>Treat it as a starting shape rather than a rule. If photography matters more to you than flowers, move the money. The point of the framework is that it forces the trade to be explicit instead of letting the last few vendors quietly consume whatever is left.</p>

      <h2>Decor that is not thrown away</h2>
      <p>Decor is where budgets go to die, and it is also the most reusable part of the day. Rent structures rather than building them. Choose flowers that are in season and local, which costs a fraction of imported stems and looks better for it.</p>
      <p>Lean on the venue instead of covering it, since lighting a good space well is dramatically cheaper than disguising a poor one. Potted plants can go home with guests or to the family afterwards rather than into a bin at midnight.</p>

      <h2>Disposable cameras on the tables</h2>
      <p>Put a few single-use film cameras on each table and let guests shoot the evening. The cost is negligible next to a second shooter, and the results are the frames your professional could never get: the table at two in the morning, the uncle mid-story, your cousins in the corridor.</p>
      <p>Collect them in a labelled basket at the exit, or you will find three of them in a taxi.</p>

      <h2>Outfits you will wear again</h2>
      <p>A lehenga worn once and stored is the least efficient money at the entire wedding. Separates worn again at someone else's function, a saree that re-enters the wardrobe, or a bandhgala that works as eveningwear all quietly halve their own cost.</p>
      <p>Rental for the heaviest single-function pieces is now genuinely good, particularly for grooms and for the sangeet. Wearing your mother's saree for one function costs nothing and is usually the photograph the family keeps.</p>

      <h2>Where not to save</h2>
      <p>Protect the photographer, the food, and the sound. Those are the three things guests actually remember, and each is very difficult to fix afterwards. Everything else is negotiable.</p>
    `,
  },
];

/** The two hub sections, in the order they appear on the blog index. */
export const CATEGORIES: BlogCategory[] = ["Planning", "Attending"];

export function getBlogBySlug(slug: string) {
  return blogs.find((blog) => blog.slug === slug);
}

export function getBlogsByCategory(category: BlogCategory) {
  return blogs.filter((blog) => blog.category === category);
}
