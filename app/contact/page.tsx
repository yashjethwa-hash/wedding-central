import type { Metadata } from "next";
import { OG_IMAGE } from "@/lib/seo";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions about planning a wedding, attending one, or working with us. Send the Wedding Central team a message.",
  openGraph: {
    title: "Contact Wedding Central",
    description:
      "Questions about planning a wedding, attending one, or working with us. Send us a message.",
    images: [OG_IMAGE],
  },
};

export default function ContactPage() {
  return (
    <main className="w-full px-6 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-2xl">
        <header className="text-center">
          <h1 className="font-serif-display text-4xl leading-tight font-medium text-ivory md:text-5xl">
            Get in touch
          </h1>

          <p className="mt-5 font-body text-base leading-relaxed font-light text-ivory/85">
            Planning a shaadi, attending one, or want to work with us. Tell us
            what you need and we will come back to you.
          </p>
        </header>

        <div className="mt-12">
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
