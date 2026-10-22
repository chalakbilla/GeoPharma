import React, { useState } from "react";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowLeft,
  FiBell,
  FiCheck,
  FiEdit2,
  FiFileText,
  FiMessageCircle,
  FiMoon,
  FiPrinter,
  FiSun,
  FiSunrise,
  FiSunset,
  FiX,
} from "react-icons/fi";
import MedicineCard from "./MedicineCard";
import { useApp } from "../context/AppContext";
import { downloadIcs, reminderCount } from "../lib/ics";

const CHECKS = [
  { key: "doctor", label: "Doctor's details" },
  { key: "patient", label: "Patient's details" },
  { key: "medicines", label: "Medicine details" },
  { key: "signature", label: "Doctor's sign + stamp" },
  { key: "date", label: "Visit date" },
];

const SEVERITY = {
  high: { cls: "border-red-200 bg-red-50 text-red-800", label: "High risk" },
  moderate: { cls: "border-amber-200 bg-amber-50 text-amber-800", label: "Moderate" },
  low: { cls: "border-sky-200 bg-sky-50 text-sky-800", label: "Minor" },
};

const SLOTS = [
  { key: "morning", label: "Morning", Icon: FiSunrise },
  { key: "afternoon", label: "Afternoon", Icon: FiSun },
  { key: "evening", label: "Evening", Icon: FiSunset },
  { key: "night", label: "Night", Icon: FiMoon },
];

const Info = ({ label, children }) =>
  children ? (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="text-[15px] font-semibold text-ink">{children}</p>
    </div>
  ) : null;

