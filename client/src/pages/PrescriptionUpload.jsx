import React, { useState } from "react";
import { FiUploadCloud, FiX, FiEdit2 } from "react-icons/fi";
import api from "../lib/api";

const PrescriptionUpload = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setResult(null);
  };

  const handleUpload = async (text = null) => {
    if (!file && !text) {
      setError("Please select an image file or provide text");
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    if (text) {
      formData.append("text", text);
    } else {
      formData.append("file", file);
    }

    try {
      const response = await api.post("/ocr", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!response.data || typeof response.data !== "object") {
        throw new Error("Invalid response from server");
      }

      setResult(response.data);
      setError(response.data.error || null);
      setEditedText(response.data.extractedText || "");
      setIsModalOpen(true);
    } catch (err) {
      console.error("OCR failed", err);
      setError(err.response?.data?.details || err.response?.data?.error || "Error processing the request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEditedText = () => {
    setIsEditing(false);
    handleUpload(editedText);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setResult(null);
    setEditedText("");
    setFile(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Upload panel */}
        <div className="pad-edge rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-sm">
          <h2 className="font-display text-2xl font-semibold text-[var(--color-ink)]">Upload prescription</h2>
          <p className="mt-1 mb-6 text-[var(--color-ink-soft)]">
            Attach a clear photo or scan and we'll read it for you.
          </p>

          <label
            htmlFor="prescription-file"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--color-line)] bg-white/60 px-6 py-10 text-center hover:border-[var(--color-leaf)]"
          >
            <FiUploadCloud className="text-3xl text-[var(--color-leaf)]" />
            <span className="text-sm text-[var(--color-ink)]">
              {file ? file.name : "Click to choose an image or PDF"}
            </span>
            <span className="text-xs text-[var(--color-ink-soft)]">JPG, PNG or PDF, up to 5MB</span>
            <input
              id="prescription-file"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            onClick={() => handleUpload()}
            disabled={loading || !file}
            className="mt-6 w-full rounded-lg bg-[var(--color-clay)] py-3 text-lg font-medium text-white transition hover:bg-[var(--color-clay-dark)] disabled:cursor-not-allowed disabled:bg-[var(--color-line)] disabled:text-[var(--color-ink-soft)]"
          >
            {loading ? "Analyzing..." : "Analyze prescription"}
          </button>

          {error && !isModalOpen && <p className="mt-4 text-sm text-[var(--color-brick)]">{error}</p>}
        </div>

        {/* Guide panel */}
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-sm">
          <h2 className="font-display text-2xl font-semibold text-[var(--color-ink)]">What makes a valid prescription</h2>
          <img
            src="/prescription_guide.png"
            alt="Prescription guide"
            className="my-4 w-full max-w-sm rounded-lg border border-[var(--color-line)]"
          />
          <ul className="list-disc space-y-2 pl-5 text-[var(--color-ink-soft)]">
            <li>Don't crop out any part of the image</li>
            <li>Avoid blurred photos</li>
            <li>Include doctor and patient details plus the visit date</li>
            <li>Medicines will be dispensed exactly as prescribed</li>
            <li>Supported types: jpeg, jpg, png, pdf — up to 5MB</li>
          </ul>
          <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
            Government regulations require a valid prescription for these medicines.
          </p>
        </div>
      </div>

      {/* Results modal */}
      {isModalOpen && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[var(--color-surface)] p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="font-display text-2xl font-semibold text-[var(--color-ink)]">Analysis results</h2>
              <button onClick={handleCloseModal} aria-label="Close">
                <FiX className="text-xl text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]" />
              </button>
            </div>

            <div className="border-t border-[var(--color-line)] pt-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium text-[var(--color-ink)]">Extracted text</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-sm text-[var(--color-clay-dark)] hover:underline"
                  >
                    <FiEdit2 size={14} /> Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <>
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="h-40 w-full rounded-lg border border-[var(--color-line)] bg-white p-3 text-[var(--color-ink)] outline-none focus:border-[var(--color-leaf)]"
                    placeholder="Edit the extracted text here..."
                  />
                  <button
                    onClick={handleSendEditedText}
                    className="mt-3 rounded-lg bg-[var(--color-leaf)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-leaf-dark)]"
                  >
                    Re-analyze
                  </button>
                </>
              ) : (
                <pre className="whitespace-pre-wrap rounded-lg border border-[var(--color-line)] bg-white p-4 text-sm text-[var(--color-ink)]">
                  {result.extractedText || "No text extracted."}
                </pre>
              )}

              {result.error ? (
                <p className="mt-4 text-[var(--color-brick)]">{result.error}</p>
              ) : (
                <>
                  <h3 className="mb-2 mt-6 font-medium text-[var(--color-ink)]">Identified conditions</h3>
                  {result.diseases && result.diseases.length > 0 ? (
                    result.diseases.map((disease, index) => (
                      <div key={index} className="mb-3 rounded-lg border border-[var(--color-line)] bg-white p-4">
                        <p className="font-medium text-[var(--color-ink)]">{disease.name}</p>
                        {disease.medicines && disease.medicines.length > 0 ? (
                          <ul className="mt-2 space-y-2">
                            {disease.medicines.map((medicine, medIndex) => (
                              <li key={medIndex} className="rounded-md bg-[var(--color-bg)] px-3 py-2">
                                <p className="text-[var(--color-ink)]">{medicine.name}</p>
                                {medicine.product ? (
                                  <p className="text-xs text-[var(--color-ink-soft)]">
                                    {medicine.product.product_name} · {medicine.product.manufacturer}
                                  </p>
                                ) : (
                                  <p className="text-xs text-[var(--color-ink-soft)]">
                                    Not found in the drug database — will need pharmacist review
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                            No medicines listed for this finding — please consult your doctor.
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-[var(--color-ink-soft)]">
                      No conditions identified. Try editing the extracted text and re-analyzing.
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="rounded-lg bg-[var(--color-ink)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionUpload;
