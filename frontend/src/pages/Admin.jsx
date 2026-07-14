import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Col, Row, Select, Space, Statistic, Typography } from "antd";
import toast from "react-hot-toast";
import { adminApi } from "../api";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/ui/Loader";
import { formatMoney } from "../utils/format";
import { tw } from "../styles/tw";

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
    <div className={tw.page}>
      <div className={tw.container}>
        <span className={tw.eyebrow}>Admin</span>
        <Typography.Title level={1}>Control panel</Typography.Title>

        <Row gutter={[16, 16]} className="!mb-8">
          {[
            ["Users", overview?.users],
            ["Hotels", overview?.hotels],
            ["Bookings", overview?.bookings],
            ["Revenue", formatMoney(overview?.revenue || 0)],
          ].map(([title, value]) => (
            <Col xs={12} md={6} key={title}>
              <Card>
                <Statistic title={title} value={value} />
              </Card>
            </Col>
          ))}
        </Row>

        <Typography.Title level={3}>Users</Typography.Title>
        <Space direction="vertical" size="middle" className="mb-8 w-full">
          {users.map((u) => (
            <Card key={u.id} size="small">
              <Row align="middle" justify="space-between" gutter={[12, 12]}>
                <Col>
                  <Typography.Text strong>{u.name}</Typography.Text>
                  <br />
                  <Typography.Text type="secondary">{u.email}</Typography.Text>
                </Col>
                <Col>
                  <Select
                    value={u.role}
                    className="min-w-[120px]"
                    onChange={(role) => setRole(u.id, role)}
                    options={["guest", "host", "admin"].map((r) => ({
                      value: r,
                      label: r,
                    }))}
                  />
                </Col>
              </Row>
            </Card>
          ))}
        </Space>

        <Typography.Title level={3}>Listings</Typography.Title>
        <Space direction="vertical" size="middle" className="w-full">
          {hotels.map((h) => (
            <Card key={h._id} size="small">
              <Row align="middle" justify="space-between" gutter={[12, 12]}>
                <Col>
                  <Typography.Text strong>{h.title}</Typography.Text>
                  <br />
                  <Typography.Text type="secondary">
                    {h.city} · host {h.host?.name}
                  </Typography.Text>
                </Col>
                <Col>
                  <Button onClick={() => toggleHotel(h._id, h.isPublished)}>
                    {h.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                </Col>
              </Row>
            </Card>
          ))}
        </Space>
      </div>
    </div>
  );
}
