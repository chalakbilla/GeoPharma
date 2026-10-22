import React from "react";
import { FiCheckCircle } from "react-icons/fi";
import HeroDecor from "./HeroDecor";

// Shared split layout for Login / Sign up.
const AuthLayout = ({ title, subtitle, children }) => (
  <main className="mx-auto flex min-h-[calc(100vh-200px)] max-w-5xl items-center px-4 py-10 md:px-6">
    <div className="card grid w-full overflow-hidden md:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden bg-gradient-to-br from-[#f6faf4] to-[#e4f2e8] p-10 md:block">
        <HeroDecor />
        <div className="relative z-10 flex h-full flex-col justify-center">
          <img src="/logo.png" alt="GeoPharma" className="h-14 w-14 object-contain" />
          <h2 className="mt-5 text-3xl font-extrabold leading-tight text-ink">
            Your prescriptions,
            <span className="block text-brand">made simple.</span>
          </h2>
          <ul className="mt-6 space-y-3 text-sm font-medium text-brand-dark">
            {["Upload once, understand every medicine", "Daily routine and reminders from your prescription", "Your history saved safely in one place"].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <FiCheckCircle className="mt-0.5 shrink-0 text-lg text-brand" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="p-6 sm:p-10">
        <h1 className="text-3xl font-extrabold text-ink">{title}</h1>
        <p className="mb-6 mt-1 text-ink-soft">{subtitle}</p>
        {children}
      </section>
    </div>
  </main>
);

export default AuthLayout;
