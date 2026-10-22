import React, { useEffect, useRef, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { FiCamera, FiFileText, FiGift, FiLock, FiShield, FiUploadCloud, FiX, FiZap } from "react-icons/fi";
import api, { errorMessage } from "../lib/api";
import { compressImage } from "../lib/image";
import { useApp } from "../context/AppContext";
import HeroDecor from "../components/HeroDecor";
import ValidGuide from "../components/ValidGuide";
import RxResults from "../components/RxResults";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // photos are compressed before upload
const MAX_PDF_BYTES = 4 * 1024 * 1024; // PDFs are sent as-is (Vercel body limit ~4.5MB)

const STEPS = [
  "Reading your prescription…",
  "Identifying medicines and doses…",
  "Checking for interactions…",
  "Preparing your summary…",
];

const TRUST = [
  { Icon: FiShield, title: "Accurate", sub: "AI powered" },
  { Icon: FiLock, title: "Private", sub: "Your data is safe" },
  { Icon: FiZap, title: "Fast", sub: "Results in seconds" },
  { Icon: FiGift, title: "Free", sub: "No sign up needed" },
];

const CHECKLIST = [
  "Don't crop out any part of the image",
  "Avoid blurred photos",
  "Include doctor and patient details plus the visit date",
  "Medicines will be dispensed exactly as prescribed",
];

const Sparkle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M10 2l1.9 5.6L17.5 9.5l-5.6 1.9L10 17l-1.9-5.6L2.5 9.5l5.6-1.9L10 2zM18 12l1 2.9 2.9 1-2.9 1-1 2.9-1-2.9-2.9-1 2.9-1 1-2.9z" />
  </svg>
);

