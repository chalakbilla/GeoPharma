import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Emergency from "./components/Emergency";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Offers from "./components/Offers";
import NeedHelp from "./components/NeedHelp";
import PrescriptionUpload from "./components/PrescriptionUpload";

const App = () => {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<PrescriptionUpload />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/needhelp" element={<NeedHelp />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
