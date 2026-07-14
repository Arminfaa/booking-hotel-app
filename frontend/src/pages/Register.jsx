import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button, Card, Form, Input, Select, Typography } from "antd";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { tw } from "../styles/tw";

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function onFinish(values) {
    setLoading(true);
    try {
      await register(values);
      toast.success("Account created");
      navigate(values.role === "host" ? "/host" : "/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${tw.page} grid min-h-[calc(100dvh-4.25rem-8rem)] items-center`}>
      <div className={`${tw.container} max-w-[460px]`}>
        <Card
          className="animate-[rise_0.65s_cubic-bezier(0.22,1,0.36,1)_both] shadow-cove bg-[radial-gradient(500px_220px_at_0%_0%,rgba(94,196,168,0.12),transparent_55%),rgba(15,26,36,0.88)] [&_.ant-card-body]:p-[clamp(1.5rem,4vw,2rem)]"
          bordered
        >
          <span className={tw.eyebrow}>Account</span>
          <Typography.Title level={2}>Join Cove</Typography.Title>
          <Typography.Paragraph type="secondary" className="!mb-6">
            Create an account to reserve stays, save bookmarks, or host listings.
          </Typography.Paragraph>
          <Form
            layout="vertical"
            size="large"
            onFinish={onFinish}
            initialValues={{ role: "guest" }}
            requiredMark={false}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input />
            </Form.Item>
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
              rules={[
                { required: true, message: "Password is required" },
                { min: 6, message: "At least 6 characters" },
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item label="I want to" name="role">
              <Select
                options={[
                  { value: "guest", label: "Book stays" },
                  { value: "host", label: "Host listings" },
                ]}
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Sign up
            </Button>
          </Form>
          <Typography.Paragraph className="!mt-5 !mb-0 text-center text-ink-soft">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-sea hover:underline">
              Log in
            </Link>
          </Typography.Paragraph>
        </Card>
      </div>
    </div>
  );
}
