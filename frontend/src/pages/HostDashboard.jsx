import { useCallback, useEffect, useState } from "react";
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
  Tooltip,
  Typography,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import { hotelsApi, uploadsApi } from "../api";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/ui/Loader";
import LocationPicker from "../components/hotels/LocationPicker";
import { tw } from "../styles/tw";
import {
  applyApiErrorsToForm,
  getFieldLabel,
  summarizeApiErrors,
} from "../utils/formErrors";

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

const requiredText = (label) => [{ required: true, message: `${label} is required` }];

const coordinateRules = (label, min, max) => [
  { required: true, message: "Pick a location on the map" },
  {
    validator: (_, value) => {
      if (value === "" || value == null) {
        return Promise.reject(new Error(`${label} is required`));
      }
      const num = Number(value);
      if (Number.isNaN(num)) {
        return Promise.reject(new Error(`${label} must be a number`));
      }
      if (num < min || num > max) {
        return Promise.reject(
          new Error(`${label} must be between ${min} and ${max}`)
        );
      }
      return Promise.resolve();
    },
  },
];

const imageRules = [
  { required: true, message: "Add at least one image URL or upload an image" },
  {
    validator: (_, value) => {
      const urls = String(value || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      if (!urls.length) {
        return Promise.reject(
          new Error("Add at least one image URL or upload an image")
        );
      }
      return Promise.resolve();
    },
  },
];

function handleFormError(form, err) {
  applyApiErrorsToForm(form, err);
  toast.error(summarizeApiErrors(err));
}

export default function HostDashboard() {
  const { user, booting } = useAuth();
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const [hotels, setHotels] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const latitude = Form.useWatch("latitude", form);
  const longitude = Form.useWatch("longitude", form);

  const fillForm = useCallback(
    (hotel) => {
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
    },
    [form]
  );

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
    if (booting) return;
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
  }, [user, booting, hotelId, navigate, form, fillForm]);

  async function onUpload(file) {
    try {
      const res = await uploadsApi.image(file, "cove/hotels");
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
        bedrooms: Number(values.bedrooms ?? 1),
        beds: Number(values.beds ?? 1),
        bathrooms: Number(values.bathrooms ?? 1),
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
      handleFormError(form, err);
    } finally {
      setSaving(false);
    }
  }

  function onFinishFailed({ errorFields }) {
    const first = errorFields[0];
    if (first) {
      form.scrollToField(first.name, { behavior: "smooth", block: "center" });
      toast.error(`${getFieldLabel(first.name[0])}: ${first.errors[0]}`);
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

  if (booting || loading) return <Loader label="Loading host dashboard..." />;

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
                  <div className="flex items-start gap-3">
                    <img
                      src={hotel.images?.[0]}
                      alt={hotel.title}
                      className="h-20 w-20 shrink-0 rounded-cove-sm border border-line object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <Typography.Title level={5} className="!mb-1 !mt-0 line-clamp-2">
                        {hotel.title}
                      </Typography.Title>
                      <Typography.Text type="secondary">
                        {hotel.city} · {hotel.isPublished ? "Published" : "Draft"}
                      </Typography.Text>
                    </div>
                    <Space size={2} className="shrink-0">
                      <Tooltip title="View">
                        <Link to={`/hotels/${hotel._id}`}>
                          <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            aria-label="View listing"
                          />
                        </Link>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <Link to={`/host/${hotel._id}`}>
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            aria-label="Edit listing"
                          />
                        </Link>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          aria-label="Delete listing"
                          onClick={() => removeHotel(hotel._id)}
                        />
                      </Tooltip>
                    </Space>
                  </div>
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
                onFinishFailed={onFinishFailed}
                initialValues={emptyForm}
                requiredMark={false}
              >
                <Row gutter={12}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Title" name="title" rules={requiredText("Title")}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="City" name="city" rules={requiredText("City")}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Country" name="country" rules={requiredText("Country")}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item label="Address" name="address" rules={requiredText("Address")}>
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, cur) =>
                    prev.latitude !== cur.latitude || prev.longitude !== cur.longitude
                  }
                >
                  {() => {
                    const latError = form.getFieldError("latitude")[0];
                    const lngError = form.getFieldError("longitude")[0];
                    const locationError = latError || lngError;

                    return (
                      <Form.Item
                        label="Location on map"
                        required
                        validateStatus={locationError ? "error" : undefined}
                        help={
                          locationError ||
                          "Click the map to place your listing. Drag the pin to fine-tune."
                        }
                      >
                        <LocationPicker
                          latitude={latitude}
                          longitude={longitude}
                          onChange={({ latitude: nextLat, longitude: nextLng }) => {
                            form.setFieldsValue({
                              latitude: nextLat,
                              longitude: nextLng,
                            });
                            form.validateFields(["latitude", "longitude"]);
                          }}
                        />
                      </Form.Item>
                    );
                  }}
                </Form.Item>
                <Form.Item
                  name="latitude"
                  hidden
                  rules={coordinateRules("Latitude", -90, 90)}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="longitude"
                  hidden
                  rules={coordinateRules("Longitude", -180, 180)}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Description"
                  name="description"
                  rules={requiredText("Description")}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
                <Row gutter={12}>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Price / night"
                      name="pricePerNight"
                      rules={[
                        { required: true, message: "Price per night is required" },
                        {
                          type: "number",
                          min: 1,
                          message: "Price per night must be at least 1",
                        },
                      ]}
                    >
                      <InputNumber style={{ width: "100%" }} min={1} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Cleaning fee"
                      name="cleaningFee"
                      rules={[
                        { required: true, message: "Cleaning fee is required" },
                        {
                          type: "number",
                          min: 0,
                          message: "Cleaning fee cannot be negative",
                        },
                      ]}
                    >
                      <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Max guests"
                      name="maxGuests"
                      rules={[
                        { required: true, message: "Max guests is required" },
                        {
                          type: "number",
                          min: 1,
                          message: "Max guests must be at least 1",
                        },
                      ]}
                    >
                      <InputNumber style={{ width: "100%" }} min={1} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Bedrooms"
                      name="bedrooms"
                      rules={[
                        { required: true, message: "Bedrooms is required" },
                        {
                          type: "number",
                          min: 0,
                          message: "Bedrooms cannot be negative",
                        },
                      ]}
                    >
                      <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Beds"
                      name="beds"
                      rules={[
                        { required: true, message: "Beds is required" },
                        {
                          type: "number",
                          min: 1,
                          message: "Beds must be at least 1",
                        },
                      ]}
                    >
                      <InputNumber style={{ width: "100%" }} min={1} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Bathrooms"
                      name="bathrooms"
                      rules={[
                        { required: true, message: "Bathrooms is required" },
                        {
                          type: "number",
                          min: 0,
                          message: "Bathrooms cannot be negative",
                        },
                      ]}
                    >
                      <InputNumber style={{ width: "100%" }} min={0} />
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
                  rules={imageRules}
                  extra="Paste URLs or use the upload button below."
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

