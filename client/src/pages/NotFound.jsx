import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <main className="mx-auto max-w-xl px-4 py-24 text-center">
    <p className="text-7xl font-extrabold text-brand">404</p>
    <h1 className="mt-3 text-2xl font-bold">We couldn't find that page</h1>
    <p className="mt-2 text-ink-soft">It may have moved, or the link might be wrong.</p>
    <Link to="/" className="btn-primary mt-6">
      Back to home
    </Link>
  </main>
);

export default NotFound;
