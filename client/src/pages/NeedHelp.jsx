import React from "react";
import { FiChevronDown, FiMail, FiMessageCircle, FiPhone } from "react-icons/fi";
import { useApp } from "../context/AppContext";

const FAQS = [
  {
    q: "How does the prescription reader work?",
    a: "Upload a clear photo, scan or PDF of your prescription. Our AI reads the doctor, patient and medicine details and explains each medicine in plain language. You can edit the text it read and re-run the analysis.",
  },
  {
    q: "Is my prescription stored?",
    a: "If you're not logged in, nothing is saved. If you're logged in, your analysis is saved to your account under My Rx so you can open it again, and you can delete it any time.",
  },
  {
    q: "Which files can I upload?",
    a: "JPG, PNG, WEBP or PDF up to 4MB. Photos from your phone are compressed automatically before upload.",
  },
  {
    q: "How do I reset my password?",
    a: "Click 'Forgot password?' on the login page and follow the steps we send to your email.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Major credit and debit cards, UPI, and net banking.",
  },
  {
    q: "Where can I track my order?",
    a: "Use the tracking link in the confirmation email we send once your order ships.",
  },
];

const NeedHelp = () => {
  const { openChat } = useApp();

  const contacts = [
    { Icon: FiPhone, title: "Toll-free support", body: "1800-123-4567", href: "tel:18001234567", hint: "Call us anytime" },
    { Icon: FiMail, title: "Email support", body: "support@geopharma.in", href: "mailto:support@geopharma.in", hint: "We reply within a day" },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Need help? We're here.</h1>
        <p className="mt-3 text-lg text-ink-soft">Choose whichever way works best for you.</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {contacts.map(({ Icon, title, body, href, hint }) => (
          <a key={title} href={href} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-xl">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint text-xl text-brand">
              <Icon />
            </span>
            <h2 className="mt-4 font-sans text-lg font-bold">{title}</h2>
            <p className="font-semibold text-brand">{body}</p>
            <p className="text-sm text-ink-soft">{hint}</p>
          </a>
        ))}
        <button onClick={() => openChat()} className="card p-5 text-left transition hover:-translate-y-0.5 hover:shadow-xl">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-xl text-white">
            <FiMessageCircle />
          </span>
          <h2 className="mt-4 font-sans text-lg font-bold">Chat with AI assistant</h2>
          <p className="font-semibold text-brand">Instant answers</p>
          <p className="text-sm text-ink-soft">Medicines, prescriptions, how-tos</p>
        </button>
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-center text-3xl font-bold">Frequently asked questions</h2>
        <div className="space-y-3">
          {FAQS.map((item) => (
            <details key={item.q} className="card group px-5 py-4 open:shadow-lg">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <FiChevronDown className="shrink-0 text-brand transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
};

export default NeedHelp;
