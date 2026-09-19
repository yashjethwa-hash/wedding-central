"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion } from "framer-motion";

/* -------------------------------------------------------------------------- */
/* The map                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The map is artwork, not a traced path: `public/india-map.png`, exported from
 * the design file. It already carries state boundaries and the Andaman and
 * Nicobar chain, and its background is transparent, so it sits over the damask
 * without a panel behind it.
 *
 * Pin percentages are fitted to THIS artwork, not to a generic projection of
 * India. The fit was solved by measuring the drawing's own mainland bounding
 * box and matching it to India's extent, then checked against fourteen cities
 * and three extreme points: it lands within about one percent of the width.
 * Replacing the artwork means refitting, or every pin moves.
 */
const MAP_SRC = "/india-map.png";

/** Intrinsic size of that file, which sets the aspect ratio of the pin layer. */
const MAP_SIZE = { width: 1045, height: 1188 };

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const SCALE_STEP = 0.5;

/* -------------------------------------------------------------------------- */
/* Data                                                                        */
/* -------------------------------------------------------------------------- */

export type Place = {
  /** Short label, used on the pin and as the React key. */
  name: string;
  /** Card heading, place and state. */
  heading: string;
  /** One line under the heading. */
  tagline: string;
  description: string;
  /** Percentage down the map, taken from the projection above. */
  top: number;
  /** Percentage across the map, taken from the projection above. */
  left: number;
  /** URL-encoded, ready to drop into a Google Maps search. */
  mapQuery: string;
};

