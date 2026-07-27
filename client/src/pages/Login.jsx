import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't log you in, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-12">
      <div className="pad-edge w-full max-w-md rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-sm">
        <h2 className="font-display text-3xl font-semibold text-[var(--color-ink)]">Welcome back</h2>
        <p className="mt-1 mb-6 text-[var(--color-ink-soft)]">Log in to manage your prescriptions and orders.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--color-ink)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-line)] bg-white px-4 py-2 outline-none focus:border-[var(--color-leaf)] focus:ring-2 focus:ring-[var(--color-leaf)]/30"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-[var(--color-ink)]">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-line)] bg-white px-4 py-2 outline-none focus:border-[var(--color-leaf)] focus:ring-2 focus:ring-[var(--color-leaf)]/30"
              placeholder="Enter your password"
            />
          </div>

          {error && <p className="text-sm text-[var(--color-brick)]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--color-leaf)] py-2.5 font-medium text-white transition hover:bg-[var(--color-leaf-dark)] disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
          New here?{" "}
          <Link to="/signup" className="font-medium text-[var(--color-clay-dark)] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
