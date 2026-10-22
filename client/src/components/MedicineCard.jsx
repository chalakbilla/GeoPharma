import React, { useState } from "react";
import { FaPills } from "react-icons/fa";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiMessageCircle,
  FiMoon,
  FiRepeat,
  FiSun,
  FiSunrise,
  FiSunset,
} from "react-icons/fi";
import { useApp } from "../context/AppContext";

const SLOTS = [
  { key: "morning", label: "Morning", Icon: FiSunrise },
  { key: "afternoon", label: "Afternoon", Icon: FiSun },
  { key: "evening", label: "Evening", Icon: FiSunset },
  { key: "night", label: "Night", Icon: FiMoon },
];

const CONFIDENCE = {
  high: { label: "Clearly read", cls: "bg-mint text-brand-dark" },
  medium: { label: "Please double-check", cls: "bg-amber-50 text-amber-700" },
  low: { label: "Handwriting unclear", cls: "bg-red-50 text-danger-dark" },
};

const Fact = ({ label, value }) =>
  value ? (
    <div className="rounded-xl bg-[#f5faf7] px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-0.5 text-sm font-semibold capitalize text-ink">{value}</p>
    </div>
  ) : null;

const MedicineCard = ({ med, defaultOpen = false, showAsk = true }) => {
  const { openChat } = useApp();
  const [open, setOpen] = useState(defaultOpen);

  const duration = med.durationText || (med.durationDays ? `${med.durationDays} days` : "");
  const hasSlots = SLOTS.some((s) => med[s.key]);
  const hasDetails = med.sideEffects.length > 0 || med.precautions.length > 0;
  const conf = CONFIDENCE[med.confidence] || CONFIDENCE.medium;
  const food = med.food && med.food !== "not specified" ? med.food : "";

  return (
    <article className="card fade-up flex flex-col p-5">
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mint text-lg text-brand">
          <FaPills />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-sans text-[17px] font-bold leading-snug text-ink">{med.name}</h3>
          {med.genericName && <p className="text-sm text-ink-soft">{med.genericName}</p>}
        </div>
        {(med.strength || med.form) && (
          <span className="shrink-0 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
            {[med.strength, med.form].filter(Boolean).join(" · ")}
          </span>
        )}
      </header>

      {med.purpose && (
        <p className="mt-3 text-sm leading-relaxed text-ink">
          <span className="font-semibold text-brand-dark">Used for: </span>
          {med.purpose}
        </p>
      )}

      {(med.dose || duration || food) && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Fact label="Dose" value={med.dose} />
          <Fact label="Duration" value={duration} />
          <Fact label="Take" value={food} />
        </div>
      )}

      {hasSlots && (
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Daily schedule">
          {SLOTS.map(({ key, label, Icon }) => (
            <span
              key={key}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                med[key] ? "bg-brand text-white" : "bg-[#eef2f0] text-ink-soft/70 line-through decoration-ink-soft/30"
              }`}
            >
              <Icon /> {label}
            </span>
          ))}
        </div>
      )}

      {med.howToTake && (
        <p className="mt-3 flex items-start gap-2 text-sm text-ink-soft">
          <FiClock className="mt-0.5 shrink-0 text-brand" /> {med.howToTake}
        </p>
      )}

      {(med.alternatives.length > 0 || med.approxPrice) && (
        <div className="mt-4 rounded-xl border border-dashed border-brand/30 bg-[#f7fbf9] p-3">
          {med.alternatives.length > 0 && (
            <>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-dark">
                <FiRepeat /> Same-salt alternatives
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {med.alternatives.map((alt) => (
                  <span key={alt} className="rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink">
                    {alt}
                  </span>
                ))}
              </div>
            </>
          )}
          {med.approxPrice && (
            <p className="mt-2 text-xs text-ink-soft">
              Indicative price: <span className="font-semibold text-ink">{med.approxPrice}</span>
              <span className="text-ink-soft"> · actual MRP may vary</span>
            </p>
          )}
        </div>
      )}

      {med.catalog?.name && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft">
          <FiCheckCircle className="text-brand" />
          In catalogue: {med.catalog.name}
          {med.catalog.manufacturer ? ` · ${med.catalog.manufacturer}` : ""}
        </p>
      )}

      {hasDetails && (
        <div className="mt-3 border-t border-line pt-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex w-full items-center justify-between text-sm font-semibold text-brand-dark"
          >
            Side effects &amp; precautions
            <FiChevronDown className={`transition ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="mt-3 grid gap-3 text-sm text-ink">
              {med.sideEffects.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">Common side effects</p>
                  <ul className="list-disc space-y-0.5 pl-5">
                    {med.sideEffects.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {med.precautions.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">Precautions</p>
                  <ul className="list-disc space-y-0.5 pl-5">
                    {med.precautions.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-1">
        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${conf.cls}`}>
          {med.confidence === "low" && <FiAlertTriangle />} {conf.label}
        </span>
        {showAsk && (
          <button
            type="button"
            onClick={() =>
              openChat(`Explain ${med.name}${med.strength ? " " + med.strength : ""}: how should I take it and what should I watch out for?`)
            }
            className="no-print flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
          >
            <FiMessageCircle /> Ask AI
          </button>
        )}
      </footer>
    </article>
  );
};

export default MedicineCard;
