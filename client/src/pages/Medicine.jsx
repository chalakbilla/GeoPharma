import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import api, { errorMessage } from "../lib/api";
import MedicineCard from "../components/MedicineCard";

// Medicine explorer: plain-language details for any medicine from the search box or Offers page.
const Medicine = () => {
  const { name } = useParams();
  const [med, setMed] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setMed(null);
    api
      .get("/drugs/info", { params: { name } })
      .then(({ data }) => !cancelled && setMed(data.medicine))
      .catch((err) => !cancelled && setError(errorMessage(err, "Couldn't load details for this medicine.")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [name]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <Link to="/" className="mb-5 inline-flex items-center gap-2 font-semibold text-brand hover:underline">
        <FiArrowLeft /> Back
      </Link>
      <h1 className="text-3xl font-extrabold sm:text-4xl">{name}</h1>
      <p className="mb-6 mt-1 text-ink-soft">General information about this medicine.</p>

      {loading && (
        <div className="card flex items-center gap-3 p-6 text-ink-soft">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-mint-deep border-t-brand" />
          Looking up details…
        </div>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger-dark">
          {error}
        </p>
      )}
      {med && <MedicineCard med={med} defaultOpen />}

      <p className="mt-6 rounded-2xl bg-white/70 p-4 text-xs leading-relaxed text-ink-soft">
        AI-generated general information, not medical advice. Always take medicines as directed by your doctor and check with your
        pharmacist before combining or switching medicines.
      </p>
    </main>
  );
};

export default Medicine;
