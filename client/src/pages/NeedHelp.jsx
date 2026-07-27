import React from "react";
import { FaPhoneAlt } from "react-icons/fa";
import { MdEmail, MdChatBubbleOutline } from "react-icons/md";

const contactMethods = [
  {
    icon: FaPhoneAlt,
    title: "Toll-free support",
    body: (
      <>
        Call us anytime: <span className="font-semibold">1800-123-4567</span>
      </>
    ),
  },
  {
    icon: MdEmail,
    title: "Email support",
    body: (
      <>
        Write to us: <span className="font-semibold">support@geopharma.in</span>
      </>
    ),
  },
  {
    icon: MdChatBubbleOutline,
    title: "Live chat",
    body: "Chat with our support team instantly from the icon in the corner of the page.",
  },
];

const faqs = [
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
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h2 className="text-center font-display text-3xl font-semibold text-[var(--color-ink)]">
        Need help? We're here.
      </h2>
      <p className="mt-2 mb-8 text-center text-[var(--color-ink-soft)]">
        Choose whichever way works best for you.
      </p>

      <div className="space-y-4">
        {contactMethods.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="flex items-center gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-sm"
          >
            <Icon className="text-2xl text-[var(--color-leaf)]" />
            <div>
              <h3 className="font-medium text-[var(--color-ink)]">{title}</h3>
              <p className="text-[var(--color-ink-soft)]">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h3 className="mb-4 text-center font-display text-2xl font-semibold text-[var(--color-ink)]">
          Frequently asked questions
        </h3>
        <div className="space-y-3">
          {faqs.map((item) => (
            <div key={item.q} className="rounded-xl border border-[var(--color-line)] bg-white p-4">
              <h4 className="font-medium text-[var(--color-ink)]">{item.q}</h4>
              <p className="mt-1 text-[var(--color-ink-soft)]">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NeedHelp;
