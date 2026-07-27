import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

const helplines = [
  { name: "National Emergency Number", number: "112" },
  { name: "Ambulance", number: "102" },
  { name: "Fire Brigade", number: "101" },
  { name: "Police", number: "100" },
  { name: "Women Helpline", number: "1091" },
  { name: "Disaster Management", number: "108" },
];

const Emergency = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="pad-edge rounded-2xl border-l-8 border-[var(--color-brick)] bg-[var(--color-surface)] p-8 shadow-sm">
        <h2 className="flex items-center gap-2 font-display text-3xl font-semibold text-[var(--color-brick)]">
          <FiAlertTriangle /> Emergency contacts
        </h2>
        <p className="mt-3 mb-6 text-[var(--color-ink-soft)]">
          These helpline numbers are available 24/7. If you're in immediate danger, dial without delay.
        </p>

        <div className="grid gap-3">
          {helplines.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-xl bg-[var(--color-bg)] px-4 py-3"
            >
              <span className="font-medium text-[var(--color-ink)]">{item.name}</span>
              <span className="font-display text-xl font-semibold text-[var(--color-brick)]">{item.number}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Emergency;
