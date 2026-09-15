import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";

/**
 * Closest free matches to the lettering in the brand artwork.
 *
 * The preloader words are PNGs, so these faces are for the rest of the site.
 * If the original design file names the real typefaces, swap them in here —
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
  weight: ["200", "300", "400"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wedding Central",
  description: "Everything for the big day, in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      {/* The fixed `/bg-pattern.jpg` layer is painted by `body::before` in globals.css. */}
      <body>{children}</body>
    </html>
  );
}
