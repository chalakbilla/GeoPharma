import React, { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FiClock, FiTrash2, FiUploadCloud } from "react-icons/fi";
import api, { errorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

const fmt = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const History = () => {
  const { user } = useAuth();
  const { setResult } = useApp();
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/prescriptions");
      setItems(data.items || []);
    } catch (err) {
      setError(errorMessage(err, "Couldn't load your prescriptions"));
      setItems([]);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (!user) return <Navigate to="/login" state={{ from: "/prescriptions" }} replace />;

  const open = async (id) => {
    setBusyId(id);
    setError(null);
    try {
      const { data } = await api.get(`/prescriptions/${id}`);
      setResult(data);
      navigate("/");
    } catch (err) {
      setError(errorMessage(err, "Couldn't open that prescription"));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this prescription from your account?")) return;
    setBusyId(id);
    try {
      await api.delete(`/prescriptions/${id}`);
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(errorMessage(err, "Couldn't delete that prescription"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">My prescriptions</h1>
          <p className="mt-1 text-ink-soft">Every prescription you've analyzed while logged in.</p>
        </div>
        <Link to="/" className="btn-primary">
          <FiUploadCloud /> Upload new
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-danger-dark">
          {error}
        </p>
      )}

      {items === null && <p className="mt-10 text-center text-ink-soft">Loading…</p>}

      {items && items.length === 0 && !error && (
        <div className="card mt-8 p-10 text-center">
          <p className="text-lg font-semibold">No saved prescriptions yet</p>
          <p className="mt-1 text-ink-soft">Upload a prescription while logged in and it will show up here.</p>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {(items || []).map((p) => (
          <article key={p.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm text-ink-soft">
                <FiClock /> {fmt(p.createdAt)}
                {p.date && <span>· Visit {p.date}</span>}
              </p>
              <h2 className="mt-1 font-sans text-lg font-bold">
                {p.isPrescription
                  ? `${p.medicineCount} ${p.medicineCount === 1 ? "medicine" : "medicines"}${p.doctor ? ` · ${p.doctor}` : ""}`
                  : "Not a prescription"}
              </h2>
              {p.patient && <p className="text-sm text-ink-soft">Patient: {p.patient}</p>}
              {p.medicines.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.medicines.map((m) => (
                    <span key={m} className="rounded-full bg-mint px-2.5 py-1 text-xs font-medium text-brand-dark">
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => open(p.id)} disabled={busyId === p.id} className="btn-primary py-2 text-sm">
                {busyId === p.id ? "Opening…" : "View"}
              </button>
              <button
                onClick={() => remove(p.id)}
                disabled={busyId === p.id}
                aria-label="Delete prescription"
                className="btn-ghost px-3 py-2 text-danger-dark"
              >
                <FiTrash2 />
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
};

export default History;
