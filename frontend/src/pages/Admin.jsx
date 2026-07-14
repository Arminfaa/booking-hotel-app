import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Select } from "antd";
import toast from "react-hot-toast";
import { adminApi } from "../api";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/ui/Loader";
import { formatMoney } from "../utils/format";
import "./Host.css";

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
      return;
    }
    Promise.all([adminApi.overview(), adminApi.users(), adminApi.hotels()])
      .then(([o, u, h]) => {
        setOverview(o.data);
        setUsers(u.data.users);
        setHotels(h.data.hotels);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  async function setRole(id, role) {
    try {
      await adminApi.updateUser(id, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
      toast.success("Role updated");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function toggleHotel(id, isPublished) {
    try {
      await adminApi.updateHotel(id, { isPublished: !isPublished });
      setHotels((prev) =>
        prev.map((h) => (h._id === id ? { ...h, isPublished: !isPublished } : h))
      );
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) return <Loader label="Loading admin..." />;

  return (
    <div className="section">
      <div className="container">
        <p className="section__eyebrow">Admin</p>
        <h1 className="section__title">Control panel</h1>
        <div className="admin-stats">
          <div><strong>{overview?.users}</strong><span>Users</span></div>
          <div><strong>{overview?.hotels}</strong><span>Hotels</span></div>
          <div><strong>{overview?.bookings}</strong><span>Bookings</span></div>
          <div><strong>{formatMoney(overview?.revenue || 0)}</strong><span>Revenue</span></div>
        </div>

        <h2>Users</h2>
        <div className="admin-table">
          {users.map((u) => (
            <div key={u.id} className="admin-row">
              <div>
                <strong>{u.name}</strong>
                <p>{u.email}</p>
              </div>
              <Select
                value={u.role}
                style={{ minWidth: 120 }}
                onChange={(role) => setRole(u.id, role)}
                options={["guest", "host", "admin"].map((r) => ({
                  value: r,
                  label: r,
                }))}
              />
            </div>
          ))}
        </div>

        <h2>Listings</h2>
        <div className="admin-table">
          {hotels.map((h) => (
            <div key={h._id} className="admin-row">
              <div>
                <strong>{h.title}</strong>
                <p>
                  {h.city} · host {h.host?.name}
                </p>
              </div>
              <button
                className="btn btn--soft"
                type="button"
                onClick={() => toggleHotel(h._id, h.isPublished)}
              >
                {h.isPublished ? "Unpublish" : "Publish"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
