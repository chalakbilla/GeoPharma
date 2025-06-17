import React, { useState } from "react";
import axios from "axios";

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
    const formData = new FormData();
    if (text) {
      formData.append('text', text);
    } else {
      formData.append('file', file);
    }

    try {
      const response = await axios.post("http://localhost:5000/ocr", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Validate response structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error("Invalid response from server");
      }

      setResult(response.data);
      setError(response.data.error || null);
      setEditedText(response.data.extractedText || "");
      setIsModalOpen(true); // Open modal on successful response
    } catch (err) {
      console.error("OCR failed", err);
      setError(err.response?.data?.details || "Error processing the request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSendEditedText = () => {
    setIsEditing(false);
    handleUpload(editedText); // Resend edited text
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setResult(null);
    setEditedText("");
    setFile(null); // Clear file input
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 md:p-10 mt-10 rounded-lg shadow-md flex flex-col md:flex-row justify-between">
      {/* Upload Section */}
      <div className="w-full md:w-1/2 md:pr-6 mb-6 md:mb-0">
        <h2 className="text-2xl font-semibold mb-2">Upload Prescription</h2>
        <p className="mb-4 text-gray-700">Please attach a prescription to proceed</p>

        <div className="mb-4">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="px-4 py-2 border border-gray-300 rounded w-full"
          />
        </div>
        <div className="mb-4">
          <button
            onClick={() => handleUpload()}
            disabled={loading || (!file && !editedText)}
            className={`w-full py-3 text-white rounded text-lg ${
              loading || (!file && !editedText) ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {loading ? "PROCESSING..." : "UPLOAD NEW"}
          </button>
        </div>

        <div className="mb-4">
          <p className="text-lg mb-2">Attached Prescription</p>
          <div className="w-full h-24 bg-gray-300 flex items-center justify-center rounded">
            <p className="text-gray-600 text-sm text-center px-2">
              {file ? file.name : "Uploaded prescriptions will be shown here"}
            </p>
          </div>
        </div>

        <button
          className="w-full py-3 bg-gray-300 text-gray-600 rounded cursor-not-allowed text-lg"
          disabled
        >
          CONTINUE
        </button>
      </div>

      {/* Guide Section */}
      <div className="w-full md:w-1/2 md:pl-6">
        <h2 className="text-2xl font-semibold mb-4">Guide for a valid prescription</h2>
        <div className="mb-4">
          <img
            src="prescription_guide.png"
            alt="Prescription Guide"
            className="w-full max-w-md rounded"
          />
        </div>
        <ul className="list-disc list-inside text-gray-800 space-y-2 mb-4">
          <li>Don't crop out any part of the image</li>
          <li>Avoid blurred image</li>
          <li>Include details of doctor and patient + clinic visit date</li>
          <li>Medicines will be dispensed as per prescription</li>
          <li>Supported file types: jpeg, jpg, png, pdf</li>
          <li>Maximum allowed file size: 5MB</li>
        </ul>
        <p className="text-sm text-gray-500">
          Government regulations require a valid prescription
        </p>
      </div>

      {/* Error Message */}
      {error && !isModalOpen && (
        <p className="text-red-500 text-center mt-4">{error}</p>
      )}

      {/* Modal Dialog */}
      {isModalOpen && result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-4">Analysis Results</h2>
            <div className="border-t-2 border-gray-300 pt-4">
              <h3 className="text-lg font-medium mb-2">Extracted Medical Report</h3>
              {isEditing ? (
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full h-40 p-2 border border-gray-300 rounded text-gray-800"
                  placeholder="Edit the extracted text here..."
                />
              ) : (
                <pre className="text-gray-800 whitespace-pre-wrap bg-gray-100 p-4 rounded border border-gray-300">
                  {result.extractedText || "No text extracted."}
                </pre>
              )}

              {result.error ? (
                <p className="text-red-500 mt-4">{result.error}</p>
              ) : (
                <>
                  <h3 className="text-lg font-medium mt-4 mb-2">Identified Diseases</h3>
                  {result.diseases && result.diseases.length > 0 ? (
                    result.diseases.map((disease, index) => (
                      <div
                        key={index}
                        className="mb-4 p-4 bg-gray-100 rounded border border-gray-300"
                      >
                        <p className="text-lg font-medium">Disease: {disease.name}</p>
                        <h4 className="text-md font-medium mt-2">Recommended Medicines:</h4>
                        <ul className="list-disc list-inside text-gray-800">
                          {disease.medicines && disease.medicines.length > 0 ? (
                            disease.medicines.map((medicine, medIndex) => (
                              <li
                                key={medIndex}
                                className="flex justify-between items-center"
                              >
                                <span>{medicine}</span>
                                {disease.purchaseLinks && disease.purchaseLinks[medIndex] && (
                                  <a
                                    href={disease.purchaseLinks[medIndex]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    Buy Now
                                  </a>
                                )}
                              </li>
                            ))
                          ) : (
                            <p>No medicines suggested.</p>
                          )}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-800">
                      No diseases identified. Please verify the report or edit the extracted text for re-analysis.
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end mt-6 space-x-2">
              {isEditing ? (
                <button
                  onClick={handleSendEditedText}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Send
                </button>
              ) : (
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
              )}
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
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