import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import "./Auth.css";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "guest@cove.dev",
    password: "password123",
  });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={location.state?.from || "/"} replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success("Welcome back");
      navigate(location.state?.from || "/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section auth-page">
      <div className="container auth-card animate-rise">
        <p className="section__eyebrow">Account</p>
        <h1>Log in to Cove</h1>
        <p className="auth-lead">
          Demo guest: <code>guest@cove.dev</code> / <code>password123</code>
        </p>
        <form onSubmit={onSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((s) => ({ ...s, password: e.target.value }))
              }
              required
            />
          </div>
          <button className="btn btn--primary" disabled={loading}>
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>
        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
