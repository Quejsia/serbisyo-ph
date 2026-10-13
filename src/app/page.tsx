"use client";

import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

// Set to false once contact requests are really saved (Supabase step).
// While true, the page tells visitors honestly that nothing is delivered.
const DEMO_MODE = true;

type Category = "Aircon" | "Plumbing" | "Tutoring" | "Electrical" | "Cleaning";
type Filter = "All" | Category;
type Status = "idle" | "sending" | "sent" | "error";

interface Provider {
  id: number;
  name: string;
  category: Category;
  location: string;
  description: string;
}

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

type FormErrors = Partial<Record<keyof ContactForm | "contact", string>>;

const FILTERS: Filter[] = [
  "All",
  "Aircon",
  "Plumbing",
  "Tutoring",
  "Electrical",
  "Cleaning",
];

const PROVIDERS: Provider[] = [
  {
    id: 1,
    name: "CoolBreeze Aircon Services",
    category: "Aircon",
    location: "Quezon City",
    description:
      "Installation, repair, and regular cleaning for split-type and window aircon units.",
  },
  {
    id: 2,
    name: "Kuya Ben Plumbing",
    category: "Plumbing",
    location: "Cebu City",
    description:
      "Leaking pipes, clogged drains, and water heater fixes. Same-day visits available.",
  },
  {
    id: 3,
    name: "Maricel's Math & Science Tutoring",
    category: "Tutoring",
    location: "Davao City",
    description:
      "One-on-one lessons for grade school and high school, in person or online.",
  },
  {
    id: 4,
    name: "Voltline Electrical",
    category: "Electrical",
    location: "Makati City",
    description:
      "Licensed electricians for rewiring, outlet and breaker repairs, and safety checks.",
  },
  {
    id: 5,
    name: "Sparkle Home Cleaning",
    category: "Cleaning",
    location: "Iloilo City",
    description:
      "Deep cleaning for apartments and houses, including move-in and move-out cleaning.",
  },
  {
    id: 6,
    name: "Arctic Pro Aircon Cleaning",
    category: "Aircon",
    location: "Cagayan de Oro",
    description:
      "Chemical wash and freon refill for home and small office aircon units.",
  },
];

// Full class strings so Tailwind can detect them.
const CATEGORY_STYLES: Record<Category, string> = {
  Aircon: "bg-sky-100 text-sky-800",
  Plumbing: "bg-blue-100 text-blue-800",
  Tutoring: "bg-violet-100 text-violet-800",
  Electrical: "bg-amber-100 text-amber-800",
  Cleaning: "bg-emerald-100 text-emerald-800",
};

const EMPTY_FORM: ContactForm = { name: "", email: "", phone: "", message: "" };

const baseInput =
  "w-full rounded-xl border bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm outline-none transition focus:ring-4";

function inputClass(hasError: boolean) {
  return `${baseInput} ${
    hasError
      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
      : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"
  }`;
}

function validate(form: ContactForm): FormErrors {
  const errors: FormErrors = {};
  if (form.name.trim() === "") {
    errors.name = "Please enter your name.";
  }
  const email = form.email.trim();
  const phone = form.phone.trim();
  if (email === "" && phone === "") {
    errors.contact = "Add an email or a mobile number so they can reply.";
  } else {
    if (email !== "" && !/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Enter a valid email, like juan@example.com.";
    }
    if (phone !== "" && phone.replace(/\D/g, "").length < 10) {
      errors.phone = "Enter a valid mobile number, like 0917 123 4567.";
    }
  }
  if (form.message.trim().length < 10) {
    errors.message = "Please write a short message (at least 10 characters).";
  }
  return errors;
}

// Swap the body of this function for a Supabase insert later.
// It should throw if saving fails so the form can show the error state.
async function submitContact(provider: Provider, data: ContactForm) {
  console.log({ provider: provider.name, ...data });
  await new Promise((resolve) => setTimeout(resolve, 600));
}