const destinations: Place[] = [
  {
    name: "Udaipur",
    heading: "Udaipur, Rajasthan",
    tagline: "The City of Royal Weddings",
    description:
      "Udaipur is a dream destination for couples looking for a royal and luxurious wedding experience. Its stunning lakes, grand palaces, and heritage venues create a beautiful setting for celebrations. Iconic properties like Taj Lake Palace add to its regal charm. The city is ideal for destination weddings, sangeet nights, and elegant receptions. Udaipur brings together royal architecture, scenic beauty, and premium hospitality.",
    top: 41.57,
    left: 19.53,
    mapQuery: "Udaipur",
  },
  {
    name: "Jaipur",
    heading: "Jaipur, Rajasthan",
    tagline: "A Royal Celebration of Love",
    description:
      "Jaipur offers a perfect blend of majestic forts, historic havelis, and the vibrant culture of Rajasthan. Its heritage venues provide a grand backdrop for traditional and luxury weddings. The Pink City's colourful markets and local craftsmanship add to the wedding experience. Couples can plan everything from royal ceremonies to elaborate pre-wedding functions. Jaipur is a destination where history and celebration come together.",
    top: 33.26,
    left: 26.5,
    mapQuery: "Jaipur",
  },
  {
    name: "Goa",
    heading: "Goa",
    tagline: "Beachside Weddings and Tropical Celebrations",
    description:
      "Goa is a popular choice for couples who want a relaxed and lively wedding by the sea. Its beaches, tropical surroundings, and resort venues suit intimate ceremonies and destination celebrations. The state is known for its sunset weddings, beach parties, and vibrant nightlife. Couples can combine their wedding with a memorable holiday for guests. Goa brings a casual, festive, and tropical atmosphere to the wedding experience.",
    top: 72.71,
    left: 19.93,
    mapQuery: "Goa",
  },
  {
    name: "Jodhpur",
    heading: "Jodhpur, Rajasthan",
    tagline: "A Wedding in the Blue City",
    description:
      "Jodhpur offers a majestic setting for couples seeking a royal Rajasthani wedding. The dramatic Mehrangarh Fort and panoramic city views create striking backdrops for wedding photography. Heritage hotels and palaces provide venues for grand celebrations and traditional ceremonies. The city's blue streets and cultural richness add character to wedding events. Jodhpur is ideal for couples looking for history, grandeur, and unforgettable views.",
    top: 35.66,
    left: 17.22,
    mapQuery: "Jodhpur",
  },
  {
    name: "Jaisalmer",
    heading: "Jaisalmer, Rajasthan",
    tagline: "Love Amid the Golden Desert",
    description:
      "Jaisalmer is a unique destination for couples dreaming of a royal desert wedding. Its golden forts, sand dunes, and traditional Rajasthani architecture create a distinctive atmosphere. Wedding celebrations can include desert sunsets, folk music, and cultural performances. Heritage properties and desert camps offer options for intimate and large gatherings. Jaisalmer combines royal traditions with the beauty of the Thar Desert.",
    top: 33.26,
    left: 10.11,
    mapQuery: "Jaisalmer",
  },
  {
    name: "Kerala",
    heading: "Kerala",
    tagline: "Serene Weddings by the Backwaters",
    description:
      "Kerala offers a peaceful and scenic setting for couples seeking a nature-inspired wedding. Its backwaters, coconut-lined landscapes, and traditional architecture create a calming atmosphere. Couples can explore houseboat celebrations, resort weddings, and traditional Kerala ceremonies. The region is also known for its rich cultural traditions and local cuisine. Kerala is suited to weddings that blend natural beauty, culture, and intimate celebrations.",
    top: 91.03,
    left: 28.11,
    mapQuery: "Kerala",
  },
  {
    name: "Rishikesh",
    heading: "Rishikesh, Uttarakhand",
    tagline: "Spiritual Beginnings by the Ganges",
    description:
      "Rishikesh is known for its spiritual surroundings and riverside locations along the holy Ganges. Couples looking for meaningful and peaceful ceremonies can explore its scenic wedding venues. The city's natural landscape creates a tranquil backdrop for intimate celebrations. It can also be combined with spiritual experiences and wellness activities for guests. Rishikesh offers a distinctive setting for couples who value serenity and tradition.",
    top: 21.62,
    left: 34.82,
    mapQuery: "Rishikesh",
  },
  {
    name: "Mussoorie",
    heading: "Mussoorie, Uttarakhand",
    tagline: "A Romantic Hill Station Wedding",
    description:
      "Mussoorie is a scenic hill station offering mountain views, cool weather, and peaceful surroundings. Its hillside resorts and heritage properties provide charming settings for wedding celebrations. Couples can plan intimate ceremonies, outdoor functions, and romantic photography sessions. The Himalayan landscape adds a refreshing touch to destination weddings. Mussoorie is a choice for those looking for a relaxed celebration surrounded by nature.",
    top: 20.25,
    left: 34.15,
    mapQuery: "Mussoorie",
  },
  {
    name: "Shimla",
    heading: "Shimla, Himachal Pradesh",
    tagline: "Colonial Charm in the Hills",
    description:
      "Shimla brings together pine-covered slopes, mountain scenery, and colonial-era architecture. Its heritage hotels and hillside venues offer a beautiful setting for weddings and pre-wedding celebrations. The cool climate and scenic surroundings make it appealing for couples planning a hill wedding. Guests can enjoy the town's heritage, views, and relaxed atmosphere. Shimla adds a classic and romantic charm to wedding celebrations.",
    top: 17.85,
    left: 31.13,
    mapQuery: "Shimla",
  },
  {
    name: "Andaman and Nicobar Islands",
    heading: "Andaman and Nicobar Islands",
    tagline: "A Tropical Escape",
    description:
      "The Andaman and Nicobar Islands offer secluded beaches, turquoise waters, and tropical landscapes for destination weddings. Couples can explore intimate seaside ceremonies and resort-based celebrations. The islands provide beautiful settings for wedding photography and memorable guest experiences. Their natural beauty suits couples looking for a private and relaxed celebration. Weddings here combine coastal charm with a peaceful island getaway.",
    top: 86.53,
    left: 88.28,
    mapQuery: "Andaman%20Nicobar%20Islands",
  },
  {
    name: "Agra",
    heading: "Agra, Uttar Pradesh",
    tagline: "A Wedding Inspired by Timeless Love",
    description:
      "Agra is known worldwide for the Taj Mahal, making it an appealing destination for romantic wedding celebrations. Couples can explore venues with views of the historic monument and the city's heritage surroundings. The city's Mughal architecture provides an elegant backdrop for photography and events. Heritage hotels and banquet venues offer options for different wedding styles. Agra connects the symbolism of love with India's rich architectural history.",
    top: 32.28,
    left: 33.94,
    mapQuery: "Agra",
  },
  {
    name: "Jim Corbett",
    heading: "Jim Corbett, Uttarakhand",
    tagline: "A Nature-Inspired Wedding Retreat",
    description:
      "Jim Corbett offers a peaceful setting surrounded by forests, rivers, and natural landscapes. Its resorts and open-air lawns can accommodate intimate weddings and destination celebrations. Couples can enjoy scenic wedding photography and a relaxed environment away from busy cities. The area also provides opportunities for nature-based guest experiences. Jim Corbett is suited to couples seeking an outdoor celebration with a touch of adventure.",
    top: 23.7,
    left: 37.1,
    mapQuery: "Jim%20Corbett",
  },
  {
    name: "Bikaner",
    heading: "Bikaner, Rajasthan",
    tagline: "Heritage, Tradition and Royal Weddings",
    description:
      "Bikaner is a historic Rajasthani city known for its medieval palaces, forts, and royal heritage. Its traditional architecture provides a distinctive setting for cultural and heritage weddings. Couples can explore venues that reflect the region's royal history and craftsmanship. Local traditions, cuisine, and decor add authenticity to wedding celebrations. Bikaner offers an experience rooted in Rajasthan's history and cultural identity.",
    top: 29.24,
    left: 18.19,
    mapQuery: "Bikaner",
  },
  {
    name: "Udupi and Mangalore",
    heading: "Udupi and Mangalore, Karnataka",
    tagline: "Coastal Traditions and Intimate Celebrations",
    description:
      "Udupi and Mangalore combine coastal beauty, temple traditions, and peaceful beachside surroundings. The region is suitable for couples seeking traditional ceremonies with a relaxed coastal atmosphere. Its temples and cultural heritage are important to many wedding celebrations. Couples can explore resorts, local venues, and scenic locations for different wedding functions. The area offers a blend of culture, nature, and coastal hospitality.",
    top: 81.39,
    left: 23.32,
    mapQuery: "Udupi%20Mangalore",
  },
  {
    name: "Lavasa",
    heading: "Lavasa, Maharashtra",
    tagline: "A Lakeside Wedding Experience",
    description:
      "Lavasa is a planned hill city near Pune, known for its Italian-inspired architecture and lakeside promenades. Its scenic surroundings provide a distinctive backdrop for weddings and pre-wedding photography. Couples can explore lakeside venues and resort settings for intimate celebrations. The area's hills and waterfront atmosphere add a relaxed destination feel. Lavasa is an option for couples seeking a picturesque wedding close to Pune.",
    top: 62.9,
    left: 18.86,
    mapQuery: "Lavasa",
  },
  {
    name: "Mahabalipuram",
    heading: "Mahabalipuram, Tamil Nadu",
    tagline: "Heritage by the Shore",
    description:
      "Mahabalipuram is a historic coastal town in Tamil Nadu, known for its shore temples and stone architecture. Its beach resorts offer opportunities for seaside weddings and traditional celebrations. Couples can combine heritage-inspired photography with coastal wedding functions. The town's cultural significance adds depth to the wedding experience. Mahabalipuram is ideal for those looking to blend history, architecture, and the sea.",
    top: 82.22,
    left: 41.25,
    mapQuery: "Mahabalipuram",
  },
  {
    name: "Alwar",
    heading: "Alwar, Rajasthan",
    tagline: "Royal Heritage Near the Wilderness",
    description:
      "Alwar offers heritage properties, historic forts, and scenic surroundings for destination weddings. Its proximity to the Sariska Tiger Reserve adds opportunities for nature-based guest experiences. Couples can explore royal-inspired venues and traditional Rajasthani celebrations. The city's heritage atmosphere works well for intimate functions and larger gatherings. Alwar brings together history, culture, and a connection to the natural landscape.",
    top: 30.94,
    left: 29.32,
    mapQuery: "Alwar",
  },
  {
    name: "Kasauli",
    heading: "Kasauli, Himachal Pradesh",
    tagline: "An Intimate Wedding in the Hills",
    description:
      "Kasauli is a quiet hill station in Himachal Pradesh known for its colonial charm and peaceful surroundings. Its scenic locations are suitable for intimate weddings and small family celebrations. Couples can explore hillside venues, heritage-style properties, and outdoor photography settings. The calm atmosphere allows guests to enjoy a relaxed wedding experience. Kasauli is well suited to couples looking for simplicity and mountain charm.",
    top: 18.6,
    left: 30.42,
    mapQuery: "Kasauli",
  },
  {
    name: "Pondicherry",
    heading: "Pondicherry",
    tagline: "French Charm Meets Coastal Romance",
    description:
      "Pondicherry offers a unique combination of French colonial architecture, coastal scenery, and relaxed hospitality. Its heritage streets and beachside locations provide attractive settings for wedding photography. Couples can explore boutique properties, resorts, and intimate celebration venues. The town's architecture and culture add a distinctive character to wedding events. Pondicherry suits couples seeking a stylish and laid-back coastal celebration.",
    top: 84.49,
    left: 40.05,
    mapQuery: "Pondicherry",
  },
  {
    name: "Khajuraho",
    heading: "Khajuraho, Madhya Pradesh",
    tagline: "A Celebration of Art and Heritage",
    description:
      "Khajuraho is a cultural destination famous for its intricately carved ancient temples and historic architecture. Its heritage surroundings provide an unusual and artistic backdrop for wedding photography. Couples can explore the region's cultural identity while planning traditional or destination celebrations. The area's monuments and local heritage create a memorable experience for guests. Khajuraho brings together history, art, and a distinctive cultural atmosphere.",
    top: 40.61,
    left: 40.35,
    mapQuery: "Khajuraho",
  },
];

