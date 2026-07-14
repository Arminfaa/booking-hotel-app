import { useState } from "react";
import { Avatar, Button, Card, Form, Input, Space, Typography, Upload } from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { authApi, uploadsApi } from "../api";
import { useAuth } from "../hooks/useAuth";
import { tw } from "../styles/tw";

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");

  async function onFinish(values) {
    setLoading(true);
    try {
      await authApi.updateMe({ ...values, avatar: avatarUrl });
      await refreshProfile();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function beforeUpload(file) {
    setUploading(true);
    try {
      const res = await uploadsApi.image(file, "cove/avatars");
      setAvatarUrl(res.data.url);
      form.setFieldValue("avatar", res.data.url);
      toast.success("Photo uploaded");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
    return false;
  }

  return (
    <div className={`${tw.page} grid min-h-[calc(100dvh-4.25rem-8rem)] items-center`}>
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
            form={form}
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
            <Form.Item label="Profile photo">
              <Space align="center" size="large">
                <Avatar size={72} src={avatarUrl || undefined} icon={<UserOutlined />} />
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                >
                  <Button icon={<UploadOutlined />} loading={uploading}>
                    Upload photo
                  </Button>
                </Upload>
              </Space>
            </Form.Item>
            <Form.Item name="avatar" hidden>
              <Input />
            </Form.Item>
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
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Save changes
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
