import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { hotelsApi, uploadsApi } from "../api";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/ui/Loader";
import { tw } from "../styles/tw";

const emptyForm = {
  title: "",
  description: "",
  city: "",
  country: "",
  address: "",
  latitude: "",
  longitude: "",
  pricePerNight: 120,
  cleaningFee: 30,
  maxGuests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  propertyType: "apartment",
  cancellationPolicy: "moderate",
  amenities: "Wifi, Kitchen",
  images: "",
  isPublished: true,
};

export default function HostDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const [hotels, setHotels] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load(fillId = hotelId) {
    setLoading(true);
    try {
      const res = await hotelsApi.mine();
      setHotels(res.data.hotels);
      if (fillId) {
        const existing = res.data.hotels.find((h) => h._id === fillId);
        if (existing) fillForm(existing);
      } else {
        form.setFieldsValue(emptyForm);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role !== "host" && user?.role !== "admin") {
      navigate("/");
      return;
    }
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await hotelsApi.mine();
        if (!alive) return;
        setHotels(res.data.hotels);
        if (hotelId) {
          const existing = res.data.hotels.find((h) => h._id === hotelId);
          if (existing) fillForm(existing);
        } else {
          form.setFieldsValue(emptyForm);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user, hotelId, navigate, form]);

  function fillForm(hotel) {
    form.setFieldsValue({
      title: hotel.title,
      description: hotel.description,
      city: hotel.city,
      country: hotel.country,
      address: hotel.address,
      latitude: hotel.location?.coordinates?.[1] ?? "",
      longitude: hotel.location?.coordinates?.[0] ?? "",
      pricePerNight: hotel.pricePerNight,
      cleaningFee: hotel.cleaningFee,
      maxGuests: hotel.maxGuests,
      bedrooms: hotel.bedrooms,
      beds: hotel.beds,
      bathrooms: hotel.bathrooms,
      propertyType: hotel.propertyType,
      cancellationPolicy: hotel.cancellationPolicy || "moderate",
      amenities: (hotel.amenities || []).join(", "),
      images: (hotel.images || []).join("\n"),
      isPublished: hotel.isPublished,
    });
  }

  async function onUpload(file) {
    try {
      const res = await uploadsApi.image(file);
      const current = form.getFieldValue("images") || "";
      form.setFieldValue(
        "images",
        current ? `${current}\n${res.data.url}` : res.data.url
      );
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.message);
    }
    return false;
  }

  async function onFinish(values) {
    setSaving(true);
    try {
      const payload = {
        ...values,
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
        pricePerNight: Number(values.pricePerNight),
        cleaningFee: Number(values.cleaningFee),
        maxGuests: Number(values.maxGuests),
        bedrooms: Number(values.bedrooms),
        beds: Number(values.beds),
        bathrooms: Number(values.bathrooms),
        amenities: String(values.amenities || "")
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        images: String(values.images || "")
          .split("\n")
          .map((a) => a.trim())
          .filter(Boolean),
      };
      const isPublished = payload.isPublished;
      delete payload.isPublished;
      if (hotelId) {
        await hotelsApi.update(hotelId, { ...payload, isPublished });
        toast.success("Listing updated");
      } else {
        await hotelsApi.create(payload);
        toast.success("Listing created");
        form.setFieldsValue(emptyForm);
      }
      await load(null);
      navigate("/host");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeHotel(id) {
    if (!confirm("Delete this listing?")) return;
    try {
      await hotelsApi.remove(id);
      toast.success("Deleted");
      load(null);
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) return <Loader label="Loading host dashboard..." />;

  return (
    <div className={tw.page}>
      <div className={tw.container}>
        <span className={tw.eyebrow}>Host</span>
        <Typography.Title level={1}>Your listings</Typography.Title>

        <Row gutter={[28, 28]}>
          <Col xs={24} lg={10}>
            <Space direction="vertical" size="middle" className="w-full">
              {hotels.map((hotel) => (
                <Card
                  key={hotel._id}
                  className="shadow-[0_12px_32px_rgba(0,0,0,0.22)]"
                  size="small"
                >
                  <FlexImg hotel={hotel} />
                  <Typography.Title level={4} className="!mt-3 !mb-1">
                    {hotel.title}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {hotel.city} · {hotel.isPublished ? "Published" : "Draft"}
                  </Typography.Text>
                  <Space wrap className="!mt-3">
                    <Link to={`/host/${hotel._id}`}>
                      <Button size="small">Edit</Button>
                    </Link>
                    <Link to={`/hotels/${hotel._id}`}>
                      <Button size="small" type="text">
                        View
                      </Button>
                    </Link>
                    <Button size="small" danger onClick={() => removeHotel(hotel._id)}>
                      Delete
                    </Button>
                  </Space>
                </Card>
              ))}
              {!hotels.length ? (
                <Typography.Text type="secondary">No listings yet.</Typography.Text>
              ) : null}
            </Space>
          </Col>

          <Col xs={24} lg={14}>
            <Card
              className="shadow-[0_12px_32px_rgba(0,0,0,0.22)] [&_.ant-card-head-title]:font-display [&_.ant-card-head-title]:text-[1.35rem]"
              title={hotelId ? "Edit listing" : "Add listing"}
            >
              <Form
                form={form}
                layout="vertical"
                size="large"
                onFinish={onFinish}
                initialValues={emptyForm}
                requiredMark={false}
              >
                <Row gutter={12}>
                  {["title", "city", "country", "address", "latitude", "longitude"].map(
                    (key) => (
                      <Col xs={24} sm={12} key={key}>
                        <Form.Item
                          label={key.charAt(0).toUpperCase() + key.slice(1)}
                          name={key}
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                    )
                  )}
                </Row>
                <Form.Item
                  label="Description"
                  name="description"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
                <Row gutter={12}>
                  <Col xs={24} sm={8}>
                    <Form.Item label="Price / night" name="pricePerNight" rules={[{ required: true }]}>
                      <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item label="Cleaning fee" name="cleaningFee" rules={[{ required: true }]}>
                      <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item label="Max guests" name="maxGuests" rules={[{ required: true }]}>
                      <InputNumber style={{ width: "100%" }} min={1} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Type" name="propertyType">
                      <Select
                        options={["apartment", "house", "villa", "cabin", "loft", "hotel"].map(
                          (t) => ({ value: t, label: t })
                        )}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Cancellation" name="cancellationPolicy">
                      <Select
                        options={["flexible", "moderate", "strict"].map((t) => ({
                          value: t,
                          label: t,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="Amenities (comma-separated)" name="amenities">
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Image URLs (one per line)"
                  name="images"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item label="Or upload image">
                  <Upload accept="image/*" showUploadList={false} beforeUpload={onUpload}>
                    <Button icon={<UploadOutlined />}>Choose image</Button>
                  </Upload>
                </Form.Item>
                {hotelId ? (
                  <Form.Item name="isPublished" valuePropName="checked">
                    <Checkbox>Published</Checkbox>
                  </Form.Item>
                ) : null}
                <Space wrap>
                  <Button type="primary" htmlType="submit" loading={saving}>
                    {hotelId ? "Update listing" : "Create listing"}
                  </Button>
                  {hotelId ? (
                    <Link to="/host">
                      <Button type="text">New listing</Button>
                    </Link>
                  ) : null}
                </Space>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

function FlexImg({ hotel }) {
  return (
    <img
      src={hotel.images?.[0]}
      alt={hotel.title}
      className="h-[140px] w-full rounded-cove-sm border border-line object-cover"
    />
  );
}
