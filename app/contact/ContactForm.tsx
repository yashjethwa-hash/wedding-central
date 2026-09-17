"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Web3Forms access key.
 *
 * Get one free at https://web3forms.com - enter the address you want the mail
 * delivered to and the key arrives by email. Put it in `.env.local` as
 * NEXT_PUBLIC_WEB3FORMS_KEY, and set the same variable on the host.
 *
 * NEXT_PUBLIC_ means this value is baked into the client bundle and is public.
 * That is how Web3Forms is designed to work, since the browser posts straight
 * to their endpoint with no backend in between, which is what lets this page
 * work under a static export. The key only lets someone send you mail.
 */
const ACCESS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "YOUR_WEB3FORMS_ACCESS_KEY";

const ENDPOINT = "https://api.web3forms.com/submit";

type Status = "idle" | "sending" | "sent" | "error";

type Fields = { name: string; email: string; phone: string; message: string };

const EMPTY: Fields = { name: "", email: "", phone: "", message: "" };

/**
 * Deliberately permissive: something, an at sign, something, a dot, something,
 * with no whitespace. Anything stricter starts rejecting addresses that are
 * perfectly valid, and the real check is whether the mail arrives.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(fields: Fields) {
  const errors: Partial<Record<keyof Fields, string>> = {};
  if (!fields.name.trim()) errors.name = "Please tell us your name.";
  if (!fields.email.trim()) errors.email = "Please enter your email address.";
  else if (!EMAIL_PATTERN.test(fields.email.trim()))
    errors.email = "That does not look like an email address.";
  if (!fields.message.trim()) errors.message = "Please write a message.";
  return errors;
}

const FIELD_CLASS =
  "w-full rounded-lg border border-white/25 bg-white/10 px-4 py-3 font-body text-sm text-ivory placeholder:text-ivory/40 transition duration-200 hover:border-white/40 focus:border-ivory/70 focus:bg-white/15 focus:shadow-[0_0_0_4px_rgba(254,245,220,0.16)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

const LABEL_CLASS = "block font-body text-sm font-medium text-ivory";

export default function ContactForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState("");
  const reduceMotion = useReducedMotion();

  const sending = status === "sending";

  function update(key: keyof Fields) {
    return (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      setFields((current) => ({ ...current, [key]: event.target.value }));
      // Clear this field's error as soon as the person starts fixing it.
      setErrors((current) => ({ ...current, [key]: undefined }));
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Always prevented: there is no server to post to, so a real navigation
    // would take the page away and lose the message.
    event.preventDefault();

    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("sending");
    setFailure("");

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: "New enquiry from Wedding Central",
          from_name: "Wedding Central",
          name: fields.name,
          email: fields.email,
          phone: fields.phone || "Not given",
          message: fields.message,
        }),
      });

      const result = await response.json().catch(() => null);

      // Web3Forms answers 200 with { success: false } for a bad key, so the
      // status code on its own is not enough to call this sent.
      if (response.ok && result?.success) {
        setStatus("sent");
        setFields(EMPTY);
        return;
      }

      setStatus("error");
      setFailure(
        result?.message ??
          "The message could not be sent. Please try again, or email us directly.",
      );
    } catch {
      setStatus("error");
      setFailure(
        "We could not reach the server. Check your connection and try again.",
      );
    }
  }

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl shadow-black/25 backdrop-blur-xl sm:p-8 md:p-10"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div>
          <label htmlFor="contact-name" className={LABEL_CLASS}>
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            value={fields.name}
            onChange={update("name")}
            disabled={sending}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={`mt-2 ${FIELD_CLASS}`}
          />
          {errors.name && (
            <p id="contact-name-error" className="mt-2 font-body text-sm text-ivory">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-email" className={LABEL_CLASS}>
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={update("email")}
            disabled={sending}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={`mt-2 ${FIELD_CLASS}`}
          />
          {errors.email && (
            <p id="contact-email-error" className="mt-2 font-body text-sm text-ivory">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-phone" className={LABEL_CLASS}>
            Phone <span className="font-light text-ivory/60">(optional)</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={fields.phone}
            onChange={update("phone")}
            disabled={sending}
            className={`mt-2 ${FIELD_CLASS}`}
          />
        </div>

        <div>
          <label htmlFor="contact-message" className={LABEL_CLASS}>
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={6}
            value={fields.message}
            onChange={update("message")}
            disabled={sending}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
            className={`mt-2 resize-y ${FIELD_CLASS}`}
          />
          {errors.message && (
            <p id="contact-message-error" className="mt-2 font-body text-sm text-ivory">
              {errors.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={sending}
          className="mt-1 self-start rounded-lg bg-ivory px-7 py-3 font-body text-sm font-semibold text-maroon transition duration-200 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ivory focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-default disabled:bg-ivory/70"
        >
          {sending ? "Sending..." : "Send message"}
        </button>

        {/* One live region, present from first render, so both outcomes are
            announced rather than appearing as a node nobody is watching. */}
        <div role="status" aria-live="polite" className="min-h-[1.5rem]">
          {status === "sent" && (
            <motion.p
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-white/25 bg-white/15 px-4 py-3 font-body text-sm text-ivory"
            >
              Message sent! We will get back to you shortly.
            </motion.p>
          )}

          {status === "error" && (
            <motion.p
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-white/30 bg-black/35 px-4 py-3 font-body text-sm text-ivory"
            >
              {failure}
            </motion.p>
          )}
        </div>
      </form>
    </motion.div>
  );
}
