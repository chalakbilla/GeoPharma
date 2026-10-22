import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="no-print mt-8 border-t border-line bg-white/70">
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-8 text-sm text-ink-soft md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
        <p>
          <span className="font-semibold text-ink">GeoPharma</span> · India's trusted online pharmacy
        </p>
      </div>
      <nav className="flex flex-wrap gap-x-6 gap-y-2">
        <Link to="/offers" className="hover:text-brand">Offers</Link>
        <Link to="/assistant" className="hover:text-brand">AI Assistant</Link>
        <Link to="/needhelp" className="hover:text-brand">Need Help?</Link>
        <Link to="/emergency" className="hover:text-danger-dark">Emergency</Link>
      </nav>
    </div>
    <p className="mx-auto max-w-[1400px] px-6 pb-6 text-xs text-ink-soft">
      GeoPharma's AI reads prescriptions and explains medicines for information only. It is not a substitute for advice from
      your doctor or pharmacist. In an emergency, call 112.
    </p>
  </footer>
);

export default Footer;
