import React, { useMemo, useState } from "react";
import { FaPills } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const MEDICINES = [
  { name: "Paracetamol", category: "Pain & Fever", originalPrice: 50, discountPrice: 40 },
  { name: "Aspirin", category: "Pain & Fever", originalPrice: 30, discountPrice: 24 },
  { name: "Ibuprofen", category: "Pain & Fever", originalPrice: 60, discountPrice: 48 },
  { name: "Gabapentin", category: "Pain & Fever", originalPrice: 50, discountPrice: 40 },
  { name: "Duloxetine", category: "Pain & Fever", originalPrice: 90, discountPrice: 72 },
  { name: "Amoxicillin", category: "Antibiotics", originalPrice: 120, discountPrice: 100 },
  { name: "Ciprofloxacin", category: "Antibiotics", originalPrice: 70, discountPrice: 56 },
  { name: "Cetirizine", category: "Allergy", originalPrice: 20, discountPrice: 16 },
  { name: "Loratadine", category: "Allergy", originalPrice: 25, discountPrice: 20 },
  { name: "Metformin", category: "Diabetes & Thyroid", originalPrice: 80, discountPrice: 64 },
  { name: "Levothyroxine", category: "Diabetes & Thyroid", originalPrice: 220, discountPrice: 176 },
  { name: "Losartan", category: "Heart & BP", originalPrice: 150, discountPrice: 120 },
  { name: "Simvastatin", category: "Heart & BP", originalPrice: 200, discountPrice: 160 },
  { name: "Atorvastatin", category: "Heart & BP", originalPrice: 150, discountPrice: 120 },
  { name: "Omeprazole", category: "Stomach", originalPrice: 100, discountPrice: 80 },
  { name: "Pantoprazole", category: "Stomach", originalPrice: 55, discountPrice: 44 },
];

const CATEGORIES = ["All", ...Array.from(new Set(MEDICINES.map((m) => m.category)))];
const pct = (m) => Math.round(((m.originalPrice - m.discountPrice) / m.originalPrice) * 100);

const Offers = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");
  const [term, setTerm] = useState("");

  const items = useMemo(
    () =>
      MEDICINES.filter(
        (m) =>
          (category === "All" || m.category === category) &&
          m.name.toLowerCase().includes(term.trim().toLowerCase())
      ),
    [category, term]
  );
  const best = Math.max(...MEDICINES.map(pct));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <section className="fade-up relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand to-brand-light p-8 text-white shadow-[0_24px_50px_-20px_rgba(14,107,76,0.7)] sm:p-12">
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10" aria-hidden="true" />
        <p className="text-sm font-semibold uppercase tracking-wider text-white/80">Latest medicine offers</p>
        <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">Save up to {best}% on everyday medicines</h1>
        <p className="mt-3 max-w-xl text-white/90">Discounts on the medicines people order most. Prices shown per pack.</p>
      </section>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                category === c ? "bg-brand text-white shadow" : "border border-line bg-white text-ink hover:border-brand-light"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 md:w-64">
          <FiSearch className="text-ink-soft" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Filter offers…"
            aria-label="Filter offers"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-center text-ink-soft">No offers match your filter.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <button
              key={m.name}
              onClick={() => navigate(`/medicine/${encodeURIComponent(m.name)}`)}
              className="card group relative p-5 text-left transition hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="absolute right-4 top-4 rounded-full bg-danger px-2.5 py-1 text-xs font-bold text-white">
                {pct(m)}% OFF
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint text-xl text-brand transition group-hover:bg-brand group-hover:text-white">
                <FaPills />
              </div>
              <h3 className="mt-4 font-sans text-lg font-bold text-ink">{m.name}</h3>
              <p className="text-sm text-ink-soft">{m.category}</p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-brand">₹{m.discountPrice}</span>
                <span className="text-sm text-ink-soft line-through">₹{m.originalPrice}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-brand-light">You save ₹{m.originalPrice - m.discountPrice}</p>
            </button>
          ))}
        </div>
      )}
    </main>
  );
};

export default Offers;
