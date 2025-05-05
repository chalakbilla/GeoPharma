import React from "react";

// Dummy data for medicines and offers
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
  { name: "Albuterol", originalPrice: 30, discountPrice: 24 },
  { name: "Hydrochlorothiazide", originalPrice: 40, discountPrice: 32 },
  { name: "Furosemide", originalPrice: 45, discountPrice: 36 },
  { name: "Pantoprazole", originalPrice: 55, discountPrice: 44 },
  { name: "Ciprofloxacin", originalPrice: 70, discountPrice: 56 },
  { name: "Prednisone", originalPrice: 95, discountPrice: 76 },
  { name: "Lisinopril", originalPrice: 60, discountPrice: 48 },
  { name: "Atorvastatin", originalPrice: 150, discountPrice: 120 },
  { name: "Gabapentin", originalPrice: 50, discountPrice: 40 },
  { name: "Clonazepam", originalPrice: 60, discountPrice: 48 },
  { name: "Duloxetine", originalPrice: 90, discountPrice: 72 },
  { name: "Fluoxetine", originalPrice: 80, discountPrice: 64 },
  { name: "Zolpidem", originalPrice: 40, discountPrice: 32 },
  { name: "Tamsulosin", originalPrice: 85, discountPrice: 68 },
  { name: "Methotrexate", originalPrice: 120, discountPrice: 96 },
  { name: "Citalopram", originalPrice: 95, discountPrice: 76 },
  { name: "Venlafaxine", originalPrice: 110, discountPrice: 88 },
  { name: "Sildenafil", originalPrice: 180, discountPrice: 144 },
  { name: "Corticosteroid", originalPrice: 150, discountPrice: 120 },
  { name: "Trazodone", originalPrice: 50, discountPrice: 40 },
  { name: "Ranitidine", originalPrice: 35, discountPrice: 28 },
  { name: "Budesonide", originalPrice: 110, discountPrice: 88 },
  { name: "Prednisolone", originalPrice: 90, discountPrice: 72 },
  { name: "Bromocriptine", originalPrice: 135, discountPrice: 108 },
  { name: "Enalapril", originalPrice: 80, discountPrice: 64 },
  { name: "Carbamazepine", originalPrice: 120, discountPrice: 96 },
  { name: "Methadone", originalPrice: 130, discountPrice: 104 },
  { name: "Hydrocodone", originalPrice: 200, discountPrice: 160 },
  { name: "Doxycycline", originalPrice: 40, discountPrice: 32 },
  { name: "Tramadol", originalPrice: 45, discountPrice: 36 },
  { name: "Warfarin", originalPrice: 60, discountPrice: 48 },
  { name: "Prazosin", originalPrice: 50, discountPrice: 40 },
  { name: "Mirtazapine", originalPrice: 85, discountPrice: 68 },
  { name: "Ceftriaxone", originalPrice: 100, discountPrice: 80 },
  { name: "Folic Acid", originalPrice: 20, discountPrice: 16 },
  { name: "Risperidone", originalPrice: 120, discountPrice: 96 },
  { name: "Ketorolac", originalPrice: 45, discountPrice: 36 },
  { name: "Loratadine", originalPrice: 25, discountPrice: 20 },
  { name: "Amitriptyline", originalPrice: 70, discountPrice: 56 },
  { name: "Venlafaxine", originalPrice: 80, discountPrice: 64 },
  { name: "Amiodarone", originalPrice: 150, discountPrice: 120 },
  { name: "Clopidogrel", originalPrice: 90, discountPrice: 72 },
  { name: "Oxycodone", originalPrice: 250, discountPrice: 200 },
  { name: "Lansoprazole", originalPrice: 120, discountPrice: 96 },
  { name: "Verapamil", originalPrice: 110, discountPrice: 88 },
  { name: "Diltiazem", originalPrice: 85, discountPrice: 68 },
];

const Offers = () => {
  return (
    <div className="p-6 bg-orange-50 min-h-screen">
      <h2 className="text-3xl font-semibold text-center text-orange-600 mb-8">Latest Medicine Offers</h2>
      <p className="text-center text-gray-500 mb-12">Check out our latest offers and discounts on medicines!</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {medicines.map((medicine, index) => {
          const discountPercentage = (
            ((medicine.originalPrice - medicine.discountPrice) / medicine.originalPrice) *
            100
          ).toFixed(0);

          return (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
            >
              <h3 className="text-xl font-semibold text-orange-600 mb-2">{medicine.name}</h3>
              <p className="text-gray-700 mb-2">Original Price: ₹{medicine.originalPrice}</p>
              <p className="text-orange-600 font-bold text-lg mb-2">
                Discounted Price: ₹{medicine.discountPrice}
              </p>
              <p className="text-sm text-green-500">You save: {discountPercentage}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Offers;
