import React from "react";
import { FiAlertTriangle, FiExternalLink, FiMapPin, FiPhoneCall } from "react-icons/fi";
import { useApp } from "../context/AppContext";

const MAIN = { name: "National Emergency Number", number: "112", note: "Police, fire & medical — works across India" };

const HELPLINES = [
  { name: "Ambulance (emergency medical)", number: "108" },
  { name: "Ambulance (patient transport)", number: "102" },
  { name: "Police", number: "100" },
  { name: "Fire Brigade", number: "101" },
  { name: "Women Helpline", number: "1091" },
  { name: "Child Helpline", number: "1098" },
  { name: "Disaster Management (NDMA)", number: "1078" },
  { name: "Tele-MANAS mental health", number: "14416" },
];

const FIRST_AID = [
  {
    title: "Chest pain or pressure",
    steps: ["Call 112 or 108 straight away.", "Sit the person down and keep them calm and still.", "Loosen tight clothing. Don't let them drive themselves."],
  },
  {
    title: "Stroke signs (FAST)",
    steps: ["Face drooping, Arm weakness, Speech difficulty.", "If any of these: Time to call 112 immediately.", "Note when symptoms started and don't give food or drink."],
  },
  {
    title: "Severe bleeding",
    steps: ["Press firmly on the wound with a clean cloth.", "Don't remove soaked cloth — add more on top.", "Raise the injured limb if possible and call for help."],
  },
  {
    title: "Burns",
    steps: ["Cool under cool running water for about 20 minutes.", "Don't use ice, butter or toothpaste.", "Cover loosely with a clean cloth and seek medical care."],
  },
  {
    title: "Choking (adult)",
    steps: ["Ask them to cough. If they can't, give 5 firm back blows.", "Then 5 abdominal thrusts. Repeat until clear.", "If they become unresponsive, call 112 and start CPR."],
  },
];

const mapsUrl = (what, place) =>
  `https://www.google.com/maps/search/${encodeURIComponent(`${what} near ${place || "me"}`)}`;

const Emergency = () => {
  const { location } = useApp();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <section className="fade-up overflow-hidden rounded-[28px] bg-gradient-to-br from-danger to-[#c62828] p-6 text-white shadow-[0_24px_50px_-20px_rgba(239,68,68,0.7)] sm:p-10">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/85">
          <FiAlertTriangle /> Emergency help
        </p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">In danger or need urgent care?</h1>
        <p className="mt-3 max-w-xl text-white/90">These numbers are free and work 24/7. Don't wait — call first.</p>

        <a
          href={`tel:${MAIN.number}`}
          className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-white px-6 py-5 text-danger-dark shadow-lg transition hover:scale-[1.01]"
        >
          <span>
            <span className="block text-sm font-semibold text-ink-soft">{MAIN.name}</span>
            <span className="block text-xs text-ink-soft">{MAIN.note}</span>
          </span>
          <span className="flex items-center gap-3 text-4xl font-extrabold sm:text-5xl">
            <FiPhoneCall className="text-3xl" /> {MAIN.number}
          </span>
        </a>

        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={mapsUrl("hospital", location)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 font-semibold ring-1 ring-white/40 transition hover:bg-white/25"
          >
            <FiMapPin /> Hospitals near {location || "me"} <FiExternalLink className="text-sm" />
          </a>
          <a
            href={mapsUrl("24 hour pharmacy", location)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 font-semibold ring-1 ring-white/40 transition hover:bg-white/25"
          >
            <FiMapPin /> 24-hour pharmacies <FiExternalLink className="text-sm" />
          </a>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Helpline numbers</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {HELPLINES.map((h) => (
            <a
              key={h.name}
              href={`tel:${h.number}`}
              className="card flex items-center justify-between gap-3 px-5 py-4 transition hover:border-danger/50 hover:shadow-lg"
            >
              <span className="font-semibold text-ink">{h.name}</span>
              <span className="flex items-center gap-2 text-xl font-extrabold text-danger-dark">
                <FiPhoneCall className="text-base" /> {h.number}
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-1 text-2xl font-bold">First-aid basics</h2>
        <p className="mb-4 text-sm text-ink-soft">Quick reminders while you wait for help. They don't replace professional care.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {FIRST_AID.map((item) => (
            <article key={item.title} className="card p-5">
              <h3 className="font-sans text-lg font-bold text-ink">{item.title}</h3>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-ink-soft">
                {item.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Emergency;
