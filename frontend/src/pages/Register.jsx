import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Input, Select } from "antd";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import "./Auth.css";

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "guest",
  });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created");
      navigate(form.role === "host" ? "/host" : "/");
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
        <h1>Join Cove</h1>
        <p className="auth-lead">
          Create an account to reserve stays, save bookmarks, or host listings.
        </p>
        <form onSubmit={onSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="name">Name</label>
            <Input
              id="name"
              size="large"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              size="large"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <Input.Password
              id="password"
              size="large"
              minLength={6}
              value={form.password}
              onChange={(e) =>
                setForm((s) => ({ ...s, password: e.target.value }))
              }
              required
            />
          </div>
          <div className="field">
            <label htmlFor="role">I want to</label>
            <Select
              id="role"
              size="large"
              style={{ width: "100%" }}
              value={form.role}
              onChange={(role) => setForm((s) => ({ ...s, role }))}
              options={[
                { value: "guest", label: "Book stays" },
                { value: "host", label: "Host listings" },
              ]}
            />
          </div>
          <button className="btn btn--primary" disabled={loading}>
            {loading ? "Creating..." : "Sign up"}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