const RxResults = ({ result, onReset, onReanalyze, reanalyzing }) => {
  const { openChat } = useApp();
  const [showText, setShowText] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(result.extractedText || "");

  const reminders = reminderCount(result.medicines);
  const passed = CHECKS.filter((c) => result.validity[c.key]).length;
  const hasSchedule = result.medicines.some((m) => SLOTS.some((s) => m[s.key]));

  const submitEdit = () => {
    setEditing(false);
    onReanalyze(draft);
  };

  // ---- Not a prescription (e.g. a lab report or unreadable photo)
  if (!result.isPrescription) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="card fade-up p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-2xl text-amber-600">
            <FiAlertCircle />
          </div>
          <h2 className="mt-4 text-2xl font-bold">This doesn't look like a prescription</h2>
          <p className="mx-auto mt-2 max-w-xl text-ink-soft">
            {result.summary || "We couldn't find any prescribed medicines in this file."}
          </p>

          {result.diagnoses.length > 0 && (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {result.diagnoses.map((d) => (
                <span key={d} className="rounded-full bg-mint px-3 py-1 text-sm font-medium text-brand-dark">
                  {d}
                </span>
              ))}
            </div>
          )}

          {result.extractedText && (
            <pre className="mx-auto mt-6 max-h-56 max-w-xl overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-white p-4 text-left text-sm text-ink">
              {result.extractedText}
            </pre>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={onReset} className="btn-primary">
              <FiArrowLeft /> Try another file
            </button>
            <button onClick={() => openChat("I uploaded a document that isn't a prescription. Can you help me understand it?")} className="btn-ghost">
              <FiMessageCircle /> Ask AI
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
      {/* Top bar */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={onReset} className="flex items-center gap-2 font-semibold text-brand hover:underline">
          <FiArrowLeft /> Upload another prescription
        </button>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => window.print()} className="btn-ghost py-2 text-sm">
            <FiPrinter /> Print / Save PDF
          </button>
          <button
            onClick={() => downloadIcs(result.medicines)}
            disabled={reminders === 0}
            title={reminders === 0 ? "No dosing times found to remind you about" : "Download a calendar file with daily reminders"}
            className="btn-ghost py-2 text-sm"
          >
            <FiBell /> Add reminders
          </button>
          <button
            onClick={() => openChat("Explain my prescription in simple words and give me a daily routine.")}
            className="btn-primary py-2 text-sm"
          >
            <FiMessageCircle /> Ask AI about this
          </button>
        </div>
      </div>

      {/* Summary */}
      <section className="card fade-up p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand">Prescription analysis</p>
            <h2 className="mt-1 text-2xl font-bold md:text-3xl">
              {result.medicines.length} {result.medicines.length === 1 ? "medicine" : "medicines"} found
            </h2>
            {result.summary && <p className="mt-2 max-w-2xl text-ink-soft">{result.summary}</p>}
          </div>
          <span
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              passed === CHECKS.length ? "bg-mint text-brand-dark" : "bg-amber-50 text-amber-700"
            }`}
          >
            {passed === CHECKS.length ? <FiCheck /> : <FiAlertTriangle />}
            {passed === CHECKS.length ? "All details present" : `${CHECKS.length - passed} detail(s) missing`}
          </span>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1fr_1.1fr]">
          <div className="space-y-3">
            <Info label="Patient">
              {[result.patient.name, result.patient.age, result.patient.gender].filter(Boolean).join(" · ")}
            </Info>
            <Info label="Visit date">{result.date}</Info>
          </div>
          <div className="space-y-3">
            <Info label="Doctor">{[result.doctor.name, result.doctor.qualification].filter(Boolean).join(", ")}</Info>
            <Info label="Clinic / hospital">{result.doctor.clinic}</Info>
            <Info label="Registration no.">{result.doctor.registrationNo}</Info>
          </div>
          <ul className="space-y-2 rounded-2xl bg-[#f5faf7] p-4">
            {CHECKS.map((c) => {
              const ok = result.validity[c.key];
              return (
                <li key={c.key} className="flex items-center gap-2.5 text-sm font-medium">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-xs text-white ${ok ? "bg-brand" : "bg-danger"}`}
                  >
                    {ok ? <FiCheck /> : <FiX />}
                  </span>
                  <span className={ok ? "text-ink" : "text-danger-dark"}>{c.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {result.diagnoses.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink-soft">Conditions mentioned:</span>
            {result.diagnoses.map((d) => (
              <span key={d} className="rounded-full bg-mint px-3 py-1 text-sm font-medium text-brand-dark">
                {d}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Safety notes */}
      {(result.interactions.length > 0 || result.warnings.length > 0) && (
        <section className="fade-up mt-6 space-y-3">
          {result.interactions.map((it, i) => {
            const sev = SEVERITY[it.severity] || SEVERITY.moderate;
            return (
              <div key={`i-${i}`} className={`flex gap-3 rounded-2xl border p-4 ${sev.cls}`}>
                <FiAlertTriangle className="mt-0.5 shrink-0 text-lg" />
                <div className="text-sm">
                  <p className="font-semibold">
                    Possible interaction ({sev.label}){it.medicines.length > 0 && `: ${it.medicines.join(" + ")}`}
                  </p>
                  <p className="mt-0.5">{it.note}</p>
                  <p className="mt-1 text-xs opacity-80">Don't stop any medicine on your own — check with your doctor or pharmacist.</p>
                </div>
              </div>
            );
          })}
          {result.warnings.map((w, i) => (
            <div key={`w-${i}`} className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <FiAlertCircle className="mt-0.5 shrink-0 text-lg" />
              <p>{w}</p>
            </div>
          ))}
        </section>
      )}

      {/* Medicines */}
      <section className="mt-8">
        <h3 className="mb-4 text-2xl font-bold">Your medicines</h3>
        {result.medicines.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {result.medicines.map((m, i) => (
              <MedicineCard key={`${m.name}-${i}`} med={m} />
            ))}
          </div>
        ) : (
          <div className="card p-6 text-ink-soft">
            No medicines were listed. If this is wrong, edit the extracted text below and re-analyze.
          </div>
        )}
      </section>

      {/* Daily schedule */}
      {hasSchedule && (
        <section className="mt-8">
          <h3 className="mb-4 text-2xl font-bold">Your daily routine</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SLOTS.map(({ key, label, Icon }) => {
              const meds = result.medicines.filter((m) => m[key]);
              return (
                <div key={key} className="card p-4">
                  <p className="flex items-center gap-2 font-semibold text-brand-dark">
                    <Icon /> {label}
                  </p>
                  {meds.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {meds.map((m, i) => (
                        <li key={`${m.name}-${i}`} className="rounded-lg bg-[#f5faf7] px-3 py-2 text-sm">
                          <p className="font-semibold text-ink">{m.name}</p>
                          {m.food && m.food !== "not specified" && <p className="text-xs capitalize text-ink-soft">{m.food}</p>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-ink-soft">Nothing scheduled</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Extracted text */}
      <section className="no-print mt-8">
        <button
          onClick={() => setShowText((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
        >
          <FiFileText /> {showText ? "Hide" : "Show"} text we read from your prescription
        </button>
        {showText && (
          <div className="card mt-3 p-5">
            {editing ? (
              <>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="input h-44 resize-y"
                  aria-label="Edit extracted text"
                />
                <div className="mt-3 flex gap-2">
                  <button onClick={submitEdit} disabled={reanalyzing || !draft.trim()} className="btn-primary py-2 text-sm">
                    {reanalyzing ? "Re-analyzing…" : "Re-analyze"}
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-ghost py-2 text-sm">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <pre className="max-h-60 overflow-auto whitespace-pre-wrap text-sm text-ink">
                  {result.extractedText || "No text extracted."}
                </pre>
                <button
                  onClick={() => {
                    setDraft(result.extractedText || "");
                    setEditing(true);
                  }}
                  className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
                >
                  <FiEdit2 /> Something wrong? Edit and re-analyze
                </button>
              </>
            )}
          </div>
        )}
      </section>

      <p className="mt-8 rounded-2xl bg-white/70 p-4 text-xs leading-relaxed text-ink-soft">
        This summary is generated by AI from your uploaded prescription and can contain mistakes. Medicines are dispensed exactly as
        prescribed. Alternatives and prices are indicative only. Never change or stop a medicine without
        asking your doctor.
      </p>
    </div>
  );
};

export default RxResults;
