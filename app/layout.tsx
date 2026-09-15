import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wedding Central",
  description: "Everything for the big day, in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/* The fixed `/bg-pattern.jpg` layer is painted by `body::before` in globals.css. */}
      <body>{children}</body>
    </html>
  );
}
