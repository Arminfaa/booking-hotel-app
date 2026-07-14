import { useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../api";
import { useAuth } from "../hooks/useAuth";
import "./Auth.css";

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.updateMe(form);
      await refreshProfile();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section auth-page">
      <div className="container auth-card animate-rise">
        <p className="section__eyebrow">Profile</p>
        <h1>{user?.name}</h1>
        <p className="auth-lead">
          {user?.email} · <span style={{ textTransform: "capitalize" }}>{user?.role}</span>
        </p>
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
            />
          </div>
          <div className="field">
            <label htmlFor="avatar">Avatar URL</label>
            <input
              id="avatar"
              value={form.avatar}
              onChange={(e) => setForm((s) => ({ ...s, avatar: e.target.value }))}
            />
          </div>
          <button className="btn btn--primary" disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
