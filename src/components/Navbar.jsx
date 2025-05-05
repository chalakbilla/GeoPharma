import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex flex-wrap justify-between items-center p-4 bg-white border-b border-gray-200">
      
      {/* Logo and Tagline */}
      <Link to="/" className="flex items-center w-full md:w-auto mb-4 md:mb-0 cursor-pointer">
        <img src="logo.png" alt="Logo" className="h-10 mr-2" />
        <span className="text-red-600 text-sm">India’s Best Online Pharmacy</span>
      </Link>

      {/* Search and Location */}
      <div className="flex flex-wrap items-center w-full md:w-auto space-x-0 md:space-x-4 space-y-2 md:space-y-0">
        <div className="flex flex-wrap items-center w-full md:w-auto space-x-2">
          <button className="border border-gray-300 px-2 py-1 rounded bg-white w-full md:w-auto">
            📍 Location
          </button>
          <input
            type="text"
            placeholder="Search"
            className="px-2 py-1 border border-gray-300 rounded w-full md:w-auto"
          />
        </div>

        {/* Emergency Button */}
        <Link to="/emergency" className="w-full md:w-auto">
          <button className="bg-red-500 text-white px-4 py-2 rounded flex items-center justify-center w-full md:w-auto cursor-pointer hover:bg-red-600">
            🚨 Emergency
          </button>
        </Link>

        {/* Nav Links */}
        <div className="flex w-full md:w-auto justify-between md:justify-start space-x-4 mt-2 md:mt-0">
          <Link to="/login" className="text-black cursor-pointer">Login</Link>
          <Link to="/signup" className="text-black cursor-pointer">Signup</Link>
          <Link to="/offers" className="text-black cursor-pointer">Offers</Link>
          <Link to="/needhelp" className="text-black cursor-pointer">Need Help?</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
