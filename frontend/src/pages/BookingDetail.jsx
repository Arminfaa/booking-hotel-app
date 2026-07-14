import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Card, Form, Input, Space, Tag, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { bookingsApi } from "../api";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import { formatDisplayDate, formatMoney } from "../utils/format";
import { tw } from "../styles/tw";

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    let alive = true;
    bookingsApi
      .get(id)
      .then((res) => {
        if (alive) setBooking(res.data.booking);
      })
      .catch(() => {
        if (alive) setBooking(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  async function cancel() {
    try {
      const res = await bookingsApi.cancel(id);
      setBooking(res.data.booking);
      const refund = res.data?.refund;
      toast.success(
        refund
          ? `Cancelled · refund ${formatMoney(refund.refundAmount)} (${refund.refundPercent}%)`
          : "Booking cancelled"
      );
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function pay(values) {
    setPaying(true);
    try {
      const res = await bookingsApi.pay(id, { cardNumber: values.cardNumber });
      setBooking(res.data.booking);
      toast.success(
        res.data.email?.preview
          ? "Paid · confirmation email queued (see API logs)"
          : "Payment successful"
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <Loader label="Loading booking..." />;
  if (!booking) {
    return (
      <EmptyState
        title="Booking not found"
        message="It may have been removed or you don’t have access."
        actionLabel="Back to bookings"
        actionTo="/bookings"
      />
    );
  }

  const unpaid = booking.paymentStatus === "unpaid" && booking.status !== "cancelled";

  return (
    <div className={tw.page}>
      <div className={`${tw.container} animate-[rise_0.65s_cubic-bezier(0.22,1,0.36,1)_both]`}>
        <Link
          to="/bookings"
          className="mb-4 inline-flex items-center gap-1.5 font-semibold text-ink-soft hover:text-sea"
        >
          <ArrowLeftOutlined /> All bookings
        </Link>
        <span className={tw.eyebrow}>Confirmation</span>
        <Typography.Title level={1}>{booking.hotel?.title}</Typography.Title>
        <Space wrap className="!mb-6">
          <Tag color="processing">{booking.status}</Tag>
          <Tag>{booking.paymentStatus}</Tag>
          <Tag color="cyan">{booking.cancellationPolicy} policy</Tag>
        </Space>

        <div className="grid gap-6 min-[880px]:grid-cols-[1.1fr_0.9fr] min-[880px]:items-start">
          <img
            className="max-h-[420px] w-full rounded-cove border border-line object-cover"
            src={booking.hotel?.images?.[0]}
            alt={booking.hotel?.title || "Stay"}
          />
          <Card>
            <Typography.Paragraph>
              <Typography.Text strong>Dates</Typography.Text>
              <br />
              {formatDisplayDate(booking.checkIn)} → {formatDisplayDate(booking.checkOut)}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>Guests</Typography.Text>
              <br />
              {booking.guests?.adults} adults
              {booking.guests?.children ? `, ${booking.guests.children} children` : ""}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>Price breakdown</Typography.Text>
              <br />
              Lodging {formatMoney(booking.pricePerNight * booking.nights)} · Cleaning{" "}
              {formatMoney(booking.cleaningFee)} · Service{" "}
              {formatMoney(booking.serviceFee || 0)} · Tax {formatMoney(booking.tax || 0)}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>Total</Typography.Text>
              <br />
              {formatMoney(booking.totalPrice)}
              {booking.paymentRef ? ` · ref ${booking.paymentRef}` : ""}
            </Typography.Paragraph>
            {booking.refundAmount ? (
              <Typography.Paragraph>
                <Typography.Text strong>Refund</Typography.Text>
                <br />
                {formatMoney(booking.refundAmount)}
              </Typography.Paragraph>
            ) : null}

            {unpaid ? (
              <Card type="inner" title="Mock payment" className="!mb-4">
                <Form
                  layout="vertical"
                  onFinish={pay}
                  initialValues={{ cardNumber: "4242424242424242" }}
                  requiredMark={false}
                >
                  <Form.Item
                    label="Card number"
                    name="cardNumber"
                    rules={[{ required: true, message: "Card number required" }]}
                  >
                    <Input size="large" placeholder="4242 4242 4242 4242" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={paying} block size="large">
                    Pay {formatMoney(booking.totalPrice)}
                  </Button>
                </Form>
              </Card>
            ) : null}

            <Space wrap>
              <Link to={`/hotels/${booking.hotel?._id}`}>
                <Button>View stay</Button>
              </Link>
              {booking.status === "confirmed" || booking.status === "pending" ? (
                <Button danger onClick={cancel}>
                  Cancel booking
                </Button>
              ) : null}
            </Space>
          </Card>
        </div>
      </div>
    </div>
  );
}
