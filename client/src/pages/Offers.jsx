import React from "react";

const medicines = [
  { name: "Paracetamol", originalPrice: 50, discountPrice: 40 },
  { name: "Aspirin", originalPrice: 30, discountPrice: 24 },
  { name: "Ibuprofen", originalPrice: 60, discountPrice: 48 },
  { name: "Amoxicillin", originalPrice: 120, discountPrice: 100 },
  { name: "Cetirizine", originalPrice: 20, discountPrice: 16 },
  { name: "Loratadine", originalPrice: 25, discountPrice: 20 },
  { name: "Metformin", originalPrice: 80, discountPrice: 64 },
  { name: "Omeprazole", originalPrice: 100, discountPrice: 80 },
  { name: "Losartan", originalPrice: 150, discountPrice: 120 },
  { name: "Simvastatin", originalPrice: 200, discountPrice: 160 },
  { name: "Levothyroxine", originalPrice: 220, discountPrice: 176 },
  { name: "Atorvastatin", originalPrice: 150, discountPrice: 120 },
  { name: "Gabapentin", originalPrice: 50, discountPrice: 40 },
  { name: "Duloxetine", originalPrice: 90, discountPrice: 72 },
  { name: "Pantoprazole", originalPrice: 55, discountPrice: 44 },
  { name: "Ciprofloxacin", originalPrice: 70, discountPrice: 56 },
];

const Offers = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="text-center font-display text-3xl font-semibold text-[var(--color-ink)]">
        Latest medicine offers
      </h2>
      <p className="mt-2 mb-10 text-center text-[var(--color-ink-soft)]">
        Everyday discounts on the medicines people order most.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {medicines.map((medicine) => {
          const discountPercentage = Math.round(
            ((medicine.originalPrice - medicine.discountPrice) / medicine.originalPrice) * 100
          );

          return (
            <div
              key={medicine.name}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="font-display text-lg font-semibold text-[var(--color-ink)]">{medicine.name}</h3>
              <p className="mt-2 text-sm text-[var(--color-ink-soft)] line-through">
                ₹{medicine.originalPrice}
              </p>
              <p className="text-xl font-semibold text-[var(--color-clay-dark)]">₹{medicine.discountPrice}</p>
              <p className="mt-1 text-sm text-[var(--color-leaf)]">Save {discountPercentage}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Offers;