/**
 * Markets in the same city are a few kilometres apart, which at this scale puts
 * them inside a fraction of one percent of each other. The Delhi and Mumbai
 * entries are fanned out on a circle of radius 3 percent, starting due east so
 * a pair splits sideways rather than stacking, and corrected for the artwork's
 * aspect ratio. Measured against the 20 by 28 pixel marker, a 2 percent radius
 * still leaves a three-pin cluster overlapping. Those clusters are deliberately
 * not to scale.
 */
const markets: Place[] = [
  {
    name: "Delhi Chawri Bazaar",
    heading: "Chawri Bazaar, Delhi",
    tagline: "The Home of Wedding Invitations",
    description:
      "Chawri Bazaar is a well-known destination for wedding invitation cards and stationery. Couples and families can explore a wide range of invitation designs, printing options, and paper materials. The market caters to traditional, modern, and customised wedding stationery needs. It is useful for finding options across different budgets and styles. Chawri Bazaar helps turn wedding invitations into a memorable first impression.",
    top: 26.93,
    left: 34.3,
    mapQuery: "Delhi%20Chawri%20Bazaar",
  },
  {
    name: "Delhi Chandni Chowk",
    heading: "Chandni Chowk, Delhi",
    tagline: "A Bridal Shopping Paradise",
    description:
      "Chandni Chowk is one of Delhi's prominent wedding shopping destinations, especially for bridal and traditional clothing. Families can explore lehengas, sarees, sherwanis, suits, jewellery, and wedding accessories. Its busy lanes offer a wide variety of designs, fabrics, and price points. The market is popular for assembling wedding outfits for different ceremonies. It is a destination for couples and families planning their complete wedding wardrobe.",
    top: 26.9,
    left: 28.33,
    mapQuery: "Delhi%20Chandni%20Chowk",
  },
  {
    name: "Mumbai Mangaldas Market",
    heading: "Mangaldas Market, Mumbai",
    tagline: "Fabrics for Every Wedding Look",
    description:
      "Mangaldas Market is a major fabric shopping destination in Mumbai, offering materials for wedding outfits and custom tailoring. Shoppers can explore silk, dress materials, lining, lace, and other textile options. The market is useful for designers, tailors, and families creating customised wedding attire. Its range of fabrics supports everything from traditional clothing to contemporary designs. It is a practical stop for sourcing materials for wedding fashion.",
    top: 61.06,
    left: 19.58,
    mapQuery: "Mumbai%20Mangaldas%20Market",
  },
  {
    name: "Mumbai Crawford Market",
    heading: "Crawford Market, Mumbai",
    tagline: "Flowers, Decor and Wedding Supplies",
    description:
      "Crawford Market is a historic shopping destination where shoppers can explore flowers, gifting items, and a range of household and decorative supplies. These products can support wedding decor, gifting arrangements, and event preparations. Families and planners can explore different materials and items for celebrations. The market's variety makes it useful when sourcing wedding-related supplies. It connects everyday shopping with the practical needs of wedding planning.",
    top: 63.36,
    left: 15.09,
    mapQuery: "Mumbai%20Crawford%20Market",
  },
  {
    name: "Jaipur Johari Bazaar",
    heading: "Johari Bazaar, Jaipur",
    tagline: "The World of Bridal Jewellery",
    description:
      "Johari Bazaar is a well-known jewellery market in Jaipur, associated with traditional Rajasthani craftsmanship. Shoppers can explore kundan, polki, meenakari, and gemstone jewellery. These styles are often considered for bridal sets, engagement jewellery, and wedding accessories. The market offers an opportunity to explore traditional designs and regional artistry. Johari Bazaar is a destination for couples and families searching for culturally inspired jewellery.",
    top: 33.22,
    left: 26.6,
    mapQuery: "Jaipur%20Johari%20Bazaar",
  },
  {
    name: "Surat New Textile Market",
    heading: "New Textile Market, Surat",
    tagline: "A Hub for Wedding Fabrics",
    description:
      "Surat's New Textile Market is an important destination for exploring fabrics and traditional Indian clothing materials. Shoppers can find sarees, dress materials, lehenga fabrics, and other textiles used in wedding fashion. Its textile trade makes it relevant to retailers, designers, and families sourcing weddingwear. Buyers can explore different fabric types, designs, and price ranges. The market is useful for planning customised outfits and wedding wardrobes.",
    top: 53.4,
    left: 16.58,
    mapQuery: "Surat%20New%20Textile%20Market",
  },
  {
    name: "Varanasi Chowk and Thatheri Bazaar",
    heading: "Chowk and Thatheri Bazaar, Varanasi",
    tagline: "The Beauty of Banarasi Silk",
    description:
      "Varanasi's Chowk and Thatheri Bazaar areas are associated with the city's traditional textile and craft heritage. Shoppers can explore Banarasi silk, brocade, and fabrics used in bridal sarees. These textiles are valued for their intricate designs and cultural significance. Families often consider Banarasi sarees for weddings and important ceremonial occasions. The markets offer a connection to Varanasi's long-standing weaving traditions.",
    top: 38.95,
    left: 50.71,
    mapQuery: "Varanasi%20Chowk%20Thatheri%20Bazaar",
  },
  {
    name: "Hyderabad Charminar",
    heading: "Charminar, Hyderabad",
    tagline: "Pearls, Bangles and Bridal Jewellery",
    description:
      "The Charminar area is a popular shopping destination for traditional jewellery, pearls, and bangles. Brides and families can explore accessories that complement traditional wedding attire. The area's jewellery shops reflect Hyderabad's cultural and craft heritage. Shoppers can look for pieces suitable for bridal looks, gifting, and festive celebrations. It is a destination for those interested in traditional jewellery styles and accessories.",
    top: 66.44,
    left: 35.49,
    mapQuery: "Hyderabad%20Charminar",
  },
  {
    name: "Lucknow Chowk",
    heading: "Chowk, Lucknow",
    tagline: "Traditional Embroidery and Bridal Fashion",
    description:
      "Lucknow Chowk is known for its traditional textile and embroidery heritage. Shoppers can explore chikankari, zardozi, shararas, and ghararas for wedding and festive occasions. These styles offer options for brides, bridesmaids, and family members. The market brings together regional craftsmanship and traditional fashion. It is a destination for those seeking detailed embroidery and culturally inspired wedding outfits.",
    top: 33.47,
    left: 43.63,
    mapQuery: "Lucknow%20Chowk",
  },
  {
    name: "Ahmedabad Dhalgarwad",
    heading: "Dhalgarwad, Ahmedabad",
    tagline: "Gujarati Textiles and Weddingwear",
    description:
      "Dhalgarwad is a traditional textile shopping area in Ahmedabad, offering a variety of fabrics and Indian clothing. Shoppers can explore sarees, Gujarati textiles, and bandhani-inspired styles for wedding celebrations. The market is relevant to families looking for regional attire and festive clothing. Its textile variety can support traditional wedding looks and ceremony-specific outfits. Dhalgarwad reflects Gujarat's rich connection to textiles and cultural fashion.",
    top: 47.05,
    left: 15.74,
    mapQuery: "Ahmedabad%20Dhalgarwad",
  },
  {
    name: "Kolkata Gariahat",
    heading: "Gariahat, Kolkata",
    tagline: "Bengali Sarees and Traditional Elegance",
    description:
      "Gariahat is a popular shopping destination in Kolkata, known for its traditional clothing and saree collections. Shoppers can explore Bengali saree styles such as Tant, Garad, and Baluchari. These textiles offer options for weddings, cultural ceremonies, and family celebrations. The market provides access to regional craftsmanship and traditional fashion. Gariahat is useful for those looking to incorporate Bengali heritage into their wedding wardrobe.",
    top: 48.79,
    left: 68.68,
    mapQuery: "Kolkata%20Gariahat",
  },
  {
    name: "Jodhpur Mochi Bazaar",
    heading: "Mochi Bazaar, Jodhpur",
    tagline: "Traditional Footwear for Weddings",
    description:
      "Mochi Bazaar in Jodhpur is associated with traditional footwear, including juttis and other handcrafted styles. Shoppers can explore footwear to complement ethnic wedding outfits. Traditional designs offer options for brides, grooms, and wedding guests. The market adds a cultural touch to wedding styling through regional craftsmanship. It is a useful destination for finding footwear for festive and ceremonial occasions.",
    top: 35.48,
    left: 17.22,
    mapQuery: "Jodhpur%20Mochi%20Bazaar",
  },
  {
    name: "Mathura and Vrindavan",
    heading: "Local Bazaars, Mathura and Vrindavan",
    tagline: "Spiritual Wedding Essentials",
    description:
      "The local bazaars of Mathura and Vrindavan offer religious items, puja accessories, and devotional products. Families can explore supplies for traditional wedding rituals and related ceremonies. These markets are particularly relevant to couples incorporating religious customs into their celebrations. Shoppers can find items connected to spiritual practices and local traditions. They offer a cultural shopping experience for wedding preparations and rituals.",
    top: 31.12,
    left: 32.8,
    mapQuery: "Mathura%20Vrindavan",
  },
  {
    name: "Moradabad Brass Market",
    heading: "Brass Market, Moradabad",
    tagline: "Decor and Traditional Metalware",
    description:
      "Moradabad is widely associated with its brassware and metalcraft industry. Shoppers can explore decorative pieces, gifting items, and metalware for wedding celebrations. These products can be used in home decor, return gifts, and traditional decorative arrangements. The market offers a variety of handcrafted and ornamental designs. Moradabad is a destination for couples and families interested in metalcraft and wedding-related gifting.",
    top: 26.24,
    left: 36.53,
    mapQuery: "Moradabad%20Brass%20Market",
  },
  {
    name: "Mumbai Lamington Road",
    heading: "Lamington Road, Mumbai",
    tagline: "Lighting and Event Electronics",
    description:
      "Lamington Road is a major electronics shopping area in Mumbai. Wedding planners and event teams can explore lighting equipment, electrical accessories, and other event-related supplies. These products may support stage setups, decorative lighting, and wedding functions. Buyers can explore different equipment options based on their event requirements. The market is relevant for the technical side of wedding decor and celebrations.",
    top: 58.74,
    left: 15.05,
    mapQuery: "Mumbai%20Lamington%20Road",
  },
  {
    name: "Bengaluru Avenue Road",
    heading: "Avenue Road, Bengaluru",
    tagline: "Stationery, Printing and Wedding Essentials",
    description:
      "Avenue Road in Bengaluru is a traditional commercial shopping area with businesses dealing in stationery, printing, textiles, and other goods. Couples and families can explore wedding invitation printing and stationery-related requirements. The area can be useful for sourcing materials for customised wedding preparations. Shoppers may also find products for event-related and personal needs. It offers a practical shopping option for wedding planning in Bengaluru.",
    top: 81.06,
    left: 32.5,
    mapQuery: "Bengaluru%20Avenue%20Road",
  },
  {
    name: "Panipat Textile Markets",
    heading: "Textile Markets, Panipat",
    tagline: "Home Textiles for the Wedding Trousseau",
    description:
      "Panipat is known for its textile industry and home furnishing products. Shoppers can explore bedsheets, blankets, home textiles, and other items for wedding trousseaus. These products are useful when preparing a new household or arranging gifts for the couple. The region's textile trade provides a variety of materials and designs. Panipat is relevant to families planning home essentials alongside wedding celebrations.",
    top: 24.21,
    left: 30.46,
    mapQuery: "Panipat%20Textile%20Markets",
  },
  {
    name: "Firozabad Glass Market",
    heading: "Glass Market, Firozabad",
    tagline: "Glassware and Decorative Pieces",
    description:
      "Firozabad is known for its glass manufacturing and craft industry. Shoppers can explore glassware, decorative items, and glass bangles for wedding-related needs. These products may be used for gifting, home decor, and traditional accessories. The market offers an opportunity to discover locally produced glass craftsmanship. Firozabad is a destination for families and planners seeking decorative and gifting items.",
    top: 32.39,
    left: 35.25,
    mapQuery: "Firozabad%20Glass%20Market",
  },
];

