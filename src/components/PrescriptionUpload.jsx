import React, { useState } from "react";
import axios from "axios";

const PrescriptionUpload = () => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [prescriptionDetails, setPrescriptionDetails] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/ocr", formData);
      setExtractedText(response.data.text);
      // Example: Hardcoded prescription details (to be replaced by OCR result)
      setPrescriptionDetails({
        doctor: "Dr. Sharma",
        patient: "Ravi",
        date: "01/05/2025",
        medicines: [
          "Paracetamol 500mg",
          "Amoxicillin",
        ],
      });
    } catch (error) {
      console.error("OCR failed", error);
    }
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
            onChange={handleFileChange}
            className="px-4 py-2 border border-gray-300 rounded w-full"
          />
        </div>
        <div className="mb-4">
          <button
            onClick={handleUpload}
            className="w-full py-3 bg-red-500 text-white rounded hover:bg-red-600 text-lg"
          >
            UPLOAD NEW
          </button>
        </div>

        <div className="mb-4">
          <p className="text-lg mb-2">Attached Prescription</p>
          <div className="w-full h-24 bg-gray-300 flex items-center justify-center rounded">
            <p className="text-gray-600 text-sm text-center px-2">
              Uploaded prescriptions will be shown here
            </p>
          </div>
        </div>

        <button className="w-full py-3 bg-gray-300 text-gray-600 rounded cursor-not-allowed text-lg">
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
      
      {/* Prescription Details Box */}
      {prescriptionDetails && (
        <div className="max-w-6xl mx-auto bg-white p-6 mt-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Prescription Details</h2>
          <div className="border-t-2 border-gray-300 pt-4">
            <p className="text-lg font-medium">Doctor: {prescriptionDetails.doctor}</p>
            <p className="text-lg font-medium">Patient: {prescriptionDetails.patient}</p>
            <p className="text-lg font-medium">Date: {prescriptionDetails.date}</p>
            <ul className="list-disc list-inside mt-4 text-gray-800">
              {prescriptionDetails.medicines.map((medicine, index) => (
                <li key={index}>{medicine}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionUpload;
