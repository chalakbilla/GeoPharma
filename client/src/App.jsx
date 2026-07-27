import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import PrescriptionUpload from "./pages/PrescriptionUpload";
import Emergency from "./pages/Emergency";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Offers from "./pages/Offers";
import NeedHelp from "./pages/NeedHelp";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[var(--color-bg)] font-sans text-[var(--color-ink)]">
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
    </AuthProvider>
  );
};

export default App;