function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
        {optional && (
          <span className="font-normal text-slate-500"> (optional)</span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Page() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  const filteredProviders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROVIDERS.filter((p) => {
      const matchesCategory = filter === "All" || p.category === filter;
      const matchesQuery =
        q === "" ||
        [p.name, p.category, p.location, p.description].some((field) =>
          field.toLowerCase().includes(q)
        );
      return matchesCategory && matchesQuery;
    });
  }, [query, filter]);

  const clearFilters = () => {
    setQuery("");
    setFilter("All");
  };

  const closeModal = useCallback(() => {
    // Don't let people lose their message while it is being sent.
    if (status === "sending") return;
    setActiveProvider(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setStatus("idle");
  }, [status]);

  // Close on Escape and lock background scroll while the modal is open.
  useEffect(() => {
    if (!activeProvider) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeProvider, closeModal]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
      contact: name === "email" || name === "phone" ? undefined : prev.contact,
    }));
    if (status === "error") setStatus("idle");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeProvider || status === "sending") return;

    const found = validate(form);
    setErrors(found);
    const firstInvalid = (Object.keys(found) as (keyof FormErrors)[])[0];
    if (firstInvalid) {
      const targetId =
        firstInvalid === "contact" ? "contact-email" : `contact-${firstInvalid}`;
      document.getElementById(targetId)?.focus();
      return;
    }

    setStatus("sending");
    try {
      await submitContact(activeProvider, form);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-gradient-to-br from-sky-100 via-indigo-100 to-amber-100 text-slate-900">
      {/* Soft background shapes so the glass panels have something to blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute hidden md:block -left-24 -top-24 -z-10 h-72 w-72 rounded-full bg-sky-300/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute hidden md:block -right-24 top-1/3 -z-10 h-80 w-80 rounded-full bg-indigo-300/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute hidden md:block -bottom-24 left-1/4 -z-10 h-72 w-72 rounded-full bg-amber-300/50 blur-3xl"
      />

      <main className="mx-auto w-full max-w-5xl pb-8">
        {DEMO_MODE && (
          <p
            role="note"
            className="m-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-relaxed text-amber-900 backdrop-blur-md"
          >
            <span className="font-semibold">Demo preview.</span> These are
            sample listings, not real businesses, and messages are not sent yet.
          </p>
        )}

        {/* Header: app name + search */}
        <header className="m-4 rounded-3xl border border-white/60 bg-white/80 p-4 shadow-lg shadow-indigo-900/5 backdrop-blur-md sm:p-6">
          <h1 className="text-2xl font-bold tracking-tight text-indigo-950 sm:text-3xl">
            SerbisyoPH
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Find local services near you.
          </p>

          <div className="relative mt-4">
            <label htmlFor="search" className="sr-only">
              Search services
            </label>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
            >
              <path
                fillRule="evenodd"
                d="M9 3a6 6 0 104.47 10.03l3.25 3.25a1 1 0 001.42-1.42l-3.25-3.25A6 6 0 009 3zM5 9a4 4 0 118 0 4 4 0 01-8 0z"
                clipRule="evenodd"
              />
            </svg>
            <input
              id="search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, service, or city"
              className={`${inputClass(false)} py-3.5 pl-12`}
            />
          </div>
        </header>

        {/* Category filters */}
        <nav aria-label="Service categories">
          <ul className="flex gap-4 overflow-x-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((item) => {
              const isActive = filter === item;
              return (
                <li key={item} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setFilter(item)}
                    aria-pressed={isActive}
                    className={`rounded-full border px-5 py-3 text-sm font-medium transition active:scale-[0.98] md:backdrop-blur-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${
                      isActive
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "border-white/60 bg-white/80 text-slate-700 hover:bg-white"
                    }`}
                  >
                    {item}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Provider list */}
        <section aria-label="Service providers" className="p-4">
          <p className="mb-4 text-sm text-slate-600" aria-live="polite">
            {filteredProviders.length}{" "}
            {filteredProviders.length === 1 ? "provider" : "providers"} found
          </p>

          {filteredProviders.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/60 bg-white/80 p-6 text-center shadow-lg shadow-indigo-900/5 backdrop-blur-md">
              <div>
                <p className="font-medium text-slate-800">
                  No providers match your search.
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Try a different keyword, or clear your filters to see
                  everything.
                </p>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
              >
                Clear search and filters
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProviders.map((provider) => (
                <li key={provider.id}>
                  <article className="flex h-full flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-5 shadow-lg shadow-indigo-900/5 md:backdrop-blur-md">
                    <div className="flex flex-col gap-2">
                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_STYLES[provider.category]}`}
                      >
                        {provider.category}
                      </span>
                      <h2 className="text-lg font-semibold leading-snug text-slate-900">
                        {provider.name}
                      </h2>
                      <p className="flex items-center gap-2 text-sm text-slate-600">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4 shrink-0 text-indigo-500"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18s6-5.37 6-10a6 6 0 10-12 0c0 4.63 6 10 6 10zm0-7.5A2.5 2.5 0 1010 5.5a2.5 2.5 0 000 5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {provider.location}
                      </p>
                    </div>

                    <p className="flex-1 text-sm leading-relaxed text-slate-700">
                      {provider.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => setActiveProvider(provider)}
                      className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
                    >
                      Contact
                    </button>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* Contact modal */}
      {activeProvider && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="contact-title"
                  className="text-xl font-bold text-indigo-950"
                >
                  Contact {activeProvider.name}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {activeProvider.category} · {activeProvider.location}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={status === "sending"}
                aria-label="Close contact form"
                className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition active:scale-95 hover:bg-white hover:text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 disabled:opacity-40"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            {status === "sent" ? (
              <div
                role="status"
                className="mt-6 flex flex-col items-center gap-4 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-7 w-7"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {DEMO_MODE ? "Demo only: nothing was sent" : "Message sent"}
                </h3>
                <p className="text-sm leading-relaxed text-slate-700">
                  {DEMO_MODE
                    ? "This is a sample listing, so your message was not delivered to anyone."
                    : `${activeProvider.name} will reply to ${form.email.trim() || form.phone.trim()}.`}
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="mt-4 flex flex-col gap-4"
              >
                <Field id="contact-name" label="Your name" error={errors.name}>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoFocus
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Juan Dela Cruz"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={
                      errors.name ? "contact-name-error" : undefined
                    }
                    className={inputClass(Boolean(errors.name))}
                  />
                </Field>

                <div
                  role="group"
                  aria-labelledby="reach-label"
                  className="flex flex-col gap-4"
                >
                  <p id="reach-label" className="text-sm text-slate-600">
                    How can they reach you? Add an email, a mobile number, or
                    both.
                  </p>

                  <Field id="contact-email" label="Email" error={errors.email}>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="juan@example.com"
                      aria-invalid={Boolean(errors.email || errors.contact)}
                      aria-describedby={
                        errors.email
                          ? "contact-email-error"
                          : errors.contact
                            ? "contact-error"
                            : undefined
                      }
                      className={inputClass(
                        Boolean(errors.email || errors.contact)
                      )}
                    />
                  </Field>

                  <Field
                    id="contact-phone"
                    label="Mobile number"
                    error={errors.phone}
                  >
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="0917 123 4567"
                      aria-invalid={Boolean(errors.phone || errors.contact)}
                      aria-describedby={
                        errors.phone
                          ? "contact-phone-error"
                          : errors.contact
                            ? "contact-error"
                            : undefined
                      }
                      className={inputClass(
                        Boolean(errors.phone || errors.contact)
                      )}
                    />
                  </Field>

                  {errors.contact && (
                    <p
                      id="contact-error"
                      role="alert"
                      className="text-sm text-rose-600"
                    >
                      {errors.contact}
                    </p>
                  )}
                </div>

                <Field
                  id="contact-message"
                  label="Message"
                  error={errors.message}
                >
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell them what you need and when."
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={
                      errors.message ? "contact-message-error" : undefined
                    }
                    className={`${inputClass(Boolean(errors.message))} resize-none`}
                  />
                </Field>

                {status === "error" && (
                  <p
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm leading-relaxed text-rose-800"
                  >
                    We couldn&apos;t send your message. Check your connection
                    and try again. Everything you typed is still here.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "sending" && (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4 animate-spin"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="opacity-25"
                      />
                      <path
                        d="M21 12a9 9 0 00-9-9"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                  {status === "sending"
                    ? "Sending..."
                    : status === "error"
                      ? "Try again"
                      : "Send message"}
                </button>

                <p className="text-xs leading-relaxed text-slate-600">
                  Your details are shared only with {activeProvider.name}, so
                  they can reply to you.
                  {DEMO_MODE && " Demo mode: messages are not sent yet."}
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
