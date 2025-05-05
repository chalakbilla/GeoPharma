import React from "react";
import { FaPhoneAlt } from "react-icons/fa"; // For phone icon
import { MdEmail } from "react-icons/md";  // For email icon

const NeedHelp = () => {
  return (
    <div className="bg-orange-50 min-h-screen flex flex-col justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl">
        <h2 className="text-3xl font-semibold text-center text-orange-600 mb-6">Need Help? We're Here to Assist You!</h2>
        <p className="text-center text-gray-500 mb-8">Our support team is available to help you with any issues or questions. Choose your preferred way to reach us:</p>

        {/* Contact Methods */}
        <div className="space-y-6">
          {/* Toll-Free Number */}
          <div className="flex items-center justify-start space-x-4 p-4 bg-orange-100 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
            <FaPhoneAlt className="text-3xl text-orange-600" />
            <div>
              <h3 className="text-xl font-semibold text-orange-600">Toll-Free Support</h3>
              <p className="text-lg text-gray-700">Call us anytime: <span className="font-bold">1800-123-4567</span></p>
            </div>
          </div>

          {/* Email Support */}
          <div className="flex items-center justify-start space-x-4 p-4 bg-orange-100 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
            <MdEmail className="text-3xl text-orange-600" />
            <div>
              <h3 className="text-xl font-semibold text-orange-600">Email Support</h3>
              <p className="text-lg text-gray-700">Send us an email: <span className="font-bold">support@company.com</span></p>
            </div>
          </div>

          {/* Live Chat Support */}
          <div className="flex items-center justify-start space-x-4 p-4 bg-orange-100 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
            <FaPhoneAlt className="text-3xl text-orange-600" />
            <div>
              <h3 className="text-xl font-semibold text-orange-600">Live Chat</h3>
              <p className="text-lg text-gray-700">Chat with our support team instantly. Click the chat icon on the bottom right of the page!</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-10">
          <h3 className="text-2xl font-semibold text-center text-orange-600 mb-4">Frequently Asked Questions</h3>
          <p className="text-center text-gray-500 mb-6">Here are some common questions our customers ask:</p>

          <div className="space-y-4">
            <div className="p-4 bg-gray-100 rounded-lg shadow-md">
              <h4 className="text-lg font-semibold text-gray-700">How do I reset my password?</h4>
              <p className="text-gray-600">To reset your password, click on the 'Forgot Password' link on the login page and follow the instructions.</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg shadow-md">
              <h4 className="text-lg font-semibold text-gray-700">What payment methods do you accept?</h4>
              <p className="text-gray-600">We accept all major credit/debit cards, PayPal, and online bank transfers.</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg shadow-md">
              <h4 className="text-lg font-semibold text-gray-700">Where can I track my order?</h4>
              <p className="text-gray-600">You can track your order by clicking the 'Track Order' link in the confirmation email we sent you.</p>
            </div>
          </div>
        </div>

        {/* Closing Message */}
        <div className="mt-8 text-center">
          <p className="text-gray-500">Still need help? Feel free to contact us through any of the methods above, and we'll get back to you as soon as possible.</p>
        </div>
      </div>
    </div>
  );
};

export default NeedHelp;