const PrescriptionUpload = () => {
  const { result, setResult } = useApp();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  // preview thumbnail for image files
  useEffect(() => {
    if (!file || !file.type.startsWith("image/") || file.type === "image/heic" || file.type === "image/heif") {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // rotate the progress message while the AI works
  useEffect(() => {
    if (!loading) {
      setStep(0);
      return undefined;
    }
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 2600);
    return () => clearInterval(t);
  }, [loading]);

  const pickFile = (picked) => {
    if (!picked) return;
    setError(null);
    const isPdf = picked.type === "application/pdf";
    const isImage = picked.type.startsWith("image/");
    if (!isPdf && !isImage) {
      setError("Please upload a JPG, PNG or PDF file.");
      return;
    }
    if (isPdf && picked.size > MAX_PDF_BYTES) {
      setError("That PDF is larger than 4MB. Try a smaller PDF or upload a photo instead.");
      return;
    }
    if (isImage && picked.size > MAX_IMAGE_BYTES) {
      setError("That image is too large. Please choose one under 15MB.");
      return;
    }
    setFile(picked);
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  const analyze = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError(null);
    try {
      const upload = await compressImage(file);
      if (upload.size > 4 * 1024 * 1024) {
        throw new Error("This file is still over 4MB after compression. Please use a smaller photo.");
      }
      const form = new FormData();
      form.append("file", upload);
      const { data } = await api.post("/ocr", form);
      setResult(data);
      setFile(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.isAxiosError ? errorMessage(err) : err.message || errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const reanalyze = async (text) => {
    setReanalyzing(true);
    setError(null);
    try {
      const { data } = await api.post("/ocr", { text });
      setResult(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setReanalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
    clearFile();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (result) {
    return (
      <>
        {error && (
          <div role="alert" className="mx-auto mt-4 max-w-[1200px] px-4 md:px-6">
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger-dark">{error}</p>
          </div>
        )}
        <RxResults result={result} onReset={reset} onReanalyze={reanalyze} reanalyzing={reanalyzing} />
      </>
    );
  }

  return (
    <main className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 md:px-6 lg:grid-cols-2 lg:py-8">
      {/* ---------- Upload card ---------- */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#fdfdfb] via-[#f7faf5] to-[#eef6ee] shadow-[0_20px_50px_-20px_rgba(14,107,76,0.35)] ring-1 ring-line">
        <HeroDecor />

        <div className="relative z-10 px-6 pb-8 pt-8 sm:px-12 lg:px-16">
          <div className="flex justify-center">
            <span className="flex items-center gap-2 rounded-full bg-[#e3f2e9] px-4 py-2 text-sm font-semibold text-brand-dark">
              <Sparkle /> AI Powered Prescription Reader
            </span>
          </div>

          <h1 className="mt-5 text-center text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            <span className="block text-ink">Upload Your</span>
            <span className="block text-brand">Prescription</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-center text-lg leading-relaxed text-ink-soft">
            We'll read your prescription and show you medicines, prices and alternatives.
          </p>

          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => !file && fileRef.current?.click()}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !file) {
                e.preventDefault();
                fileRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              pickFile(e.dataTransfer.files?.[0]);
            }}
            className={`relative mx-auto mt-8 flex min-h-[190px] max-w-xl flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed px-6 py-8 text-center transition ${
              dragging ? "border-brand bg-mint" : "border-[#b9c9c0] bg-white/75 hover:border-brand-light"
            } ${file ? "" : "cursor-pointer"}`}
          >
            {file ? (
              <div className="flex w-full items-center gap-4 text-left">
                {preview ? (
                  <img src={preview} alt="Selected prescription" className="h-24 w-24 shrink-0 rounded-xl border border-line object-cover" />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-mint text-3xl text-brand">
                    <FiFileText />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{file.name}</p>
                  <p className="text-sm text-ink-soft">{(file.size / 1024 / 1024).toFixed(2)} MB · ready to read</p>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  aria-label="Remove file"
                  className="rounded-full p-2 text-ink-soft hover:bg-red-50 hover:text-danger-dark"
                >
                  <FiX />
                </button>
              </div>
            ) : (
              <>
                <FiUploadCloud className="text-5xl text-brand" />
                <p className="text-lg font-semibold text-ink">Click to upload or drag &amp; drop</p>
                <p className="text-sm text-ink-soft">JPG, PNG or PDF (up to 4MB)</p>
              </>
            )}

            {loading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-3xl bg-white/95">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-mint-deep border-t-brand" />
                <p className="font-semibold text-ink" aria-live="polite">
                  {STEPS[step]}
                </p>
                <p className="text-xs text-ink-soft">Usually takes 5–15 seconds</p>
              </div>
            )}
          </div>

          <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />

          {error && (
            <p role="alert" className="mx-auto mt-4 max-w-xl rounded-xl bg-red-50 px-4 py-3 text-sm text-danger-dark">
              {error}
            </p>
          )}

          <div className="mx-auto mt-5 grid max-w-xl gap-3 sm:grid-cols-2">
            {file ? (
              <>
                <button onClick={analyze} disabled={loading} className="btn-primary py-3.5 text-base">
                  <Sparkle /> {loading ? "Reading…" : "Read prescription"}
                </button>
                <button onClick={() => fileRef.current?.click()} disabled={loading} className="btn-ghost py-3.5 text-base">
                  Choose different file
                </button>
              </>
            ) : (
              <>
                <button onClick={() => fileRef.current?.click()} className="btn-primary py-3.5 text-base">
                  <FiUploadCloud className="text-lg" /> Choose File
                </button>
                <button onClick={() => cameraRef.current?.click()} className="btn-ghost py-3.5 text-base">
                  <FiCamera className="text-lg" /> Use Camera
                </button>
              </>
            )}
          </div>

          <div className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-y-5 sm:grid-cols-4 sm:divide-x sm:divide-line">
            {TRUST.map(({ Icon, title, sub }) => (
              <div key={title} className="flex flex-col items-center px-2 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e3f2e9] text-xl text-brand">
                  <Icon />
                </span>
                <p className="mt-2 text-sm font-bold text-ink">{title}</p>
                <p className="text-xs text-ink-soft">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Guide card ---------- */}
      <section className="rounded-[28px] bg-white/70 p-6 shadow-[0_20px_50px_-20px_rgba(14,107,76,0.25)] ring-1 ring-line sm:p-9">
        <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">What makes a valid prescription?</h2>
        <p className="mt-2 text-lg text-ink-soft">Here's what we look for in a prescription:</p>

        <div className="mt-6">
          <ValidGuide />
        </div>

        <ul className="mt-6 space-y-3 rounded-2xl bg-[#e9f5ee] p-5">
          {CHECKLIST.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[15px] font-medium text-brand-dark">
              <FaCheckCircle className="mt-0.5 shrink-0 text-lg text-brand" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-soft">
          Government regulations require a valid prescription for certain medicines.
        </p>
      </section>
    </main>
  );
};

export default PrescriptionUpload;
