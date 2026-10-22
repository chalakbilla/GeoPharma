import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import PrescriptionUpload from "./pages/PrescriptionUpload";
import Emergency from "./pages/Emergency";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Offers from "./pages/Offers";
import NeedHelp from "./pages/NeedHelp";
import History from "./pages/History";
import Medicine from "./pages/Medicine";
import Assistant from "./pages/Assistant";
import NotFound from "./pages/NotFound";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => (
  <AuthProvider>
    <AppProvider>
      <Router>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col font-sans text-ink">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<PrescriptionUpload />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/needhelp" element={<NeedHelp />} />
              <Route path="/prescriptions" element={<History />} />
              <Route path="/medicine/:name" element={<Medicine />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
          <ChatWidget />
        </div>
      </Router>
    </AppProvider>
  </AuthProvider>
);

export default App;
