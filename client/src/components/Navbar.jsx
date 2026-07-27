import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMapPin, FiSearch, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get("/drugs/search", { params: { q: searchTerm } });
        setSearchResults(data.results || []);
      } catch (err) {
        console.error("Drug search failed:", err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-[var(--color-surface)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img src="/logo.png" alt="GeoPharma" className="h-9 w-9" />
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold text-[var(--color-ink)]">GeoPharma</p>
            <p className="text-[11px] tracking-wide text-[var(--color-clay-dark)]">
              India's trusted online pharmacy
            </p>
          </div>
        </Link>

        <div className="hidden flex-1 items-center gap-2 md:flex">
          <button className="flex items-center gap-1 rounded-full border border-[var(--color-line)] bg-white px-3 py-1.5 text-sm text-[var(--color-ink-soft)] hover:border-[var(--color-leaf)]">
            <FiMapPin className="text-[var(--color-leaf)]" /> Location
          </button>
          <div className="relative flex-1" ref={searchBoxRef}>
            <div className="flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-3 py-1.5">
              <FiSearch className="text-[var(--color-ink-soft)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowResults(true)}
                placeholder="Search medicines, brands..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-ink-soft)]"
              />
            </div>

            {showResults && searchTerm.trim() && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-[var(--color-line)] bg-white shadow-lg">
                {searching && (
                  <p className="px-4 py-3 text-sm text-[var(--color-ink-soft)]">Searching...</p>
                )}
                {!searching && searchResults.length === 0 && (
                  <p className="px-4 py-3 text-sm text-[var(--color-ink-soft)]">No matches found</p>
                )}
                {!searching &&
                  searchResults.map((drug) => (
                    <div
                      key={drug.id}
                      className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] px-4 py-2.5 last:border-b-0 hover:bg-[var(--color-bg)]"
                    >
                      <div>
                        <p className="text-sm font-medium text-[var(--color-ink)]">{drug.product_name}</p>
                        <p className="text-xs text-[var(--color-ink-soft)]">
                          {drug.manufacturer}
                          {drug.atc_code ? ` · ${drug.atc_code}` : ""}
                        </p>
                      </div>
                      {drug.dispensing_cat && (
                        <span className="shrink-0 rounded-full bg-[var(--color-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-ink-soft)]">
                          Cat {drug.dispensing_cat}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link to="/emergency">
            <button className="rounded-full bg-[var(--color-brick)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
              Emergency
            </button>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-[var(--color-ink)]">
            <Link to="/offers" className="hover:text-[var(--color-clay-dark)]">Offers</Link>
            <Link to="/needhelp" className="hover:text-[var(--color-clay-dark)]">Need Help?</Link>
            {user ? (
              <>
                <span className="text-[var(--color-ink-soft)]">Hi, {user.name?.split(" ")[0]}</span>
                <button onClick={handleLogout} className="hover:text-[var(--color-brick)]">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-[var(--color-clay-dark)]">Login</Link>
                <Link to="/signup">
                  <button className="rounded-full bg-[var(--color-leaf)] px-4 py-2 font-medium text-white hover:bg-[var(--color-leaf-dark)]">
                    Sign up
                  </button>
                </Link>
              </>
            )}
          </nav>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4 md:hidden">
          <Link to="/emergency" onClick={() => setOpen(false)} className="font-medium text-[var(--color-brick)]">
            Emergency
          </Link>
          <Link to="/offers" onClick={() => setOpen(false)}>Offers</Link>
          <Link to="/needhelp" onClick={() => setOpen(false)}>Need Help?</Link>
          {user ? (
            <button onClick={handleLogout} className="text-left text-[var(--color-brick)]">Logout</button>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/signup" onClick={() => setOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
