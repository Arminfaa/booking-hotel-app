import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Form, Input, Typography } from "antd";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { tw } from "../styles/tw";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={location.state?.from || "/"} replace />;
  }

  async function onFinish(values) {
    setLoading(true);
    try {
      await login(values);
      toast.success("Welcome back");
      navigate(location.state?.from || "/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${tw.page} grid min-h-[calc(100svh-4.25rem-8rem)] items-center`}>
      <div className={`${tw.container} max-w-[460px]`}>
        <Card
          className="animate-[rise_0.65s_cubic-bezier(0.22,1,0.36,1)_both] shadow-cove bg-[radial-gradient(500px_220px_at_0%_0%,rgba(94,196,168,0.12),transparent_55%),rgba(15,26,36,0.88)] [&_.ant-card-body]:p-[clamp(1.5rem,4vw,2rem)]"
          bordered
        >
          <span className={tw.eyebrow}>Account</span>
          <Typography.Title level={2}>Log in to Cove</Typography.Title>
          <Typography.Paragraph type="secondary" className="!mb-6 [&_code]:rounded-md [&_code]:bg-sea/12 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.86em] [&_code]:text-sea">
            Demo guest: <code>guest@cove.dev</code> / <code>password123</code>
          </Typography.Paragraph>
          <Form
            layout="vertical"
            size="large"
            onFinish={onFinish}
            initialValues={{ email: "guest@cove.dev", password: "password123" }}
            requiredMark={false}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, type: "email", message: "Enter a valid email" }]}
            >
              <Input type="email" autoComplete="email" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Password is required" }]}
            >
              <Input.Password autoComplete="current-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Log in
            </Button>
          </Form>
          <Typography.Paragraph className="!mt-5 !mb-0 text-center text-ink-soft">
            New here?{" "}
            <Link to="/register" className="font-bold text-sea hover:underline">
              Create an account
            </Link>
          </Typography.Paragraph>
        </Card>
      </div>
    </div>
  );
}
