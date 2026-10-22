import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiBell, FiClock, FiLogOut, FiMapPin, FiMenu, FiSearch, FiUserPlus, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import api from "../lib/api";

const navLink = ({ isActive }) =>
  `text-[15px] font-medium transition hover:text-brand ${isActive ? "text-brand" : "text-ink"}`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const { location, setLocation } = useApp();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [locDraft, setLocDraft] = useState(location);
  const searchRef = useRef(null);
  const locRef = useRef(null);

  // debounced medicine search
  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return undefined;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get("/drugs/search", { params: { q } });
        if (!cancelled) setResults(data.results || []);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term]);

  useEffect(() => {
    const onDown = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
      if (locRef.current && !locRef.current.contains(e.target)) setLocOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const openMedicine = (name) => {
    setShowResults(false);
    setTerm("");
    setMenuOpen(false);
    navigate(`/medicine/${encodeURIComponent(name)}`);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const q = term.trim();
    if (q.length >= 2) openMedicine(q);
  };

  const saveLocation = (e) => {
    e.preventDefault();
    setLocation(locDraft.trim().slice(0, 40));
    setLocOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="no-print sticky top-0 z-50 bg-white/95 shadow-[0_1px_0_0_var(--color-line)] backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 md:flex-nowrap md:px-6">
        {/* Brand */}
        <Link to="/" className="order-1 flex shrink-0 items-center gap-3" onClick={closeMenu}>
          <img src="/logo.png" alt="GeoPharma" className="h-11 w-11 object-contain" />
          <div className="leading-tight">
            <p className="font-sans text-xl font-bold tracking-tight text-ink">GeoPharma</p>
            <p className="text-xs text-ink-soft">India's trusted online pharmacy</p>
          </div>
        </Link>

        {/* Search */}
        <div className="relative order-3 w-full md:order-2 md:mx-4 md:w-auto md:flex-1" ref={searchRef}>
          <form
            onSubmit={submitSearch}
            className="flex items-center gap-3 rounded-full border border-line bg-[#f7faf8] px-5 py-3 transition focus-within:border-brand-light focus-within:bg-white"
          >
            <FiSearch className="shrink-0 text-lg text-ink-soft" />
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onFocus={() => setShowResults(true)}
              placeholder="Search medicines, brands..."
              aria-label="Search medicines"
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-ink-soft"
            />
          </form>

          {showResults && term.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-line bg-white p-1.5 shadow-xl">
              {searching && <p className="px-4 py-3 text-sm text-ink-soft">Searching…</p>}
              {!searching && results.length === 0 && (
                <p className="px-4 py-3 text-sm text-ink-soft">No matches found. Try another spelling.</p>
              )}
              {!searching &&
                results.map((drug) => (
                  <button
                    key={drug.id}
                    type="button"
                    onClick={() => openMedicine(drug.name)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-mint"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">{drug.name}</span>
                      {(drug.generic || drug.note) && (
                        <span className="block truncate text-xs text-ink-soft">
                          {[drug.generic, drug.note].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-brand">View</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Desktop actions */}
        <div className="order-2 ml-auto hidden items-center gap-3 md:order-3 md:ml-0 md:flex">
          <div className="relative" ref={locRef}>
            <button
              type="button"
              onClick={() => {
                setLocDraft(location);
                setLocOpen((v) => !v);
              }}
              className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-[15px] font-semibold text-brand transition hover:border-brand-light hover:bg-mint"
            >
              <FiMapPin /> <span className="max-w-[110px] truncate">{location || "Location"}</span>
            </button>
            {locOpen && (
              <form
                onSubmit={saveLocation}
                className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-line bg-white p-4 shadow-xl"
              >
                <p className="text-sm font-semibold text-ink">Where are you?</p>
                <p className="mb-3 text-xs text-ink-soft">Used to find hospitals and pharmacies near you.</p>
                <input
                  autoFocus
                  value={locDraft}
                  onChange={(e) => setLocDraft(e.target.value)}
                  placeholder="City or pincode, e.g. Ranchi"
                  className="input"
                  maxLength={40}
                />
                <div className="mt-3 flex gap-2">
                  <button type="submit" className="btn-primary flex-1 py-2 text-sm">
                    Save
                  </button>
                  {location && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocation("");
                        setLocOpen(false);
                      }}
                      className="btn-ghost py-2 text-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          <Link
            to="/emergency"
            className="flex items-center gap-2 rounded-xl bg-danger px-5 py-2.5 text-[15px] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(239,68,68,0.7)] transition hover:bg-danger-dark"
          >
            <FiBell /> Emergency
          </Link>

          <nav className="flex items-center gap-5 pl-2">
            <NavLink to="/offers" className={navLink}>
              Offers
            </NavLink>
            <NavLink to="/needhelp" className={navLink}>
              Need Help?
            </NavLink>
            {user ? (
              <>
                <NavLink to="/prescriptions" className={navLink}>
                  My Rx
                </NavLink>
                <span className="text-[15px] text-ink-soft">Hi, {user.name?.split(" ")[0]}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-[15px] font-medium text-ink transition hover:text-danger-dark"
                >
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLink}>
                  Login
                </NavLink>
                <Link to="/signup" className="btn-primary rounded-xl px-5 py-2.5 text-[15px]">
                  <FiUserPlus /> Sign up
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Mobile toggle */}
        <div className="order-2 ml-auto flex items-center gap-2 md:hidden">
          <Link
            to="/emergency"
            aria-label="Emergency"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger text-white"
          >
            <FiBell />
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-1 border-t border-line bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => {
              const next = window.prompt("Enter your city or pincode", location || "");
              if (next !== null) setLocation(next.trim().slice(0, 40));
            }}
            className="flex items-center gap-2 rounded-xl px-3 py-3 text-left font-medium text-brand hover:bg-mint"
          >
            <FiMapPin /> {location || "Set location"}
          </button>
          <Link to="/offers" onClick={closeMenu} className="rounded-xl px-3 py-3 font-medium hover:bg-mint">
            Offers
          </Link>
          <Link to="/needhelp" onClick={closeMenu} className="rounded-xl px-3 py-3 font-medium hover:bg-mint">
            Need Help?
          </Link>
          <Link to="/assistant" onClick={closeMenu} className="rounded-xl px-3 py-3 font-medium hover:bg-mint">
            AI Assistant
          </Link>
          {user ? (
            <>
              <Link to="/prescriptions" onClick={closeMenu} className="flex items-center gap-2 rounded-xl px-3 py-3 font-medium hover:bg-mint">
                <FiClock /> My prescriptions
              </Link>
              <button onClick={handleLogout} className="rounded-xl px-3 py-3 text-left font-medium text-danger-dark hover:bg-red-50">
                Logout ({user.name?.split(" ")[0]})
              </button>
            </>
          ) : (
            <div className="mt-2 flex gap-2">
              <Link to="/login" onClick={closeMenu} className="btn-ghost flex-1">
                Login
              </Link>
              <Link to="/signup" onClick={closeMenu} className="btn-primary flex-1">
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
