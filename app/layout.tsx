import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import { ChromeProvider } from "@/components/ChromeGate";
import Navbar from "@/components/Navbar";
import { NAVBAR_HEIGHT } from "@/components/navigation";
import Footer from "@/components/Footer";
import { OG_IMAGE } from "@/lib/seo";
import "./globals.css";

/**
 * Closest free matches to the lettering in the brand artwork.
 *
 * If the original design file names the real typefaces, swap them in here -
 * nothing else needs to change, since everything reads the CSS variables.
 */
const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const sans = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

/**
 * TODO: point this at the real domain before launch. Open Graph and Twitter
 * need absolute URLs, and metadataBase is what turns the relative paths below
 * into them.
 */
const SITE_URL = "https://weddingcentral.example";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Wedding Central - Plan & Discover Weddings Across India",
    // Page titles come through as "Contact | Wedding Central".
    template: "%s | Wedding Central",
  },
  description:
    "Plan and discover weddings across India. Destination venues, Mumbai markets, rituals, outfits, real budgets and guest etiquette, for everyone planning a shaadi or attending one.",
  keywords: [
    "Indian weddings",
    "destination wedding India",
    "wedding planning India",
    "shaadi",
    "wedding markets Mumbai",
    "wedding blog India",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Wedding Central",
    url: SITE_URL,
    title: "Wedding Central - Plan & Discover Weddings Across India",
    description:
      "Destination venues, Mumbai markets, rituals, outfits and real budgets, for everyone planning a shaadi or attending one.",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Central - Plan & Discover Weddings Across India",
    description:
      "Destination venues, Mumbai markets, rituals, outfits and real budgets, in one place.",
    images: [OG_IMAGE.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      {/* The fixed `/bg-pattern.jpg` layer is painted by `body::before` in globals.css. */}
      <body>
        {/* Lets the homepage hold the navbar back while the preloader runs. */}
        <ChromeProvider>
          <Navbar />

          {/* The navbar is fixed, so it is out of flow. This reserves the room
              it would have taken, which keeps it off the top of every page. */}
          <div style={{ paddingTop: NAVBAR_HEIGHT }}>{children}</div>

          <Footer />
        </ChromeProvider>
      </body>
    </html>
  );
}
