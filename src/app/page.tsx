"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type Category = "Aircon" | "Plumbing" | "Tutoring" | "Electrical" | "Cleaning";
type Filter = "All" | Category;

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
  message: string;
}

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

const EMPTY_FORM: ContactForm = { name: "", email: "", message: "" };

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200";

export default function Page() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);

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

  const closeModal = () => {
    setActiveProvider(null);
    setForm(EMPTY_FORM);
  };

  // Close on Escape and lock background scroll while the modal is open.
  useEffect(() => {
    if (!activeProvider) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveProvider(null);
        setForm(EMPTY_FORM);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeProvider]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({
      provider: activeProvider?.name,
      ...form,
    });
    closeModal();
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-gradient-to-br from-sky-100 via-indigo-100 to-amber-100 text-slate-900">
      {/* Soft background shapes so the glass panels have something to blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 -z-10 h-72 w-72 rounded-full bg-sky-300/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/3 -z-10 h-80 w-80 rounded-full bg-indigo-300/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/4 -z-10 h-72 w-72 rounded-full bg-amber-300/50 blur-3xl"
      />

      <main className="mx-auto w-full max-w-5xl pb-8">
        {/* Header: app name + search */}
        <header className="m-4 rounded-3xl border border-white/60 bg-white/80 p-4 shadow-lg shadow-indigo-900/5 backdrop-blur-md sm:p-6">
          <h1 className="text-2xl font-bold tracking-tight text-indigo-950 sm:text-3xl">
            SerbisyoPH
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Find trusted local services near you.
          </p>

          <div className="relative mt-4">
            <label htmlFor="search" className="sr-only">
              Search services
            </label>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
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
              className={`${inputClass} py-3.5 pl-12`}
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
                    className={`rounded-full border px-5 py-2.5 text-sm font-medium backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${
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
            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 text-center shadow-lg shadow-indigo-900/5 backdrop-blur-md">
              <p className="font-medium text-slate-800">
                No providers match your search.
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Try a different keyword, or choose All to see every category.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProviders.map((provider) => (
                <li key={provider.id}>
                  <article className="flex h-full flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-5 shadow-lg shadow-indigo-900/5 backdrop-blur-md">
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
                      className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
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
            className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-md"
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
                aria-label="Close contact form"
                className="rounded-full p-2 text-slate-500 transition hover:bg-white hover:text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
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

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact-name"
                  className="text-sm font-medium text-slate-700"
                >
                  Your name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  autoFocus
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Juan Dela Cruz"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact-email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="juan@example.com"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact-message"
                  className="text-sm font-medium text-slate-700"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell them what you need and when."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
              >
                Send message
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
