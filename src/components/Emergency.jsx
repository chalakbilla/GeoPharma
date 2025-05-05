import React from "react";

const Emergency = () => {
  const helplines = [
    { name: "National Emergency Number", number: "112" },
    { name: "Ambulance", number: "102" },
    { name: "Fire Brigade", number: "101" },
    { name: "Police", number: "100" },
    { name: "Women Helpline", number: "1091" },
    { name: "Disaster Management", number: "108" },
  ];

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 border-l-8 border-orange-500">
        <h2 className="text-3xl font-bold text-orange-600 mb-4">🚨 Emergency Contacts</h2>
        <p className="text-gray-700 mb-6">
          Please use the following helpline numbers during emergencies. These services are available 24/7.
        </p>

        <div className="grid gap-4">
          {helplines.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-4 bg-orange-100 rounded-xl hover:shadow-md transition-shadow"
            >
              <span className="text-lg font-medium text-orange-800">{item.name}</span>
              <span className="text-xl font-bold text-orange-700">{item.number}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-sm text-gray-600">
          <p>If you're in immediate danger or need urgent assistance, dial the numbers above without delay.</p>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
