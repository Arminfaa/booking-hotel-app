import { useState } from "react";
import { Button, Card, Form, Input, Typography } from "antd";
import toast from "react-hot-toast";
import { authApi } from "../api";
import { useAuth } from "../hooks/useAuth";
import { tw } from "../styles/tw";

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  async function onFinish(values) {
    setLoading(true);
    try {
      await authApi.updateMe(values);
      await refreshProfile();
      toast.success("Profile updated");
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
          <span className={tw.eyebrow}>Profile</span>
          <Typography.Title level={2}>{user?.name}</Typography.Title>
          <Typography.Paragraph type="secondary" className="!mb-6">
            {user?.email} ·{" "}
            <span className="capitalize">{user?.role}</span>
          </Typography.Paragraph>
          <Form
            layout="vertical"
            size="large"
            onFinish={onFinish}
            initialValues={{
              name: user?.name || "",
              phone: user?.phone || "",
              avatar: user?.avatar || "",
            }}
            requiredMark={false}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Phone" name="phone">
              <Input />
            </Form.Item>
            <Form.Item label="Avatar URL" name="avatar">
              <Input />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Save changes
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