const TABS = [
  { id: "destinations", label: "Destinations", places: destinations },
  { id: "markets", label: "Markets", places: markets },
] as const;

type TabId = (typeof TABS)[number]["id"];

const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=";

/* -------------------------------------------------------------------------- */
/* Pieces                                                                      */
/* -------------------------------------------------------------------------- */

function ExternalArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-[0.9em] w-[0.9em] shrink-0"
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

/** A teardrop marker whose tip, not its centre, sits on the coordinate. */
function PinGlyph({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 34"
      aria-hidden="true"
      className="h-7 w-5 drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)]"
    >
      <path
        d="M12 33.5C12 33.5 23 20.5 23 12A11 11 0 1 0 1 12c0 8.5 11 21.5 11 21.5Z"
        fill="var(--color-ivory)"
        stroke="rgba(74,15,40,0.55)"
        strokeWidth="1.2"
      />
      <circle cx="12" cy="12" r="4.2" fill={active ? "#4a0f28" : "#a31a57"} />
    </svg>
  );
}

/** A small stroked X, used only for the popover's close control. */
function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className="h-4 w-4"
    >
      <path d="M5 5l14 14" />
      <path d="M19 5L5 19" />
    </svg>
  );
}

export default function VenuesMap() {
  const [tab, setTab] = useState<TabId>("destinations");
  const [openPin, setOpenPin] = useState<string | null>(null);
  const [scale, setScale] = useState(MIN_SCALE);
  const reduceMotion = useReducedMotion();

  const frameRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [frame, setFrame] = useState({ width: 0, height: 0 });

  const active = TABS.find((entry) => entry.id === tab) ?? TABS[0];

  /*
    The frame's own size, watched rather than measured once, because the pan
    limits below are derived from it and it changes with the viewport.
  */
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () =>
      setFrame({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /*
    Pan limits are computed rather than handed to Framer as a ref.

    Passing dragConstraints={frameRef} looks right and does nothing: a scale
    transform does not change an element's layout box, so Framer measures the
    map as exactly the size of its frame and allows no movement at any zoom.
    The overflow at a given scale is half the extra width and height, which is
    what these numbers are.
  */
  const overflowX = Math.max(0, (frame.width * (scale - 1)) / 2);
  const overflowY = Math.max(0, (frame.height * (scale - 1)) / 2);
  const canPan = scale > MIN_SCALE;

  const zoom = useCallback(
    (direction: 1 | -1) => {
      setScale((current) => {
        const next = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, Number((current + direction * SCALE_STEP).toFixed(2))),
        );
        // Zooming back out has to recentre, or the map stays parked off to one
        // side with empty frame beside it.
        if (next === MIN_SCALE) {
          x.set(0);
          y.set(0);
        }
        return next;
      });
      setOpenPin(null);
    },
    [x, y],
  );

  function switchTab(next: TabId) {
    setTab(next);
    // A tooltip left open would otherwise point at a pin from the old set.
    setOpenPin(null);
  }

  // Escape is a standard way to dismiss a popover, on top of the pin toggle
  // and the explicit close button inside the card itself.
  useEffect(() => {
    if (!openPin) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPin(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPin]);

  return (
    <section className="w-full" aria-labelledby="venues-heading">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <h2
              id="venues-heading"
              className="font-serif-display text-3xl font-medium text-ivory sm:text-4xl"
            >
              Where India gets married
            </h2>
            <p className="mt-4 font-body text-base font-light leading-relaxed text-ivory/85">
              The places couples travel to, and the markets they shop in before
              they go. Zoom in, drag to move around, and tap a pin for the
              detail.
            </p>
          </div>

          {/* Pill toggle, as a tablist so it works from the keyboard. */}
          <div
            role="tablist"
            aria-label="Map view"
            className="flex shrink-0 rounded-full border border-white/25 bg-white/10 p-1 backdrop-blur-md"
          >
            {TABS.map((entry) => {
              const selected = entry.id === tab;
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => switchTab(entry.id)}
                  className="relative rounded-full px-5 py-2.5 font-body text-sm font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory"
                >
                  {selected && (
                    <motion.span
                      layoutId="venues-toggle-thumb"
                      className="absolute inset-0 rounded-full bg-ivory"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 36 }
                      }
                    />
                  )}
                  <span
                    className={`relative z-10 ${selected ? "text-maroon" : "text-ivory/80"}`}
                  >
                    {entry.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* The frame clips the map, so a panned map cannot spill over the page. */}
        <div
          ref={frameRef}
          className="relative mx-auto mt-12 w-full max-w-[24rem] overflow-hidden rounded-2xl sm:max-w-[30rem] lg:max-w-[36rem]"
          style={{ aspectRatio: `${MAP_SIZE.width} / ${MAP_SIZE.height}` }}
        >
          <motion.div
            className={`h-full w-full ${canPan ? "cursor-grab active:cursor-grabbing" : ""}`}
            drag={canPan}
            dragConstraints={{
              left: -overflowX,
              right: overflowX,
              top: -overflowY,
              bottom: overflowY,
            }}
            dragElastic={0.06}
            dragMomentum={false}
            style={{ x, y, scale }}
            onClick={() => setOpenPin(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MAP_SRC}
              alt="Map of India"
              width={MAP_SIZE.width}
              height={MAP_SIZE.height}
              draggable={false}
              className="pointer-events-none block h-full w-full select-none"
            />

            <div className="absolute inset-0">
              <AnimatePresence mode="wait">
                <motion.div key={tab} className="absolute inset-0">
                  {active.places.map((place, index) => {
                    const isOpen = openPin === place.name;
                    // Flip the card to the left of the pin near the right edge,
                    // or it would run off the map.
                    const flipHorizontal = place.left > 58;
                    // Pins near the top have nowhere to open upward into: the
                    // frame clips at its own edge, so the card drops below the
                    // pin instead for anything in the top fifth of the map.
                    const flipVertical = place.top < 20;

                    return (
                      <div
                        key={place.name}
                        className="absolute"
                        style={{
                          left: `${place.left}%`,
                          top: `${place.top}%`,
                          zIndex: isOpen ? 30 : 10,
                          /*
                            The offset belongs on this wrapper, not on the button
                            inside it. A transform does not move the layout box,
                            so offsetting the button left the wrapper sitting at
                            the coordinate while the pin drew up and to the left,
                            and neighbouring wrappers then swallowed each other's
                            hover and click targets.

                            The counter-scale keeps the marker the same size on
                            screen at every zoom, so it stays a sane hit target
                            and the cards stay readable.
                          */
                          transform: `translate(-50%, -100%) scale(${1 / scale})`,
                          transformOrigin: "bottom center",
                        }}
                        /*
                          Hover lives on the wrapper, not the pin, for two
                          reasons. The tooltip is inside it, so reaching for the
                          Google Maps button does not count as leaving. And the
                          guard on pointerType keeps touch out: a tap fires
                          pointerenter before click, so without it the enter
                          opened the card and the click immediately toggled it
                          shut.
                        */
                        onPointerEnter={(event) => {
                          if (event.pointerType === "mouse") setOpenPin(place.name);
                        }}
                        onPointerLeave={(event) => {
                          if (event.pointerType !== "mouse") return;
                          setOpenPin((current) =>
                            current === place.name ? null : current,
                          );
                        }}
                      >
                        <motion.button
                          type="button"
                          aria-expanded={isOpen}
                          aria-label={place.name}
                          /*
                            No onFocus here on purpose. A tap focuses the button
                            before it clicks it, so opening on focus left the
                            click seeing isOpen as true and toggling straight
                            back shut: the card never appeared on touch. Enter
                            and Space already fire click, so the keyboard is
                            covered by this handler alone.
                          */
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenPin(isOpen ? null : place.name);
                          }}
                          className="block cursor-pointer rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory"
                          initial={
                            reduceMotion
                              ? { opacity: 0 }
                              : { opacity: 0, y: -28, scale: 0.6 }
                          }
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={
                            reduceMotion
                              ? { duration: 0.2, delay: index * 0.01 }
                              : {
                                  type: "spring",
                                  stiffness: 520,
                                  damping: 24,
                                  delay: index * 0.035,
                                }
                          }
                        >
                          <PinGlyph active={isOpen} />
                        </motion.button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              role="group"
                              aria-label={place.heading}
                              initial={
                                reduceMotion
                                  ? { opacity: 0 }
                                  : { opacity: 0, scale: 0.92, y: 6 }
                              }
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={
                                reduceMotion
                                  ? { opacity: 0 }
                                  : { opacity: 0, scale: 0.92, y: 6 }
                              }
                              transition={{ duration: 0.18, ease: "easeOut" }}
                              onClick={(event) => event.stopPropagation()}
                              className={`absolute w-64 max-w-[70vw] rounded-xl border border-white/25 bg-[#2c0917]/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl sm:w-72 ${
                                flipVertical ? "top-9" : "bottom-2"
                              } ${flipHorizontal ? "right-3" : "left-3"}`}
                            >
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenPin(null);
                                }}
                                aria-label={`Close ${place.heading} details`}
                                className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full text-ivory/70 transition-colors duration-200 hover:bg-white/10 hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory"
                              >
                                <CloseIcon />
                              </button>

                              <p className="pr-6 font-serif-display text-sm font-semibold text-ivory">
                                {place.heading}
                              </p>

                              <p className="mt-1.5 font-body text-xs font-semibold tracking-[0.12em] text-ivory/65 uppercase">
                                {place.tagline}
                              </p>

                              <p className="mt-3 font-body text-xs leading-relaxed text-ivory/80">
                                {place.description}
                              </p>

                              <a
                                href={`${MAPS_URL}${place.mapQuery}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(event) => event.stopPropagation()}
                                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-ivory px-3 py-2 font-body text-xs font-semibold text-maroon transition duration-200 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory"
                              >
                                View on Google Maps
                                <ExternalArrow />
                              </a>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Zoom controls, bottom right, outside the panned layer so they stay put. */}
          <div className="absolute right-3 bottom-3 z-40 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => zoom(1)}
              disabled={scale >= MAX_SCALE}
              aria-label="Zoom in"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/50 font-body text-lg leading-none text-ivory backdrop-blur-md transition duration-200 hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => zoom(-1)}
              disabled={scale <= MIN_SCALE}
              aria-label="Zoom out"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/50 font-body text-lg leading-none text-ivory backdrop-blur-md transition duration-200 hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory disabled:cursor-not-allowed disabled:opacity-40"
            >
              &minus;
            </button>
          </div>

          <p className="sr-only" role="status" aria-live="polite">
            {`Zoom ${scale} times`}
          </p>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center font-body text-xs leading-relaxed text-ivory/55">
          Tap or click a pin for the full detail and a link to Google Maps.
          Pin positions are projected from real coordinates; markets in the
          same city are fanned out so each one can be reached, so those
          clusters are not to scale.
        </p>
      </div>
    </section>
  );
}
